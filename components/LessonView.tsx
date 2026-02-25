import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Lesson, ChatMessage } from '../types';
import { Button } from './Button';
import { Download, Edit3, CheckCircle2, MessageSquareText, X, Loader2, Plus, Trash2, Undo, Save } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { modifyLesson } from '../services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface LessonViewProps {
  lesson: Lesson;
  onUpdateLesson: (updatedLesson: Lesson) => void;
}

type EditMode = 'idle' | 'add' | 'remove' | 'generating';

export const LessonView: React.FC<LessonViewProps> = ({ lesson, onUpdateLesson }) => {
  const [content, setContent] = useState(lesson.content);
  // Edit States
  const [isEditingPanelOpen, setIsEditingPanelOpen] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>('idle');
  const [editInstruction, setEditInstruction] = useState('');
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const [downloadState, setDownloadState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // Load content when lesson changes
  useEffect(() => {
    setContent(lesson.content);
    resetEditState();
    setDownloadState('idle');
    if (!lesson.chatHistory) {
       onUpdateLesson({...lesson, chatHistory: []});
    }
  }, [lesson.id]);

  const resetEditState = () => {
      setIsEditingPanelOpen(false);
      setEditMode('idle');
      setEditInstruction('');
      setPreviewContent(null);
  }

  const handleApplyModification = async () => {
      if (!editInstruction.trim()) return;
      setEditMode('generating');
      
      try {
          let fullInstruction = editInstruction;
          if (editMode === 'add') {
              fullInstruction = `AJOUT : ${editInstruction}`;
          } else if (editMode === 'remove') {
              fullInstruction = `SUPPRESSION : ${editInstruction}`;
          }

          const newContent = await modifyLesson(content, fullInstruction);
          setPreviewContent(newContent);
          setEditMode('idle');
      } catch (error) {
          alert("Erreur lors de la modification. Veuillez réessayer.");
          setEditMode('idle');
      }
  };

  const handleConfirmChanges = () => {
      if (previewContent) {
          const updatedLesson = { ...lesson, content: previewContent };
          setContent(previewContent);
          onUpdateLesson(updatedLesson);
          resetEditState();
      }
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setDownloadState('loading');

    try {
        const input = contentRef.current;
        
        // Standard high-quality capture
        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: input.scrollWidth,
            // Ensure background color is white for PDF even in dark mode
            backgroundColor: '#ffffff',
            ignoreElements: (element) => element.classList.contains('no-print')
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const width = pdfWidth;
        const height = width / ratio;

        // Simple multipage logic
        let heightLeft = height;
        let position = 0;
        let pageHeight = pdfHeight;

        pdf.addImage(imgData, 'PNG', 0, position, width, height);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - height;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, width, height);
            heightLeft -= pageHeight;
        }

        pdf.save(`Karongo-${lesson.topic.replace(/\s+/g, '_')}.pdf`);
        setDownloadState('success');
        setTimeout(() => setDownloadState('idle'), 2500);

    } catch (error) {
        console.error("PDF Generation failed", error);
        alert("Erreur lors de la création du PDF. Veuillez réessayer.");
        setDownloadState('idle');
    }
  };

  const handleUpdateHistory = (newHistory: ChatMessage[]) => {
      onUpdateLesson({ ...lesson, chatHistory: newHistory });
  };

  const displayContent = previewContent || content;

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 bg-gray-50 dark:bg-gray-900`}>
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          
          {/* Edit Panel Overlay */}
          {isEditingPanelOpen && (
            <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-2 border-amber-500 animate-in fade-in slide-in-from-top-4 relative z-40">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <Edit3 size={20} className="mr-2 text-amber-600" />
                        Assistant de Modification
                    </h3>
                    <button onClick={resetEditState} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {!previewContent ? (
                    <>
                        <div className="flex gap-4 mb-4">
                            <button 
                                onClick={() => setEditMode('add')}
                                className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-all flex flex-col items-center gap-2
                                    ${editMode === 'add' 
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'}`}
                            >
                                <Plus size={20} />
                                Ajouter / Modifier
                            </button>
                            <button 
                                onClick={() => setEditMode('remove')}
                                className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-all flex flex-col items-center gap-2
                                    ${editMode === 'remove' 
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                                        : 'border-gray-200 dark:border-gray-700 hover:border-red-300'}`}
                            >
                                <Trash2 size={20} />
                                Supprimer
                            </button>
                        </div>

                        {editMode !== 'idle' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {editMode === 'add' ? "Instruction d'ajout/modification :" : "Partie à supprimer :"}
                                    </label>
                                    <textarea 
                                        value={editInstruction}
                                        onChange={(e) => setEditInstruction(e.target.value)}
                                        placeholder={editMode === 'add' ? "Ex: Ajoute un exercice sur les périmètres à la fin." : "Ex: Retire la partie motivation car elle est trop longue."}
                                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 outline-none min-h-[100px]"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" onClick={() => setEditMode('idle')}>Annuler</Button>
                                    <Button 
                                        onClick={handleApplyModification} 
                                        isLoading={editMode === 'generating'}
                                        disabled={!editInstruction.trim()}
                                    >
                                        Générer
                                    </Button>
                                </div>
                            </div>
                        )}
                         {editMode === 'idle' && (
                             <p className="text-sm text-gray-500 italic text-center">Sélectionnez une action ci-dessus pour commencer.</p>
                         )}
                    </>
                ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center">
                            <CheckCircle2 size={18} className="mr-2" />
                            Aperçu des modifications
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            Les ajouts sont surlignés en vert. Si le résultat vous convient, validez.
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={handleConfirmChanges} className="bg-green-600 hover:bg-green-700 text-white">
                                <Save size={16} className="mr-2" /> Valider
                            </Button>
                            <Button variant="outline" onClick={() => setPreviewContent(null)}>
                                <Undo size={16} className="mr-2" /> Annuler
                            </Button>
                        </div>
                    </div>
                )}
            </div>
          )}

          {/* Toolbar - Z-Index 30 ensures it stays above Lesson Content (Z-10) */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors">
            <div className="min-w-0 flex-1 mr-2">
              <h2 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white line-clamp-2 md:line-clamp-1 leading-tight">
                {lesson.topic}
                {previewContent && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Prévisualisation</span>}
              </h2>
              <div className="flex gap-2 mt-1">
                 <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">{lesson.subject}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 shrink-0">
              <Button 
                variant={isChatOpen ? "secondary" : "outline"} 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="hidden md:flex items-center gap-2"
                title="Discuter avec l'IA"
              >
                {isChatOpen ? <X size={18} /> : <MessageSquareText size={18} />}
                <span className="hidden lg:inline">{isChatOpen ? 'Fermer Chat' : 'Questions ?'}</span>
              </Button>

              {!isEditingPanelOpen ? (
                <Button variant="outline" onClick={() => setIsEditingPanelOpen(true)} icon={<Edit3 size={16} />}>
                  Modifier
                </Button>
              ) : null}
              
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2 hidden sm:block"></div>

              {/* PDF Export Button */}
              <Button 
                variant="primary" 
                onClick={handleDownloadPDF} 
                title="Télécharger en PDF"
                disabled={downloadState === 'loading' || downloadState === 'success' || !!previewContent}
                className={`transition-all duration-300 ${downloadState === 'success' ? 'bg-green-600 border-green-600 hover:bg-green-700' : ''}`}
              >
                {downloadState === 'loading' ? (
                   <Loader2 size={20} className="animate-spin" />
                ) : downloadState === 'success' ? (
                   <CheckCircle2 size={20} className="animate-bounce" />
                ) : (
                   <div className="flex items-center">
                       <Download size={22} />
                       <span className="hidden sm:inline ml-2">Télécharger</span>
                   </div>
                )}
              </Button>
            </div>
          </div>

          {/* Lesson Content Container - Z-Index 10 */}
          <div className="lesson-container bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden min-h-[600px] print:shadow-none print:border-none print:min-h-0 transition-colors relative">
            
            {/* WATERMARK LAYER (Background) - Z-Index 0 */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
                <div className="w-full h-full flex flex-wrap content-start justify-center opacity-[0.03] dark:opacity-[0.04]">
                    {/* Grid of repeating watermarks */}
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className="w-64 h-64 flex items-center justify-center transform -rotate-45">
                            <span className="text-xl font-black text-gray-900 dark:text-gray-100 whitespace-nowrap border-2 border-current px-4 py-2 rounded-lg opacity-80">
                                KARONGO • USAGE ÉDUCATIF
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div 
                ref={contentRef} 
                className={`relative z-10 p-8 md:p-12 print:p-0 bg-transparent text-gray-900 dark:text-gray-100 ${previewContent ? 'ring-4 ring-amber-100 dark:ring-amber-900/30' : ''}`}
            >
                <div className="border-b-2 border-black dark:border-gray-500 pb-4 mb-8 flex justify-between items-end opacity-50 dark:opacity-70 print:opacity-100">
                    <span className="font-bold text-sm tracking-widest uppercase dark:text-gray-300">Karongo • CM2</span>
                    <span className="text-xs dark:text-gray-400">{new Date(lesson.createdAt).toLocaleDateString()}</span>
                </div>

                <article className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:my-1 print:prose-black bg-transparent">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white border-b border-amber-500 pb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg md:text-2xl font-semibold mt-8 mb-4 text-amber-700 dark:text-amber-500" {...props} />,
                            table: ({node, ...props}) => (
                                <div className="overflow-x-auto my-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />
                                </div>
                            ),
                            thead: ({node, ...props}) => <thead className="bg-gray-50/80 dark:bg-gray-900/80" {...props} />,
                            th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider" {...props} />,
                            td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800" {...props} />,
                            span: ({node, className, ...props}) => <span className={className} {...props} />
                        }}
                    >
                        {displayContent}
                    </ReactMarkdown>
                </article>
                
                <div className="mt-12 pt-4 border-t border-gray-300 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400 hidden print:block">
                    Généré par KARONGO - Assistant Pédagogique Burkina Faso
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sidebar (Desktop - Fixed width & Clean Transition) */}
      <div className={`
        hidden md:block 
        transition-all duration-300 ease-in-out 
        overflow-hidden 
        bg-white dark:bg-gray-850 
        ${isChatOpen ? 'w-[400px] border-l border-gray-200 dark:border-gray-700 shadow-xl' : 'w-0 border-l-0'}
      `}>
         {/* Inner container to hold width during transition */}
        <div className="w-[400px] h-full flex flex-col">
            <ChatInterface 
                lessonContent={lesson.content} 
                history={lesson.chatHistory || []} 
                onUpdateHistory={handleUpdateHistory}
                onClose={() => setIsChatOpen(false)}
            />
        </div>
      </div>

      {/* Chat Overlay (Mobile - Full width) */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 md:hidden flex flex-col">
             <ChatInterface 
                lessonContent={lesson.content} 
                history={lesson.chatHistory || []} 
                onUpdateHistory={handleUpdateHistory}
                onClose={() => setIsChatOpen(false)}
            />
        </div>
      )}

      {/* Mobile Chat Toggle (Floating Action Button) if chat is closed */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="md:hidden fixed bottom-6 right-6 p-4 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 z-30 flex items-center justify-center transition-transform active:scale-95"
        >
          <MessageSquareText size={24} />
        </button>
      )}
    </div>
  );
};