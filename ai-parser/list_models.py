import os
import google.generativeai as genai

api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    print("Error: GOOGLE_API_KEY environment variable is not set.")
    exit(1)

genai.configure(api_key=api_key)

try:
    print("Fetching available models...")
    models = genai.list_models()
    for m in models:
        if "generateContent" in m.supported_generation_methods:
            print(f"Found model: {m.name}")
except Exception as e:
    print("Error fetching models:", e)
