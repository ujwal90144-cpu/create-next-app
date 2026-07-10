"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCard } from "@/components/UploadCard";
import { PreviewView } from "@/components/PreviewView";
import { ResultView } from "@/components/ResultView";
import { ImportResponse } from "@/types";

export default function Home() {
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawRecords, setRawRecords] = useState<any[]>([]);
  const [result, setResult] = useState<ImportResponse | null>(null);

  const handleFileAccepted = (acceptedFile: File, parsedData: any[]) => {
    setFile(acceptedFile);
    setRawRecords(parsedData);
    setStep("preview");
  };

  const handleImportSuccess = (response: ImportResponse) => {
    setResult(response);
    setStep("result");
  };

  const reset = () => {
    setFile(null);
    setRawRecords([]);
    setResult(null);
    setStep("upload");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30">
      {/* Premium background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-950 to-neutral-950 -z-10" />

      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center px-3 py-1 mb-6 text-sm font-medium rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <span className="flex w-2 h-2 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
            Production Ready
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-500">
            AI Powered <br className="md:hidden" /> CSV Importer
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light">
            Import CSV files from any CRM and intelligently convert them into the GrowEasy CRM format using AI field mapping.
          </p>
        </motion.div>

        <div className="mt-12 relative z-10">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {step === "upload" && (
              <UploadCard onFileAccepted={handleFileAccepted} />
            )}
            
            {step === "preview" && file && (
              <PreviewView 
                file={file} 
                records={rawRecords} 
                onCancel={reset}
                onSuccess={handleImportSuccess}
              />
            )}

            {step === "result" && result && (
              <ResultView result={result} onReset={reset} />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
