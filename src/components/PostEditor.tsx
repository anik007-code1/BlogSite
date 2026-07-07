import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Globe, Heading, Code, Quote, Sparkles, 
  CheckCircle2, ShieldAlert, GripVertical, Trash2, Plus, 
  Copy, ChevronUp, ChevronDown, Youtube, BookOpen, AlertCircle, Laptop,
  Image, UploadCloud, Table
} from 'lucide-react';
import { Article } from '../types';

interface PostEditorProps {
  articleId?: string; // If passed, we are in "Edit" mode!
  allArticles: Article[];
  onBack: () => void;
  onSave: (articleData: Partial<Article>) => void;
  isLoading?: boolean;
}

interface Block {
  id: string;
  type: 'heading' | 'paragraph' | 'code' | 'quote' | 'youtube' | 'image' | 'table';
  value: string;
  meta?: {
    filename?: string;
  };
}

// Convert HTML String to Blocks list using standard browser-native DOMParser
const parseHTMLToBlocks = (html: string): Block[] => {
  if (!html || !html.trim()) {
    return [{ id: '1', type: 'paragraph', value: '' }];
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const blocks: Block[] = [];
    const children = Array.from(doc.body.children);

    if (children.length === 0) {
      // Return raw text wrapped in paragraph if no structural tags found
      return [{ id: Math.random().toString(), type: 'paragraph', value: html.trim() }];
    }

    children.forEach((el) => {
      // 1. YouTube video embed containers
      if (el.classList.contains('aspect-video') || el.querySelector('iframe')) {
        const iframe = el.querySelector('iframe');
        const url = iframe ? (iframe.getAttribute('src') || '') : '';
        blocks.push({
          id: Math.random().toString(),
          type: 'youtube',
          value: url
        });
        return;
      }

      // 2. Syntax-highlighted code block containers
      if (el.tagName === 'DIV' && el.querySelector('pre')) {
        const pre = el.querySelector('pre');
        const filename = el.querySelector('span')?.textContent || 'script.py';
        const codeText = pre?.textContent || '';
        blocks.push({
          id: Math.random().toString(),
          type: 'code',
          value: codeText,
          meta: { filename }
        });
        return;
      }

      // Handle raw Image tags
      if (el.tagName === 'IMG') {
        blocks.push({
          id: Math.random().toString(),
          type: 'image',
          value: el.getAttribute('src') || '',
          meta: { filename: el.getAttribute('alt') || 'uploaded_image.png' }
        });
        return;
      }

      // Handle Figure elements containing image
      if (el.tagName === 'FIGURE') {
        const img = el.querySelector('img');
        if (img) {
          const src = img.getAttribute('src') || '';
          const caption = el.querySelector('figcaption')?.textContent || img.getAttribute('alt') || 'uploaded_image.png';
          blocks.push({
            id: Math.random().toString(),
            type: 'image',
            value: src,
            meta: { filename: caption }
          });
          return;
        }
      }

      // 3. Headings
      if (el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H1') {
        blocks.push({
          id: Math.random().toString(),
          type: 'heading',
          value: el.innerHTML
        });
        return;
      }

      // 4. Quotations
      if (el.tagName === 'BLOCKQUOTE') {
        blocks.push({
          id: Math.random().toString(),
          type: 'quote',
          value: el.innerHTML
        });
        return;
      }

      // 4.5. Table Content Parser
      if (el.tagName === 'TABLE' || el.querySelector('table') || (el.className && el.className.includes('overflow') && el.querySelector('table'))) {
        const table = el.tagName === 'TABLE' ? el : el.querySelector('table')!;
        const headers: string[] = [];
        const rows: string[][] = [];
        
        table.querySelectorAll('thead th, thead td').forEach((cell) => {
          headers.push(cell.textContent || '');
        });
        
        table.querySelectorAll('tbody tr').forEach((tr) => {
          const row: string[] = [];
          tr.querySelectorAll('td, th').forEach((cell) => {
            row.push(cell.textContent || '');
          });
          if (row.length > 0) {
            rows.push(row);
          }
        });
        
        if (headers.length === 0) {
          const firstRow = table.querySelector('tr');
          if (firstRow) {
            firstRow.querySelectorAll('th, td').forEach((cell) => {
              headers.push(cell.textContent || '');
            });
            table.querySelectorAll('tr').forEach((tr, index) => {
              if (index === 0) return;
              const row: string[] = [];
              tr.querySelectorAll('td, th').forEach((cell) => {
                row.push(cell.textContent || '');
              });
              if (row.length > 0) {
                rows.push(row);
              }
            });
          }
        }

        blocks.push({
          id: Math.random().toString(),
          type: 'table',
          value: JSON.stringify({ 
            headers: headers.length > 0 ? headers : ['Feature', 'Specification', 'Details'], 
            rows: rows.length > 0 ? rows : [['Value 1', 'Value 2', 'Value 3']] 
          })
        });
        return;
      }

      // 5. Standard Editorial paragraph
      blocks.push({
        id: Math.random().toString(),
        type: 'paragraph',
        value: el.innerHTML
      });
    });

    if (blocks.length === 0) {
      blocks.push({ id: Math.random().toString(), type: 'paragraph', value: '' });
    }

    return blocks;
  } catch (err) {
    console.error("DOM Parsing error, using plain text fallback:", err);
    return [{ id: Math.random().toString(), type: 'paragraph', value: html }];
  }
};

// Serialize Blocks list to robust HTML string
const serializeBlocksToHTML = (blocks: Block[]): string => {
  return blocks
    .map((b) => {
      const sanitizedValue = b.value.trim();
      if (b.type === 'heading') {
        return `<h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">${sanitizedValue}</h2>`;
      }
      if (b.type === 'quote') {
        return `<blockquote class="border-l-4 border-secondary px-8 py-4 my-12 bg-surface-container-low italic font-headline-md text-headline-md text-on-surface-variant">${sanitizedValue}</blockquote>`;
      }
      if (b.type === 'code') {
        const filename = b.meta?.filename || 'script.py';
        return `<div class="my-10 shadow-lg rounded-lg overflow-hidden border border-outline-variant font-sans">
  <div class="bg-[#131b2e] text-[#7c839b] px-4 py-2 font-mono text-xs flex justify-between items-center">
    <span>${filename}</span>
  </div>
  <pre class="bg-[#131b2e] p-6 overflow-x-auto text-[#7c839b] font-mono text-sm leading-relaxed"><code>${sanitizedValue}</code></pre>
</div>`;
      }
      if (b.type === 'image') {
        const altText = b.meta?.filename || 'Uploaded layout visual';
        return `<figure class="my-10 text-center">
  <img class="mx-auto rounded-xl shadow-lg max-h-[500px] object-cover border border-cream-dark" src="${sanitizedValue}" alt="${altText}" referrerPolicy="no-referrer" />
  ${altText ? `<figcaption class="text-xs text-[#7c7a72] mt-3 font-serif italic">${altText}</figcaption>` : ''}
</figure>`;
      }
      if (b.type === 'youtube') {
        // Extract Youtube Video ID
        let videoId = '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = sanitizedValue.match(regExp);
        if (match && match[2].length === 11) {
          videoId = match[2];
        } else {
          videoId = sanitizedValue; // Fallback
        }

        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return `<div class="my-10 relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-cream-dark">
  <iframe class="absolute top-0 left-0 w-full h-full" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerPolicy="no-referrer"></iframe>
</div>`;
      }
      if (b.type === 'table') {
        try {
          const data = JSON.parse(b.value || '{"headers":[],"rows":[]}');
          const headersHTML = data.headers.map((h: string) => `<th class="px-4 py-3 bg-cream-dark/40 font-serif font-bold text-[#141414] border-b border-cream-dark">${h}</th>`).join('');
          const rowsHTML = data.rows.map((row: string[]) => {
            const cellsHTML = row.map((cell: string) => `<td class="px-4 py-3 border-b border-cream-dark/40">${cell}</td>`).join('');
            return `<tr class="hover:bg-cream-paper/30 transition-colors">${cellsHTML}</tr>`;
          }).join('');
          
          return `<div class="my-8 overflow-x-auto border border-cream-dark/60 rounded-xl shadow-sm"><table class="min-w-full divide-y divide-cream-dark/60 text-left font-sans text-xs bg-white"><thead><tr>${headersHTML}</tr></thead><tbody class="divide-y divide-cream-dark/30">${rowsHTML}</tbody></table></div>`;
        } catch (e) {
          return `<div class="my-8 overflow-x-auto border border-cream-dark/60 rounded-xl shadow-sm"><table class="min-w-full divide-y divide-cream-dark/60 text-left font-sans text-xs bg-white">${b.value}</table></div>`;
        }
      }
      // Default Editorial Paragraph and content blocks
      return `<p class="mb-6 font-body-lg text-body-lg">${sanitizedValue}</p>`;
    })
    .join('\n');
};

const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const PostEditor: React.FC<PostEditorProps> = ({
  articleId,
  allArticles,
  onBack,
  onSave,
  isLoading = false
}) => {
  const isEditMode = !!articleId;
  const existingArticle = allArticles.find(a => a.id === articleId);

  // Core Manuscript Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Programming');
  const [summary, setSummary] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredImage, setFeaturedImage] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published'>('Draft');

  // Interactive Drag & Drop Block-Based States
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [draggedToolType, setDraggedToolType] = useState<string | null>(null);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [activeDropZoneIndex, setActiveDropZoneIndex] = useState<number | null>(null);

  // Parse HTML content string into blocks list on mount or ID change
  useEffect(() => {
    if (isEditMode && existingArticle) {
      setTitle(existingArticle.title);
      setCategory(existingArticle.category);
      setSummary(existingArticle.summary);
      setIsFeatured(existingArticle.isFeatured);
      setFeaturedImage(existingArticle.featuredImage);
      setTagsInput(existingArticle.tags.join(', '));
      setStatus(existingArticle.status);
      setBlocks(parseHTMLToBlocks(existingArticle.content));
    } else {
      setTitle('');
      setCategory('Programming');
      setSummary('');
      setFeaturedImage('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop');
      setTagsInput('');
      setStatus('Draft');
      // Set simple layout guidance blocks
      setBlocks([
        { id: '1', type: 'heading', value: 'Welcome to your layout-driven manuscript' },
        { id: '2', type: 'paragraph', value: 'This editor utilizes an interactive Drag & Drop block building workflow. Drag customized elements from the sidebar on the left and drop them into the dashed hotzones below to architect professional responsive structures.' }
      ]);
    }
  }, [articleId, existingArticle, isEditMode]);

  // Handle Drag Start from Preset Sidebar
  const handleDragStartTool = (type: string) => {
    setDraggedToolType(type);
    setDraggedBlockIndex(null);
  };

  // Handle Drag Start to Reorder Existing Blocks
  const handleDragStartBlock = (index: number) => {
    setDraggedBlockIndex(index);
    setDraggedToolType(null);
  };

  const handleDragEnd = () => {
    setDraggedToolType(null);
    setDraggedBlockIndex(null);
    setActiveDropZoneIndex(null);
  };

  // Handle dropping elements on hotzones
  const handleDropOnZone = (targetIndex: number) => {
    setActiveDropZoneIndex(null);

    // CASE A: Dropping a new element preset tool
    if (draggedToolType) {
      let defaultValue = '';
      const meta: { filename?: string } = {};

      if (draggedToolType === 'heading') defaultValue = 'Heading Section Title';
      if (draggedToolType === 'paragraph') defaultValue = 'Write standard body narrative with rich typography context...';
      if (draggedToolType === 'quote') defaultValue = 'This represents a striking sentence or professional highlight quote pulled to captivate observers.';
      if (draggedToolType === 'code') {
        defaultValue = 'def calculate_reading_rhythm(element_type, density_score):\n    baseline = 8\n    if element_type == "HEADING_XL":\n        return baseline * 12\n    return baseline * 4';
        meta.filename = 'layout_engine.py';
      }
      if (draggedToolType === 'youtube') defaultValue = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      if (draggedToolType === 'image') {
        defaultValue = '';
        meta.filename = '';
      }

      const newBlock: Block = {
        id: Math.random().toString(),
        type: draggedToolType as any,
        value: defaultValue,
        meta: (draggedToolType === 'code' || draggedToolType === 'image') ? meta : undefined
      };

      const newBlocks = [...blocks];
      newBlocks.splice(targetIndex, 0, newBlock);
      setBlocks(newBlocks);
      setDraggedToolType(null);
    }

    // CASE B: Reordering an existing element block
    else if (draggedBlockIndex !== null) {
      if (draggedBlockIndex === targetIndex || draggedBlockIndex === targetIndex - 1) {
        setDraggedBlockIndex(null);
        return; // dropped onto immediate offset boundaries, ignore
      }

      const newBlocks = [...blocks];
      const [movedBlock] = newBlocks.splice(draggedBlockIndex, 1);
      
      const adjustedTargetIndex = draggedBlockIndex < targetIndex ? targetIndex - 1 : targetIndex;
      newBlocks.splice(adjustedTargetIndex, 0, movedBlock);
      setBlocks(newBlocks);
      setDraggedBlockIndex(null);
    }
  };

  const handleDropFilesOnZone = async (files: FileList, targetIndex: number) => {
    const newAddedBlocks: Block[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          const base64 = await readFileAsDataURL(file);
          newAddedBlocks.push({
            id: Math.random().toString(),
            type: 'image',
            value: base64,
            meta: { filename: file.name }
          });
        } catch (err) {
          console.error("Failed to read dropped file:", err);
        }
      }
    }

    if (newAddedBlocks.length > 0) {
      setBlocks(prev => {
        const copy = [...prev];
        copy.splice(targetIndex, 0, ...newAddedBlocks);
        return copy;
      });
    }
  };

  // Fallback / standard operations operations trigger for blocks
  const appendBlockFromSidebar = (type: 'heading' | 'paragraph' | 'code' | 'quote' | 'youtube' | 'image' | 'table') => {
    let defaultValue = '';
    const meta: { filename?: string } = {};

    if (type === 'heading') defaultValue = 'Heading Section Title';
    if (type === 'paragraph') defaultValue = 'Write standard body narrative with rich typography context...';
    if (type === 'quote') defaultValue = 'This represents a striking sentence or professional highlight quote pulled to captivate observers.';
    if (type === 'code') {
      defaultValue = '// Your TypeScript 5.0 Decorator block structure\n@logged\nclass Controller {\n  public resolve() {\n    return "Vellum";\n  }\n}';
      meta.filename = 'controller.ts';
    }
    if (type === 'youtube') defaultValue = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    if (type === 'image') {
      defaultValue = '';
      meta.filename = '';
    }
    if (type === 'table') {
      defaultValue = JSON.stringify({ 
        headers: ['Feature', 'Specification', 'Details'], 
        rows: [
          ['Rendering Engine', 'Isomorphic React', 'Super-fast load speeds'],
          ['Responsive Frame', 'Tailwind CSS Grid', 'Fluid adaptive spacing'],
          ['Static Outlines', 'SEO Canonical Tags', 'Maximum Google rank Index']
        ] 
      });
    }

    const newBlock: Block = {
      id: Math.random().toString(),
      type,
      value: defaultValue,
      meta: (type === 'code' || type === 'image') ? meta : undefined
    };

    setBlocks([...blocks, newBlock]);
  };

  const updateBlockValue = (id: string, value: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, value } : b));
  };

  const updateBlockMeta = (id: string, filename: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, meta: { ...b.meta, filename } } : b));
  };

  const moveBlockByButton = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [temp] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIndex, 0, temp);
    setBlocks(newBlocks);
  };

  const duplicateBlock = (index: number) => {
    const active = blocks[index];
    const newBlock: Block = {
      id: Math.random().toString(),
      type: active.type,
      value: active.value,
      meta: active.meta ? { ...active.meta } : undefined
    };

    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
  };

  // Calculate dynamic SEO index score
  const calculateSEOScore = () => {
    let score = 20; // Default Baseline
    if (title.length >= 30 && title.length <= 60) score += 20;
    else if (title.length > 10) score += 10;

    if (summary.length >= 100 && summary.length <= 160) score += 30;
    else if (summary.length > 40) score += 15;

    // Estimate based on compiled content length
    const totalContent = serializeBlocksToHTML(blocks);
    if (totalContent.length > 800) score += 20;
    else if (totalContent.length > 200) score += 10;

    if (tagsInput.split(',').length >= 3) score += 10;

    return Math.min(score, 100);
  };

  const seoScore = calculateSEOScore();
  const generatedSlug = (title || 'untitled-post')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || blocks.length === 0) {
      alert("Manuscript demands a validated title and at least one layout component.");
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const serializedContent = serializeBlocksToHTML(blocks);
    const textCharCount = serializedContent.replace(/<[^>]*>/g, '').split(' ').length;
    const readingTimeValue = Math.max(1, Math.ceil(textCharCount / 200));

    // Find the first image block to represent as the featured image
    const firstImgBlock = blocks.find(b => b.type === 'image' && b.value);
    const resolvedFeaturedImage = firstImgBlock 
      ? firstImgBlock.value 
      : (featuredImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop');

    onSave({
      id: articleId,
      title,
      category,
      summary,
      content: serializedContent,
      isFeatured,
      featuredImage: resolvedFeaturedImage,
      tags: tags.length > 0 ? tags : ['Editorial'],
      status,
      readingTime: `${readingTimeValue} min read`,
      seoTitle: `${title} | LLM Review Pro`,
      seoDescription: summary
    });
  };

  const PRESET_TOOLS = [
    { type: 'heading', title: 'Section Heading', desc: 'Add structured H2 subtitle', icon: Heading },
    { type: 'paragraph', title: 'Paragraph Block', desc: 'Write long-form text bodies', icon: BookOpen },
    { type: 'table', title: 'Data Table', desc: 'Insert beautiful tabular data grids', icon: Table },
    { type: 'image', title: 'Graphic Image', desc: 'Drag-and-drop or select file', icon: Image },
    { type: 'code', title: 'Syntax Code Block', desc: 'Embed programming snippets', icon: Code },
    { type: 'quote', title: 'Highlight Quote', desc: 'Push beautiful serif quotes', icon: Quote },
    { type: 'youtube', title: 'YouTube Video', desc: 'Presents dynamic iframe watch views', icon: Youtube },
  ] as const;

  // Render a visual line hotzone for drag drops
  const renderDropZone = (index: number) => {
    const isOver = activeDropZoneIndex === index;
    const isDragging = draggedToolType !== null || draggedBlockIndex !== null;

    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          const isFileDrag = e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files');
          if (isDragging || isFileDrag) {
            e.dataTransfer.dropEffect = 'copy';
          }
        }}
        onDragEnter={(e) => {
          const isFileDrag = e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files');
          if (isDragging || isFileDrag) {
            setActiveDropZoneIndex(index);
          }
        }}
        onDragLeave={() => {
          setActiveDropZoneIndex(null);
        }}
        onDrop={async (e) => {
          e.preventDefault();
          setActiveDropZoneIndex(null);
          const files = e.dataTransfer.files;
          if (files && files.length > 0) {
            await handleDropFilesOnZone(files, index);
          } else {
            handleDropOnZone(index);
          }
        }}
        className={`relative w-full transition-all duration-300 ${
          isOver 
            ? 'py-8' 
            : isDragging 
              ? 'py-3' 
              : 'py-1'
        }`}
      >
        <div 
          className={`w-full border-t-2 border-dashed transition-all duration-300 rounded ${
            isOver 
              ? 'border-brass-accent scale-100 opacity-100' 
              : isDragging 
                ? 'border-cream-dark opacity-60 hover:border-brass-accent' 
                : 'border-transparent opacity-0'
          }`}
        >
          <span 
            className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 text-[9px] font-mono tracking-widest font-bold rounded-full uppercase transition-all duration-300 shadow-sm border ${
              isOver
                ? 'bg-brass-accent text-white border-brass-accent scale-110'
                : 'bg-white text-[#7c7a72] border-cream-dark opacity-100 scale-100'
            }`}
          >
            {isOver ? 'Drop Component Here' : 'Insert Component'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in duration-300 font-sans max-w-7xl mx-auto pb-16">
      
      {/* Header controls block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7c7a72] hover:text-charcoal-intense transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 translate-x-0 group-hover:-translate-x-1 transition-transform" />
          <span>Exit to Control Room</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-charcoal-intense text-cream-base border border-[#3e3c35] font-mono font-medium px-3 py-1 rounded-full uppercase tracking-wider">
            Workspace: Interactive Layout Builder
          </span>
          {isEditMode && (
            <span className="text-[10px] bg-brass-light/20 text-brass-accent border border-brass-light/40 font-bold px-3 py-1 rounded-full uppercase">
              Editing: {existingArticle?.title.slice(0, 20)}...
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: DRAG PRESET TOOLBAR & WORKSPACE CANVAS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Preset templates selector */}
          <div className="bg-cream-paper border border-cream-dark/60 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal-intense">
                Layout Component Presets
              </h3>
              <p className="text-xs text-[#7c7a72] mt-0.5">
                Drag a layout option directly into the manuscript canvas dropzones, or simply click to append at the end.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 pt-2">
              {PRESET_TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.type}
                    draggable
                    onDragStart={() => handleDragStartTool(tool.type)}
                    onDragEnd={handleDragEnd}
                    onClick={() => appendBlockFromSidebar(tool.type)}
                    className="flex flex-col items-center justify-center p-3 text-center bg-white hover:bg-cream-dark/40 border border-cream-dark hover:border-brass-accent rounded-xl cursor-grab active:cursor-grabbing hover:shadow-sm transition-all select-none group"
                    title={`Drag or click to insert ${tool.title}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-cream-base/80 text-charcoal-intense group-hover:bg-brass-accent group-hover:text-white flex items-center justify-center transition-colors mb-1.5 shadow-sm">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs font-bold text-charcoal-intense block">
                      {tool.title}
                    </span>
                    <span className="text-[9px] text-[#7c7a72] leading-tight mt-0.5 max-w-full truncate">
                      {tool.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Post Title & Canvas Body container */}
          <div className="bg-cream-paper border border-cream-dark/60 rounded-2xl p-6 md:p-8 space-y-6">
            
            {/* Headline Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72]">
                Manuscript Headline Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your manuscript a beautiful, SEO-optimized headline..."
                className="w-full bg-white border border-cream-dark border-b-2 rounded-xl py-3.5 px-4.5 text-xl font-serif font-bold text-charcoal-intense focus:outline-none focus:border-brass-accent transition-all"
                required
              />
            </div>

            {/* D&D Visual Canvas Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-cream-dark/50 pb-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72]">
                  Interactive Manuscript Canvas
                </label>
                <span className="text-[10px] font-mono font-semibold text-brass-accent">
                  {blocks.length} Components Connected
                </span>
              </div>

              {/* Render canvas list */}
              <div className="space-y-1">
                {renderDropZone(0)}

                {blocks.map((block, index) => {
                  const isBlockDragging = draggedBlockIndex === index;

                  return (
                    <React.Fragment key={block.id}>
                      <div
                        draggable
                        onDragStart={() => handleDragStartBlock(index)}
                        onDragEnd={handleDragEnd}
                        className={`relative bg-white border border-cream-dark rounded-xl p-5 shadow-sm transition-all ${
                          isBlockDragging 
                            ? 'opacity-40 scale-95 border-brass-accent border-dashed bg-cream-base/20' 
                            : 'hover:border-cream-dark/80 group/block'
                        }`}
                      >
                        {/* Block Control Panel Top Bar */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-cream-base text-[#7c7a72] hover:text-charcoal-intense rounded"
                              title="Drag to reposition block inside layout"
                            >
                              <GripVertical className="w-4 h-4 cursor-grab" />
                            </button>
                            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#7c7a72] px-2 py-0.5 bg-cream-base rounded border border-cream-dark/40">
                              {block.type}
                            </span>
                          </div>

                          {/* Quick Actions Bar */}
                          <div className="flex items-center gap-1.5 opacity-80 group-hover/block:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => moveBlockByButton(index, 'up')}
                              disabled={index === 0}
                              className="p-1 hover:bg-cream-base text-[#7c7a72] hover:text-charcoal-intense rounded disabled:opacity-30"
                              title="Move component layer up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBlockByButton(index, 'down')}
                              disabled={index === blocks.length - 1}
                              className="p-1 hover:bg-cream-base text-[#7c7a72] hover:text-charcoal-intense rounded disabled:opacity-30"
                              title="Move component layer down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => duplicateBlock(index)}
                              className="p-1 hover:bg-cream-base text-[#7c7a72] hover:text-charcoal-intense rounded"
                              title="Duplicate component node"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBlock(index)}
                              className="p-1 hover:bg-red-50 text-charcoal-soft hover:text-red-600 rounded"
                              title="Remove component node"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Block Content Input Panels */}
                        {block.type === 'heading' && (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={block.value}
                              onChange={(e) => updateBlockValue(block.id, e.target.value)}
                              placeholder="Enter section header subtitle..."
                              className="w-full bg-cream-base/10 border-b border-cream-dark text-md font-serif font-semibold text-charcoal-intense p-2 focus:outline-none focus:border-brass-accent"
                            />
                          </div>
                        )}

                        {block.type === 'paragraph' && (
                          <div className="space-y-1">
                            <textarea
                              rows={3}
                              value={block.value}
                              onChange={(e) => updateBlockValue(block.id, e.target.value)}
                              placeholder="Write your beautiful long-form manuscript body chapters here..."
                              className="w-full bg-cream-base/10 border border-cream-dark/50 rounded-lg p-3 text-sm focus:outline-none focus:border-brass-accent font-sans leading-relaxed text-charcoal-soft resize-y font-body-lg"
                            />
                          </div>
                        )}

                        {block.type === 'quote' && (
                          <div className="space-y-1 pl-1">
                            <textarea
                              rows={2}
                              value={block.value}
                              onChange={(e) => updateBlockValue(block.id, e.target.value)}
                              placeholder="Highlight key quote excerpt..."
                              className="w-full font-serif italic text-charcoal-intense bg-cream-base/20 border-l-4 border-brass-accent p-3 text-sm focus:outline-none"
                            />
                          </div>
                        )}

                        {block.type === 'code' && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-[#7c7a72]">Filename:</span>
                              <input
                                type="text"
                                value={block.meta?.filename || ''}
                                onChange={(e) => updateBlockMeta(block.id, e.target.value)}
                                placeholder="script.py"
                                className="bg-cream-base/20 border border-cream-dark rounded px-2 py-0.5 text-xs font-mono text-charcoal-soft focus:outline-none"
                              />
                            </div>
                            <textarea
                              rows={6}
                              value={block.value}
                              onChange={(e) => updateBlockValue(block.id, e.target.value)}
                              placeholder="// write block scripts in full syntax form..."
                              className="w-full bg-[#131b2e] border border-[#1d273f] rounded-lg p-4 text-xs font-mono text-[#adc7e6] leading-relaxed focus:outline-none focus:border-blue-400"
                            />
                          </div>
                        )}

                        {block.type === 'youtube' && (
                          <div className="space-y-3.5">
                            <div className="space-y-1">
                              <p className="text-[10px] font-mono text-[#7c7a72] leading-relaxed">
                                Paste YouTube Video URL (from your Channel, short-links, and embeds fully supported):
                              </p>
                              <div className="relative">
                                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                <input
                                  type="text"
                                  value={block.value}
                                  onChange={(e) => updateBlockValue(block.id, e.target.value)}
                                  placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                  className="w-full bg-cream-base/10 border border-cream-dark rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-brass-accent font-mono"
                                />
                              </div>
                            </div>

                            {/* Render live iframe feedback */}
                            {(() => {
                              const vId = getYoutubeVideoId(block.value);
                              if (vId) {
                                return (
                                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md border border-cream-dark bg-black">
                                    <iframe
                                      src={`https://www.youtube.com/embed/${vId}`}
                                      title="Embedded video player"
                                      className="absolute top-0 left-0 w-full h-full"
                                      frameBorder="0"
                                      allowFullScreen
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                );
                              }
                              return (
                                <div className="p-4 bg-amber-50/50 border border-[#f5eeda] rounded-lg flex items-center gap-2 text-[10px] text-amber-800 font-medium">
                                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span>Enter a valid YouTube Video link to render the live interactive video player.</span>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {block.type === 'table' && (
                          <div className="space-y-4 bg-cream-paper/70 p-4 border border-cream-dark/50 rounded-xl">
                            {(() => {
                              let tableData = { headers: ['Header 1', 'Header 2'], rows: [['Cell A1', 'Cell A2']] };
                              try {
                                if (block.value) {
                                  tableData = JSON.parse(block.value);
                                }
                              } catch (e) {}

                              const updateTable = (newData: typeof tableData) => {
                                updateBlockValue(block.id, JSON.stringify(newData));
                              };

                              const handleHeaderChange = (colIdx: number, val: string) => {
                                const headers = [...tableData.headers];
                                headers[colIdx] = val;
                                updateTable({ ...tableData, headers });
                              };

                              const handleCellChange = (rowIdx: number, colIdx: number, val: string) => {
                                const rows = tableData.rows.map((row, rI) => 
                                  rI === rowIdx ? row.map((cell, cI) => cI === colIdx ? val : cell) : row
                                );
                                updateTable({ ...tableData, rows });
                              };

                              const addColumn = () => {
                                const headers = [...tableData.headers, `Header ${tableData.headers.length + 1}`];
                                const rows = tableData.rows.map(row => [...row, '']);
                                updateTable({ headers, rows });
                              };

                              const removeColumn = (colIdx: number) => {
                                if (tableData.headers.length <= 1) return;
                                const headers = tableData.headers.filter((_, i) => i !== colIdx);
                                const rows = tableData.rows.map(row => row.filter((_, i) => i !== colIdx));
                                updateTable({ headers, rows });
                              };

                              const addRow = () => {
                                const rows = [...tableData.rows, Array(tableData.headers.length).fill('')];
                                updateTable({ ...tableData, rows });
                              };

                              const removeRow = (rowIdx: number) => {
                                if (tableData.rows.length <= 1) return;
                                const rows = tableData.rows.filter((_, i) => i !== rowIdx);
                                updateTable({ ...tableData, rows });
                              };

                              return (
                                <div className="space-y-3 font-sans">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-serif font-bold text-charcoal-intense">Editorial Data Table Builder</span>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={addColumn}
                                        className="px-2.5 py-1 bg-white hover:bg-cream-dark text-[10px] sm:text-xs font-semibold border border-cream-dark/85 rounded flex items-center gap-1 transition-colors"
                                      >
                                        <Plus className="w-3.5 h-3.5 text-brass-accent" />
                                        <span>Add Column</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={addRow}
                                        className="px-2.5 py-1 bg-charcoal-intense hover:bg-charcoal-soft text-cream-base text-[10px] sm:text-xs font-semibold rounded flex items-center gap-1 transition-colors animate-fade-in"
                                      >
                                        <Plus className="w-3.5 h-3.5 text-brass-light" />
                                        <span>Add Row</span>
                                      </button>
                                    </div>
                                  </div>

                                  <div className="overflow-x-auto border border-cream-dark/60 rounded-xl shadow-sm bg-white">
                                    <table className="min-w-full divide-y divide-cream-dark/60 text-left font-sans text-xs">
                                      <thead>
                                        <tr className="bg-cream-paper/40">
                                          {tableData.headers.map((header, colIdx) => (
                                            <th key={colIdx} className="p-2 border-b border-cream-dark/60 min-w-[120px]">
                                              <div className="flex items-center gap-1">
                                                <input
                                                  type="text"
                                                  value={header}
                                                  onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                                                  className="w-full bg-transparent border-b border-cream-dark/40 focus:border-brass-accent focus:outline-none font-bold text-charcoal-intense py-0.5"
                                                />
                                                {tableData.headers.length > 1 && (
                                                  <button
                                                    type="button"
                                                    onClick={() => removeColumn(colIdx)}
                                                    className="p-1 hover:text-red-600 rounded text-gray-400 font-bold transition-colors"
                                                    title="Delete Column"
                                                  >
                                                    ×
                                                  </button>
                                                )}
                                              </div>
                                            </th>
                                          ))}
                                          <th className="p-2 border-b border-cream-dark/60 w-10"></th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-cream-dark/20">
                                        {tableData.rows.map((row, rowIdx) => (
                                          <tr key={rowIdx}>
                                            {row.map((cell, colIdx) => (
                                              <td key={colIdx} className="p-2 min-w-[120px]">
                                                <input
                                                  type="text"
                                                  value={cell}
                                                  onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                                                  className="w-full bg-cream-base/10 rounded border border-transparent hover:border-cream-dark/30 focus:border-brass-accent focus:outline-none p-1 font-mono text-xs text-charcoal-soft"
                                                />
                                              </td>
                                            ))}
                                            <td className="p-2 text-center w-10">
                                              {tableData.rows.length > 1 && (
                                                <button
                                                  type="button"
                                                  onClick={() => removeRow(rowIdx)}
                                                  className="p-1 text-gray-400 hover:text-red-600 rounded font-semibold transition-colors"
                                                  title="Delete Row"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {block.type === 'image' && (
                          <div className="space-y-4">
                            {block.value ? (
                              <div className="space-y-3">
                                {/* Preview with caption / filename edit */}
                                <div className="relative group/img rounded-xl overflow-hidden border border-cream-dark shadow-sm bg-cream-base/10 max-h-[360px] flex items-center justify-center">
                                  <img 
                                    src={block.value} 
                                    alt={block.meta?.filename || 'Uploaded layout visual'}
                                    className="max-h-[340px] w-auto object-contain p-2"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <label className="px-3.5 py-1.5 bg-white hover:bg-cream-base text-charcoal-intense text-[11px] font-bold uppercase rounded-lg shadow-sm cursor-pointer transition-colors">
                                      Replace Image
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const base64 = await readFileAsDataURL(file);
                                            updateBlockValue(block.id, base64);
                                            updateBlockMeta(block.id, file.name);
                                          }
                                        }}
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => updateBlockValue(block.id, '')}
                                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-750 text-white text-[11px] font-bold uppercase rounded-lg shadow-sm transition-colors cursor-pointer"
                                    >
                                      Clear
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-[#7c7a72] shrink-0">Caption / Alt:</span>
                                  <input
                                    type="text"
                                    value={block.meta?.filename || ''}
                                    onChange={(e) => updateBlockMeta(block.id, e.target.value)}
                                    placeholder="e.g. Kyoto Sunset Gardens"
                                    className="w-full bg-cream-base/10 border border-cream-dark/60 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-brass-accent text-charcoal-soft font-mono"
                                  />
                                </div>
                              </div>
                            ) : (
                              /* Uploader dropzone within block */
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.dataTransfer.dropEffect = 'copy';
                                }}
                                onDrop={async (e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files?.[0];
                                  if (file && file.type.startsWith('image/')) {
                                    const base64 = await readFileAsDataURL(file);
                                    updateBlockValue(block.id, base64);
                                    updateBlockMeta(block.id, file.name);
                                  }
                                }}
                                className="border-2 border-dashed border-cream-dark hover:border-brass-accent rounded-xl p-8 text-center bg-cream-base/10 hover:bg-cream-base/20 transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer relative group"
                              >
                                <div className="w-11 h-11 rounded-full bg-cream-base flex items-center justify-center text-charcoal-soft group-hover:text-brass-accent group-hover:bg-white transition-colors shadow-sm">
                                  <UploadCloud className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-charcoal-intense">
                                    Drag & Drop High-Quality Image Here
                                  </p>
                                  <p className="text-[10px] text-[#7c7a72] mt-0.5">
                                    or click to choose custom file from your device
                                  </p>
                                </div>
                                <label className="absolute inset-0 cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const base64 = await readFileAsDataURL(file);
                                        updateBlockValue(block.id, base64);
                                        updateBlockMeta(block.id, file.name);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                      {renderDropZone(index + 1)}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Blank canvas helper banner */}
              {blocks.length === 0 && (
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnZone(0)}
                  className="border-2 border-dashed border-cream-dark/80 rounded-2xl p-12 text-center bg-cream-paper/30 flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-full bg-cream-dark/50 flex items-center justify-center text-brass-accent">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div className="max-w-md">
                    <p className="font-serif text-base font-bold text-charcoal-intense">This manuscript is empty</p>
                    <p className="text-xs text-[#7c7a72] mt-0.5">
                      Drag layout node items like headings, coding blocks, or custom YouTube embeds from the toolbar preset list or click them to establish your custom visual narrative.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Core category fields */}
            <div className="grid grid-cols-1 gap-6 pt-4 border-t border-cream-dark/40">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72]">
                  Category Section
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-cream-dark py-2.5 px-3.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-brass-accent cursor-pointer"
                >
                  <option value="Programming">Programming</option>
                  <option value="Tech">Technology</option>
                  <option value="Travel">Travel</option>
                  <option value="Photography">Photography</option>
                </select>
              </div>
            </div>

            {/* Article visual Listing summary */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72]">
                Listing Excerpt / Card Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                placeholder="Give your post a concise, catchy summaries shown in lists cards..."
                className="w-full bg-white border border-cream-dark rounded-lg p-3.5 text-xs text-charcoal-soft focus:outline-none focus:border-brass-accent transition-all"
                maxLength={200}
              />
              <div className="flex justify-between items-center text-[9px] text-[#7c7a72]">
                <span>Provide value to listeners. Keep listing summary under 200 characters.</span>
                <span>{summary.length}/200</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE CABINET STATE & DYNAMIC REAL-TIME SEO OPTIMIZER */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Operations Cabinet */}
          <div className="bg-cream-paper border border-cream-dark/60 rounded-2xl p-6 space-y-6">
            <h3 className="font-serif text-base font-bold text-charcoal-intense border-b border-cream-dark/60 pb-3">
              Operations Cabinet
            </h3>

            {/* Publication state */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72]">Publication State</p>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('Draft')}
                  className={`flex-1 py-2.5 text-center rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    status === 'Draft'
                      ? 'bg-amber-50 border border-amber-200 text-amber-800'
                      : 'bg-white hover:bg-cream-dark border border-cream-dark text-[#7c7a72]'
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Published')}
                  className={`flex-1 py-2.5 text-center rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    status === 'Published'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-white hover:bg-cream-dark border border-cream-dark text-[#7c7a72]'
                  }`}
                >
                  Publish
                </button>
              </div>
            </div>

            {/* Hero check checkbox */}
            <label className="flex items-center gap-3.5 p-3 bg-white border border-cream-dark rounded-lg cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-brass-accent"
              />
              <div className="font-sans text-xs">
                <p className="font-bold text-charcoal-intense">Hero Featured Story</p>
                <p className="text-[10px] text-[#7c7a72]">Draw layout prominence to feed head.</p>
              </div>
            </label>

            {/* Tags fields */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72]">Tags (Comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Programming, UI, Minimalist"
                className="w-full bg-white border border-cream-dark rounded-lg py-2.5 px-3.5 text-xs text-charcoal-soft focus:outline-none focus:border-brass-accent"
              />
            </div>

            <div className="pt-4 border-t border-cream-dark/60 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 bg-charcoal-intense hover:bg-charcoal-soft text-cream-base rounded-xl text-xs font-bold uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed font-medium' : ''}`}
              >
                <Save className="w-4 h-4 text-brass-light" />
                <span>{isLoading ? 'Saving Manuscript...' : 'Save Manuscript'}</span>
              </button>
              
              <button
                type="button"
                onClick={onBack}
                disabled={isLoading}
                className="w-full py-2.5 bg-white hover:bg-cream-dark border border-cream-dark text-charcoal-soft rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                Discard Changes
              </button>
            </div>

          </div>

          {/* DYNAMIC REAL-TIME SEO OPTIMIZER */}
          <div className="bg-cream-paper border border-cream-dark/60 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-cream-dark/60 pb-3">
              <div className="flex items-center gap-1.5 text-charcoal-intense animate-fade-in">
                <Globe className="w-4.5 h-4.5 text-brass-accent animate-spin" style={{ animationDuration: '6s' }} />
                <h3 className="font-serif text-base font-bold">SEO Analyzer</h3>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                seoScore >= 80 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : seoScore >= 50 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                Score: {seoScore}
              </span>
            </div>

            {/* Google snippet simulator */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72]">Google SERP Snippet Simulator</p>
              
              <div className="bg-white border border-cream-dark rounded-xl p-4 space-y-1.5 font-sans leading-relaxed shadow-sm">
                <p className="text-sm font-medium text-blue-800 hover:underline cursor-pointer line-clamp-1 font-serif">
                  {title ? `${title} | LLM Review Pro` : 'A Beautiful Manuscript Title | LLM Review Pro'}
                </p>
                <p className="text-[11px] text-emerald-800 truncate font-mono">
                  https://llmreviewpro.com/{category.toLowerCase()}/{generatedSlug}
                </p>
                <p className="text-xs text-[#5c5a52] line-clamp-3">
                  {summary || 'No excerpt written. Draft a catchy listing summary card excerpt in the left configuration box to dynamically see listings metadata snippet simulator.'}
                </p>
              </div>
            </div>

            {/* Checklist of rules */}
            <div className="space-y-3.5 text-xs font-sans">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72]">SEO Scoring checklist</p>
              
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  {title.length >= 30 && title.length <= 60 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className={title.length >= 30 && title.length <= 60 ? 'text-charcoal-intense font-semibold' : 'text-[#7c7a72]'}>
                    Title length between 30 and 60 chars ({title.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {summary.length >= 100 && summary.length <= 160 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className={summary.length >= 100 && summary.length <= 160 ? 'text-charcoal-intense font-semibold' : 'text-[#7c7a72]'}>
                    Summary length between 100 and 160 chars ({summary.length})
                  </span>
                </div>

                {/* Length of compiled output estimate */}
                {(() => {
                  const compiled = serializeBlocksToHTML(blocks);
                  const isLongEnough = compiled.length > 800;
                  return (
                    <div className="flex items-center gap-2">
                      {isLongEnough ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span className={isLongEnough ? 'text-charcoal-intense font-semibold' : 'text-[#7c7a72]'}>
                        In-depth storytelling (compiled length &gt; 800: {compiled.length} chars)
                      </span>
                    </div>
                  );
                })()}

                <div className="flex items-center gap-2">
                  {tagsInput.split(',').map(t => t.trim()).filter(Boolean).length >= 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className={tagsInput.split(',').map(t => t.trim()).filter(Boolean).length >= 3 ? 'text-charcoal-intense font-semibold' : 'text-[#7c7a72]'}>
                    At least 3 descriptive search keywords
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </form>

    </div>
  );
};
