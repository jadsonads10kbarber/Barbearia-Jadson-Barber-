import React, { useState } from 'react';
import { Newspaper, Plus, Trash2, Edit2, Eye, EyeOff, Star, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { FeedPost } from '../../types';

export const AdminFeedPage: React.FC = () => {
  const { feedPosts, addFeedPost, updateFeedPost, deleteFeedPost, addToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tendências');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [author, setAuthor] = useState('Barbearia Jadson Barber');
  const [active, setActive] = useState(true);
  const [highlighted, setHighlighted] = useState(false);

  const handleOpenCreate = () => {
    setEditingPost(null);
    setTitle('');
    setCategory('Tendências');
    setContent('');
    setImage('https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=600&auto=format&fit=crop&q=80');
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
    setImage(post.image);
    setAuthor(post.author);
    setActive(post.active ?? true);
    setHighlighted(post.highlighted ?? false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      addToast('Por favor, preencha o título e o conteúdo.', 'error');
      return;
    }

    if (editingPost) {
      await updateFeedPost(editingPost.id, {
        title: title.trim(),
        category,
        content: content.trim(),
        image: image.trim() || 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=600&auto=format&fit=crop&q=80',
        author: author.trim(),
        active,
        highlighted,
      });
    } else {
      await addFeedPost({
        title: title.trim(),
        category,
        content: content.trim(),
        image: image.trim() || 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=600&auto=format&fit=crop&q=80',
        author: author.trim(),
        active,
        highlighted,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <AdminLayout
      title="Gestão do Feed de Notícias & Tendências"
      subtitle="Publique dicas de corte, avisos e promoções que aparecem diretamente no aplicativo do cliente"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111111] p-4 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#DAA520]" />
            Publicações do Feed ({feedPosts.length})
          </h2>
          <p className="text-xs text-neutral-400 font-sans">
            Mantenha seus clientes informados e engajados
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
            className="bg-[#111111] border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-colors"
          >
            <div>
              <div className="relative h-44 w-full bg-neutral-900 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2.5 py-1 rounded-full bg-black/80 text-[#DAA520] text-[10px] font-mono font-bold uppercase border border-amber-500/30">
                    {post.category}
                  </span>
                  {post.highlighted && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-mono font-bold uppercase flex items-center gap-1">
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
                  onClick={() => handleOpenEdit(post)}
                  className="p-1.5 rounded-lg bg-neutral-900 text-amber-400 hover:bg-neutral-800 border border-neutral-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteFeedPost(post.id)}
                  className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 border border-neutral-800"
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
          <div className="w-full max-w-md bg-[#111111] border border-neutral-800 rounded-3xl p-6 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#DAA520]" />
                {editingPost ? 'Editar Publicação' : 'Criar Publicação'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white bg-neutral-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Estilos de Barba para 2026"
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
                    <option value="Campanha">Campanha</option>
                    <option value="Cuidados">Cuidados</option>
                    <option value="Aviso">Aviso</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-neutral-300">Autor</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">URL da Imagem Banner</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#DAA520]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-neutral-300">Conteúdo</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Texto completo da matéria..."
                  className="w-full bg-black/80 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#DAA520]"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Ativo no App</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highlighted}
                    onChange={(e) => setHighlighted(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Destaque Principal</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#DAA520] hover:bg-[#c9951b] text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {editingPost ? 'Salvar Alterações' : 'Publicar no Feed'}
              </button>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};
