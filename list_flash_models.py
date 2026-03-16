from google import genai as genai_client
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai_client.Client(api_key=api_key)

print("Searching for flash models...")
try:
    models = client.models.list()
    for m in models:
        if "flash" in m.name.lower():
            print(f"ID: {m.name}")
except Exception as e:
    print(f"ERROR: {e}")
