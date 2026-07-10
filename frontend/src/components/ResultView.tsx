import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImportResponse } from "@/types";

interface ResultViewProps {
  result: ImportResponse;
  onReset: () => void;
}

export function ResultView({ result, onReset }: ResultViewProps) {
  const [activeTab, setActiveTab] = useState<"success" | "skipped">("success");

  const totalProcessed = result.importedCount + result.skippedCount;
  const successRate = totalProcessed > 0 ? ((result.importedCount / totalProcessed) * 100).toFixed(1) : "0";

  const downloadJson = (data: any[], filename: string) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-md">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-3xl font-bold text-white">{result.importedCount}</h3>
            <p className="text-sm text-neutral-400">Successfully Mapped</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-md">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <XCircle className="w-8 h-8 text-rose-400 mb-3" />
            <h3 className="text-3xl font-bold text-white">{result.skippedCount}</h3>
            <p className="text-sm text-neutral-400">Skipped (No Contact Info)</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-md">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-8 h-8 text-indigo-400 mb-3" />
            <h3 className="text-3xl font-bold text-white">{successRate}%</h3>
            <p className="text-sm text-neutral-400">Success Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-md">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Clock className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-3xl font-bold text-white">{((result.processingTimeMs || 0) / 1000).toFixed(1)}s</h3>
            <p className="text-sm text-neutral-400">AI Processing Time</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex bg-neutral-900/50 p-1 rounded-lg border border-neutral-800 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab("success")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "success" 
                ? "bg-neutral-800 text-white shadow-sm" 
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Mapped Data ({result.parsedRecords.length})
          </button>
          <button 
            onClick={() => setActiveTab("skipped")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "skipped" 
                ? "bg-neutral-800 text-white shadow-sm" 
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Skipped Data ({result.skippedRecords.length})
          </button>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onReset}
            className="border-neutral-700 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Start New Import
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => {
              if (activeTab === "success") downloadJson(result.parsedRecords, "mapped_records.json");
              else downloadJson(result.skippedRecords, "skipped_records.json");
            }}
          >
            <Download className="w-4 h-4 mr-2" /> 
            Download JSON
          </Button>
        </div>
      </div>

      <Card className="border-neutral-800 bg-neutral-900/80 backdrop-blur-xl shadow-xl overflow-hidden rounded-2xl flex flex-col h-[500px]">
        <div className="overflow-auto flex-1 custom-scrollbar">
          {activeTab === "success" ? (
            <SuccessTable records={result.parsedRecords} />
          ) : (
            <SkippedTable records={result.skippedRecords} />
          )}
        </div>
      </Card>
    </div>
  );
}

function SuccessTable({ records }: { records: any[] }) {
  if (records.length === 0) return <EmptyState message="No records were successfully mapped." />;

  const columns = Object.keys(records[0] || {});

  return (
    <table className="w-full text-sm text-left text-neutral-300">
      <thead className="text-xs text-neutral-400 uppercase bg-neutral-900/90 sticky top-0 backdrop-blur-sm shadow-sm z-10">
        <tr>
          {columns.map((col) => (
            <th key={col} className="px-4 py-3 font-medium whitespace-nowrap border-b border-neutral-800">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((row, i) => (
          <tr key={i} className={`border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors ${i % 2 === 0 ? 'bg-neutral-900/20' : ''}`}>
            {columns.map((col) => (
              <td key={col} className="px-4 py-3 font-light truncate max-w-[200px]" title={row[col]}>
                {row[col] ? (typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])) : <span className="text-neutral-600">-</span>}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SkippedTable({ records }: { records: any[] }) {
  if (records.length === 0) return <EmptyState message="No records were skipped." />;

  const columns = Object.keys(records[0] || {}).filter(k => k !== '_skip_reason');

  return (
    <table className="w-full text-sm text-left text-neutral-300">
      <thead className="text-xs text-neutral-400 uppercase bg-neutral-900/90 sticky top-0 backdrop-blur-sm shadow-sm z-10">
        <tr>
          <th className="px-4 py-3 font-medium border-b border-neutral-800 text-rose-400">Skip Reason</th>
          {columns.map((col) => (
            <th key={col} className="px-4 py-3 font-medium whitespace-nowrap border-b border-neutral-800">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((row, i) => (
          <tr key={i} className={`border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors ${i % 2 === 0 ? 'bg-neutral-900/20' : ''}`}>
            <td className="px-4 py-3 font-medium text-rose-400/90">{row._skip_reason || "Unknown"}</td>
            {columns.map((col) => (
              <td key={col} className="px-4 py-3 font-light truncate max-w-[150px]" title={row[col]}>
                 {row[col] ? (typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])) : <span className="text-neutral-600">-</span>}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-neutral-500">
      <p>{message}</p>
    </div>
  );
}
