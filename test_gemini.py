from google import genai as genai_client
from dotenv import load_dotenv
import os
import json

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"Using API Key: {api_key[:10]}...")

client = genai_client.Client(api_key=api_key)

summary = "I practiced advanced SQL queries using window functions like RANK() and LEAD() today"

prompt = f"""
    The user completed a habit/task with this summary: "{summary}"
    
    Generate exactly 3 specific questions to verify their work.
    1. One theory-based question that requires a short text answer.
    2. Two multiple-choice questions (MCQs). Each MCQ must have 4 options.
    
    Return the response as a valid JSON object with a "questions" key.
    Each question object must have: "id" (int), "type" ("theory" or "mcq"), "question" (str), "options" (list of strings, for MCQ only), and "expected_answer" (str).
    
    Format:
    {{
      "questions": [
        {{
          "id": 0,
          "type": "theory",
          "question": "...",
          "expected_answer": "..."
        }},
        {{
          "id": 1,
          "type": "mcq",
          "question": "...",
          "options": ["A", "B", "C", "D"],
          "expected_answer": "B"
        }}
      ]
    }}
"""

try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    print("RAW RESPONSE:")
    print(response.text)
except Exception as e:
    print(f"ERROR: {e}")
