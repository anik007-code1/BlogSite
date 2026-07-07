import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BlogHome } from './components/BlogHome';
import { BlogPost } from './components/BlogPost';
import { AdminDashboard } from './components/AdminDashboard';
import { PostEditor } from './components/PostEditor';
import { AdminLogin } from './components/AdminLogin';
import { InfoPages } from './components/InfoPages';
import { Article } from './types';

export default function App() {
  const [view, setView] = useState<'home' | 'post' | 'dashboard' | 'editor' | 'login' | 'about' | 'privacy' | 'terms' | 'contact'>('home');
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string>('');
  const [editingArticleId, setEditingArticleId] = useState<string | undefined>(undefined);
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const script = document.getElementById('preloaded-articles');
      if (script && script.textContent) {
        return JSON.parse(script.textContent);
      }
    } catch (e) {
      console.warn("Failed to parse preloaded articles", e);
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    try {
      const script = document.getElementById('preloaded-articles');
      if (script && script.textContent) {
        return false;
      }
    } catch (e) {}
    return true;
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vellum_admin_token') === 'vellum_vector_admin_token_2026';
  });

  // A helper function to sync the URL with pushState without full reload
  const syncUrl = (
    targetView: 'home' | 'post' | 'dashboard' | 'editor' | 'login' | 'about' | 'privacy' | 'terms' | 'contact',
    slug: string = ''
  ) => {
    let targetPath = '/';
    if (targetView === 'post' && slug) {
      targetPath = `/post/${slug}`;
    } else if (targetView !== 'home') {
      targetPath = `/${targetView}`;
    }
    
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view: targetView, slug }, '', targetPath);
    }
  };

  // Helper to parse path into state
  const parsePath = () => {
    let pathname = window.location.pathname;
    // Normalize trailing slash (excluding root '/')
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    const postMatch = pathname.match(/^\/post\/([^/]+)/);
    
    if (postMatch) {
      const slug = postMatch[1];
      setSelectedArticleSlug(slug);
      setView('post');
    } else if (pathname === '/about') {
      setView('about');
      setSelectedArticleSlug('');
    } else if (pathname === '/privacy') {
      setView('privacy');
      setSelectedArticleSlug('');
    } else if (pathname === '/terms') {
      setView('terms');
      setSelectedArticleSlug('');
    } else if (pathname === '/contact') {
      setView('contact');
      setSelectedArticleSlug('');
    } else if (pathname === '/login' || pathname === '/admin') {
      if (localStorage.getItem('vellum_admin_token') === 'vellum_vector_admin_token_2026') {
        setView('dashboard');
      } else {
        setView('login');
      }
      setSelectedArticleSlug('');
    } else if (pathname === '/dashboard') {
      if (localStorage.getItem('vellum_admin_token') === 'vellum_vector_admin_token_2026') {
        setView('dashboard');
      } else {
        setView('login');
      }
      setSelectedArticleSlug('');
    } else {
      setView('home');
      setSelectedArticleSlug('');
    }
  };

  useEffect(() => {
    parsePath();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      parsePath();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Fetch all articles dynamically from Express Full-Stack Server
  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/articles');
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      } else {
        console.error("Server responded with error status:", response.status);
      }
    } catch (err) {
      console.error("Failed to fetch articles from Express full-stack API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const preloaded = document.getElementById('preloaded-articles');
    let hasPreloadedData = false;
    if (preloaded && preloaded.textContent) {
      try {
        const parsed = JSON.parse(preloaded.textContent);
        if (Array.isArray(parsed) && parsed.length > 0) {
          hasPreloadedData = true;
        }
      } catch (e) {}
    }

    if (!hasPreloadedData) {
      fetchArticles();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Record real page views dynamically to SQLite as visitors read posts/explore pathways
  useEffect(() => {
    const trackVisitorEvent = async () => {
      try {
        let sessionId = localStorage.getItem('vellum_visitor_session');
        if (!sessionId) {
          sessionId = 'sess_' + Math.random().toString(36).substring(2, 11);
          localStorage.setItem('vellum_visitor_session', sessionId);
        }
        await fetch('/api/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: selectedArticleSlug ? `/post/${selectedArticleSlug}` : `/${view}`,
            sessionId: sessionId
          })
        });
      } catch (err) {
        console.warn("Analytics tracker warning:", err);
      }
    };
    if (view !== 'dashboard' && view !== 'editor' && view !== 'login') {
      trackVisitorEvent();
    }
  }, [view, selectedArticleSlug]);

  // Synchronize document.title and canonical link dynamically for frontend SEO
  useEffect(() => {
    let title = 'LLM Review Pro | Expert In-depth LLM Evaluations & Analysis';
    
    if (view === 'about') {
      title = 'About Us | LLM Review Pro';
    } else if (view === 'privacy') {
      title = 'Privacy Policy | LLM Review Pro';
    } else if (view === 'terms') {
      title = 'Terms of Service | LLM Review Pro';
    } else if (view === 'contact') {
      title = 'Contact Us | LLM Review Pro';
    } else if (view === 'login') {
      title = 'Admin Login | LLM Review Pro';
    } else if (view === 'dashboard') {
      title = 'Admin Dashboard | LLM Review Pro';
    } else if (view === 'editor') {
      title = 'Composer Workbench | LLM Review Pro';
    } else if (view === 'post' && selectedArticleSlug) {
      const art = articles.find(a => a.slug === selectedArticleSlug);
      if (art) {
        title = art.seoTitle || art.title || title;
      }
    }
    
    document.title = title;

    // Manage dynamic canonical link
    let canonicalUrl = 'https://llmreviewpro.com' + window.location.pathname;
    // Clean trailing slash
    if (canonicalUrl.endsWith('/') && canonicalUrl !== 'https://llmreviewpro.com/') {
      canonicalUrl = canonicalUrl.slice(0, -1);
    }
    
    let link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);
  }, [view, selectedArticleSlug, articles]);

  // Save new or updated article from the composer workbench
  const handleSaveArticle = async (articleData: Partial<Article>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('vellum_admin_token') || '';
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(articleData),
      });

      if (response.ok) {
        // Reload list
        await fetchArticles();
        // Go back to dashboard!
        setView('dashboard');
        syncUrl('dashboard');
        setEditingArticleId(undefined);
      } else {
        alert("Server failed to save manuscript. Please check authentication and input parameters.");
      }
    } catch (err) {
      console.error("Failed to post manuscript details", err);
      alert("Network connectivity issue. Failed to sync manuscript to core server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Switch between routes smoothly
  const handleNavigate = (targetView: 'home' | 'post' | 'dashboard' | 'editor' | 'login' | 'about' | 'privacy' | 'terms' | 'contact') => {
    let resolvedView = targetView;
    if ((targetView === 'dashboard' || targetView === 'editor') && !isAdminAuthenticated) {
      resolvedView = 'login';
    }
    setView(resolvedView);
    if (resolvedView !== 'post') {
      setSelectedArticleSlug('');
    }
    if (resolvedView !== 'editor') {
      setEditingArticleId(undefined);
    }
    syncUrl(resolvedView, resolvedView === 'post' ? selectedArticleSlug : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (slug: string) => {
    setSelectedArticleSlug(slug);
    setView('post');
    syncUrl('post', slug);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleNavigateToEditor = (articleId?: string) => {
    if (!isAdminAuthenticated) {
      setView('login');
      syncUrl('login');
      return;
    }
    setEditingArticleId(articleId);
    setView('editor');
    syncUrl('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (token: string, email: string) => {
    localStorage.setItem('vellum_admin_token', token);
    localStorage.setItem('vellum_admin_email', email);
    setIsAdminAuthenticated(true);
    setView('dashboard');
    syncUrl('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('vellum_admin_token');
    localStorage.removeItem('vellum_admin_email');
    setIsAdminAuthenticated(false);
    setView('home');
    syncUrl('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-gray-900 selection:bg-neutral-200">
      
      {/* Dynamic Header */}
      <Header 
        currentView={view} 
        onNavigate={handleNavigate} 
        selectedArticleSlug={selectedArticleSlug}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogout={handleLogout}
      />

      {/* Main content body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {view === 'home' && (
          <BlogHome 
            articles={articles} 
            onSelectArticle={handleSelectArticle}
            isLoading={isLoading}
          />
        )}

        {view === 'post' && (
          <BlogPost 
            articleSlug={selectedArticleSlug} 
            onBack={() => handleNavigate('home')}
            onNavigateToPost={handleSelectArticle}
            allArticles={articles}
          />
        )}

        {view === 'login' && (
          <AdminLogin 
            onLoginSuccess={handleLoginSuccess}
            onBack={() => handleNavigate('home')}
          />
        )}

        {view === 'dashboard' && isAdminAuthenticated && (
          <AdminDashboard 
            articles={articles}
            onNavigateToEditor={handleNavigateToEditor}
            onRefreshArticles={fetchArticles}
          />
        )}

        {view === 'editor' && isAdminAuthenticated && (
          <PostEditor 
            articleId={editingArticleId}
            allArticles={articles}
            onBack={() => handleNavigate('dashboard')}
            onSave={handleSaveArticle}
            isLoading={isLoading}
          />
        )}

        {(view === 'about' || view === 'privacy' || view === 'terms' || view === 'contact') && (
          <InfoPages 
            pageType={view} 
            onNavigate={handleNavigate} 
          />
        )}
      </main>

      {/* Dynamic Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}
