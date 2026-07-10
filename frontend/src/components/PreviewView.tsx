import { useState, useMemo, useRef } from "react";
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender,
  ColumnDef
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import axios from "axios";
import { FileText, X, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ImportResponse } from "@/types";

interface PreviewViewProps {
  file: File;
  records: any[];
  onCancel: () => void;
  onSuccess: (data: ImportResponse) => void;
}

export function PreviewView({ file, records, onCancel, onSuccess }: PreviewViewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For preview, we show all records but use virtualization so it doesn't lag
  const previewData = useMemo(() => records, [records]);
  
  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (previewData.length === 0) return [];
    return Object.keys(previewData[0]).map(key => ({
      id: key,
      accessorFn: (row) => row[key],
      header: key,
      cell: info => {
        const val = info.getValue();
        return (
          <div className="max-w-[200px] truncate">
            {val !== undefined && val !== null ? String(val) : ""}
          </div>
        );
      },
    }));
  }, [previewData]);

  const table = useReactTable({
    data: previewData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const handleConfirmImport = async () => {
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post<ImportResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/import`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        onSuccess(response.data);
      } else {
        setError(response.data.message || "Import failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Network error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full border-neutral-800 bg-neutral-900/80 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl flex flex-col h-[85vh]">
      <CardHeader className="border-b border-neutral-800 bg-neutral-900/50 p-6 flex flex-row items-center justify-between shrink-0">
        <div>
          <CardTitle className="flex items-center gap-3 text-2xl text-white">
            <FileText className="text-indigo-400 w-6 h-6" />
            CSV Preview
          </CardTitle>
          <div className="flex items-center gap-4 mt-2 text-sm text-neutral-400">
            <span className="flex items-center gap-1.5 bg-neutral-800/50 px-2.5 py-1 rounded-md border border-neutral-800">
              <strong className="text-white">{records.length}</strong> rows
            </span>
            <span className="flex items-center gap-1.5 bg-neutral-800/50 px-2.5 py-1 rounded-md border border-neutral-800">
              <strong className="text-white">{columns.length}</strong> columns
            </span>
            <span className="text-neutral-500">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            disabled={isUploading}
            className="text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button 
            onClick={handleConfirmImport} 
            disabled={isUploading || records.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Confirm & Import AI Map
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {error && (
        <div className="bg-red-950/40 border-b border-red-900/50 px-6 py-3 text-sm text-red-400 flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {isUploading && (
        <div className="px-6 py-4 bg-indigo-950/20 border-b border-indigo-900/30 flex flex-col gap-2 shrink-0">
          <div className="flex justify-between text-xs font-medium text-indigo-300">
            <span>Uploading & running AI field mapping...</span>
            <span className="animate-pulse">Please do not close this window</span>
          </div>
          <Progress value={50} className="h-1 bg-indigo-950/50 [&>div]:bg-indigo-500" />
        </div>
      )}

      <CardContent className="p-0 flex-1 overflow-hidden relative">
        <div 
          ref={tableContainerRef} 
          className="h-full overflow-auto custom-scrollbar"
        >
          <div className="min-w-[800px]">
            <table className="w-full text-sm text-left text-neutral-300 grid">
              <thead className="text-xs text-neutral-400 uppercase bg-neutral-900/90 sticky top-0 backdrop-blur-sm shadow-sm z-10 grid">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="flex w-full">
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-6 py-4 font-medium border-b border-neutral-800 flex-1 min-w-[150px]">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              
              <tbody 
                style={{ 
                  display: 'grid',
                  height: `${rowVirtualizer.getTotalSize()}px`, // tells scrollbar how big the table is
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const row = rows[virtualRow.index];
                  return (
                    <tr 
                      key={row.id}
                      className={`flex w-full absolute top-0 left-0 border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors ${virtualRow.index % 2 === 0 ? 'bg-neutral-900/20' : ''}`}
                      style={{
                        transform: `translateY(${virtualRow.start}px)`, // places the row exactly where it should be
                      }}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-3 font-light flex-1 min-w-[150px]">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
