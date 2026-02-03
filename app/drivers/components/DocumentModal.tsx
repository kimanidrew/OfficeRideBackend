import { FaTimesCircle, FaFileAlt, FaUpload } from "react-icons/fa";

export default function DocumentModal({ selectedDoc, setSelectedDoc }: any) {
  const getFileType = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    return 'other';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between px-8 py-5 border-b bg-white">
          <div>
            <h3 className="text-xl font-bold text-slate-800 capitalize leading-tight">
              {selectedDoc.type.replace('_', ' ')}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">{selectedDoc.url.split('/').pop()}</p>
          </div>
          <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-all">
            <FaTimesCircle size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-slate-100 flex items-center justify-center">
          {getFileType(selectedDoc.url) === 'image' ? (
            <img src={selectedDoc.url} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border-4 border-white" />
          ) : getFileType(selectedDoc.url) === 'pdf' ? (
            <object data={`${selectedDoc.url}#navpanes=0`} type="application/pdf" className="w-full h-[70vh] rounded-xl border border-slate-200">
              <div className="p-20 text-center bg-white rounded-xl">
                <FaFileAlt className="text-6xl text-slate-200 mx-auto mb-4" />
                <p>Native PDF preview unavailable.</p>
              </div>
            </object>
          ) : (
            <div className="text-center p-20 bg-white rounded-2xl">
              <FaFileAlt className="text-7xl text-slate-200 mx-auto mb-6" />
              <p className="text-slate-500 font-bold text-lg">Preview not supported</p>
            </div>
          )}
        </div>

        <div className="p-5 bg-white border-t flex justify-end items-center gap-4 px-8">
          <button onClick={() => setSelectedDoc(null)} className="px-6 py-2.5 text-slate-500 font-semibold hover:bg-slate-50">Cancel</button>
          <a href={selectedDoc.url} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all">
            <FaUpload className="rotate-180" /> Download
          </a>
        </div>
      </div>
    </div>
  );
}
