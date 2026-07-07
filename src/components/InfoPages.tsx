import React, { useState } from 'react';
import { Mail, Shield, BookOpen, AlertCircle, Send, CheckCircle2, DollarSign } from 'lucide-react';

interface InfoPagesProps {
  pageType: 'about' | 'privacy' | 'terms' | 'contact';
  onNavigate: (view: 'home' | 'post' | 'dashboard' | 'editor' | 'login' | 'about' | 'privacy' | 'terms' | 'contact') => void;
}

export const InfoPages: React.FC<InfoPagesProps> = ({ pageType, onNavigate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;

    setFormStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setFormStatus('error');
      }
    } catch (err) {
      console.error("Support submission failed:", err);
      setFormStatus('error');
    }
  };

  // Google Ad Unit Mockup
  const GoogleAdUnit: React.FC<{ format: 'banner' | 'sidebar' | 'inline' }> = ({ format }) => {
    return (
      <div className={`my-8 mx-auto w-full border border-dashed border-cream-dark/80 bg-cream-paper/40 rounded-xl p-4 transition-all hover:bg-cream-paper/70 font-sans text-center max-w-4xl select-none`}>
        <div className="flex items-center justify-between border-b border-cream-dark/40 pb-2 mb-3">
          <span className="text-[9px] font-mono tracking-widest text-[#9a9994] uppercase font-bold">
            Google AdSense • Placeholder Zone
          </span>
          <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-brass-accent bg-cream-dark/20 px-1.5 py-0.5 rounded uppercase font-sans">
            <DollarSign className="w-2.5 h-2.5" />
            Ad Unit
          </span>
        </div>
        
        {format === 'banner' && (
          <div className="py-6 flex flex-col items-center justify-center min-h-[90px]">
            <p className="text-xs font-serif font-bold text-charcoal-soft">Responsive Header/Nav Banner (728x90 / Auto)</p>
            <p className="text-[10px] font-mono mt-1 text-[#929087]">Code: &lt;ins class="adsbygoogle" style="display:block" data-ad-format="auto"&gt;&lt;/ins&gt;</p>
          </div>
        )}

        {format === 'sidebar' && (
          <div className="py-8 flex flex-col items-center justify-center min-h-[250px]">
            <p className="text-xs font-serif font-bold text-charcoal-soft">Sidebar Billboard (300x250 / 300x600)</p>
            <p className="text-[10px] font-mono mt-1 text-[#929087]">Code: &lt;ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px"&gt;&lt;/ins&gt;</p>
          </div>
        )}

        {format === 'inline' && (
          <div className="py-5 flex flex-col items-center justify-center min-h-[120px]">
            <p className="text-xs font-serif font-bold text-charcoal-soft">In-Article Native Container (Matching Fonts)</p>
            <p className="text-[10px] font-mono mt-1 text-[#929087]">Code: &lt;ins class="adsbygoogle" data-ad-layout="in-article"&gt;&lt;/ins&gt;</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN: Main Informational content */}
      <div className="lg:col-span-8 bg-white border border-cream-dark/60 rounded-2xl p-8 sm:p-12 space-y-8 shadow-sm">
        
        {/* About Us */}
        {pageType === 'about' && (
          <article className="space-y-6">
            <header className="border-b border-cream-dark/40 pb-6 mb-8">
              <span className="font-mono text-[10px] font-extrabold tracking-widest text-brass-accent uppercase">
                Established 2026
              </span>
              <h1 className="font-serif text-4xl font-extrabold text-charcoal-intense mt-2">
                About LLM Review Pro
              </h1>
              <p className="text-sm text-charcoal-soft mt-1 font-sans">
                A modern sandbox for thoughtful LLM critiques, AI assessments, and minimal styling.
              </p>
            </header>

            <section className="space-y-6 text-charcoal-soft leading-relaxed text-sm">
              <p className="font-serif italic text-base text-charcoal-intense">
                "We believe interfaces are written conversations. When reading high-fidelity explanations about hardware, algorithms, or traveling, your attention deserves protection from noisy layouts."
              </p>
              <p>
                <strong>LLM Review Pro</strong> has emerged as a dedicated editorial publication focusing on advanced technology, modern programming paradigms, artificial intelligence breakthroughs, and deep-focus sabbaticals. Our team of experienced developers, architects, and essayists aim to deliver clear, precise, and structurally elegant narratives.
              </p>
              <p>
                Unlike generic news aggregators, we invest heavily in custom design and custom code rendering. Our platform does not employ distracting overlays, click-bait formatting, or low-quality summaries. Every single artifact is crafted to provide native value to builders and creative minds globally.
              </p>
              <h3 className="font-serif text-xl font-bold text-charcoal-intense pt-4">Our Core Paradigms</h3>
              <ul className="list-disc pl-5 space-y-3 font-sans text-xs">
                <li>
                  <strong className="text-charcoal-intense">Tactile Digitalism:</strong> Composing interfaces that recall the focus and satisfaction of traditional stationary and fine press booklets.
                </li>
                <li>
                  <strong className="text-charcoal-intense">Technical Simplicity:</strong> Demonstrating algorithmic logic and complex architectures with clean, compilable, and highly readable code snippets.
                </li>
                <li>
                  <strong className="text-charcoal-intense">Ethical Monetization:</strong> Preserving total editorial freedom through carefully selected, context-aware Google AdSense units that respect reader visual focus.
                </li>
              </ul>
            </section>
          </article>
        )}

        {/* Privacy Policy */}
        {pageType === 'privacy' && (
          <article className="space-y-6">
            <header className="border-b border-cream-dark/40 pb-6 mb-8">
              <span className="font-mono text-[10px] font-extrabold tracking-widest text-brass-accent uppercase">
                AdSense Compliant • Cookie Disclosures
              </span>
              <h1 className="font-serif text-4xl font-extrabold text-charcoal-intense mt-2">
                Privacy Policy & Cookie Statement
              </h1>
              <p className="text-sm text-charcoal-soft mt-1 font-sans">
                Last modified: June 7, 2026. Complete disclosures regarding third-party advertisers and user safeguards.
              </p>
            </header>

            <section className="space-y-6 text-charcoal-soft leading-relaxed text-sm">
              <p>
                At LLM Review Pro, accessible from our public web portal, the privacy of our visitors is one of our primary priorities. This Privacy Policy document contains types of information that is collected and recorded by our platform and how we use it securely.
              </p>

              <h3 className="font-serif text-xl font-bold text-charcoal-intense pt-2">1. Log Files & Metadata</h3>
              <p>
                LLM Review Pro follows a standard procedure of using server log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and optionally the number of clicks. These are not linked to any personally identifiable information.
              </p>

              <h3 className="font-serif text-xl font-bold text-charcoal-intense pt-2">2. Google DoubleClick DART Cookies & AdSense</h3>
              <p>
                Google is one of the third-party vendors on our site. It uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our platform and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-brass-accent underline">https://policies.google.com/technologies/ads</a>.
              </p>

              <h3 className="font-serif text-xl font-bold text-charcoal-intense pt-2">3. Advertising Partners Privacy Policies</h3>
              <p>
                Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on LLM Review Pro, which are sent directly to users' browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
              </p>
              <p className="italic text-xs bg-cream-base/10 border-l-2 border-brass-accent p-3">
                Note that LLM Review Pro has no access to or control over these cookies used by third-party advertisers. We strictly encourage reading the respective Privacy Policies of these third-party ad servers for more detailed information.
              </p>

              <h3 className="font-serif text-xl font-bold text-charcoal-intense pt-2">4. User Rights (GDPR & CCPA Compliant)</h3>
              <p>
                We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs font-sans">
                <li><strong>The right to access:</strong> You have the right to request copies of your diagnostic or newsletter email entries.</li>
                <li><strong>The right to rectification:</strong> You have the right to request that we correct any inaccurate registration records.</li>
                <li><strong>The right to erasure:</strong> You have the right to request that we erase your newsletter email trace in our subscribers database.</li>
              </ul>
            </section>
          </article>
        )}

        {/* Terms of Service */}
        {pageType === 'terms' && (
          <article className="space-y-6">
            <header className="border-b border-cream-dark/40 pb-6 mb-8">
              <span className="font-mono text-[10px] font-extrabold tracking-widest text-[#7c7a72] uppercase">
                Content Usage Rights • Licenses
              </span>
              <h1 className="font-serif text-4xl font-extrabold text-charcoal-intense mt-2">
                Terms of Service & Rules
              </h1>
              <p className="text-sm text-charcoal-soft mt-1 font-sans">
                Effective date: June 7, 2026. Understanding your agreements when accessing public written materials.
              </p>
            </header>

            <section className="space-y-6 text-charcoal-soft leading-relaxed text-sm">
              <p>
                By accessing this platform, we assume you accept these terms of service in full. Do not continue to use LLM Review Pro if you do not agree to take all of the rules and conditions stated on this page.
              </p>

              <h3 className="font-serif text-xl font-bold text-charcoal-intense pt-2">1. Intellectual Property License</h3>
              <p>
                Unless otherwise stated, LLM Review Pro and/or its licensors own the intellectual property rights for all material published under our domains. All intellectual property rights are reserved. You may view and print pages for your own personal use subject to restrictions set in these terms of service.
              </p>
              <p>You must not: </p>
              <ul className="list-disc pl-5 space-y-2 text-xs font-sans">
                <li>Republish technical prose or visual illustrations from LLM Review Pro without precise citation.</li>
                <li>Sell, rent, or sub-license technical content published with our copyright indicators.</li>
                <li>Reproduce, duplicate, or copy code scripts without attribution to the active authors.</li>
              </ul>

              <h3 className="font-serif text-xl font-bold text-charcoal-intense pt-2">2. User Comments & Contributions</h3>
              <p>
                Certain parts of this platform may offer opportunities for authorized authors to publish manuscripts or comments. LLM Review Pro does not filter, edit, or publish comments prior to their presence on the website. Comments do not reflect the views and opinions of LLM Review Pro, its agents or affiliates. Comments reflect the view and opinion of the person who posts their thoughts.
              </p>
            </section>
          </article>
        )}

        {/* Contact Us */}
        {pageType === 'contact' && (
          <article className="space-y-6">
            <header className="border-b border-cream-dark/40 pb-6 mb-8">
              <span className="font-mono text-[10px] font-extrabold tracking-widest text-brass-accent uppercase">
                Direct Communication Portal
              </span>
              <h1 className="font-serif text-4xl font-extrabold text-charcoal-intense mt-2">
                Contact Our Editorial Team
              </h1>
              <p className="text-sm text-charcoal-soft mt-1 font-sans">
                Reach out regarding technical article revisions, collaboration proposals, or ad placement queries.
              </p>
            </header>

            {formStatus === 'success' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center space-y-3 font-sans">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="font-serif text-lg font-bold text-emerald-800">Manuscript Request Sent Successfully</h3>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Your comments have been securely logged in our platform queue. A system administrator will review your proposal at <strong>anik.jobdesk@gmail.com</strong>.
                </p>
                <button
                  onClick={() => setFormStatus('idle')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer mt-2"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#7c7a72] tracking-wider">Your Full Name</label>
                    <input
                      type="text"
                      className="w-full bg-cream-paper/40 border border-cream-dark/80 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-brass-accent transition-all text-charcoal-intense"
                      placeholder="Anik Dev"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#7c7a72] tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-cream-paper/40 border border-cream-dark/80 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-brass-accent transition-all text-charcoal-intense"
                      placeholder="anik.jobdesk@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#7c7a72] tracking-wider">Inquiry Subject</label>
                  <input
                    type="text"
                    className="w-full bg-cream-paper/40 border border-cream-dark/80 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-brass-accent transition-all text-charcoal-intense"
                    placeholder="AdSense Collaboration proposal"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-[#7c7a72] tracking-wider">Your Message *</label>
                  <textarea
                    required
                    rows={6}
                    className="w-full bg-cream-paper/40 border border-cream-dark/80 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-brass-accent transition-all text-charcoal-intense"
                    placeholder="Write details regarding your architectural proposals here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                {formStatus === 'error' && (
                  <p className="text-red-700 text-xs font-semibold text-center p-2 bg-red-50 border border-red-200 rounded-xl animate-fade-in font-sans">
                    Could not submit message. Please check internet connections and try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={formStatus === 'sending'}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-charcoal-intense hover:bg-charcoal-soft text-cream-base font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {formStatus === 'sending' ? (
                    <span className="w-4 h-4 border-2 border-cream-base border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Submit Secure Message</span>
                      <Send className="w-3.5 h-3.5 text-brass-light" />
                    </>
                  )}
                </button>
              </form>
            )}
          </article>
        )}

      </div>

      {/* RIGHT COLUMN: Interactive Sidebar containing Google Ad units, category nodes, platform integrity metrics */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Dynamic Ad Unit placed in Sidebar */}
        <GoogleAdUnit format="sidebar" />

        <div className="bg-cream-paper border border-cream-dark/60 rounded-2xl p-6 space-y-5">
          <h3 className="font-serif text-base font-bold text-charcoal-intense border-b border-cream-dark/60 pb-3">
            Quick Navigation Indexes
          </h3>
          <ul className="space-y-3 font-sans text-xs">
            <li>
              <button 
                onClick={() => onNavigate('about')}
                className={`w-full text-left font-semibold transition-colors hover:text-brass-accent flex items-center gap-2 ${pageType === 'about' ? 'text-brass-accent' : 'text-charcoal-soft'}`}
              >
                <BookOpen className="w-4 h-4" />
                <span>About Our Platform</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('privacy')}
                className={`w-full text-left font-semibold transition-colors hover:text-brass-accent flex items-center gap-2 ${pageType === 'privacy' ? 'text-brass-accent' : 'text-charcoal-soft'}`}
              >
                <Shield className="w-4 h-4" />
                <span>Privacy & Disclosures</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('terms')}
                className={`w-full text-left font-semibold transition-colors hover:text-brass-accent flex items-center gap-2 ${pageType === 'terms' ? 'text-brass-accent' : 'text-charcoal-soft'}`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Terms & Copyrights</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('contact')}
                className={`w-full text-left font-semibold transition-colors hover:text-brass-accent flex items-center gap-2 ${pageType === 'contact' ? 'text-brass-accent' : 'text-charcoal-soft'}`}
              >
                <Mail className="w-4 h-4" />
                <span>Contact Administrator</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="bg-cream-paper border border-[#e1dfd6] rounded-2xl p-6 text-center space-y-3 font-sans">
          <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#9a9994] font-mono">Platform Integrity</h4>
          <p className="text-xs text-charcoal-soft leading-relaxed">
            Relational SQLite data is encrypted dynamically inside a secure Sandbox container to fully guarantee author protection.
          </p>
        </div>

      </div>

    </div>
  );
};
