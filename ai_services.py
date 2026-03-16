import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")


def generate_quiz(summary: str):
    prompt = f"""
    Generate 3 MCQ questions from this summary:

    {summary}

    Return simple text questions.
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message["content"]