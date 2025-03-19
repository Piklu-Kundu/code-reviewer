import { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import Markdown from "react-markdown";
import { ClipLoader } from "react-spinners";
import Editor from "@monaco-editor/react";

function App() {
  const [code, setCode] = useState(`function sum() {\n  return 1 + 1;\n}`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const editorRef = useRef(null);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
    editor.focus();
  }

  async function reviewCode() {
    try {
      setLoading(true);
      setError("");
      const response = await axios.post("http://localhost:3000/ai/get-review", { 
        code: editorRef.current.getValue() 
      });
      setReview(response.data);
    } catch (error) {
      console.error("Error fetching review:", error);
      setError("Failed to get review. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Code Review</h1>
        <div className="header-controls">
          <button 
            className="review-button" 
            onClick={reviewCode}
            disabled={loading}
          >
            {loading ? (
              <ClipLoader size={20} color="#ffffff" />
            ) : (
              "Analyze Code"
            )}
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className="editor-panel">
          <div className="editor-header">
            <h2>Code Editor</h2>
            <span className="language-tag">JavaScript</span>
          </div>
          <div className="code-editor-container">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              defaultValue={code}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                cursorStyle: "line",
                cursorBlinking: "smooth",
              }}
            />
          </div>
        </div>

        <div className="review-panel">
          <div className="review-header">
            <h2>Code Analysis</h2>
            <div className="status-indicator">
              {error && <span className="error-message">{error}</span>}
            </div>
          </div>
          <div className="review-content">
            {review ? (
              <Markdown components={{
                code({ node, inline, className, children, ...props }) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}>{review}</Markdown>
            ) : (
              <div className="empty-state">
                <p>Your code analysis will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;