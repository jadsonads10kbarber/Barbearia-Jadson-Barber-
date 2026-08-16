import React, { useState, useRef } from 'react';
import {
  Newspaper,
  Plus,
  Trash2,
  Edit2,
  Star,
  X,
  UploadCloud,
  Image as ImageIcon,
  RefreshCw,
  CheckCircle2,
  Link as LinkIcon,
  Sparkles,
  Camera,
  FolderOpen,
  Eye,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { FeedPost } from '../../types';

// Curated Barber Presets for instant selection if preferred
const BARBER_PHOTO_PRESETS = [
  {
    title: 'Degradê Navalhado & Fade',
    url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80',
    category: 'Tendências',
  },
  {
    title: 'Barba Alinhada & Terapia',
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80',
    category: 'Cuidados',
  },
  {
    title: 'Corte Clássico Pompadour',
    url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&auto=format&fit=crop&q=80',
    category: 'Estilo',
  },
  {
    title: 'Texturizado Moderno / Crop',
    url: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=800&auto=format&fit=crop&q=80',
    category: 'Tendências',
  },
  {
    title: 'Black Power & Linhas Perfeitas',
    url: 'https://images.unsplash.com/photo-1520338661084-680395057c93?w=800&auto=format&fit=crop&q=80',
    category: 'Cortes',
  },
  {
    title: 'Ambiente & Experiência VIP',
    url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80',
    category: 'Aviso',
  },
];

export const AdminFeedPage: React.FC = () => {
  const { feedPosts, addFeedPost, updateFeedPost, deleteFeedPost, addToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tendências');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'camera' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [author, setAuthor] = useState('Barbearia Jadson Barber');
  const [active, setActive] = useState(true);
  const [highlighted, setHighlighted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleOpenCreate = () => {
    setEditingPost(null);
    setTitle('');
    setCategory('Tendências');
    setContent('');
    setImage('');
    setImageFileName('');
    setUrlInput('');
    setImageTab('upload');
    setAuthor('Barbearia Jadson Barber');
    setActive(true);
    setHighlighted(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: FeedPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setCategory(post.category);
    setContent(post.content);
    setImage(post.image || '');
    setImageFileName('');
    setUrlInput(post.image || '');
    setImageTab(post.image?.startsWith('data:') ? 'upload' : 'url');
    setAuthor(post.author);
    setActive(post.active ?? true);
    setHighlighted(post.highlighted ?? false);
    setIsModalOpen(true);
  };

  // Ultra-reliable image compressor and loader for device/gallery/camera
  const handleImageFile = (file: File) => {
    if (!file) return;

    setIsProcessingImage(true);
    const fileName = file.name || 'foto_dispositivo.jpg';
    setImageFileName(fileName);

    // 1. Direct FileReader - sets immediate preview within milliseconds
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (rawDataUrl) {
        // Set preview immediately so the user sees the photo right away!
        setImage(rawDataUrl);
        setIsProcessingImage(false);
        addToast(`Foto "${fileName}" carregada com sucesso!`, 'success');

        // 2. High-performance canvas downscaling (max 800px, 82% JPEG) to keep data light (~40KB) & fast in Firestore
        try {
          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const MAX_SIZE = 800;
              let w = img.naturalWidth || img.width || 800;
              let h = img.naturalHeight || img.height || 600;

              if (w > h) {
                if (w > MAX_SIZE) {
                  h = Math.round((h * MAX_SIZE) / w);
                  w = MAX_SIZE;
                }
              } else {
                if (h > MAX_SIZE) {
                  w = Math.round((w * MAX_SIZE) / h);
                  h = MAX_SIZE;
                }
              }

              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL('image/jpeg', 0.82);
                if (compressed && compressed.length > 50) {
                  setImage(compressed);
                }
              }
            } catch (canvasErr) {
              console.warn('Canvas optimization fallback to reader', canvasErr);
            }
          };

          img.onerror = () => {
            console.warn('Image decode error fallback, keeping raw data');
          };

          img.src = rawDataUrl;
        } catch (canvasErr) {
          console.warn('Canvas processing error', canvasErr);
        }
      } else {
        setIsProcessingImage(false);
        addToast('Erro ao carregar os dados da foto.', 'error');
      }
    };

    reader.onerror = () => {
      setIsProcessingImage(false);
      addToast('Não foi possível ler o arquivo selecionado.', 'error');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
    // Clear value so user can pick the same file again if desired
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      addToast('Por favor, digite ou cole o link da imagem.', 'error');
      return;
    }
    setImage(urlInput.trim());
    setImageFileName('Imagem via link URL');
    addToast('Link da imagem aplicado!', 'success');
  };

  const handleSelectPreset = (presetUrl: string, presetCat: string) => {
    setImage(presetUrl);
    setImageFileName('Modelo sugerido Jadson Barber');
    if (!title) setCategory(presetCat);
    addToast('Foto modelo selecionada!', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      addToast('Por favor, preencha o título e o conteúdo.', 'error');
      return;
    }

    if (!image) {
      addToast('Por favor, adicione uma foto para a publicação.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPost) {
        await updateFeedPost(editingPost.id, {
          title: title.trim(),
          category,
          content: content.trim(),
          image,
          author: author.trim(),
          active,
          highlighted,
        });
      } else {
        await addFeedPost({
          title: title.trim(),
          category,
          content: content.trim(),
          image,
          author: author.trim(),
          active,
          highlighted,
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar publicação:', err);
      addToast('Erro ao salvar publicação. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Gestão do Feed de Notícias & Tendências"
      subtitle="Publique fotos carregadas do celular/computador, fotos de cortes ou novidades para os clientes"
    >
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#DAA520]" />
            Publicações do Feed ({feedPosts.length})
          </h2>
          <p className="text-xs text-neutral-400 font-sans">
            Cada cliente pode curtir cada publicação 1 vez
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-2.5 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Publicação</span>
        </button>
      </div>

      {/* Feed Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feedPosts.map((post) => (
          <div
            key={post.id}
            className="bg-[#111111] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-colors shadow-lg"
          >
            <div>
              <div className="relative h-48 w-full bg-neutral-900 overflow-hidden">
                <img
                  src={post.image || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80'}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2.5 py-1 rounded-full bg-black/80 text-[#DAA520] text-[10px] font-mono font-bold uppercase border border-amber-500/30 backdrop-blur-xs">
                    {post.category}
                  </span>
                  {post.highlighted && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-black" />
                      Destaque
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span>Por {post.author}</span>
                  <span>{post.date}</span>
                </div>

                <h3 className="font-bold text-sm text-white line-clamp-1">{post.title}</h3>
                <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">{post.content}</p>

                <div className="pt-1 text-[11px] text-[#DAA520] font-mono font-semibold">
                  ❤️ {post.likesCount || 0} curtida{(post.likesCount || 0) === 1 ? '' : 's'} (1 por cliente)
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-800/80 bg-black/40 flex items-center justify-between">
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                  post.active ?? true ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                {post.active ?? true ? 'Ativo no App' : 'Oculto'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(post)}
                  className="p-1.5 rounded-lg bg-neutral-900 text-amber-400 hover:bg-neutral-800 border border-neutral-800 cursor-pointer"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteFeedPost(post.id)}
                  className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 border border-neutral-800 cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#DAA520]" />
                {editingPost ? 'Editar Publicação' : 'Criar Publicação no Feed'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Image Selection Section */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#DAA520]" />
                    Foto da Publicação *
                  </span>
                  {image && (
                    <span className="text-[10px] text-emerald-400 font-sans font-bold flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Foto Carregada
                    </span>
                  )}
                </label>

                {/* Sub tabs */}
                <div className="grid grid-cols-4 gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`py-1.5 px-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      imageTab === 'upload' ? 'bg-[#DAA520] text-black shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <FolderOpen className="w-3 h-3" />
                    <span>Galeria</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageTab('camera')}
                    className={`py-1.5 px-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      imageTab === 'camera' ? 'bg-[#DAA520] text-black shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3 h-3" />
                    <span>Câmera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`py-1.5 px-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      imageTab === 'url' ? 'bg-[#DAA520] text-black shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageTab('presets')}
                    className={`py-1.5 px-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      imageTab === 'presets' ? 'bg-[#DAA520] text-black shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Modelos</span>
                  </button>
                </div>

                {/* Tab 1: Galeria / Arquivos do Dispositivo */}
                {imageTab === 'upload' && (
                  <div className="space-y-3">
                    {image ? (
                      <div className="border-2 border-emerald-500/60 bg-emerald-950/15 rounded-2xl p-4 text-center space-y-3">
                        <div className="relative h-48 w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-emerald-500/30">
                          <img
                            src={image}
                            alt="Foto Selecionada da Galeria"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-black text-[11px] font-mono font-bold flex items-center gap-1 shadow-md">
                              <Check className="w-3.5 h-3.5" />
                              Foto Pronta!
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono px-1">
                          <span className="text-neutral-300 truncate max-w-[200px]">
                            📁 {imageFileName || 'Foto da Galeria'}
                          </span>
                          <span className="text-emerald-400 font-bold">100% Anexada</span>
                        </div>

                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                              title="Trocar Foto"
                            />
                            <button
                              type="button"
                              className="w-full py-2 px-3 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Trocar por Outra Foto</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setImage('');
                              setImageFileName('');
                              setUrlInput('');
                            }}
                            className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-red-950 text-red-400 border border-red-500/30 font-mono font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative border-2 border-dashed border-[#DAA520] hover:border-amber-400 bg-amber-950/20 hover:bg-amber-950/30 rounded-2xl p-6 text-center transition-all space-y-3 group block shadow-inner">
                          {/* Native invisible file input covering entire box for instant click/touch handling */}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                            title="Toque aqui para escolher a foto"
                          />

                          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#DAA520]/20 group-hover:bg-[#DAA520]/30 flex items-center justify-center text-[#DAA520] transition-colors border border-[#DAA520]/40 shadow-md">
                            {isProcessingImage ? (
                              <RefreshCw className="w-8 h-8 animate-spin text-[#DAA520]" />
                            ) : (
                              <UploadCloud className="w-8 h-8" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-base font-bold text-white font-mono flex items-center justify-center gap-2">
                              {isProcessingImage ? (
                                'Carregando foto selecionada...'
                              ) : (
                                <>
                                  <span>Escolher Foto da Galeria</span>
                                  <span className="text-[#DAA520]">→</span>
                                </>
                              )}
                            </p>
                            <p className="text-xs text-neutral-300 font-sans">
                              Toque em qualquer lugar desta caixa para abrir as fotos do aparelho
                            </p>
                          </div>

                          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md pointer-events-none">
                            <UploadCloud className="w-4 h-4" />
                            <span>Abrir Galeria do Aparelho</span>
                          </div>
                        </div>

                        {/* Direct Native System Selector as Secondary Guaranteed Fallback */}
                        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1.5">
                          <label className="block text-xs font-mono text-neutral-400 font-bold">
                            Ou escolha diretamente pelo seletor do sistema:
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-xs text-neutral-400 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-mono file:font-bold file:bg-[#DAA520] file:text-black hover:file:bg-amber-400 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Câmera Direta */}
                {imageTab === 'camera' && (
                  <div className="space-y-3">
                    {image ? (
                      <div className="border-2 border-emerald-500/60 bg-emerald-950/15 rounded-2xl p-4 text-center space-y-3">
                        <div className="relative h-48 w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-emerald-500/30">
                          <img
                            src={image}
                            alt="Foto da Câmera"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-black text-[11px] font-mono font-bold flex items-center gap-1 shadow-md">
                              <Check className="w-3.5 h-3.5" />
                              Foto Pronta!
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                              title="Tirar Outra Foto"
                            />
                            <button
                              type="button"
                              className="w-full py-2 px-3 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Tirar Outra Foto</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setImage('');
                              setImageFileName('');
                              setUrlInput('');
                            }}
                            className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-red-950 text-red-400 border border-red-500/30 font-mono font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative border-2 border-dashed border-[#DAA520] hover:border-amber-400 bg-amber-950/20 hover:bg-amber-950/30 rounded-2xl p-6 text-center transition-all space-y-3 group block shadow-inner">
                        {/* Native invisible camera input covering entire box */}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                          title="Toque aqui para abrir a câmera"
                        />

                        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#DAA520]/20 flex items-center justify-center text-[#DAA520] border border-[#DAA520]/40 shadow-md">
                          {isProcessingImage ? (
                            <RefreshCw className="w-8 h-8 animate-spin text-[#DAA520]" />
                          ) : (
                            <Camera className="w-8 h-8" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-bold text-[#DAA520] font-mono">
                            {isProcessingImage ? 'Processando foto capturada...' : 'Tirar Foto com a Câmera Agora'}
                          </p>
                          <p className="text-xs text-neutral-300 font-sans">
                            Toque em qualquer lugar desta caixa para abrir a câmera do celular
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md pointer-events-none">
                          <Camera className="w-4 h-4" />
                          <span>Abrir Câmera do Celular</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: URL Input */}
                {imageTab === 'url' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://exemplo.com/foto-corte.jpg"
                      className="flex-1 bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3.5 py-2.5 bg-[#DAA520] hover:bg-[#c9951b] text-black text-xs font-mono font-bold rounded-xl cursor-pointer"
                    >
                      Carregar
                    </button>
                  </div>
                )}

                {/* Tab 4: Barber Presets */}
                {imageTab === 'presets' && (
                  <div className="space-y-2">
                    <p className="text-xs text-neutral-400 font-mono">
                      Toque em qualquer modelo para usar na publicação:
                    </p>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1.5 bg-neutral-950 rounded-xl border border-neutral-800">
                      {BARBER_PHOTO_PRESETS.map((preset, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleSelectPreset(preset.url, preset.category)}
                          className={`relative rounded-lg overflow-hidden border transition-all text-left group cursor-pointer ${
                            image === preset.url ? 'border-emerald-500 ring-2 ring-emerald-500/60 scale-[0.98]' : 'border-neutral-800 hover:border-[#DAA520]'
                          }`}
                        >
                          <img src={preset.url} alt={preset.title} className="w-full h-16 object-cover group-hover:scale-105 transition-transform" />
                          {image === preset.url && (
                            <div className="absolute top-1 right-1 bg-emerald-500 text-black rounded-full p-0.5 shadow">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                          <div className="p-1 bg-black/90">
                            <p className="text-[9px] font-mono text-neutral-300 truncate">{preset.title}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Global Active Image Status Bar */}
                {image ? (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-emerald-500/50">
                        <img src={image} alt="Thumb" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-emerald-300 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Foto Anexada: {imageFileName || 'Imagem Selecionada'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImage('');
                        setImageFileName('');
                        setUrlInput('');
                      }}
                      className="text-red-400 hover:text-red-300 text-[11px] underline cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-2 text-xs font-mono text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Nenhuma foto anexada ainda. Escolha uma foto na Galeria ou Modelos acima.</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Título da Publicação</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Novo Estilo Degradê Navalhado 2026"
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                  >
                    <option value="Tendências">Tendências</option>
                    <option value="Cortes">Cortes & Barba</option>
                    <option value="Estilo">Estilo & Dicas</option>
                    <option value="Campanha">Campanha / Promoção</option>
                    <option value="Cuidados">Cuidados Capilares</option>
                    <option value="Aviso">Aviso da Barbearia</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Autor / Assinatura</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Barbearia Jadson Barber"
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Conteúdo da Publicação</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva a descrição, detalhes do corte, produtos usados ou aviso..."
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#DAA520] leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono">
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded border-neutral-700 text-[#DAA520] focus:ring-[#DAA520] cursor-pointer"
                  />
                  <span>Publicação Ativa</span>
                </label>

                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highlighted}
                    onChange={(e) => setHighlighted(e.target.checked)}
                    className="rounded border-neutral-700 text-[#DAA520] focus:ring-[#DAA520] cursor-pointer"
                  />
                  <span className="text-[#DAA520] font-bold">Destaque ⭐</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isProcessingImage}
                className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Salvando Publicação...</span>
                  </>
                ) : (
                  <span>{editingPost ? 'Salvar Alterações' : 'Publicar no Feed'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
