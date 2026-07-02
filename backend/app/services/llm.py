import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2:1b"

def generate_answer(question, chunks):
    context = ""

    for chunk in chunks[:3]:
        context += f"\nFile: {chunk['file_name']}\n"
        context += chunk["content"][:1200]
        context += "\n---\n"

    prompt = f"""
You are CodeAssist AI.

Answer ONLY using the repository context.

Repository Context:
{context}

Question:
{question}

Respond in Markdown using this format:

# Explanation

...

# Files

- app.py
- login.html

# Important Functions

- /login
- home()

# Beginner Summary

...

Do not invent anything outside the repository.
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        data = response.json()
        return data.get("response", "No response from Ollama.")

    except Exception as e:
        return f"Ollama error: {str(e)}"