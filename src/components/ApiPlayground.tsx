import React, { useState } from 'react';
import { 
  Terminal, Code, Copy, Check, Play, FileText, 
  RefreshCw, Info, AlertOctagon, ExternalLink, HelpCircle
} from 'lucide-react';
import { Article } from '../types';

interface ApiPlaygroundProps {
  onRefreshArticles: () => void;
}

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({ onRefreshArticles }) => {
  const [activeTab, setActiveTab] = useState<'playground' | 'curl' | 'python' | 'node'>('playground');
  
  // Playground Form States
  const [title, setTitle] = useState('Expert Evaluation: benchmark GPT-4.5 vs Claude 3.5 Sonnet');
  const [content, setContent] = useState('## Introduction\n\nBenchmarking the next generation model structures on strict programming routines in Python and Rust.\n\n### Findings\n- **Inference Speed**: GPT-4.5 leads by 12% on raw token output.\n- **Depth of Reasoning**: Claude 3.5 Sonnet exhibits higher logical consistency on complex edge cases.\n- **Precision**: Both scores above 92% on compiler verification.');
  const [category, setCategory] = useState('AI');
  const [summary, setSummary] = useState('An in-depth logical assessment and coding benchmark comparison between GPT-4.5 and Claude 3.5 Sonnet.');
  const [tags, setTags] = useState('LLM, Comparison, Benchmark, Claude, GPT');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [author, setAuthor] = useState('Anik Reviewer');
  
  // Auth Token Playground
  const [token, setToken] = useState('SAJDHFGJLDFghSDKFGSDKJHJGHLKJGHJHJHGLKSDJKHGFSDJKHfg');
  
  // Execution & Monitor States
  const [isRunning, setIsRunning] = useState(false);
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<'token' | 'curl' | 'python' | 'node' | null>(null);

  const REQUIRED_TOKEN = 'SAJDHFGJLDFghSDKFGSDKJHJGHLKJGHJHJHGLKSDJKHGFSDJKHfg';
  const apiEndpointUrl = `${window.location.protocol}//${window.location.host}/api/content/upload`;

  const triggerCopy = (text: string, type: 'token' | 'curl' | 'python' | 'node') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSimulateUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);
    setApiResponse(null);
    setResponseStatus(null);

    const payload: any = {
      title,
      content,
      category,
      summary,
      author,
      token, // Can be sent in body or headers
      status,
      isFeatured,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      // Simulate real fetch to the new endpoint
      const response = await fetch('/api/content/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Upload-Token': token, // also pass in headers for redundancy check
        },
        body: JSON.stringify(payload),
      });

      setResponseStatus(response.status);
      const data = await response.json();
      setApiResponse(data);
      
      if (response.ok) {
        onRefreshArticles(); // Refresh parent lists
      }
    } catch (err: any) {
      setResponseStatus(500);
      setApiResponse({
        success: false,
        error: 'Network connect block. Make sure server backend is fully operational.',
        detail: err.message || err,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const curlCode = `curl -X POST "${apiEndpointUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-Upload-Token: ${REQUIRED_TOKEN}" \\
  -d '{
    "title": "Deep Dive into LLM Context Windows",
    "content": "Exploring the mathematical limitations of attention mechanisms over 200k tokens...",
    "category": "AI",
    "summary": "Everything you need to know about context window architectures.",
    "tags": ["AI", "Architecture", "Benchmarking"],
    "status": "Published"
  }'`;

  const pythonCode = `import requests

url = "${apiEndpointUrl}"
headers = {
    "X-Upload-Token": "${REQUIRED_TOKEN}",
    "Content-Type": "application/json"
}

payload = {
    "title": "Automated Content Strategy for Neural Architectures",
    "content": "## Core Analysis\\nApplying reinforcement learning structures directly on writing formats...",
    "category": "AI",
    "summary": "Deep dive study on automated AI publishing algorithms.",
    "tags": ["AI", "Automation", "RLHF"],
    "status": "Published",
    "author": "Anik Pipeline"
}

response = requests.post(url, headers=headers, json=payload)

if response.status_code in [200, 201]:
    print("Article Uploaded!", response.json()["articleUrl"])
else:
    print("Failed Code:", response.status_code)
    print("Response detail:", response.json())`;

  const nodeCode = `const url = "${apiEndpointUrl}";

const payload = {
  title: "Next-gen Reasoning Pipelines in Developer Workspaces",
  content: "### Systematic Orchestration\\n\\nAnalyzing structural patterns inside agent pipelines...",
  category: "Programming",
  summary: "A blueprint for developing context-aware tooling systems.",
  tags: ["AI", "DeveloperTools", "NodeJS"],
  status: "Draft"
};

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Upload-Token": "${REQUIRED_TOKEN}"
  },
  body: JSON.stringify(payload)
})
.then(res => res.json().then(data => ({ status: res.status, data })))
.then(({ status, data }) => {
  if (status === 200 || status === 201) {
    console.log("Success! Post URL:", data.articleUrl);
  } else {
    console.error("Upload error:", data.error);
  }
})
.catch(err => console.error("Network Error:", err));`;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-cream-paper border border-[#e1dfd6] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-charcoal-intense flex items-center gap-2">
              <Terminal className="w-5 h-5 text-brass-accent" />
              <span>Automated Creator API</span>
            </h3>
            <p className="text-xs text-[#7c7a72] font-sans max-w-xl">
              Publish reviews, benchmark drafts, or structured critiques into <strong className="text-charcoal-soft">LLM Review Pro</strong> programmatically. Use this workspace to copy integrations or test API payloads in real-time.
            </p>
          </div>
          
          <div className="bg-white border border-[#e1dfd6] rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 shadow-sm">
            <div className="font-mono text-[11px]">
              <span className="text-[#7c7a72] block text-[9px] uppercase font-bold tracking-wider">Access Token</span>
              <span className="text-charcoal-intense font-semibold font-mono block max-w-xs truncate">
                {REQUIRED_TOKEN}
              </span>
            </div>
            <button
              onClick={() => triggerCopy(REQUIRED_TOKEN, 'token')}
              className="p-2 hover:bg-cream-dark/50 text-brass-accent rounded-lg transition-colors border border-transparent hover:border-cream-dark cursor-pointer"
              title="Copy Token"
              id="copy-token-badge-btn"
            >
              {copiedText === 'token' ? <Check className="w-4 h-4 text-emerald-600 animate-bounce" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e1dfd6] font-sans text-xs font-bold uppercase tracking-wider text-[#7c7a72]">
        <button
          onClick={() => setActiveTab('playground')}
          className={`px-4 py-2.5 border-b-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'playground' 
              ? 'border-charcoal-intense text-charcoal-intense' 
              : 'border-transparent hover:text-charcoal-soft'
          }`}
          id="api-tab-playground"
        >
          API Live Simulator
        </button>
        <button
          onClick={() => setActiveTab('curl')}
          className={`px-4 py-2.5 border-b-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'curl' 
              ? 'border-charcoal-intense text-charcoal-intense' 
              : 'border-transparent hover:text-charcoal-soft'
          }`}
          id="api-tab-curl"
        >
          cURL / Linux Command
        </button>
        <button
          onClick={() => setActiveTab('python')}
          className={`px-4 py-2.5 border-b-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'python' 
              ? 'border-charcoal-intense text-charcoal-intense' 
              : 'border-transparent hover:text-charcoal-soft'
          }`}
          id="api-tab-python"
        >
          Python requests
        </button>
        <button
          onClick={() => setActiveTab('node')}
          className={`px-4 py-2.5 border-b-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'node' 
              ? 'border-charcoal-intense text-charcoal-intense' 
              : 'border-transparent hover:text-charcoal-soft'
          }`}
          id="api-tab-node"
        >
          Node.js / JS
        </button>
      </div>

      {/* Active Tab Panels */}
      {activeTab === 'playground' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {/* Simulator Form panel */}
          <form onSubmit={handleSimulateUpload} className="bg-cream-paper border border-[#e1dfd6] rounded-2xl p-6 space-y-4 shadow-sm" id="api-simulator-form">
            <h4 className="font-serif text-base font-bold text-charcoal-intense border-b border-[#e1dfd6]/60 pb-2">
              POST /api/content/upload
            </h4>

            {/* Secret token */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72] block">
                Authorization Token input (Editable for Testing)
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full text-xs font-mono p-2.5 border border-[#e1dfd6] rounded-lg bg-white text-charcoal-intense focus:border-brass-accent focus:ring-1 focus:ring-brass-accent outline-hidden"
                id="simulator-token-input"
              />
              <p className="text-[9px] text-[#7c7a72] italic font-sans">
                Set to incorrect content to verify the server’s lock validation logic.
              </p>
            </div>

            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72] block">
                  Article Title (Required)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-sans p-2.5 border border-[#e1dfd6] rounded-lg bg-white text-charcoal-intense focus:border-brass-accent focus:ring-1 focus:ring-brass-accent outline-hidden"
                  id="simulator-title-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72] block">
                  Section / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-sans p-2.5 border border-[#e1dfd6] rounded-lg bg-white text-charcoal-intense focus:border-brass-accent focus:ring-1 focus:ring-brass-accent outline-hidden"
                  id="simulator-category-select"
                >
                  <option value="AI">AI</option>
                  <option value="Tech">Tech</option>
                  <option value="Programming">Programming</option>
                </select>
              </div>
            </div>

            {/* Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72] block">
                  Author Persona Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full text-xs font-sans p-2.5 border border-[#e1dfd6] rounded-lg bg-white text-charcoal-intense focus:border-brass-accent focus:ring-1 focus:ring-brass-accent outline-hidden"
                  id="simulator-author-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72] block">
                  Seeding Status
                </label>
                <div className="flex gap-4 pt-1.5 font-sans text-xs">
                  <label className="flex items-center gap-1.5 font-semibold text-charcoal-soft">
                    <input
                      type="radio"
                      checked={status === 'Published'}
                      onChange={() => setStatus('Published')}
                      className="accent-[#9a8466]"
                    />
                    Published
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-charcoal-soft">
                    <input
                      type="radio"
                      checked={status === 'Draft'}
                      onChange={() => setStatus('Draft')}
                      className="accent-[#9a8466]"
                    />
                    Draft
                  </label>
                </div>
              </div>
            </div>

            {/* Excerpt Summary */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72] block">
                Short Excerpt Summary (Optional)
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full text-xs font-sans p-2.5 border border-[#e1dfd6] rounded-lg bg-white text-charcoal-intense focus:border-brass-accent focus:ring-1 focus:ring-brass-accent outline-hidden resize-none"
                placeholder="Let backend auto-summarize content from the body if empty."
                id="simulator-summary-input"
              />
            </div>

            {/* Content Body */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72] block">
                Markdown / HTML Content Body (Required)
              </label>
              <textarea
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-xs font-mono p-2.5 border border-[#e1dfd6] rounded-lg bg-white text-charcoal-intense focus:border-brass-accent focus:ring-1 focus:ring-brass-accent outline-hidden"
                id="simulator-content-input"
              />
            </div>

            {/* Tag metadata & featured */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#7c7a72] block">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full text-xs font-sans p-2.5 border border-[#e1dfd6] rounded-lg bg-white text-charcoal-intense focus:border-brass-accent focus:ring-1 focus:ring-brass-accent outline-hidden"
                  id="simulator-tags-input"
                />
              </div>

              <div className="pt-4 flex items-center">
                <label className="flex items-center gap-2 cursor-pointer font-sans text-xs font-bold text-charcoal-intense uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4.5 h-4.5 rounded-sm border-[#e1dfd6] text-brass-accent focus:ring-0 accent-[#9a8466]"
                  />
                  <span>Mark as Homepage Featured</span>
                </label>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isRunning}
              className="w-full py-3 bg-charcoal-intense hover:bg-charcoal-soft text-cream-base rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              id="simulate-api-submit-btn"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-brass-light" />
                  <span>Transmitting Payload...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-brass-light" />
                  <span>Simulate API Core Post</span>
                </>
              )}
            </button>
          </form>

          {/* Response Console panel */}
          <div className="space-y-4">
            <div className="bg-charcoal-intense text-[#ededed] border border-charcoal-soft rounded-2xl p-5 shadow-lg flex flex-col justify-between h-[510px]">
              <div>
                <div className="flex items-center justify-between border-b border-charcoal-soft pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#7c7a72] font-mono ml-2">
                      Localhost Trace Console
                    </span>
                  </div>
                  {responseStatus && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold font-mono ${
                      responseStatus >= 200 && responseStatus < 300 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      STATUS {responseStatus}
                    </span>
                  )}
                </div>

                <div className="font-mono text-xs overflow-y-auto max-h-[400px] space-y-3 pr-2 scrollbar-style">
                  {!apiResponse && !isRunning && (
                    <p className="text-[#7c7a72] italic leading-relaxed text-center py-24">
                      Console idle. Click "Simulate API Core Post" on the simulator workbench to send a real payload and view structural responses.
                    </p>
                  )}

                  {isRunning && (
                    <div className="flex flex-col items-center justify-center py-20 text-[#c2b49e] font-sans gap-3">
                      <RefreshCw className="w-8 h-8 animate-spin" />
                      <p className="text-[11px] font-mono tracking-wider animate-pulse uppercase">
                        STREAMS CONNECTED... PIPING SQL INSERT...
                      </p>
                    </div>
                  )}

                  {apiResponse && (
                    <div className="space-y-3">
                      <p className="text-brass-light text-[10px] font-bold border-b border-charcoal-soft/50 pb-1 flex items-center gap-1.5 select-none uppercase">
                        <Info className="w-3.5 h-3.5" />
                        <span>JSON Response Frame</span>
                      </p>
                      <pre className="text-emerald-400 overflow-x-auto text-[11px] leading-relaxed p-3 bg-[#0d0d0d] rounded-lg border border-charcoal-soft">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Action output for successful simulation */}
              {apiResponse && apiResponse.success && (
                <div className="bg-emerald-950/20 border border-emerald-800 rounded-xl p-4 flex items-center justify-between gap-4 font-sans select-none animate-fade-in animate-duration-300">
                  <div className="space-y-1">
                    <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">Simulation Perfect</span>
                    <p className="text-xs text-cream-base/80">
                      The article has been successfully inserted into the SQLite database.
                    </p>
                  </div>
                  <a
                    href={`/post/${apiResponse.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-md hover:scale-102 active:scale-98"
                    id="simulator-view-live-btn"
                  >
                    <span>View Post</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Action output for error simulation */}
              {apiResponse && !apiResponse.success && (
                <div className="bg-red-950/20 border border-red-800 rounded-xl p-4 flex items-center justify-between gap-4 font-sans select-none">
                  <div className="space-y-1">
                    <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-widest block flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Unauthorized / Bad Token</span>
                    </span>
                    <p className="text-xs text-cream-base/80">
                      Authentication validation block active. Check token content matches accurately.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToken(REQUIRED_TOKEN)}
                    className="px-3.5 py-2 bg-red-650 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    id="simulator-auto-fix-token"
                  >
                    <span>Fix Key</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'curl' ? (
        <div className="space-y-4">
          <div className="bg-cream-paper border border-[#e1dfd6] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#e1dfd6]/60">
              <h4 className="font-serif text-sm font-bold text-charcoal-intense flex items-center gap-2">
                <Code className="w-4 h-4 text-brass-accent" />
                <span>Publishing via cURL</span>
              </h4>
              <button
                onClick={() => triggerCopy(curlCode, 'curl')}
                className="flex items-center gap-1 cursor-pointer hover:bg-cream-dark text-xs text-brass-accent font-sans border border-[#e1dfd6] px-2.5 py-1 rounded-lg bg-white"
                id="btn-copy-curl-code"
              >
                {copiedText === 'curl' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snip</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-charcoal-soft font-sans leading-relaxed">
              cURL is a command-line tool standard on Unix, Linux, and macOS platforms. You can execute this request in any terminal pipeline or bash schedule.
            </p>
            <pre className="text-xs font-mono bg-white border border-[#e1dfd6] rounded-xl p-4 overflow-x-auto text-charcoal-soft shadow-inner">
              {curlCode}
            </pre>
          </div>
        </div>
      ) : activeTab === 'python' ? (
        <div className="space-y-4">
          <div className="bg-cream-paper border border-[#e1dfd6] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#e1dfd6]/60">
              <h4 className="font-serif text-sm font-bold text-charcoal-intense flex items-center gap-2">
                <Code className="w-4 h-4 text-brass-accent" />
                <span>Publishing with Python requests</span>
              </h4>
              <button
                onClick={() => triggerCopy(pythonCode, 'python')}
                className="flex items-center gap-1 cursor-pointer hover:bg-cream-dark text-xs text-brass-accent font-sans border border-[#e1dfd6] px-2.5 py-1 rounded-lg bg-white"
                id="btn-copy-python-code"
              >
                {copiedText === 'python' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snip</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-charcoal-soft font-sans leading-relaxed">
              Ensure you have the <code>requests</code> module installed (<code>pip install requests</code>). This pattern is incredibly useful for scrapping workflows, scientific metrics pipeline conversions, or AI feedback uploads.
            </p>
            <pre className="text-xs font-mono bg-white border border-[#e1dfd6] rounded-xl p-4 overflow-x-auto text-charcoal-soft shadow-inner leading-relaxed">
              {pythonCode}
            </pre>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-cream-paper border border-[#e1dfd6] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#e1dfd6]/60">
              <h4 className="font-serif text-sm font-bold text-charcoal-intense flex items-center gap-2">
                <Code className="w-4 h-4 text-brass-accent" />
                <span>NodeJS / Fetch Client</span>
              </h4>
              <button
                onClick={() => triggerCopy(nodeCode, 'node')}
                className="flex items-center gap-1 cursor-pointer hover:bg-cream-dark text-xs text-brass-accent font-sans border border-[#e1dfd6] px-2.5 py-1 rounded-lg bg-white"
                id="btn-copy-node-code"
              >
                {copiedText === 'node' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snip</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-charcoal-soft font-sans leading-relaxed">
              Standard native JavaScript <code>fetch</code> API structure. Executes beautifully inside other JS scripts, Node scripts, or frontend components on remote portals.
            </p>
            <pre className="text-xs font-mono bg-white border border-[#e1dfd6] rounded-xl p-4 overflow-x-auto text-[#2e2e2e] shadow-inner leading-relaxed">
              {nodeCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
