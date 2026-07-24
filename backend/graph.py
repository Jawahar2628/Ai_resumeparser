import os
from typing import Dict, Any
from typing_extensions import TypedDict
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_community.document_loaders import PyPDFLoader
from langgraph.graph import StateGraph, END
import json

from schema import ResumeSchema, CandidateEvaluationSchema

def get_llm():
    provider = os.getenv("LLM_PROVIDER", "groq").lower()
    
    if provider == "ollama":
        from langchain_ollama import ChatOllama
        base_url = os.getenv("OLLAMA_BASE_URL", "https://ai.shinelogics.com")
        model = os.getenv("OLLAMA_MODEL", "qwen3:8b")
        llm = ChatOllama(model=model, base_url=base_url, temperature=0, format="json")
    else:
        from langchain_groq import ChatGroq
        model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        llm = ChatGroq(model=model, temperature=0)
        
    return llm
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
        llm = get_llm()
        parser = JsonOutputParser(pydantic_object=ResumeSchema)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert AI Resume Parser. Extract the requested details from the provided resume text exactly according to the schema.\n\nCRITICAL RULES:\n1. SEPARATE 'experience' from 'projects'. Do not list academic or personal projects under experience.\n2. Do NOT invent or hallucinate data. If 'certifications' are not mentioned, return an empty array [].\n\n{format_instructions}"),
            ("user", "Resume Text:\n{resume_text}")
        ])
        
        chain = prompt | llm | parser
        result = chain.invoke({
            "resume_text": state["raw_text"],
            "format_instructions": parser.get_format_instructions()
        })
        
        return {"parsed_resume": result, "status": "resume_parsed"}
    except Exception as e:
        return {"error": str(e), "status": "failed_parsing"}

# Node 3: Evaluate Candidate
def evaluate_candidate_node(state: GraphState):
    """Uses LLM to evaluate the parsed resume and generate candidate scoring."""
    if state.get("error"):
        return state
        
    try:
        llm = get_llm()
        parser = JsonOutputParser(pydantic_object=CandidateEvaluationSchema)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert AI Technical Recruiter. Based on the parsed resume data, evaluate the candidate and provide scores, career analysis, and personality insights.\n\nDO NOT repeat the resume data. ONLY output the evaluation fields defined in the schema.\n\n{format_instructions}"),
            ("user", "Parsed Resume Data:\n{parsed_data}")
        ])
        
        chain = prompt | llm | parser
        result = chain.invoke({
            "parsed_data": json.dumps(state["parsed_resume"]),
            "format_instructions": parser.get_format_instructions()
        })
        
        return {"evaluation": result, "status": "candidate_evaluated"}
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
