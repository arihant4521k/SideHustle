// src/App.jsx
import React from "react";
import { motion } from "framer-motion";
import ChatWidget from "./ChatWidget";

export default function App() {
  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            {/* Animated Logo */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-2xl">🤖</span>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 blur-lg opacity-40 -z-10"></div>
            </motion.div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                RAG Knowledge Base
              </h1>
              <p className="text-gray-400 text-sm md:text-base mt-1">
                Upload documents and unlock AI-powered insights
              </p>
            </div>
          </div>

          {/* Decorative line */}
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ChatWidget />
        </motion.div>
      </div>
    </div>
  );
}