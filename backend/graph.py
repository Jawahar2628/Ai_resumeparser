import os
from typing import Dict, Any
from typing_extensions import TypedDict
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from langgraph.graph import StateGraph, END
import json

from schema import ResumeSchema, CandidateEvaluationSchema

# Define the State for the LangGraph
class GraphState(TypedDict):
    file_path: str
    raw_text: str
    parsed_resume: Dict[str, Any]
    evaluation: Dict[str, Any]
    status: str
    error: str

# Node 1: Extract Text
def extract_text_node(state: GraphState):
    """Extracts raw text from the provided PDF file."""
    try:
        loader = PyPDFLoader(state["file_path"])
        pages = loader.load()
        text = "\n".join([page.page_content for page in pages])
        return {"raw_text": text, "status": "text_extracted"}
    except Exception as e:
        return {"error": str(e), "status": "failed_extraction"}

# Node 2: Parse Resume using LLM Structured Output
def parse_resume_node(state: GraphState):
    """Uses LLM to parse the raw text into a structured JSON defined by ResumeSchema."""
    if state.get("error"):
        return state
        
    try:
        # We need a Groq API key in the environment
        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)
        structured_llm = llm.with_structured_output(ResumeSchema)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert AI Resume Parser. Extract the requested details from the provided resume text exactly according to the schema. If information is missing, use empty strings or empty lists."),
            ("user", "Resume Text:\n{resume_text}")
        ])
        
        chain = prompt | structured_llm
        result = chain.invoke({"resume_text": state["raw_text"]})
        
        return {"parsed_resume": result.model_dump(), "status": "resume_parsed"}
    except Exception as e:
        return {"error": str(e), "status": "failed_parsing"}

# Node 3: Evaluate Candidate
def evaluate_candidate_node(state: GraphState):
    """Uses LLM to evaluate the parsed resume and generate candidate scoring."""
    if state.get("error"):
        return state
        
    try:
        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)
        structured_llm = llm.with_structured_output(CandidateEvaluationSchema)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert AI Technical Recruiter. Based on the parsed resume data, evaluate the candidate and provide scores, career analysis, and personality insights as per the schema."),
            ("user", "Parsed Resume Data:\n{parsed_data}")
        ])
        
        chain = prompt | structured_llm
        result = chain.invoke({"parsed_data": json.dumps(state["parsed_resume"])})
        
        return {"evaluation": result.model_dump(), "status": "candidate_evaluated"}
    except Exception as e:
        return {"error": str(e), "status": "failed_evaluation"}

# Build the Graph
def build_resume_parser_graph():
    workflow = StateGraph(GraphState)
    
    # Add Nodes
    workflow.add_node("extract_text", extract_text_node)
    workflow.add_node("parse_resume", parse_resume_node)
    workflow.add_node("evaluate_candidate", evaluate_candidate_node)
    
    # Define Edges
    workflow.set_entry_point("extract_text")
    
    # Conditional edge after extraction
    def check_extraction(state: GraphState):
        if state.get("error"): return "end"
        return "continue"
        
    workflow.add_conditional_edges(
        "extract_text",
        check_extraction,
        {"continue": "parse_resume", "end": END}
    )
    
    # Conditional edge after parsing
    def check_parsing(state: GraphState):
        if state.get("error"): return "end"
        return "continue"
        
    workflow.add_conditional_edges(
        "parse_resume",
        check_parsing,
        {"continue": "evaluate_candidate", "end": END}
    )
    
    workflow.add_edge("evaluate_candidate", END)
    
    # Compile Graph
    return workflow.compile()

# Instantiate the compiled graph
app_graph = build_resume_parser_graph()
