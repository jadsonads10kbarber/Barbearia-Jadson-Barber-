import React from 'react';
import { Newspaper, ThumbsUp, Share2, Sparkles, User, Calendar, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FeedPage: React.FC = () => {
  const { feedPosts, toggleLikePost, addToast, barbershopInfo } = useApp();

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
    <div className="pb-20 pt-2 px-4 max-w-md mx-auto space-y-6 snap-y snap-mandatory">
      
      {/* Title Header */}
      <div className="border-b border-neutral-800 pb-3">
        <h1 className="text-xl font-black text-white font-mono flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-amber-400" />
          Feed & Novidades
        </h1>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Confira novidades e tendências da Barbearia JADSON BARBER
        </p>
      </div>

      {/* Feed List */}
      <div className="space-y-8">
        {feedPosts.map((post) => (
          <article
            key={post.id}
            className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl p-3.5 flex flex-col justify-between max-h-[calc(100vh-150px)] snap-start snap-always space-y-3"
          >
            {/* Header / Meta info */}
            <div className="flex items-center justify-between text-xs text-gray-400 shrink-0">
              <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                <User className="w-3.5 h-3.5" />
                {post.author}
              </span>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </span>
              </div>
            </div>

            {/* 9:16 Aspect Ratio Image Container */}
            <div className="flex-1 min-h-0 w-full relative aspect-[9/16] overflow-hidden rounded-xl bg-neutral-950 border border-neutral-800/80">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Post Title & Description */}
            <div className="shrink-0 space-y-1">
              <h2 className="text-base font-bold text-white font-mono leading-tight line-clamp-1">
                {post.title}
              </h2>
              <p className="text-xs text-gray-300 leading-snug line-clamp-2">
                {post.content}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between shrink-0">
              <button
                onClick={() => toggleLikePost(post.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  post.isLiked
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-neutral-800 text-gray-300 hover:text-amber-400'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-black' : ''}`} />
                <span>{post.likesCount} Curtidas</span>
              </button>

              <button
                onClick={() => handleShare(post.title, post.content)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-xs font-bold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Compartilhar</span>
              </button>
            </div>

          </article>
        ))}
      </div>

    </div>
  );
};
