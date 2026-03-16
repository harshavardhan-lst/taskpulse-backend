from google import genai as genai_client
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai_client.Client(api_key=api_key)

print("Listing models...")
try:
    models = client.models.list()
    for m in models:
        print(f"Name: {m.name}, DisplayName: {m.display_name}")
except Exception as e:
    print(f"ERROR: {e}")
