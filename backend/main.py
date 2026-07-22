import os
import shutil
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from database import get_db, CandidateDB, SessionLocal
from graph import app_graph

app = FastAPI(title="AI Resume Parser Backend")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def process_resume_background(file_path: str, candidate_id: int):
    # Use a new DB session for the background task
    db = SessionLocal()
    try:
        initial_state = {
            "file_path": file_path,
            "raw_text": "",
            "parsed_resume": {},
            "evaluation": {},
            "status": "started",
            "error": ""
        }
        
        result = app_graph.invoke(initial_state)
        
        db_candidate = db.query(CandidateDB).filter(CandidateDB.id == candidate_id).first()
        if not db_candidate:
            return
            
        if result.get("error"):
            db_candidate.status = f"error: {result['error']}"
        else:
            parsed_data = result["parsed_resume"]
            evaluation_data = result["evaluation"]
            
            db_candidate.full_name = parsed_data.get("full_name", "Unknown")
            db_candidate.email = parsed_data.get("email", "")
            db_candidate.phone = parsed_data.get("phone", "")
            db_candidate.overall_score = evaluation_data.get("ai_technical_score", 0)
            db_candidate.experience_level = evaluation_data.get("experience_level", "Unknown")
            db_candidate.parsed_resume = parsed_data
            db_candidate.evaluation = evaluation_data
            db_candidate.status = "completed"
            
        db.commit()
    except Exception as e:
        db_candidate = db.query(CandidateDB).filter(CandidateDB.id == candidate_id).first()
        if db_candidate:
            db_candidate.status = f"error: {str(e)}"
            db.commit()
    finally:
        db.close()
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/api/upload")
async def upload_resume(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(status_code=400, detail="Only PDF and Word documents are supported.")
        
    if not os.environ.get("GROQ_API_KEY"):
        raise HTTPException(status_code=500, detail="GROQ_API_KEY environment variable is not set. Please set it to use the AI parser.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Create candidate placeholder
        db_candidate = CandidateDB(status="processing")
        db.add(db_candidate)
        db.commit()
        db.refresh(db_candidate)
        
        # Enqueue background task
        background_tasks.add_task(process_resume_background, file_path, db_candidate.id)
        
        return {
            "message": "Resume uploaded successfully. Processing in background.",
            "candidate_id": db_candidate.id,
            "status": "processing"
        }
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/candidates")
def list_candidates(db: Session = Depends(get_db)):
    candidates = db.query(CandidateDB).all()
    return candidates

@app.get("/api/candidates/{candidate_id}")
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(CandidateDB).filter(CandidateDB.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate
