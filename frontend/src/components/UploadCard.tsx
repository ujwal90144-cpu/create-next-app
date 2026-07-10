import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileType, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UploadCardProps {
  onFileAccepted: (file: File, parsedData: any[]) => void;
}

export function UploadCard({ onFileAccepted }: UploadCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    if (rejectedFiles.length > 0) {
      setError("Please upload a valid CSV file.");
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Only CSV files are supported.");
      return;
    }

    setIsParsing(true);
    
    // Animate progress bar artificially to show it's doing something on large files
    const interval = setInterval(() => {
      setProgress(p => (p < 90 ? p + 10 : p));
    }, 100);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        clearInterval(interval);
        setProgress(100);
        
        if (results.errors.length > 0 && results.data.length === 0) {
          setError("Failed to parse CSV file. Ensure it's correctly formatted.");
          setIsParsing(false);
          return;
        }

        setTimeout(() => {
          setIsParsing(false);
          onFileAccepted(file, results.data);
        }, 500); // Small delay for UX
      },
      error: (err) => {
        clearInterval(interval);
        setError(err.message);
        setIsParsing(false);
      }
    });
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <Card className="max-w-3xl mx-auto border-neutral-800 bg-neutral-900/50 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
      <CardContent className="p-0">
        <div 
          {...getRootProps()} 
          className={`relative group p-16 border-2 border-dashed transition-all duration-300 ease-out cursor-pointer flex flex-col items-center justify-center text-center
            ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-neutral-800 hover:border-indigo-500/50 hover:bg-neutral-800/30'}
          `}
        >
          <input {...getInputProps()} />
          
          <AnimatePresence mode="wait">
            {isParsing ? (
              <motion.div
                key="parsing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-sm flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
                  <FileType className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-medium text-neutral-200 mb-2">Parsing CSV...</h3>
                <p className="text-sm text-neutral-400 mb-6">Please wait while we read your file locally.</p>
                <Progress value={progress} className="h-2 w-full bg-neutral-800" />
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-neutral-800/50 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-500 flex items-center justify-center mb-6 shadow-inner">
                  <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-indigo-400' : 'text-neutral-400 group-hover:text-indigo-400'} transition-colors`} />
                </div>
                <h3 className="text-2xl font-semibold text-neutral-100 mb-3">
                  {isDragActive ? "Drop the file here" : "Drag & Drop your CSV"}
                </h3>
                <p className="text-neutral-400 max-w-sm mb-8">
                  Upload exports from Facebook Leads, Google Ads, or any other CRM. We'll handle the mapping.
                </p>
                
                <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-neutral-800/80 text-neutral-300 border border-neutral-700/50 shadow-sm group-hover:border-indigo-500/30 transition-colors">
                  <span className="font-medium text-white">Choose File</span>
                  <span className="text-neutral-500">or drop it here</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-6 py-4 bg-red-950/30 border-t border-red-900/50 flex items-center gap-3 text-red-400"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
