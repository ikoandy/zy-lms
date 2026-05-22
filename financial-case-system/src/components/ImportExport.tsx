import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Printer, FileSpreadsheet, Check, X, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import type { DebtorRecord } from '@/lib/api';

export default function ImportExport() {
  const batchImport = useStore((s) => s.batchImport);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<Partial<DebtorRecord>[]>([]);
  const [fileName, setFileName] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setImporting(true);
    setProgress(10);
    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      setProgress(30);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Partial<DebtorRecord>>(ws);
      setProgress(60);
      setPreview(json.slice(0, 20));
      setProgress(100);
    } catch {
      setPreview([]);
    } finally {
      setImporting(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.xlsx')) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    setProgress(0);
    try {
      setProgress(50);
      await batchImport(preview);
      setProgress(100);
      setPreview([]);
      setFileName('');
    } catch {
      setProgress(0);
    } finally {
      setImporting(false);
    }
  };

  const handleCancel = () => {
    setPreview([]);
    setFileName('');
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
          dragOver ? 'border-[#4A7CFF] bg-[#4A7CFF]/5' : 'border-[#2A2D3E] bg-[#1C1E2A]'
        }`}
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={36} className={`mb-3 ${dragOver ? 'text-[#4A7CFF]' : 'text-gray-500'}`} />
        <p className="mb-1 text-sm text-gray-300">拖拽 XLSX 文件到此处，或点击选择文件</p>
        <p className="text-xs text-gray-500">仅支持 .xlsx 格式</p>
        <input ref={fileRef} type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
      </div>

      {/* Progress */}
      {fileName && (
        <div className="flex items-center gap-2 rounded-lg bg-[#1C1E2A] p-3">
          <FileSpreadsheet size={16} className="text-[#34D399]" />
          <span className="flex-1 text-sm text-gray-300">{fileName}</span>
          {importing && <Loader2 size={16} className="animate-spin text-[#4A7CFF]" />}
        </div>
      )}
      {(importing || progress > 0) && progress < 100 && (
        <div className="h-2 overflow-hidden rounded-full bg-[#22253A]">
          <div className="h-full rounded-full bg-[#4A7CFF] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="rounded-xl border border-[#2A2D3E] bg-[#1C1E2A] p-4">
          <h3 className="mb-3 text-sm font-medium text-white">导入预览（前 {preview.length} 条）</h3>
          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2A2D3E]">
                  <th className="px-2 py-2 text-left text-gray-400">姓名</th>
                  <th className="px-2 py-2 text-left text-gray-400">身份证号</th>
                  <th className="px-2 py-2 text-left text-gray-400">合同编号</th>
                  <th className="px-2 py-2 text-left text-gray-400">欠款总额</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i} className="border-b border-[#2A2D3E]/50">
                    <td className="px-2 py-1.5 text-gray-300">{r.name || '-'}</td>
                    <td className="px-2 py-1.5 text-gray-300">{r.idCard || '-'}</td>
                    <td className="px-2 py-1.5 text-gray-300">{r.contractNo || '-'}</td>
                    <td className="px-2 py-1.5 text-gray-300">{r.totalDebt ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 rounded-lg bg-[#34D399] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2FC78A] disabled:opacity-50"
            >
              <Check size={14} /> 确认导入
            </button>
            <button onClick={handleCancel} className="flex items-center gap-2 rounded-lg border border-[#2A2D3E] bg-[#22253A] px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-[#2A2D3E]">
              <X size={14} /> 取消
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => window.open(api.downloadTemplateUrl(), '_blank')} className="flex items-center gap-2 rounded-lg border border-[#2A2D3E] bg-[#1C1E2A] px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-[#22253A]">
          <Download size={15} /> 下载模板
        </button>
        <button onClick={() => window.open(api.exportXlsxUrl(), '_blank')} className="flex items-center gap-2 rounded-lg bg-[#4A7CFF] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3B6AE0]">
          <FileSpreadsheet size={15} /> 导出 XLSX
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-[#2A2D3E] bg-[#1C1E2A] px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-[#22253A]">
          <Printer size={15} /> 打印
        </button>
      </div>
    </div>
  );
}
