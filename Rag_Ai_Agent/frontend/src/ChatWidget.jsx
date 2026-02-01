// src/ChatWidget.jsx
import { useState, useRef, useEffect } from "react";
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
} from "@heroui/react";

export default function ChatWidget() {
  // --- STATE: Chat ---
  const [msgs, setMsgs] = useState([
    { role: "bot", text: "Hello! Upload a PDF to knowledge base, then ask me anything about it." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // --- STATE: RAG Processing ---
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, success, error
  const [ingestStatus, setIngestStatus] = useState("idle"); // idle, ingesting, success, error
  const [statusMsg, setStatusMsg] = useState("");

  // Auto-scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // --- HANDLER: Upload PDF ---
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setUploadStatus("idle");
      setIngestStatus("idle");
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploadStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.status === "success") {
        setUploadStatus("success");
        setStatusMsg("File uploaded! Now click 'Process PDF'.");
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setUploadStatus("error");
      setStatusMsg("Upload failed.");
      console.error(err);
    }
  };

  // --- HANDLER: Ingest (Chunk & Embed) ---
  const ingestFile = async () => {
    setIngestStatus("ingesting");
    try {
      const res = await fetch("http://localhost:8000/ingest", {
        method: "POST",
      });
      const data = await res.json();

      if (data.status === "ok") {
        setIngestStatus("success");
        setStatusMsg(`Success! Knowledge base updated with ${data.chunks_count} chunks.`);
        setMsgs((prev) => [...prev, { role: "bot", text: "I have read the document. What would you like to know?" }]);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setIngestStatus("error");
      setStatusMsg("Ingestion failed.");
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
      setMsgs((prev) => [...prev, { role: "bot", text: "Error connecting to server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[85vh]">
      
      {/* LEFT SIDEBAR: Knowledge Base Management */}
      <Card className="w-full md:w-1/3 p-4 h-fit md:h-full bg-content1 shadow-md">
        <CardBody className="gap-6">
          <div>
            <h3 className="text-xl font-bold text-primary mb-2">Knowledge Base</h3>
            <p className="text-sm text-default-500">Upload a PDF to train your AI.</p>
          </div>
          
          <Divider />

          {/* File Input */}
          <div className="flex flex-col gap-3">
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary
                hover:file:bg-primary-100"
            />
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                color="primary" 
                variant={uploadStatus === "success" ? "flat" : "solid"}
                onPress={uploadFile}
                isLoading={uploadStatus === "uploading"}
                isDisabled={!file || uploadStatus === "success"}
                className="flex-1"
              >
                {uploadStatus === "success" ? "Uploaded" : "1. Upload"}
              </Button>

              <Button 
                color="secondary" 
                onPress={ingestFile}
                isLoading={ingestStatus === "ingesting"}
                isDisabled={uploadStatus !== "success"}
                className="flex-1"
              >
                2. Process
              </Button>
            </div>
          </div>

          {/* Status Chips */}
          {statusMsg && (
            <Chip 
              color={ingestStatus === "success" ? "success" : uploadStatus === "error" ? "danger" : "warning"} 
              variant="flat" 
              className="w-full justify-center"
            >
              {statusMsg}
            </Chip>
          )}

          <Divider />
          
          <div className="text-xs text-default-400">
            <p>Supported: PDF Files</p>
            <p>Max Size: 10MB</p>
          </div>
        </CardBody>
      </Card>

      {/* RIGHT PANEL: Chat Interface */}
      <Card className="flex-1 h-full shadow-lg bg-content1">
        
        {/* Messages Area */}
        <ScrollShadow className="flex-1 p-6 space-y-4">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar 
                  size="sm" 
                  isBordered 
                  color={m.role === "user" ? "primary" : "secondary"}
                  name={m.role === "user" ? "Me" : "AI"}
                />
                <div className={`p-3 rounded-xl text-sm ${
                  m.role === "user" 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-default-100 text-default-900 rounded-tl-none"
                }`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="flex gap-3 items-center bg-default-50 p-3 rounded-xl rounded-tl-none">
                  <Spinner size="sm" color="secondary" />
                  <span className="text-xs text-default-500">Generating answer...</span>
               </div>
             </div>
          )}
          <div ref={bottomRef} />
        </ScrollShadow>

        {/* Input Area */}
        <div className="p-4 bg-default-50 border-t border-default-200">
          <form 
            className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          >
            <Input
              fullWidth
              placeholder="Ask about your document..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || ingestStatus !== "success"}
              classNames={{
                inputWrapper: "bg-white shadow-sm",
              }}
            />
            <Button 
              type="submit" 
              color="primary" 
              isIconOnly 
              isLoading={loading}
              isDisabled={!input.trim() || ingestStatus !== "success"}
            >
              ➝
            </Button>
          </form>
          {ingestStatus !== "success" && (
            <p className="text-xs text-center text-default-400 mt-2">
              Please upload and process a document to start chatting.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}