import React, { useRef, useState } from 'react';
import { Adjunto } from '../../types';
import { procesarArchivoAdjunto, tamanoLegible } from '../../lib/utils';
import {
  UploadCloud,
  Paperclip,
  FileText,
  Image as ImageIcon,
  FileCode,
  X,
  Eye,
  Download,
  AlertCircle,
} from 'lucide-react';

interface FileUploadZoneProps {
  adjuntos: Adjunto[];
  onAdjuntosChange: (nuevosAdjuntos: Adjunto[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  compact?: boolean;
  label?: string;
  helperText?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  adjuntos,
  onAdjuntosChange,
  maxFiles = 10,
  maxSizeMB = 25,
  compact = false,
  label = 'Adjuntar archivos o capturas de pantalla',
  helperText = 'Formatos soportados: PNG, JPG, PDF, XML, XLSX, CSV, TXT, LOG (Máximo 25MB por archivo)',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const procesarArchivos = async (archivos: FileList | File[]) => {
    setErrorMsg(null);
    if (!archivos || archivos.length === 0) return;

    if (adjuntos.length + archivos.length > maxFiles) {
      setErrorMsg(`Solo puedes adjuntar hasta un máximo de ${maxFiles} archivos.`);
      return;
    }

    setCargando(true);
    const nuevos: Adjunto[] = [];

    for (let i = 0; i < archivos.length; i++) {
      const file = archivos[i];
      if (file.size > maxSizeMB * 1024 * 1024) {
        setErrorMsg(`El archivo "${file.name}" supera el límite de ${maxSizeMB}MB.`);
        continue;
      }
      try {
        const adj = await procesarArchivoAdjunto(file);
        nuevos.push(adj);
      } catch (err) {
        console.error('Error al procesar archivo:', err);
      }
    }

    if (nuevos.length > 0) {
      onAdjuntosChange([...adjuntos, ...nuevos]);
    }
    setCargando(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await procesarArchivos(e.dataTransfer.files);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await procesarArchivos(e.target.files);
    }
  };

  const handleEliminar = (id: string) => {
    onAdjuntosChange(adjuntos.filter((a) => a.id !== id));
  };

  const getFileBadgeIcon = (nombre: string, mime: string) => {
    const ext = nombre.split('.').pop()?.toLowerCase() || '';
    if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
      return <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
    if (['xml', 'json', 'log'].includes(ext)) {
      return <FileCode className="w-4 h-4 text-amber-500 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-[#1565C0] shrink-0" />;
  };

  return (
    <div className="space-y-3">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleInputChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.xml,.txt,.csv,.log,.zip"
      />

      {/* Label and counter */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-[#1565C0] dark:text-[#3FA2E8]" />
          <span>{label}</span>
        </label>
        {adjuntos.length > 0 && (
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {adjuntos.length} de {maxFiles} archivos
          </span>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Zone */}
      {!compact ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#1565C0] bg-blue-50/80 dark:bg-blue-950/50 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-[#1565C0] dark:hover:border-[#3FA2E8] bg-slate-50/60 dark:bg-[#081B3A]/40'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-[#1565C0] dark:text-[#3FA2E8] flex items-center justify-center shadow-xs">
              <UploadCloud className={`w-6 h-6 ${cargando ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                {cargando
                  ? 'Procesando archivos adjuntos...'
                  : 'Haz clic para seleccionar o arrastra archivos aquí'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {helperText}
              </p>
            </div>
            <button
              type="button"
              className="mt-1 px-4 py-1.5 rounded-xl bg-white dark:bg-[#0E244D] border border-slate-200 dark:border-[#1A3668] text-xs font-semibold text-[#1565C0] dark:text-[#3FA2E8] hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs pointer-events-none"
            >
              Explorar archivos de mi dispositivo
            </button>
          </div>
        </div>
      ) : (
        /* Compact button trigger */
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1A3668] bg-slate-50 dark:bg-[#081B3A] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#1565C0] hover:border-[#1565C0] transition"
          >
            <Paperclip className="w-3.5 h-3.5 text-[#1565C0] dark:text-[#3FA2E8]" />
            <span>Adjuntar archivo</span>
          </button>
          <span className="text-[11px] text-slate-400">
            {adjuntos.length === 0 ? 'Sin archivos' : `${adjuntos.length} adjunto(s)`}
          </span>
        </div>
      )}

      {/* Uploaded Files Grid */}
      {adjuntos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {adjuntos.map((adj) => {
            const esImagen =
              adj.tipoMime.startsWith('image/') ||
              ['png', 'jpg', 'jpeg', 'webp', 'gif'].some((ext) =>
                adj.nombre.toLowerCase().endsWith(ext)
              );

            return (
              <div
                key={adj.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#0E244D] border border-slate-200 dark:border-[#1A3668] shadow-2xs group hover:border-[#1565C0] dark:hover:border-[#3FA2E8] transition"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Thumbnail if image and dataUrl available */}
                  {esImagen && adj.url && adj.url.startsWith('data:') ? (
                    <div
                      onClick={() => setPreviewImage(adj.url)}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                      title="Ver vista previa ampliada"
                    >
                      <img
                        src={adj.url}
                        alt={adj.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#081B3A] border border-slate-200 dark:border-[#1A3668] flex items-center justify-center shrink-0">
                      {getFileBadgeIcon(adj.nombre, adj.tipoMime)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate"
                      title={adj.nombre}
                    >
                      {adj.nombre}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{tamanoLegible(adj.tamanoBytes)}</span>
                      {esImagen && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Imagen
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* File Actions */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {esImagen && adj.url && adj.url.startsWith('data:') && (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(adj.url)}
                      className="p-1 rounded-lg text-slate-400 hover:text-[#1565C0] dark:hover:text-[#3FA2E8] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Vista previa"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {adj.url && adj.url.startsWith('data:') && (
                    <a
                      href={adj.url}
                      download={adj.nombre}
                      className="p-1 rounded-lg text-slate-400 hover:text-[#1565C0] dark:hover:text-[#3FA2E8] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Descargar"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleEliminar(adj.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    title="Eliminar archivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white dark:bg-[#0E244D] p-2 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Vista previa ampliada"
              className="max-h-[80vh] w-auto rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
