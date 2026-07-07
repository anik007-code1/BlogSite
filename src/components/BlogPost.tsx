import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Calendar, Eye, Bookmark, Share2, Heart, Play } from 'lucide-react';
import { Article } from '../types';

interface BlogPostProps {
  articleSlug: string;
  onBack: () => void;
  onNavigateToPost: (slug: string) => void;
  allArticles: Article[];
}

export const BlogPost: React.FC<BlogPostProps> = ({
  articleSlug,
  onBack,
  onNavigateToPost,
  allArticles
}) => {
  const [article, setArticle] = useState<Article | null>(() => {
    try {
      const script = document.getElementById('preloaded-article');
      if (script && script.textContent) {
        const data = JSON.parse(script.textContent);
        if (data && data.slug === articleSlug) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Failed to parse preloaded article", e);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => {
    try {
      const script = document.getElementById('preloaded-article');
      if (script && script.textContent) {
        const data = JSON.parse(script.textContent);
        if (data && data.slug === articleSlug) {
          return false;
        }
      }
    } catch (e) {}
    return true;
  });

  const [likes, setLikes] = useState(Math.floor(Math.random() * 200) + 45);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);

  // Fetch single article from persistent backend API (this increments views dynamically!)
  useEffect(() => {
    if (article && article.slug === articleSlug) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const fetchArticleDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/articles/${articleSlug}`);
        if (response.ok) {
          const data = await response.json();
          if (active) {
            setArticle(data);
          }
        }
      } catch (err) {
        console.error("Error fetching article details", err);
      } finally {
        if (active) {
          setIsLoading(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
    };

    fetchArticleDetails();

    return () => {
      active = false;
    };
  }, [articleSlug]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4 font-sans">
        <div className="w-10 h-10 border-4 border-brass-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="font-serif italic text-sm text-[#7c7a72]">Opening original manuscript...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-32 space-y-4 font-sans">
        <h2 className="font-serif text-2xl text-charcoal-intense">Manuscript lost in archives</h2>
        <p className="text-xs text-[#7c7a72]">The article with slug "{articleSlug}" was not found or remains a draft.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-charcoal-intense text-cream-base rounded-md text-xs font-semibold cursor-pointer"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  // Get 3 related articles (same category, or just other published ones, excluding current)
  const relatedArticles = allArticles
    .filter(a => a.slug !== article.slug && a.status === 'Published')
    .slice(0, 3);

  return (
    <article className="animate-fade-in duration-300">
      
      {/* Back button */}
      <div className="max-w-4xl mx-auto mb-8 font-sans">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7c7a72] hover:text-charcoal-intense transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 translate-x-0 group-hover:-translate-x-1 transition-transform" />
          <span>Back to catalog</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Article Header (Screen 2 matching details) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-brass-accent uppercase tracking-widest font-sans">
            <span>{article.category}</span>
            <span>/</span>
            <span className="text-[#929087] font-mono">{article.publishedDate}</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal-intense leading-[1.08] tracking-tight">
            {article.title}
          </h1>

          <p className="font-serif italic text-xl md:text-2xl text-charcoal-soft/80 leading-relaxed font-light border-l-2 border-cream-dark/60 pl-6 max-w-3xl">
            {article.summary}
          </p>

          {/* Author Banner & Stats Row */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-y border-cream-dark/60 pb-6 font-sans">
            
            <div className="flex items-center gap-3">
              <img 
                src={article.authorAvatar} 
                alt={article.author}
                className="w-11 h-11 rounded-full object-cover border border-cream-dark"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div>
                <p className="text-sm font-bold text-charcoal-intense">{article.author}</p>
                <p className="text-[11px] text-[#7c7a72]">{article.authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-[#7c7a72] text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4.5 h-4.5 text-brass-accent" />
                <span>{article.readingTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4.5 h-4.5 text-brass-accent" />
                <span>{article.views.toLocaleString()} dynamic views</span>
              </div>
            </div>

          </div>
        </div>

        {/* Hero image header banner */}
        <div className="rounded-2xl overflow-hidden aspect-[16/9] border border-cream-dark shadow-md bg-cream-dark">
          <img 
            src={article.featuredImage} 
            alt={article.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="eager"
          />
        </div>

        {/* Article Layout Core (Two columns layout matching physical stationeries) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
          
          {/* Left social utilities - Sticky rail */}
          <div className="lg:col-span-2 space-y-6 font-sans lg:sticky lg:top-28 lg:h-fit border-b lg:border-b-0 pb-6 lg:pb-0 border-cream-dark/40">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7c7a72]">Interact</p>
            
            <div className="flex lg:flex-col gap-4">
              <button 
                onClick={() => { setLikes(l => hasLiked ? l - 1 : l + 1); setHasLiked(!hasLiked); }}
                className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                  hasLiked 
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-cream-dark hover:border-red-300 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{likes}</span>
              </button>

              <button 
                onClick={() => setHasBookmarked(!hasBookmarked)}
                className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                  hasBookmarked 
                    ? 'border-brass-light bg-brass-light/10 text-brass-accent'
                    : 'border-cream-dark hover:border-brass-accent hover:text-brass-accent'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${hasBookmarked ? 'fill-current' : ''}`} />
                <span>Save</span>
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Article link copied to clipboard!');
                }}
                className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-cream-dark hover:border-brass-accent hover:text-brass-accent transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            <div className="hidden lg:block space-y-3 pt-6 border-t border-cream-dark/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7c7a72]">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {article.tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-cream-paper border border-cream-dark py-1 px-2.5 rounded font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right main written body (Beautiful long-form news reader typography) */}
          <div className="lg:col-span-10 space-y-10">
            <div 
              className="prose max-w-none font-serif text-[#2a2a28] text-lg md:text-xl leading-relaxed tracking-normal space-y-6 animate-fade-in-up duration-500"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* GOOGLE ADSENSE IN-ARTICLE NATIVE AD PLACEMENT */}
            <div className="w-full border border-dashed border-cream-dark/65 bg-cream-paper/20 rounded-xl p-4 text-center font-sans shadow-sm select-none">
              <div className="flex items-center justify-between border-b border-cream-dark/30 pb-2 mb-2">
                <span className="text-[9px] font-mono tracking-widest text-[#9a9994] uppercase font-bold">
                  Google AdSense • In-Article Matching Ad Unit
                </span>
                <span className="text-[8px] font-bold text-brass-accent uppercase bg-cream-dark/30 px-1.5 py-0.5 rounded">
                  Sponsored Slot
                </span>
              </div>
              <div className="py-4 flex flex-col items-center justify-center min-h-[70px]">
                <p className="text-xs font-serif font-bold text-charcoal-soft">Native Matched Content Ad Unit</p>
                <p className="text-[9px] font-mono mt-1 text-[#929087]">
                  Code: &lt;ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article"&gt;&lt;/ins&gt;
                </p>
              </div>
            </div>

            {/* Mobile tags container */}
            <div className="lg:hidden flex flex-wrap gap-2 pt-6 mt-8 border-t border-cream-dark/40 font-sans">
              {article.tags.map(tag => (
                <span key={tag} className="text-[11px] bg-cream-paper border border-cream-dark py-1 px-2.5 rounded font-mono">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* 4. RECOMMENDATION FRAMEWORKS (Matching Screen 2 bottom) */}
        {relatedArticles.length > 0 && (
          <div className="pt-16 border-t border-cream-dark mt-20 space-y-10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[11px] font-bold text-brass-accent tracking-widest uppercase font-sans mb-1">
                  Read Next
                </p>
                <h3 className="font-serif text-3xl font-bold text-charcoal-intense">
                  Related Manuscripts
                </h3>
              </div>
              <button 
                onClick={onBack}
                className="text-xs font-bold text-charcoal-soft hover:text-brass-accent font-sans border-b border-charcoal-soft transition-colors pb-0.5"
              >
                View all essays
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((rel) => (
                <a 
                  key={rel.id}
                  href={`/post/${rel.slug}`}
                  onClick={(e) => { e.preventDefault(); onNavigateToPost(rel.slug); }}
                  className="bg-cream-paper hover:bg-white rounded-xl border border-cream-dark/40 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col group h-full text-left"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={rel.featuredImage} 
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-brass-accent uppercase tracking-wider block">
                        {rel.category}
                      </span>
                      <h4 className="font-serif text-lg font-bold leading-snug text-charcoal-intense group-hover:text-brass-accent transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-cream-dark/40 font-sans text-[10px] text-[#7c7a72]">
                      <span>{rel.publishedDate}</span>
                      <span>{rel.readingTime}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </article>
  );
};
