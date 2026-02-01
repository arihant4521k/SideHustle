// src/ChatWidget.jsx
import React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardBody,
  Button,
  Input,
  ScrollShadow,
  Avatar,
  Divider,
  Chip,
  Spinner,
  Progress,
} from "@heroui/react";

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-2">
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-purple-400 rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
    <span className="text-xs text-gray-400 ml-2">AI is thinking...</span>
  </div>
);

// Connection status indicator
const ConnectionStatus = ({ isConnected }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
    <span className="text-xs text-gray-400">{isConnected ? 'Connected' : 'Disconnected'}</span>
  </div>
);

export default function ChatWidget() {
  // --- STATE: Chat ---
  const [msgs, setMsgs] = useState([
    { role: "bot", text: "👋 Hello! Upload a PDF to knowledge base, then ask me anything about it." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // --- STATE: RAG Processing ---
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, success, error
  const [ingestStatus, setIngestStatus] = useState("idle"); // idle, ingesting, success, error
  const [statusMsg, setStatusMsg] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch("http://localhost:8000/health");
        if (res.ok) {
          setIsConnected(true);
        }
      } catch (err) {
        setIsConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // --- HANDLER: Upload PDF ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus("idle");
      setIngestStatus("idle");
      setStatusMsg("");
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploadStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();

      if (data.status === "success") {
        setUploadStatus("success");
        setStatusMsg("✅ File uploaded! Now click 'Process PDF'.");
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err) {
      setUploadStatus("error");
      setStatusMsg("❌ Upload failed. Is the backend running?");
      console.error(err);
    }
  };

  // --- HANDLER: Ingest (Chunk & Embed) ---
  const ingestFile = async () => {
    setIngestStatus("ingesting");
    setStatusMsg("🔄 Processing document...");

    try {
      const res = await fetch("http://localhost:8000/ingest", {
        method: "POST",
      });
      const data = await res.json();

      if (data.status === "ok") {
        setIngestStatus("success");
        setStatusMsg(`✅ Success! Knowledge base updated with ${data.chunks_count} chunks.`);
        setMsgs((prev) => [...prev, {
          role: "bot",
          text: "📚 I have processed your document. What would you like to know about it?"
        }]);
      } else {
        throw new Error(data.message || "Ingestion failed");
      }
    } catch (err) {
      setIngestStatus("error");
      setStatusMsg("❌ Processing failed. Please try again.");
      console.error(err);
    }
  };

  // --- HANDLER: Chat ---
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMsgs((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMsgs((prev) => [...prev, { role: "bot", text: data.answer }]);
    } catch (err) {
      setMsgs((prev) => [...prev, { role: "bot", text: "❌ Error connecting to server. Please check if the backend is running." }]);
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "success": return "success";
      case "error": return "danger";
      case "uploading":
      case "ingesting": return "warning";
      default: return "default";
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[80vh]">

      {/* LEFT SIDEBAR: Knowledge Base Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full md:w-[350px] flex-shrink-0"
      >
        <Card className="h-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10">
          <CardBody className="gap-5 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">📁</span> Knowledge Base
                </h3>
                <p className="text-sm text-gray-400 mt-1">Upload a PDF to train your AI</p>
              </div>
              <ConnectionStatus isConnected={isConnected} />
            </div>

            <Divider className="bg-white/10" />

            {/* File Upload Area */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  id="file-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer
                    ${file
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-purple-500/5'
                    }`}
                >
                  <div className="text-4xl mb-2">{file ? '📄' : '📤'}</div>
                  <span className="text-sm text-gray-300 text-center">
                    {file ? file.name : 'Click or drag PDF here'}
                  </span>
                  {file && (
                    <span className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </label>
              </div>

              {/* Progress Bar */}
              {uploadStatus === "uploading" && (
                <Progress
                  value={uploadProgress}
                  className="h-1"
                  classNames={{
                    indicator: "bg-gradient-to-r from-purple-500 to-pink-500"
                  }}
                />
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
                  onPress={uploadFile}
                  isLoading={uploadStatus === "uploading"}
                  isDisabled={!file || uploadStatus === "success"}
                  size="lg"
                >
                  {uploadStatus === "success" ? "✓ Uploaded" : "1. Upload"}
                </Button>

                <Button
                  className="flex-1 bg-gradient-to-r from-pink-600 to-red-600 font-semibold text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-shadow"
                  onPress={ingestFile}
                  isLoading={ingestStatus === "ingesting"}
                  isDisabled={uploadStatus !== "success" || ingestStatus === "success"}
                  size="lg"
                >
                  {ingestStatus === "success" ? "✓ Ready" : "2. Process"}
                </Button>
              </div>

              {/* Status Message */}
              <AnimatePresence>
                {statusMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Chip
                      color={getStatusColor(uploadStatus === "success" ? ingestStatus : uploadStatus)}
                      variant="flat"
                      className="w-full justify-center py-4"
                    >
                      {statusMsg}
                    </Chip>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Divider className="bg-white/10" />

            {/* Instructions */}
            <div className="space-y-3 text-sm">
              <h4 className="font-semibold text-white">How it works:</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">1.</span>
                  <span>Upload a PDF document</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pink-400">2.</span>
                  <span>Click "Process" to analyze content</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400">3.</span>
                  <span>Ask questions about your document</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* RIGHT PANEL: Chat Interface */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 min-w-0"
      >
        <Card className="h-full flex flex-col shadow-2xl shadow-purple-500/10 bg-black/40 backdrop-blur-xl border border-white/10">

          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                isBordered
                className="bg-gradient-to-br from-purple-500 to-pink-500"
                name="AI"
                size="sm"
              />
              <div>
                <h3 className="font-semibold text-white">AI Assistant</h3>
                <p className="text-xs text-gray-400">
                  {ingestStatus === "success" ? "Ready to answer questions" : "Waiting for document..."}
                </p>
              </div>
            </div>
            <Chip
              size="sm"
              variant="flat"
              color={ingestStatus === "success" ? "success" : "default"}
            >
              {ingestStatus === "success" ? "Active" : "Standby"}
            </Chip>
          </div>

          {/* Messages Area */}
          <ScrollShadow className="flex-1 p-4 space-y-4 overflow-y-auto">
            <AnimatePresence>
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <Avatar
                      size="sm"
                      isBordered
                      className={m.role === "user"
                        ? "bg-gradient-to-br from-purple-600 to-indigo-600"
                        : "bg-gradient-to-br from-pink-500 to-red-500"
                      }
                      name={m.role === "user" ? "Me" : "AI"}
                    />
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-sm shadow-lg shadow-purple-500/20"
                        : "bg-white/10 text-gray-100 rounded-tl-sm border border-white/5"
                      }`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar
                    size="sm"
                    isBordered
                    className="bg-gradient-to-br from-pink-500 to-red-500"
                    name="AI"
                  />
                  <div className="bg-white/10 rounded-2xl rounded-tl-sm border border-white/5">
                    <TypingIndicator />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </ScrollShadow>

          {/* Input Area */}
          <div className="p-4 bg-black/30 border-t border-white/10">
            <form
              className="flex gap-3"
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            >
              <Input
                fullWidth
                placeholder={ingestStatus === "success"
                  ? "Ask about your document..."
                  : "Upload and process a PDF first..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || ingestStatus !== "success"}
                classNames={{
                  inputWrapper: "bg-white/10 border border-white/20 hover:border-purple-500/50 focus-within:border-purple-500 transition-colors",
                  input: "text-white placeholder:text-gray-500",
                }}
                size="lg"
              />
              <Button
                type="submit"
                isIconOnly
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
                isLoading={loading}
                isDisabled={!input.trim() || ingestStatus !== "success"}
                size="lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}