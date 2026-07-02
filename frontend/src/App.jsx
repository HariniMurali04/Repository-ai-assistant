import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { TypeAnimation } from "react-type-animation";
import "./index.css";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [uploadInfo, setUploadInfo] = useState(null);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [askLoading, setAskLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [time, setTime] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const fileIcon = (name) => {
    if (name.endsWith(".py")) return "🐍";
    if (name.endsWith(".html")) return "🌐";
    if (name.endsWith(".css")) return "🎨";
    if (name.endsWith(".js") || name.endsWith(".jsx")) return "⚛️";
    if (name.endsWith(".json")) return "📦";
    if (name.endsWith(".md")) return "📄";
    return "📁";
  };

  const uploadRepo = async () => {
    if (!file) return alert("Please choose a ZIP file");

    const start = performance.now();
    const formData = new FormData();
    formData.append("file", file);

    setUploadLoading(true);
    setStage("uploading");

    try {
      const res = await axios.post("http://127.0.0.1:8000/upload", formData);
      setUploadInfo(res.data);
      setFiles(res.data.files || []);
      setStage("✅ Repository indexed successfully");
      setTime(`Indexed in ${((performance.now() - start) / 1000).toFixed(1)}s`);
    } catch (error) {
      alert(error.message);
      setStage("❌ Upload failed");
    }

    setUploadLoading(false);
  };

  const askQuestion = async () => {
    if (!question) return alert("Enter a question");

    const start = performance.now();

    setAskLoading(true);
    setAnswer("");
    setStage("thinking");

    try {
      const res = await axios.post("http://127.0.0.1:8000/ask", {
        question,
      });

      setAnswer(res.data.answer);
      setSources(res.data.sources || []);

      setChatHistory((prev) => [
        ...prev,
        {
          question,
          answer: res.data.answer,
        },
      ]);

      setStage("✅ Answer generated");
      setTime(`Answered in ${((performance.now() - start) / 1000).toFixed(1)}s`);
    } catch (error) {
      alert(error.message);
      setStage("❌ Failed to generate answer");
    }

    setAskLoading(false);
  };

  const copyAnswer = () => {
    navigator.clipboard.writeText(answer);
    alert("Answer copied!");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🚀 CodeAssist</h2>
        <p>AI Repository Assistant</p>
        <nav>
          <span>📁 Upload Repo</span>
          <span>💬 Chat</span>
          <span>📄 Sources</span>
          <span>⚙ Settings</span>
        </nav>
      </aside>

      <main className="main">
        <section className="hero">
          <span className="badge">RAG + FAISS + FastAPI + Ollama</span>
          <h1>AI-Powered Repository Assistant</h1>
          <p>
            Understand any GitHub project in seconds. Upload a ZIP repository and ask
            questions using Semantic Search, FAISS, RAG, and a local LLM.
          </p>
        </section>

        {!uploadInfo && (
          <div className="empty-state">
            🚀 No repository uploaded yet. Upload a ZIP file to start asking questions.
          </div>
        )}

        {uploadInfo && (
          <section className="stats">
            <div className="stat">
              <h3>📁 Files</h3>
              <p>{uploadInfo.total_files}</p>
            </div>
            <div className="stat">
              <h3>🧠 Chunks</h3>
              <p>{uploadInfo.total_chunks}</p>
            </div>
            <div className="stat success-text">
              <h3>⚡ Status</h3>
              <p>Ready</p>
            </div>
          </section>
        )}

        <section className="grid">
          <div className="card">
            <h2>📂 Upload Repository</h2>

            <label className="dropzone">
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <span>📂 Drop ZIP file here</span>
              <small>{file ? `✅ ${file.name}` : "or click to browse files"}</small>
              {uploadInfo && (
                <small>
                  {uploadInfo.total_files} files detected • Ready for questions
                </small>
              )}
            </label>

            <button onClick={uploadRepo}>
              {uploadLoading ? "Processing..." : "Upload & Index"}
            </button>

            {stage && (
              <div className="loading-box">
                {uploadLoading && stage === "uploading" ? (
                  <>
                    <TypeAnimation
                      sequence={[
                        "📂 Uploading repository...",
                        800,
                        "📄 Reading files...",
                        800,
                        "🧠 Creating embeddings...",
                        800,
                        "⚡ Building FAISS index...",
                        800,
                      ]}
                      wrapper="div"
                      cursor={true}
                      repeat={Infinity}
                      speed={60}
                    />
                    <progress value="70" max="100"></progress>
                  </>
                ) : stage === "thinking" ? (
                  <TypeAnimation
                    sequence={[
                      "🔍 Searching FAISS...",
                      800,
                      "📚 Retrieving context...",
                      800,
                      "🤖 Asking Ollama...",
                      800,
                      "✍️ Generating answer...",
                      800,
                    ]}
                    wrapper="div"
                    cursor={true}
                    repeat={Infinity}
                    speed={60}
                  />
                ) : (
                  stage
                )}
              </div>
            )}

            {time && <div className="time-box">⏱ {time}</div>}
          </div>

          <div className="card">
            <h2>💬 Ask Anything</h2>
            <textarea
              placeholder="Example: Where is login implemented?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button onClick={askQuestion}>
              {askLoading ? "Thinking..." : "Send Question"}
            </button>

            {askLoading && (
              <div className="thinking-box">
                <TypeAnimation
                  sequence={[
                    "🔍 Searching FAISS...",
                    800,
                    "📚 Retrieving context...",
                    800,
                    "🤖 Asking Ollama...",
                    800,
                    "✍️ Generating answer...",
                    800,
                  ]}
                  wrapper="div"
                  cursor={true}
                  repeat={Infinity}
                  speed={60}
                />
              </div>
            )}
          </div>
        </section>

        <section className="workspace">
          <div className="file-card">
            <h2>📂 Repository Explorer</h2>
            {files.length === 0 ? (
              <p className="muted">No files indexed yet.</p>
            ) : (
              <div className="file-list">
                {files.map((file, index) => (
                  <div className="file-item" key={index}>
                    {fileIcon(file)} {file}
                  </div>
                ))}
              </div>
            )}
          </div>

          {answer && (
            <div className="answer-card">
              <div className="answer-header">
                <h2>🤖 AI Analysis</h2>
                <button className="copy-btn" onClick={copyAnswer}>
                  📋 Copy Answer
                </button>
              </div>

              <div className="divider"></div>

              <div className="markdown-answer">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");

                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code {...props}>{children}</code>
                      );
                    },
                  }}
                >
                  {answer}
                </ReactMarkdown>
              </div>

              <div className="divider"></div>

              <h3>📄 Sources</h3>

              <div className="sources">
                {sources.map((src, index) => (
                  <div className="source" key={index}>
                    ✓ <b>{src.file_name}</b>
                    <span>{src.file_path}</span>
                  </div>
                ))}
              </div>

              <div className="divider"></div>

              <h3>💬 Chat History</h3>

              <div className="history-card">
                {chatHistory.length === 0 ? (
                  <p className="muted">No previous questions.</p>
                ) : (
                  chatHistory.map((chat, index) => (
                    <div className="history-item" key={index}>
                      <b>❓ {chat.question}</b>
                      <div className="history-answer">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {chat.answer}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        <footer>
          Built with React • FastAPI • FAISS • Sentence Transformers • Ollama • RAG
        </footer>
      </main>
    </div>
  );
}

export default App;