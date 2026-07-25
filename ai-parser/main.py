import os
import shutil
import traceback
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from graph import app_graph

app = FastAPI(title="AI Resume Parser Service (Stateless)")

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

@app.post("/api/upload")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(status_code=400, detail="Only PDF and Word documents are supported.")
        
    if not os.environ.get("GROQ_API_KEY") and not os.environ.get("OLLAMA_BASE_URL"):
        raise HTTPException(status_code=500, detail="LLM configuration (GROQ or OLLAMA) is missing.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Process synchronously and stateless
        initial_state = {
            "file_path": file_path,
            "raw_text": "",
            "parsed_resume": {},
            "evaluation": {},
            "status": "started",
            "error": ""
        }
        
        result = app_graph.invoke(initial_state)
        
        if result.get("error"):
            print("Graph returned error:", result["error"])
            raise HTTPException(status_code=500, detail=result["error"])
            
        return {
            "message": "Resume uploaded and parsed successfully.",
            "status": "completed",
            "parsed_resume": result.get("parsed_resume", {}),
            "evaluation": result.get("evaluation", {})
        }
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
