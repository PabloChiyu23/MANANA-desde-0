
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { LessonParams } from '../types';

interface LessonResultProps {
  content: string;
  planBContent: string | null;
  params: LessonParams;
  isPro: boolean;
  onSave: () => void;
  onRegenerate: () => void;
  onUpgrade: () => void;
  onGeneratePlanB: () => void;
  isLoading: boolean;
  isPlanBLoading: boolean;
}

const LessonResult: React.FC<LessonResultProps> = ({ 
  content, 
  planBContent,
  params,
  isPro, 
  onSave, 
  onRegenerate, 
  onUpgrade, 
  onGeneratePlanB,
  isLoading,
  isPlanBLoading
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleCopy = () => {
    const textToCopy = planBContent ? `${content}\n\n--- PLAN B ---\n${planBContent}` : content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Limpia el texto para el PDF:
   * 1. Remueve símbolos de Markdown (#, *)
   * 2. Remueve emojis (Unicode ranges)
   * 3. Sustituye checkboxes por guiones simples
   * 4. Mantiene caracteres latinos/españoles (á, é, í, ó, ú, ñ)
   */
  const cleanTextForPdf = (text: string) => {
    // 1. Quitar markdown
    let cleaned = text.replace(/[#*]/g, '');
    
    // 2. Reemplazar checkboxes comunes por guiones para que no salgan símbolos raros
    cleaned = cleaned.replace(/[☐☑☒]/g, '-');

    // 3. Remover emojis usando un regex robusto
    // Este regex cubre la mayoría de los rangos de emojis y símbolos suplementarios
    cleaned = cleaned.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');

    // 4. Limpieza final de cualquier carácter no ASCII/Latín-1 que jsPDF helvetica no soporte
    // Permitimos el rango de caracteres latinos extendidos para el español
    return cleaned.trim();
  };

  const handleExportPDF = () => {
    if (!isPro) {
      onUpgrade();
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = 20;

      const lines = content.split('\n');
      
      lines.forEach((line) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }

        const isMainTitle = line.startsWith('# ');
        const isSectionHeader = line.startsWith('## ');
        const isSeparator = line.startsWith('---');

        if (isSeparator) {
          currentY += 2;
          doc.setDrawColor(230, 230, 230);
          doc.line(margin, currentY, pageWidth - margin, currentY);
          currentY += 6;
          return;
        }

        // Limpiamos la línea de emojis y markdown para el PDF
        const cleanLine = cleanTextForPdf(line);
        if (!cleanLine && !isSeparator) return; // Si la línea quedó vacía por los emojis, saltar

        if (isMainTitle) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(18);
          doc.setTextColor(22, 101, 52); // Green 800
          doc.text(cleanLine, margin, currentY);
          currentY += 12;
        } else if (isSectionHeader) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(31, 41, 55); // Gray 800
          doc.text(cleanLine, margin, currentY);
          currentY += 8;
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(75, 85, 99); // Gray 600
          const splitLines = doc.splitTextToSize(cleanLine, contentWidth);
          splitLines.forEach((l: string) => {
            if (currentY > 270) { doc.addPage(); currentY = 20; }
            doc.text(l, margin, currentY);
            currentY += 6;
          });
        }
      });

      if (planBContent) {
        doc.addPage();
        currentY = 20;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(180, 83, 9); // Amber 700
        doc.text('ESTRATEGIA DE RESCATE (PLAN B)', margin, currentY);
        currentY += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const cleanPlanB = cleanTextForPdf(planBContent);
        const splitPlanB = doc.splitTextToSize(cleanPlanB, contentWidth);
        doc.text(splitPlanB, margin, currentY);
      }

      // Pie de página
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pageCount} · Generado por MAÑANA`, pageWidth / 2, 285, { align: 'center' });
      }

      doc.save(`Planeacion_NEM_${params.topic.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error al generar PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="mt-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col h-full">
        <div className="bg-green-600 p-5 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <span className="text-xl">📋</span> TU CLASE ESTÁ LISTA
          </h3>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-white text-green-700 hover:bg-green-50 rounded-xl text-xs font-black uppercase transition-all shadow-md active:scale-95"
          >
            {copied ? "¡COPIADO!" : "COPIAR TODO"}
          </button>
        </div>

        <div className="p-8 bg-white prose prose-green max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-medium font-sans text-sm sm:text-base">
            {content}
          </div>

          {planBContent && (
            <div className="mt-8 p-6 bg-amber-50 border-2 border-dashed border-amber-200 rounded-2xl animate-in zoom-in-95">
              <div className="whitespace-pre-wrap text-amber-900 leading-relaxed font-sans italic text-sm">
                {planBContent}
              </div>
            </div>
          )}

          {isPlanBLoading && (
            <div className="mt-8 p-6 bg-amber-50 border-2 border-dashed border-amber-100 rounded-2xl flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-amber-600 font-bold text-xs uppercase tracking-widest">Creando plan B...</span>
            </div>
          )}
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-b flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 w-full">
            <button 
              onClick={handleExportPDF}
              disabled={isGeneratingPdf}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                isPro ? 'bg-white border text-gray-700 hover:bg-gray-50 shadow-sm' : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              {isGeneratingPdf ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : <span>📄</span>}
              {isGeneratingPdf ? 'Generando...' : 'Exportar PDF'} {!isPro && '🔒'}
            </button>
            <button 
              onClick={() => onGeneratePlanB()}
              disabled={isPlanBLoading || (!!planBContent)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm"
            >
              <span>⚡</span> {planBContent ? 'PLAN B LISTO' : 'Generar Plan B'}
            </button>
          </div>
        </div>

        <div className="p-6 bg-white flex flex-col sm:flex-row gap-4">
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex-1 py-4 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-gray-700 font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            🔄 OTRA VERSIÓN
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-4 px-6 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 transform active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            ⭐ GUARDAR CLASE
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonResult;
