import os

ALLOWED_EXTENSIONS = (
    ".py", ".js", ".jsx", ".ts", ".tsx",
    ".java", ".html", ".css", ".json", ".md"
)

IGNORED_FOLDERS = (
    "venv",
    "node_modules",
    ".git",
    ".history",
    ".vscode",
    "__pycache__",
    "uploads",
    "dist",
    "build"
)

def read_code_files(upload_folder="uploaded_repo"):
    code_files = []

    for root, dirs, files in os.walk(upload_folder):

        dirs[:] = [d for d in dirs if d not in IGNORED_FOLDERS]

        for file in files:
            if file.endswith(ALLOWED_EXTENSIONS):
                file_path = os.path.join(root, file)

                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()

                    code_files.append({
                        "file_name": file,
                        "file_path": file_path,
                        "content": content
                    })

                except Exception as e:
                    print("Error reading file:", file_path, e)

    return code_files