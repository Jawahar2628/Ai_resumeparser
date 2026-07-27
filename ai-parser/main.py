import os
import shutil
import traceback
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Load environment variables from .env file
load_dotenv()

from graph import app_graph
from database import get_db, CandidateDB

app = FastAPI(title="AI Resume Parser Service (Async)")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def _process_resume_task(job_id: int, file_path: str):
    # Use a new DB session for the background task
    from database import SessionLocal
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
        
        candidate = db.query(CandidateDB).filter(CandidateDB.id == job_id).first()
        if candidate:
            if result.get("error"):
                candidate.status = "error"
                candidate.evaluation = {"error": result["error"]}
            else:
                candidate.status = "completed"
                candidate.parsed_resume = result.get("parsed_resume", {})
                candidate.evaluation = result.get("evaluation", {})
            db.commit()
            
    except Exception as e:
        traceback.print_exc()
        candidate = db.query(CandidateDB).filter(CandidateDB.id == job_id).first()
        if candidate:
            candidate.status = "error"
            candidate.evaluation = {"error": str(e)}
            db.commit()
    finally:
        db.close()
        if os.path.exists(file_path):
            os.remove(file_path)


@app.post("/api/upload")
async def upload_resume(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(status_code=400, detail="Only PDF and Word documents are supported.")
        
    if not os.environ.get("GROQ_API_KEY") and not os.environ.get("OLLAMA_BASE_URL"):
        raise HTTPException(status_code=500, detail="LLM configuration (GROQ or OLLAMA) is missing.")

    # Create a DB record immediately
    candidate_record = CandidateDB(status="processing", full_name="Processing...")
    db.add(candidate_record)
    db.commit()
    db.refresh(candidate_record)

    # Use job_id (CandidateDB id) in the filename to prevent collisions
    file_path = os.path.join(UPLOAD_DIR, f"{candidate_record.id}_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        background_tasks.add_task(_process_resume_task, candidate_record.id, file_path)
        
        return {
            "message": "Resume upload accepted, processing in background.",
            "job_id": candidate_record.id,
            "status": "processing"
        }
        
    except Exception as e:
        traceback.print_exc()
        if os.path.exists(file_path):
            os.remove(file_path)
        candidate_record.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status/{job_id}")
async def get_status(job_id: int, db: Session = Depends(get_db)):
    candidate = db.query(CandidateDB).filter(CandidateDB.id == job_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return {
        "job_id": candidate.id,
        "status": candidate.status,
        "parsed_resume": candidate.parsed_resume,
        "evaluation": candidate.evaluation
    }
