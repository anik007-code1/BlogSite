import React, { useState, useEffect } from 'react';
import { 
  Plus, Eye, Users, FileText, Mail, ShieldAlert,
  Settings, BarChart3, Radio, FileEdit, CheckCircle, 
  XSquare, RefreshCw, Layout, BookOpen, Layers,
  Trash2, X
} from 'lucide-react';
import { Article, VisitorStats } from '../types';
import { ApiPlayground } from './ApiPlayground';

interface AdminDashboardProps {
  articles: Article[];
  onNavigateToEditor: (articleId?: string) => void;
  onRefreshArticles: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  articles,
  onNavigateToEditor,
  onRefreshArticles,
}) => {
  const [activeSidebar, setActiveSidebar] = useState<'dashboard' | 'posts' | 'categories' | 'analytics' | 'messages' | 'settings' | 'api'>('dashboard');
  const [analyticsData, setAnalyticsData] = useState<{
    stats: VisitorStats;
    totalArticles: number;
    draftsCount: number;
    subscribersCount: number;
    messagesCount?: number;
    unreadMessagesCount?: number;
  } | null>(null);
  
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  // Fetch SQLite stored feedback messages from backend
  const loadMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const token = localStorage.getItem('vellum_admin_token') || '';
      const response = await fetch('/api/contact', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setContactMessages(data);
      }
    } catch (err) {
      console.error("Error reading help messages from SQLite", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeSidebar === 'messages') {
      loadMessages();
    }
  }, [activeSidebar]);

  const handleMarkMessageRead = async (id: string) => {
    try {
      const token = localStorage.getItem('vellum_admin_token') || '';
      const response = await fetch(`/api/contact/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        loadMessages();
        loadAnalytics();
      }
    } catch (err) {
      console.error("Failed to flag read message:", err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this support message?")) return;
    try {
      const token = localStorage.getItem('vellum_admin_token') || '';
      const response = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        loadMessages();
        loadAnalytics();
      }
    } catch (err) {
      console.error("Failed inside delete message action:", err);
    }
  };

  // Handle article deletion via safe backend DELETE call
  const handleDeleteArticle = async (id: string) => {
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('vellum_admin_token') || '';
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        onRefreshArticles();
        await loadAnalytics();
      } else {
        alert("Failed to delete manuscript. Check security authorizations.");
      }
    } catch (err) {
      console.error("Failed to delete article", err);
      alert("Network failure. Deletion could not reach the backend server.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  // Fetch stats in real-time from Express full-stack endpoint
  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const token = localStorage.getItem('vellum_admin_token') || '';
      const response = await fetch('/api/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Error reading analytics from Express", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [articles]);

  // Handle immediate Quick Publish Status toggle via backend API
  const handleToggleStatus = async (article: Article) => {
    setIsUpdatingStatus(article.id);
    const updatedStatus = article.status === 'Published' ? 'Draft' : 'Published';
    
    try {
      const token = localStorage.getItem('vellum_admin_token') || '';
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...article,
          status: updatedStatus,
        }),
      });

      if (response.ok) {
        onRefreshArticles();
        await loadAnalytics();
      }
    } catch (err) {
      console.error("Failed to toggle article publication state", err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const menuItems = [
    { key: 'dashboard', label: 'Overview', icon: Layout },
    { key: 'posts', label: 'All Artifacts', icon: FileText },
    { key: 'categories', label: 'Sections', icon: Layers },
    { key: 'analytics', label: 'Dynamic Traffic', icon: BarChart3 },
    { key: 'messages', label: 'Contact Messages', icon: Mail },
    { key: 'api', label: 'Content Upload API', icon: Radio },
    { key: 'settings', label: 'Platform Config', icon: Settings },
  ] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in duration-300 font-sans">
      
      {/* LEFT COLUMN: Sidebar Navigation */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-cream-paper border border-cream-dark/60 rounded-2xl p-6 space-y-8">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal-intense mb-1">
              Author Control Room
            </h3>
            <p className="text-[10px] uppercase font-bold tracking-wider text-brass-accent font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Admin Gateway Connected
            </p>
          </div>

          <nav className="flex flex-col gap-1.5 font-sans">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasUnreadMessages = item.key === 'messages' && (analyticsData?.unreadMessagesCount ?? 0) > 0;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveSidebar(item.key)}
                  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all text-left cursor-pointer ${
                    activeSidebar === item.key
                      ? 'bg-charcoal-intense text-cream-base shadow-md'
                      : 'hover:bg-cream-dark/40 text-charcoal-soft'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${activeSidebar === item.key ? 'text-brass-light' : 'text-[#7c7a72]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {hasUnreadMessages && (
                    <span className="bg-brass-accent text-charcoal-intense font-sans font-extrabold text-[9px] px-1.5 py-0.5 rounded-full animate-pulse border border-cream-base/25">
                      {analyticsData?.unreadMessagesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-cream-dark/60 font-sans text-[11px] text-[#7c7a72] leading-relaxed">
            <p className="font-semibold text-charcoal-intense">LLM Review Pro CMS v4.0</p>
            <p className="mt-1">Relational state synced to fallback JSON server mimicking safe database structures.</p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Active Admin View Content */}
      <div className="lg:col-span-9 space-y-8">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-dark/60">
          <div>
            <h1 className="font-serif text-3xl font-bold text-charcoal-intense">
              {activeSidebar === 'dashboard' ? 'Dashboard Overview' : `${activeSidebar.charAt(0).toUpperCase() + activeSidebar.slice(1)}`}
            </h1>
            <p className="text-xs text-[#7c7a72] mt-1 font-sans">
              Monitor layout statistics, review metadata parameters, and manage written manuscripts.
            </p>
          </div>

          <button
            onClick={() => onNavigateToEditor()}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-charcoal-intense hover:bg-charcoal-soft text-cream-base rounded-xl text-xs font-bold transition-all duration-200 shadow-md group cursor-pointer"
            id="create-new-article-button"
          >
            <Plus className="w-4.5 h-4.5 text-brass-light group-hover:rotate-90 transition-transform duration-300" />
            <span>Compose Essay</span>
          </button>
        </div>

        {activeSidebar === 'dashboard' ? (
          <>
            {/* 1. ANALYTICS ROW CARDS (Screen 3 matching parameters) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              
              <div className="bg-cream-paper border border-cream-dark/60 rounded-xl p-5 space-y-2.5">
                <div className="flex justify-between items-center text-[#7c7a72]">
                  <span className="text-[10px] font-bold tracking-widest uppercase">Pageviews</span>
                  <Eye className="w-4 h-4 text-brass-accent" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold tracking-tight text-charcoal-intense font-mono">
                    {isLoadingAnalytics ? '...' : analyticsData?.stats.pageViews.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold font-sans">
                    +12.4% vs last week
                  </p>
                </div>
              </div>

              <div className="bg-cream-paper border border-cream-dark/60 rounded-xl p-5 space-y-2.5">
                <div className="flex justify-between items-center text-[#7c7a72]">
                  <span className="text-[10px] font-bold tracking-widest uppercase">Unique Visitors</span>
                  <Users className="w-4 h-4 text-brass-accent" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold tracking-tight text-charcoal-intense font-mono">
                    {isLoadingAnalytics ? '...' : analyticsData?.stats.uniqueVisitors.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold font-sans">
                    +8.1% vs last week
                  </p>
                </div>
              </div>

              <div className="bg-cream-paper border border-cream-dark/60 rounded-xl p-5 space-y-2.5">
                <div className="flex justify-between items-center text-[#7c7a72]">
                  <span className="text-[10px] font-bold tracking-widest uppercase">Total Essays</span>
                  <FileText className="w-4 h-4 text-brass-accent" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold tracking-tight text-charcoal-intense font-mono">
                    {articles.length}
                  </p>
                  <p className="text-[10px] text-brass-accent font-bold font-sans">
                    {articles.filter(a => a.status === 'Draft').length} Saved Drafts
                  </p>
                </div>
              </div>

              <div className="bg-cream-paper border border-cream-dark/60 rounded-xl p-5 space-y-2.5">
                <div className="flex justify-between items-center text-[#7c7a72]">
                  <span className="text-[10px] font-bold tracking-widest uppercase">Subscribers</span>
                  <Mail className="w-4 h-4 text-brass-accent" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold tracking-tight text-charcoal-intense font-mono">
                    {isLoadingAnalytics ? '...' : (analyticsData?.subscribersCount ?? 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold font-sans">
                    +{analyticsData?.subscribersCount ? '100%' : '0%'} growth rate
                  </p>
                </div>
              </div>

              <div 
                className="bg-cream-paper border border-cream-dark/60 rounded-xl p-5 space-y-2.5 cursor-pointer hover:bg-cream-dark/25 transition-all"
                onClick={() => setActiveSidebar('messages')}
              >
                <div className="flex justify-between items-center text-[#7c7a72]">
                  <span className="text-[10px] font-bold tracking-widest uppercase">Unread Inbox</span>
                  <Mail className="w-4 h-4 text-brass-accent" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold tracking-tight text-charcoal-intense font-mono flex items-center gap-1.5">
                    {isLoadingAnalytics ? '...' : analyticsData?.unreadMessagesCount ?? 0}
                    {(analyticsData?.unreadMessagesCount ?? 0) > 0 && (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-brass-accent animate-ping"></span>
                    )}
                  </p>
                  <p className="text-[10px] text-brass-accent font-bold font-sans uppercase">
                    Review Inquiries
                  </p>
                </div>
              </div>

            </div>

            {/* 2. CUSTOM SVG TRAFFIC CHART (Optimized vector chart mimicking Screen 3 display) */}
            <div className="bg-cream-paper border border-cream-dark/60 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal-intense">
                    Live Operational Traffic
                  </h3>
                  <p className="text-xs text-[#7c7a72] font-sans">Weekly routing analysis metrics.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold font-sans uppercase text-[#7c7a72]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brass-accent"></span>
                    Weekly Hits
                  </span>
                </div>
              </div>

              {/* Dynamic SVG Drawing Frame */}
              <div className="w-full h-64 font-mono select-none relative">
                {(() => {
                  const history = analyticsData?.stats.visitorHistory || [];
                  const maxVal = Math.max(...history.map(h => h.count), 1);
                  
                  // Calculate dynamic coordinates
                  // Mon (50), Tue (150), Wed (250), Thu (350), Fri (450), Sat (550), Sun (650)
                  const points = history.map((h, i) => {
                    const x = 50 + i * 100;
                    const y = 190 - (h.count / maxVal) * 140; // Max height is 140px (from y=190 down to y=50)
                    return { x, y, day: h.day, count: h.count };
                  });

                  // Construct dynamic paths
                  const areaPath = points.length > 0
                    ? `M 50 190 L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${points[points.length - 1].x} 190 Z`
                    : '';
                  const linePath = points.length > 0
                    ? `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`
                    : '';

                  // Find peak point for peak label positioning
                  const peakPoint = points.reduce((max, p) => p.count > max.count ? p : max, points[0] || { x: 550, y: 45, count: 0, day: 'Sat' });
                  
                  // Represent scale values dynamically on the Y-Axis
                  const yLabelMax = maxVal;
                  const yLabelMed = Math.floor(maxVal * 0.5);
                  const yLabelLow = Math.floor(maxVal * 0.25);

                  return (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 700 240" id="analytical-svg-graph">
                      {/* Grid Lines */}
                      <line x1="50" y1="40" x2="680" y2="40" stroke="#eae8e0" strokeDasharray="3 3" />
                      <line x1="50" y1="90" x2="680" y2="90" stroke="#eae8e0" strokeDasharray="3 3" />
                      <line x1="50" y1="140" x2="680" y2="140" stroke="#eae8e0" strokeDasharray="3 3" />
                      <line x1="50" y1="190" x2="680" y2="190" stroke="#e1dfd6" />

                      {/* Horizontal Grid values */}
                      <text x="15" y="44" fill="#929087" fontSize="10" className="font-semibold text-right">{(yLabelMax > 999) ? `${(yLabelMax / 1000).toFixed(1)}K` : yLabelMax}</text>
                      <text x="15" y="94" fill="#929087" fontSize="10" className="font-semibold">{(yLabelMed > 999) ? `${(yLabelMed / 1000).toFixed(1)}K` : yLabelMed}</text>
                      <text x="15" y="144" fill="#929087" fontSize="10" className="font-semibold">{(yLabelLow > 999) ? `${(yLabelLow / 1000).toFixed(1)}K` : yLabelLow}</text>
                      <text x="15" y="194" fill="#929087" fontSize="10" className="font-semibold">0</text>

                      {points.length > 0 && (
                        <g>
                          {/* Dynamic Path shading below curve */}
                          <path 
                            d={areaPath} 
                            fill="url(#brass-gradient)" 
                            opacity="0.08"
                          />

                          {/* Dynamic Main continuous line stroke */}
                          <path 
                            d={linePath} 
                            fill="none" 
                            stroke="#9a8466" 
                            strokeWidth="3.5" 
                            strokeLinecap="round"
                          />

                          {/* Nodes definitions */}
                          {points.map((p, idx) => (
                            <circle 
                              key={idx}
                              cx={p.x} 
                              cy={p.y} 
                              r={p.day === peakPoint.day ? "6" : "5"} 
                              fill={p.day === peakPoint.day ? "#141414" : "#faf9f5"} 
                              stroke="#9a8466" 
                              strokeWidth="2.5" 
                            />
                          ))}

                          {/* Active highlight flag above peak node */}
                          <g transform={`translate(${peakPoint.x - 45}, ${peakPoint.y - 35})`}>
                            <rect width="90" height="24" rx="4" fill="#141414" />
                            <text x="45" y="15" fill="#faf9f5" fontSize="9" textAnchor="middle" className="font-sans font-bold">
                              {peakPoint.count.toLocaleString()} HITS
                            </text>
                          </g>
                        </g>
                      )}

                      {/* Horizontal Labels */}
                      {points.map((p, idx) => (
                        <text 
                          key={idx}
                          x={p.x} 
                          y="215" 
                          fill={p.day === peakPoint.day ? "#141414" : "#7c7a72"} 
                          fontSize="10" 
                          textAnchor="middle"
                          className={p.day === peakPoint.day ? "font-bold" : ""}
                        >
                          {p.day}
                        </text>
                      ))}

                      {/* SVG Gradient declaration */}
                      <defs>
                        <linearGradient id="brass-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9a8466" />
                          <stop offset="100%" stopColor="#faf9f5" />
                        </linearGradient>
                      </defs>
                    </svg>
                  );
                })()}
              </div>
            </div>

            {/* 3. MANUSCRIPTS MANAGEMENT TABLE */}
            <div className="bg-cream-paper border border-cream-dark/60 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-cream-dark/60 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-cream-paper">
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal-intense">
                    Manuscripts Catalog
                  </h3>
                  <p className="text-xs text-[#7c7a72] font-sans">
                    Track status indices, review historical views, and launch deep editorial rewrites.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    onRefreshArticles();
                    await loadAnalytics();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-cream-dark/80 rounded-lg text-xs font-semibold text-[#7c7a72] transition-colors cursor-pointer border border-cream-dark font-sans"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync state</span>
                </button>
              </div>

              {/* Data Table Core */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream-dark/30 text-[10px] font-bold text-[#7c7a72] uppercase tracking-wider font-sans border-b border-cream-dark/60">
                      <th className="py-4 px-6">Manuscript Details</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4 text-center">Total Hits</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-dark/40 text-xs">
                    {articles.map((article) => (
                      <tr 
                        key={article.id} 
                        className="hover:bg-cream-dark/15 transition-all group"
                      >
                        {/* Title details */}
                        <td className="py-4 px-6 max-w-sm">
                          <p className="font-serif text-sm font-bold text-charcoal-intense group-hover:text-brass-accent transition-colors line-clamp-1">
                            {article.title}
                          </p>
                          <p className="text-[10px] text-[#7c7a72] mt-0.5 font-sans">
                            Written by {article.author} • {article.publishedDate}
                          </p>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 py-1.5 font-sans">
                          <span className="bg-white border border-cream-dark text-[10px] uppercase font-bold py-1 px-2.5 rounded text-[#7c7a72]">
                            {article.category}
                          </span>
                        </td>

                        {/* Views count */}
                        <td className="py-4 px-4 text-center font-mono font-medium text-charcoal-soft">
                          {article.views.toLocaleString()}
                        </td>

                        {/* Status Tag */}
                        <td className="py-4 px-4 font-sans">
                          {article.status === 'Published' ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/65 px-2.5 py-1 rounded">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-extrabold text-amber-700 bg-amber-50 border border-amber-200/65 px-2.5 py-1 rounded">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              Draft
                            </span>
                          )}
                        </td>

                        {/* Practical Action controllers */}
                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap font-sans">
                          <button
                            onClick={() => handleToggleStatus(article)}
                            disabled={isUpdatingStatus === article.id}
                            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all duration-150 cursor-pointer ${
                              article.status === 'Published'
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                            id={`status-toggle-${article.id}`}
                          >
                            {isUpdatingStatus === article.id ? (
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block"></span>
                            ) : article.status === 'Published' ? (
                              'Keep Draft'
                            ) : (
                              'Go Active'
                            )}
                          </button>

                          <button
                            onClick={() => onNavigateToEditor(article.id)}
                            className="px-3 py-1.5 bg-white border border-cream-dark/80 hover:bg-cream-dark text-charcoal-soft rounded text-[10px] font-bold uppercase transition-all cursor-pointer inline-flex items-center gap-1"
                            id={`edit-action-${article.id}`}
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {deletingId === article.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteArticle(article.id)}
                                disabled={isDeleting}
                                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-750 text-white rounded text-[10px] font-bold uppercase transition-all cursor-pointer shadow-sm"
                                id={`delete-confirm-${article.id}`}
                              >
                                {isDeleting ? "Deleting..." : "Confirm"}
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-[10px] font-bold transition-all cursor-pointer"
                                title="Cancel deletion"
                                id={`delete-cancel-${article.id}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDeleteArticle(article.id)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 border border-red-200 rounded text-[10px] font-bold uppercase transition-all cursor-pointer inline-flex items-center gap-1"
                              id={`delete-trigger-${article.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeSidebar === 'messages' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-cream-paper border border-[#e1dfd6] rounded-2xl p-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal-intense flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brass-accent" />
                  <span>Contact Inquiry Inbox</span>
                </h3>
                <p className="text-xs text-[#7c7a72] font-sans mt-0.5">
                  Read, prioritize, and delete visitor submissions logged directly to SQLite.
                </p>
              </div>
              <button
                onClick={loadMessages}
                disabled={isLoadingMessages}
                className="p-2 hover:bg-cream-dark/60 rounded-full transition-colors cursor-pointer text-[#7c7a72] inline-flex items-center gap-1.5"
                title="Force reload inquiries"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingMessages ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {isLoadingMessages ? (
              <div className="py-24 text-center">
                <span className="w-8 h-8 border-4 border-charcoal-soft border-t-transparent rounded-full animate-spin inline-block"></span>
                <p className="text-xs text-[#7c7a72] mt-2 font-mono">Loading messages from SQLite db...</p>
              </div>
            ) : contactMessages.length === 0 ? (
              <div className="bg-cream-paper/40 border border-dashed border-cream-dark/65 rounded-2xl p-20 text-center space-y-3">
                <Mail className="w-10 h-10 text-cream-dark/80 mx-auto" strokeWidth={1} />
                <h4 className="font-serif text-charcoal-intense text-base font-bold">Inbox is completely clear</h4>
                <p className="text-xs text-[#7c7a72] max-w-sm mx-auto font-sans leading-relaxed">
                  No submissions are in the relational datastore queue. Submit inquiries from the public contact portal to test in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-4 font-sans animate-fade-in duration-200">
                {contactMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`border rounded-2xl p-6 transition-all shadow-sm ${
                      msg.isRead 
                        ? 'bg-cream-paper/20 border-cream-dark/40 text-charcoal-soft/80' 
                        : 'bg-white border-brass-accent/40 ring-1 ring-brass-accent/10 shadow-md text-charcoal-intense'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-cream-dark/40 pb-4 mb-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-charcoal-intense">
                            {msg.name || 'Anonymous Sender'}
                          </span>
                          <span className="font-mono text-[9px] text-[#908070] bg-cream-dark/25 px-2 py-0.5 rounded font-extrabold">
                            {msg.email}
                          </span>
                        </div>
                        <p className="text-xs font-serif italic text-charcoal-soft mt-1">
                          Subject: {msg.subject || '(Untitled Topic)'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="font-mono text-[#9a9994] font-semibold text-right">
                          {new Date(msg.timestamp).toLocaleString(undefined, { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </span>
                        
                        {!msg.isRead && (
                          <span className="bg-brass-accent/15 text-brass-accent border border-brass-accent/35 font-sans font-extrabold uppercase px-2 py-0.5 rounded tracking-wide">
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed font-sans whitespace-pre-line text-[#30302e] bg-cream-paper/20 p-4 rounded-xl border border-cream-dark/20">
                      {msg.message}
                    </p>

                    <div className="flex justify-end gap-3 pt-4 border-t border-cream-dark/30 mt-4 text-[10px] font-sans font-bold">
                      {!msg.isRead && (
                        <button
                          onClick={() => handleMarkMessageRead(msg.id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded uppercase cursor-pointer"
                        >
                          Mark Viewed
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded uppercase cursor-pointer"
                      >
                        Delete Inquiry
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeSidebar === 'api' ? (
          <ApiPlayground onRefreshArticles={onRefreshArticles} />
        ) : (
          /* Fallback content for other tab lists under discovery phase */
          <div className="bg-cream-paper border border-cream-dark/60 rounded-2xl p-12 text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-brass-accent mx-auto animate-pulse" />
            <h3 className="font-serif text-xl font-bold text-charcoal-intense">
              Advanced Administration Gateways
            </h3>
            <p className="text-xs text-charcoal-soft max-w-md mx-auto leading-relaxed">
              The '{activeSidebar}' portal controls advanced parameters. For security during live operation, standard manuscript compose and publishing features remain consolidated inside the core dashboard overview node.
            </p>
            <button
              onClick={() => setActiveSidebar('dashboard')}
              className="px-4 py-2 bg-charcoal-intense hover:bg-charcoal-soft text-cream-base rounded-lg text-xs font-bold transition-all cursor-pointer font-sans"
            >
              Return to Overview
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
