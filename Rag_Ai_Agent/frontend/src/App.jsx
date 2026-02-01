// src/App.jsx
import React from "react";
import ChatWidget from "./ChatWidget";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex items-center gap-2">
          <div className="w-3 h-8 bg-primary rounded-full"></div>
          <h1 className="text-2xl font-bold text-slate-800">RAG Knowledge Base</h1>
        </div>
        <ChatWidget />
      </div>
    </div>
  );
}