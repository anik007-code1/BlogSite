import React, { useState } from 'react';
import { Search, Eye, BookOpen, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Article } from '../types';

interface BlogHomeProps {
  articles: Article[];
  onSelectArticle: (slug: string) => void;
  isLoading: boolean;
}

export const BlogHome: React.FC<BlogHomeProps> = ({
  articles,
  onSelectArticle,
  isLoading
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamically extract categories from all published articles
  const categories = React.useMemo(() => {
    const uniqueCats = new Set<string>();
    articles.forEach((a) => {
      if (a.category && a.status === 'Published') {
        const capitalized = a.category.charAt(0).toUpperCase() + a.category.slice(1);
        uniqueCats.add(capitalized);
      }
    });
    return ['All', ...Array.from(uniqueCats).sort()];
  }, [articles]);

  // Filtration logic
  const filteredArticles = articles.filter((article) => {
    const matchesCategory = 
      selectedCategory === 'All' || 
      article.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch && article.status === 'Published';
  });

  // Find Featured post (or fallback to latest published)
  const featuredPost = articles.find(a => a.isFeatured && a.status === 'Published') || articles[0];

  return (
    <div className="space-y-16 animate-fade-in duration-300">
      
      {/* 1. HERO FEATURED SECTION (Matching Screen 1 layout) */}
      {featuredPost && (
        <a 
          href={`/post/${featuredPost.slug}`}
          onClick={(e) => { e.preventDefault(); onSelectArticle(featuredPost.slug); }}
          className="relative rounded-2xl overflow-hidden bg-[#1e1e19] text-white border border-cream-dark/20 shadow-xl cursor-pointer group hover:shadow-2xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 block"
          id="featured-hero-card"
        >
          {/* Cover image left on large screens */}
          <div className="lg:col-span-8 overflow-hidden aspect-video lg:aspect-auto lg:h-[480px]">
            <img 
              src={featuredPost.featuredImage} 
              alt={featuredPost.title}
              className="w-full h-full object-cover opacity-90 group-hover:scale-[1.02] transition-transform duration-700 select-none"
              referrerPolicy="no-referrer"
              loading="eager"
            />
          </div>

          {/* Details right */}
          <div className="lg:col-span-4 p-8 md:p-12 flex flex-col justify-between bg-zinc-950 h-full">
            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold text-brass-light tracking-widest uppercase font-sans">
                  Featured post
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-brass-accent"></span>
                <span className="text-xs font-mono text-zinc-400">
                  {featuredPost.category}
                </span>
              </div>

              <h1 className="font-serif text-3xl md:text-4xl text-cream-base font-bold leading-tight group-hover:text-brass-light transition-colors">
                {featuredPost.title}
              </h1>

              <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                {featuredPost.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-zinc-800 font-sans mt-8">
              <div className="flex items-center gap-3">
                <img 
                  src={featuredPost.authorAvatar} 
                  alt={featuredPost.author}
                  className="w-9 h-9 rounded-full object-cover border border-zinc-800"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div>
                  <p className="text-xs font-semibold text-cream-base">{featuredPost.author}</p>
                  <p className="text-[10px] text-zinc-500">{featuredPost.publishedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-brass-light font-medium">
                <span>Read Feature</span>
                <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </a>
      )}

      {/* 2. NAVIGATION AND FILTRATION FRAME (Matching Screen 1 precisely) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-cream-dark/60">
        
        {/* Category Toggles (Tactile Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1" id="category-scroller">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-medium rounded-full cursor-pointer transition-all duration-200 uppercase tracking-wider font-sans whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-charcoal-intense text-cream-base shadow-md font-bold'
                  : 'bg-cream-paper hover:bg-cream-dark/60 text-charcoal-soft border border-cream-dark/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#7c7a72]" />
          <input
            type="text"
            placeholder="Search essays by title or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cream-paper/80 border border-cream-dark/60 rounded-xl py-2.5 pl-10 pr-4 text-xs text-charcoal-intense placeholder-on-surface-variant/40 focus:outline-none focus:border-brass-accent focus:bg-cream-paper transition-all font-sans"
          />
        </div>

      </div>

      {/* 2.5 GOOGLE ADSENSE MAIN HOMEPAGE HEADER AD UNIT */}
      <div className="w-full border border-dashed border-cream-dark/70 bg-cream-paper/30 rounded-xl p-4 text-center font-sans shadow-sm hover:bg-cream-paper/55 transition-all select-none">
        <div className="flex items-center justify-between border-b border-cream-dark/30 pb-2 mb-2">
          <span className="text-[9px] font-mono tracking-widest text-[#9a9994] uppercase font-bold">
            Google AdSense • Homepage Top Leaderboard
          </span>
          <span className="text-[8px] font-extrabold text-brass-accent uppercase bg-cream-dark/30 px-2 py-0.5 rounded-full">
            Active Placement Slot
          </span>
        </div>
        <div className="py-4 flex flex-col items-center justify-center min-h-[70px]">
          <p className="text-xs font-serif font-bold text-charcoal-soft">Header Banner & Native Responsive Unit (728x90 or Fluid)</p>
          <p className="text-[9px] font-mono mt-1 text-[#929087] bg-cream-dark/15 px-2 py-1 rounded inline-block">
            Code: &lt;ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXX" data-ad-slot="XXXXXX" data-ad-format="auto"&gt;&lt;/ins&gt;
          </p>
        </div>
      </div>

      {/* 3. STORIES GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 border-4 border-brass-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="font-serif italic text-sm text-[#7c7a72]">Opening the catalog vault...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-24 bg-cream-paper/40 rounded-2xl border border-cream-dark/45">
          <p className="font-serif text-lg text-charcoal-soft">No published essays found matching criteria</p>
          <p className="text-xs text-[#7c7a72] mt-2 font-sans">Try browsing alternative headers or reset search tokens.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="mt-6 px-4 py-2 bg-charcoal-intense hover:bg-charcoal-soft text-cream-base rounded-md text-xs font-semibold cursor-pointer font-sans"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredArticles.map((article) => (
            <a 
              key={article.id}
              href={`/post/${article.slug}`}
              onClick={(e) => { e.preventDefault(); onSelectArticle(article.slug); }}
              className="bg-cream-paper hover:bg-white rounded-xl border border-cream-dark/40 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group h-full text-left"
            >
              {/* Card visual thumb */}
              <div className="relative aspect-video overflow-hidden border-b border-cream-dark/20 h-48 bg-cream-dark">
                <img 
                  src={article.featuredImage} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                
                {/* Category label overlays */}
                <div className="absolute top-4 left-4 bg-charcoal-intense/80 backdrop-blur-sm text-cream-base text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded">
                  {article.category}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#7c7a72] uppercase">
                    <Calendar className="w-3 h-3" />
                    <span>{article.publishedDate}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{article.readingTime}</span>
                  </div>

                  <h3 className="font-serif text-xl font-bold leading-snug text-charcoal-intense group-hover:text-brass-accent transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-charcoal-soft/80 line-clamp-3 leading-relaxed font-sans">
                    {article.summary}
                  </p>
                </div>

                {/* Card footer details signature */}
                <div className="flex items-center justify-between pt-4 border-t border-cream-dark/40 mt-auto font-sans">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={article.authorAvatar} 
                      alt={article.author}
                      className="w-7.5 h-7.5 rounded-full object-cover border border-cream-dark"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-[11px] font-semibold text-charcoal-intense">{article.author}</p>
                      <p className="text-[9px] text-[#7c7a72]">{article.authorRole.split('&')[0]}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-mono text-[#7c7a72] uppercase font-bold">
                    <Eye className="w-3.5 h-3.5 text-brass-accent" />
                    <span>{article.views.toLocaleString()}</span>
                  </div>
                </div>

              </div>
            </a>
          ))}
        </div>
      )}

    </div>
  );
};
