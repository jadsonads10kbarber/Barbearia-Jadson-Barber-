import React from 'react';
import { Newspaper, Heart, Share2, Sparkles, User, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FeedPage: React.FC = () => {
  const { feedPosts, toggleLikePost, addToast, barbershopInfo } = useApp();

  // Filter only active posts for clients
  const visiblePosts = feedPosts.filter((post) => post.active ?? true);

  const handleShare = async (title: string, content: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `JADSON BARBER — ${title}`,
          text: content,
          url: window.location.href,
        });
      } catch (e) {
        // user cancelled share
      }
    } else {
      navigator.clipboard.writeText(`${title} - ${barbershopInfo.name}: ${window.location.href}`);
      addToast('Link da publicação copiado!', 'info');
    }
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="border-b border-neutral-800 pb-3">
        <h1 className="text-xl font-black text-white font-mono flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-amber-400" />
          Feed & Novidades
        </h1>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Confira dicas de estilo, tendências e novidades da Barbearia Jadson Barber
        </p>
      </div>

      {/* Feed List */}
      {visiblePosts.length === 0 ? (
        <div className="p-8 text-center bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-2">
          <Newspaper className="w-8 h-8 text-neutral-600 mx-auto" />
          <p className="text-sm font-mono text-neutral-400">Nenhuma publicação no feed no momento.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {visiblePosts.map((post) => (
            <article
              key={post.id}
              className="bg-neutral-900/90 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl p-4 flex flex-col justify-between space-y-3 hover:border-neutral-700 transition-colors"
            >
              {/* Header / Meta info */}
              <div className="flex items-center justify-between text-xs text-gray-400 shrink-0">
                <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <User className="w-3.5 h-3.5" />
                  {post.author}
                </span>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                </div>
              </div>

              {/* Aspect Ratio Image Container */}
              <div className="w-full relative aspect-[4/5] sm:aspect-[16/10] overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-800/80">
                <img
                  src={post.image || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80'}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              {/* Post Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-white font-mono leading-tight">
                  {post.title}
                </h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => toggleLikePost(post.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    post.isLiked
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-md shadow-rose-500/10'
                      : 'bg-neutral-800 text-gray-300 hover:text-rose-400 hover:bg-neutral-800/80 border border-neutral-700/50'
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-transform ${post.isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                  <span>
                    {post.isLiked ? 'Curtido' : 'Curtir'} ({post.likesCount || 0})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare(post.title, post.content)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-xs font-bold transition-colors cursor-pointer border border-neutral-700/50"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Compartilhar</span>
                </button>
              </div>

            </article>
          ))}
        </div>
      )}

    </div>
  );
};

