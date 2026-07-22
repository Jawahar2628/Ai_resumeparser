from sqlalchemy import create_engine, Column, Integer, String, Text, Float, JSON
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./recruitment.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class CandidateDB(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String)
    overall_score = Column(Float)
    experience_level = Column(String)
    status = Column(String, default="processing")
    
    # Store the full JSON dumps for easy retrieval in the MVP
    parsed_resume = Column(JSON)
    evaluation = Column(JSON)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
