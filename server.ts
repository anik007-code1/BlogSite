import express from 'express';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { Article, VisitorStats } from './src/types';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'database.db');

// Middleware - ENABLE gzip compression and increase limits to fix PayloadTooLargeError for base64 image uploads
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enforce single canonical URL scheme by redirecting www -> non-www, http -> https, and trailing slashes (301 Permanent Redirect)
app.use((req, res, next) => {
  const host = req.headers.host || '';
  const isWww = host.startsWith('www.');
  const isHttp = req.headers['x-forwarded-proto'] === 'http';

  // If request comes from www.llmreviewpro.com or is plain http on llmreviewpro.com, redirect to canonical https://llmreviewpro.com
  if (host.includes('llmreviewpro.com') && (isWww || isHttp)) {
    const canonicalHost = 'llmreviewpro.com';
    let pathAndQuery = req.url;
    // Clean trailing slash if present (except for root '/')
    if (req.path.length > 1 && req.path.endsWith('/') && !req.path.includes('.')) {
      const query = req.url.slice(req.path.length);
      pathAndQuery = req.path.slice(0, -1) + query;
    }
    return res.redirect(301, `https://${canonicalHost}${pathAndQuery}`);
  }

  // Redirect other trailing slashes (e.g. on localhost or preview URL)
  if (req.path.length > 1 && req.path.endsWith('/')) {
    if (!req.path.includes('.')) {
      const query = req.url.slice(req.path.length);
      const cleanPath = req.path.slice(0, -1);
      return res.redirect(301, cleanPath + query);
    }
  }
  next();
});

// Initialize SQLite Database Engine
let db: Database.Database;

function initDB() {
  if (!db) {
    db = new Database(DB_FILE);
    db.pragma('journal_mode = WAL');

    // Create Relational Tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category TEXT,
        summary TEXT,
        content TEXT,
        author TEXT,
        authorRole TEXT,
        authorAvatar TEXT,
        publishedDate TEXT,
        status TEXT,
        isFeatured INTEGER DEFAULT 0,
        featuredImage TEXT,
        tags TEXT, -- JSON Array
        views INTEGER DEFAULT 0,
        readingTime TEXT,
        seoTitle TEXT,
        seoDescription TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS subscribers (
        email TEXT PRIMARY KEY,
        timestamp TEXT
      );

      CREATE TABLE IF NOT EXISTS stats (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        timestamp TEXT,
        isRead INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS page_visits (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        path TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        dayOfWeek TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
      CREATE INDEX IF NOT EXISTS idx_page_visits_path ON page_visits(path);
      CREATE INDEX IF NOT EXISTS idx_page_visits_timestamp ON page_visits(timestamp);
    `);

    // Determine if complete database seed reset is needed (checks if baseline essay or its page views are missing)
    const mustSeed = (db.prepare("SELECT COUNT(*) as count FROM articles WHERE id = 'ai_claude_mython'").get() as { count: number }).count === 0 ||
                     (db.prepare("SELECT COUNT(*) as count FROM page_visits WHERE path LIKE '/post/%'").get() as { count: number }).count === 0;
    if (mustSeed) {
      db.prepare("DELETE FROM articles").run(); // Purges all old default placeholders
      db.prepare("DELETE FROM page_visits").run(); // Purge old page visits for clean, synchronized state
    }

    // Bootstrap Dynamic page visits if empty
    const countVisitsObj = db.prepare("SELECT COUNT(*) as count FROM page_visits").get() as { count: number };
    if (countVisitsObj.count === 0) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const counts = [1844, 3512, 2204, 5231, 6842, 11048, 9512];
      const insertVisit = db.prepare("INSERT INTO page_visits (id, sessionId, path, timestamp, dayOfWeek) VALUES (?, ?, ?, ?, ?)");
      const runTransaction = db.transaction(() => {
        for (let d = 0; d < days.length; d++) {
          const day = days[d];
          const count = counts[d];
          for (let i = 0; i < count; i++) {
            const id = `visit_${day}_${i}`;
            const sessionId = `sess_${day}_${Math.floor(i / 2.3)}`; // Some repeated to simulate unique users vs total page views
            const timestamp = new Date(Date.now() - (7 - d) * 24 * 60 * 60 * 1000).toISOString();
            insertVisit.run(id, sessionId, '/', timestamp, day);
          }
        }
      });
      runTransaction();
    }

    if (mustSeed) {
      const insertStmt = db.prepare(`
        INSERT INTO articles (
          id, title, slug, category, summary, content, author, authorRole, 
          authorAvatar, publishedDate, status, isFeatured, featuredImage, 
          tags, views, readingTime, seoTitle, seoDescription, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const seedArticles: Article[] = [
        {
          id: 'ai_claude_fable',
          title: 'Claude Fable: Anthropic’s Specialized Creative Engine & Multi-modal Narrative Synthesis',
          slug: 'claude-fable-specialized-creative-multimodal-narrative',
          category: 'AI',
          summary: 'An depth review of Anthropic’s Claude Fable model designed for hyper-creative dialogue, multi-agent prose orchestration, and extreme semantic alignment.',
          content: `
            <p class="mb-6 font-body-lg text-body-lg text-charcoal-intense">
              While engineering circles focus heavily on code-generation models, Anthropic's quiet rollout of the <strong>Claude Fable</strong> architecture marks a distinct milestone. Purpose-built for non-linear logic, multi-modal storyline branching, and hyper-realistic emotional alignment, Fable targets human-grade creative processes, screenwriting, and advanced simulation.
            </p>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Innovative Prose Generation & Context Orchestration</h2>
            <p class="mb-6">
              Unlike traditional LLMs which optimize primarily for raw factual retrieval, the Fable model employs a proprietary <em>Semantic Resonance Loop</em>. This ensures complex symbolic cross-references are held perfectly in context, raising the capability of generating highly sophisticated non-cliché narratives and multi-character dialogue modules.
            </p>

            <div class="my-10 shadow-lg rounded-xl overflow-hidden border border-cream-dark font-sans">
              <div class="bg-[#131b2e] text-[#a5badb] px-4 py-3 font-mono text-xs flex justify-between items-center border-b border-cream-dark/20">
                <span>fable_story_agent.py</span>
                <span class="text-xs uppercase text-brass-accent font-semibold tracking-wider font-sans">Semantic Resonance Evaluation</span>
              </div>
              <pre class="bg-[#131b2e] p-6 overflow-x-auto text-[#eef3fb] font-mono text-xs md:text-sm leading-relaxed"><code># Simulating Claude Fable non-linear prompt branches
def evaluate_prose_flow(narrative_nodes):
    resonance_index = calculate_emotional_vector(narrative_nodes)
    if resonance_index > 0.89:
        return optimize_vocabulary_weights(narrative_nodes)
    else:
        return inject_stylistic_diversity(narrative_nodes)</code></pre>
            </div>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Unmatched Alignment and Tone Nuance</h2>
            <p class="mb-6">
              Through Anthropic’s constitutional training, Claude Fable understands abstract instructions about pacing, metaphors, and suspense. Authors and developers can programmatically lock down the tone with extremely light XML directives, creating rich literary companions that remain aligned without drifting.
            </p>
          `,
          author: 'Anik Admin',
          authorRole: 'System Administrator',
          authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
          publishedDate: 'Jun 11, 2526',
          status: 'Published',
          isFeatured: false,
          featuredImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1100&auto=format&fit=crop',
          tags: ['AI', 'Claude', 'Narrative', 'Anthropic'],
          views: 312,
          readingTime: '5 min read',
          seoTitle: 'Claude Fable Creative & Narrative Analysis | LLM Review Pro',
          seoDescription: 'Discover the inner mechanics of Anthropic’s Claude Fable creative narrative engine with live evaluation examples.',
          createdAt: '2026-06-11T11:00:00Z'
        },
        {
          id: 'ai_claude_mython',
          title: 'Anthropic Claude Mython: Optimising Advanced Code-Generation Pathways',
          slug: 'anthropic-claude-mython-optimizing-code-generation-pathways',
          category: 'Programming',
          summary: 'A technical investigation into Claude Mython, the internal experimental branch optimizing abstract syntax trees and high-fidelity code-synthesis compilers.',
          content: `
            <p class="mb-6 font-body-lg text-body-lg text-charcoal-intense">
              While engineering circles focus heavily on generic instruction tuning, <strong>Claude Mython</strong> introduces deep parser optimizations specifically modeled for high-fidelity compilation and structural reasoning. Designed to bridge abstract natural language specifications and deterministic syntax structures, Mython minimizes syntax crashes and multi-file code rot.
            </p>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Abstract Syntax Tree (AST) Fine-Tuning</h2>
            <p class="mb-6">
              Classic large language models output tokens sequentially using probabilistic metrics. Mython leverages a secondary structural checker that ranks outputs relative to the compilability of their Abstract Syntax Trees (AST).
            </p>

            <div class="my-10 shadow-lg rounded-xl overflow-hidden border border-cream-dark font-sans">
              <div class="bg-[#131b2e] text-[#a5badb] px-4 py-3 font-mono text-xs flex justify-between items-center border-b border-cream-dark/20">
                <span>mython_ast_compiler.py</span>
                <span class="text-xs uppercase text-brass-accent font-semibold tracking-wider font-sans">AST Verification Step</span>
              </div>
              <pre class="bg-[#131b2e] p-6 overflow-x-auto text-[#eef3fb] font-mono text-xs md:text-sm leading-relaxed"><code>import ast

def verify_code_compilability(generated_code):
    try:
        parsed_ast = ast.parse(generated_code)
        # Verify node alignment and depth boundaries
        node_count = len(list(ast.walk(parsed_ast)))
        return True, node_count
    except SyntaxError as err:
        return False, str(err)</code></pre>
            </div>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Optimized Multi-File Module Synthesising</h2>
            <p class="mb-6">
              When processing imports and structural class parameters, Claude Mython is optimized to hold complex state dependencies cleanly across files, yielding pristine production-ready codebases with strict separation of concerns.
            </p>
          `,
          author: 'Anik Admin',
          authorRole: 'System Administrator',
          authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
          publishedDate: 'Jun 14, 2026',
          status: 'Published',
          isFeatured: false,
          featuredImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1100&auto=format&fit=crop',
          tags: ['AI', 'Claude', 'Mython', 'Programming'],
          views: 452,
          readingTime: '6 min read',
          seoTitle: 'Anthropic Claude Mython AST Compiler Analysis | LLM Review Pro',
          seoDescription: 'Dive deep into structural compiler optimizations, grammar constraints, and AST checks within Claude Mython.',
          createdAt: '2026-06-14T09:00:00Z'
        },
        {
          id: 'ai_gemini_models',
          title: 'Gemini 1.5 Pro and Flash: Engineering Millions of Sequence Context Windows',
          slug: 'gemini-pro-flash-engineering-millions-context-windows',
          category: 'Tech',
          summary: 'An analysis of Google’s native multimodal architecture, RingAttention scaling, and needles-in-a-haystack retrieval over millions of token inputs.',
          content: `
            <p class="mb-6 font-body-lg text-body-lg text-charcoal-intense">
              While other models vie for incremental speed improvements, Google's Gemini 1.5 Pro and Flash architectures have fundamentally rewritten attention limits by unlocking constant <strong>2 million token context windows</strong>. Underneath this extraordinary sequence capacity lies a combination of native multi-modality and horizontal cluster distribution.
            </p>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">RingAttention Across Hardware Clusters</h2>
            <p class="mb-6">
              Standard Self-Attention scales quadratically ($O(N^2)$) relative to sequence length, causing memory overload inside a single TPU. Google overcomes this bottleneck with <strong>RingAttention</strong>, distributing the key-value sequence blocks sequentially around a Ring of host accelerators.
            </p>

            <div class="my-10 shadow-lg rounded-xl overflow-hidden border border-cream-dark font-sans">
              <div class="bg-[#131b2e] text-[#a5badb] px-4 py-3 font-mono text-xs flex justify-between items-center border-b border-cream-dark/20">
                <span>ring_attention_dist.py</span>
                <span class="text-xs uppercase text-brass-accent font-semibold tracking-wider font-sans">Distributed KV Block Exchange</span>
              </div>
              <pre class="bg-[#131b2e] p-6 overflow-x-auto text-[#eef3fb] font-mono text-xs md:text-sm leading-relaxed"><code>def exchange_block_ring(local_kv_block, ring_rank, total_ranks):
    # Sends local Key-Value block to next logical ring node while receiving from previous
    next_node = (ring_rank + 1) % total_ranks
    prev_node = (ring_rank - 1 + total_ranks) % total_ranks
    
    send_kv_async(dest=next_node, src_block=local_kv_block)
    incoming_kv_block = recv_kv_sync(source=prev_node)
    return incoming_kv_block</code></pre>
            </div>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Absolute Needle-In-A-Haystack Retrieval</h2>
            <p class="mb-6">
              With 100% retrieval rate on context needles at 2M sequence blocks, Gemini allows developers to index entire codeports, full hour-long audio files, and complete textbooks natively in the prompt without utilizing complex vector database chunking layers (RAG).
            </p>
          `,
          author: 'Anik Admin',
          authorRole: 'System Administrator',
          authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
          publishedDate: 'Jun 13, 2026',
          status: 'Published',
          isFeatured: false,
          featuredImage: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1100&auto=format&fit=crop',
          tags: ['AI', 'Gemini', 'Google', 'RingAttention'],
          views: 894,
          readingTime: '5 min read',
          seoTitle: 'Gemini 1.5 Pro and Flash Context Window Engineering | LLM Review Pro',
          seoDescription: 'Discover the mechanics of RingAttention, multi-hour native multimodal indexing, and low-latency token pipelines in Gemini 1.5.',
          createdAt: '2026-06-13T10:00:00Z'
        },
        {
          id: 'ai_gpt_codex',
          title: 'Re-evaluating GPT Codex: The Foundational Base of Modern Developer Autopilot Systems',
          slug: 'gpt-codex-revisited-foundation-modern-code-automation',
          category: 'Programming',
          summary: 'How OpenAI\'s GPT Codex pioneered pre-training on code corpuses, paving the way for Github Copilot, agentic tree-of-thought routines, and autonomous compilers.',
          content: `
            <p class="mb-6 font-body-lg text-body-lg text-charcoal-intense">
              Before ChatGPT and modern reasoning engines captured mainstream headlines, OpenAI's <strong>GPT Codex</strong> established the fundamental architecture of automated programming. By heavily pre-training on public source repositories, Codex proved that natural language directions could reliably map directly to operational scripts.
            </p>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Syntax-Aware Token Weight Tuning</h2>
            <p class="mb-6">
              Codex represents a custom GPT-3 fine-tune optimized for programming syntax. Unlike natural writing streams, programming languages possess rigid context-free grammars. Codex adjusted the tokenizer vocabulary to prevent fragmentation of standard spacing buffers (e.g., preserving multiple indent spaces as unified tokens).
            </p>

            <div class="my-10 shadow-lg rounded-xl overflow-hidden border border-cream-dark font-sans">
              <div class="bg-[#131b2e] text-[#a5badb] px-4 py-3 font-mono text-xs flex justify-between items-center border-b border-cream-dark/20">
                <span>codex_sample_inference.py</span>
                <span class="text-xs uppercase text-brass-accent font-semibold tracking-wider font-sans">Token Sampling Control</span>
              </div>
              <pre class="bg-[#131b2e] p-6 overflow-x-auto text-[#eef3fb] font-mono text-xs md:text-sm leading-relaxed"><code># Simulating classic Codex token completion with strict temperature
def sample_codex_token(logits, temperature=0.2):
    # Lower temperature is critical for deterministic syntax mapping
    scaled_logits = logits / max(temperature, 1e-5)
    probs = softmax(scaled_logits)
    return select_highest_probability_token(probs)</code></pre>
            </div>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Pioneering Agentic AutPilot Platforms</h2>
            <p class="mb-6">
              From Codex came GitHub Copilot and the realization that autocomplete could solve complex sub-routines. The foundational lessons learned in training Codex on function definition bounds laid the pathway for modern real-time context-aware editor integrations.
            </p>
          `,
          author: 'Anik Admin',
          authorRole: 'System Administrator',
          authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
          publishedDate: 'Jun 12, 2026',
          status: 'Published',
          isFeatured: false,
          featuredImage: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=1100&auto=format&fit=crop',
          tags: ['AI', 'GPT', 'Codex', 'OpenAI'],
          views: 512,
          readingTime: '5 min read',
          seoTitle: 'Re-evaluating GPT Codex Programming Foundations | LLM Review Pro',
          seoDescription: 'A retro and logical exploration of GPT Codex, tokenizer optimizations, and how it shaped GitHub Copilot.',
          createdAt: '2026-06-12T08:00:00Z'
        },
        {
          id: 'ai_stepfun',
          title: 'Stepfun Trillion-Parameter MoE: The Ascent of Multi-Modal Supercomputing',
          slug: 'stepfun-trillion-parameter-moe-ascent-multimodal',
          category: 'Tech',
          summary: 'An investigative deep-dive into Stepfun\'s sparse Mixture-of-Experts routing strategies, cross-modal perception vectors, and petabyte-scale pre-training pipelines.',
          content: `
            <p class="mb-6 font-body-lg text-body-lg text-charcoal-intense">
              While global startup attention is highly focused on next-token text benchmarks, Chinese lab <strong>Stepfun</strong> has achieved brilliant milestones in configuring unified multi-modality inside trillion-parameter sparse Mixture-of-Experts (MoE) infrastructures.
            </p>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Dynamic Expert Gating at Extreme Scale</h2>
            <p class="mb-6">
              Stepfun\'s engineering avoids the compute bottlenecks of dense parameters by routing tokens exclusively to two highly specialized sub-expert clusters inside the feedforward layer. This enables the model to host deep specialized domains like biochemical or complex financial calculations without massive memory demands.
            </p>

            <div class="my-10 shadow-lg rounded-xl overflow-hidden border border-cream-dark font-sans">
              <div class="bg-[#131b2e] text-[#a5badb] px-4 py-3 font-mono text-xs flex justify-between items-center border-b border-cream-dark/20">
                <span>sparse_moe_routing.py</span>
                <span class="text-xs uppercase text-brass-accent font-semibold tracking-wider font-sans">Gating Dispatch Node</span>
              </div>
              <pre class="bg-[#131b2e] p-6 overflow-x-auto text-[#eef3fb] font-mono text-xs md:text-sm leading-relaxed"><code>def route_to_experts(token_inputs, expert_weights):
    # Calculates gating vector for the sparse MoE structure
    routing_scores = softmax(matmul(token_inputs, expert_weights))
    active_expert_indices = get_top_k_indices(routing_scores, k=2)
    return active_expert_indices</code></pre>
            </div>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Native Audiovisual Processing</h2>
            <p class="mb-6">
              Unlike classic systems that stack simple speech transcribers and language models, Stepfun is co-trained in cooperative auditory and pixel manifolds. Auditory spectrogram waves and high-res pixel patches are mapped directly into the same latent vector space, allowing for stunning native multi-modal inference fluidity.
            </p>
          `,
          author: 'Anik Admin',
          authorRole: 'System Administrator',
          authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
          publishedDate: 'Jun 10, 2026',
          status: 'Published',
          isFeatured: false,
          featuredImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1100&auto=format&fit=crop',
          tags: ['AI', 'Stepfun', 'MoE', 'Multimodal'],
          views: 489,
          readingTime: '5 min read',
          seoTitle: 'Stepfun Trillion Parameter MoE Architecture | LLM Review Pro',
          seoDescription: 'Understand Stepfun’s trillion-parameter MoE and unified auditory-visual processing pipelines.',
          createdAt: '2026-06-10T07:00:00Z'
        },
        {
          id: 'ai_deepseek',
          title: 'DeepSeek-V3 and R1: Shaking the Global GPU Scaling Paradigm',
          slug: 'deepseek-v3-and-r1-shaking-global-gpu-scaling',
          category: 'Tech',
          summary: 'How Multi-head Latent Attention (MLA) cache compression and reinforcement-learning-driven Chain of Thought algorithms made DeepSeek-R1 a master of low-cost reasoning.',
          content: `
            <p class="mb-6 font-body-lg text-body-lg text-charcoal-intense">
              The artificial intelligence landscape witnessed a dramatic architectural shift with the release of the <strong>DeepSeek-V3</strong> model series and its reasoning-specialised counterpart, <strong>DeepSeek-R1</strong>. What makes DeepSeek's global rise so historic is not merely matching high-capability Western models on core benchmarks, but doing so with a fraction of the traditional budget.
            </p>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Compressing KV Cache with MLA</h2>
            <p class="mb-6">
              In standard Transformer models, Key-Value (KV) caching is the central bottleneck restricting high context lengths. DeepSeek introduces <strong>Multi-Head Latent Attention (MLA)</strong> to project keys and values onto a low-rank, compressed bottleneck matrix dynamically inside the feedforward sequence. This drastically cuts cache footprint for each concurrent query.
            </p>

            <div class="my-10 shadow-lg rounded-xl overflow-hidden border border-cream-dark font-sans">
              <div class="bg-[#131b2e] text-[#a5badb] px-4 py-3 font-mono text-xs flex justify-between items-center border-b border-cream-dark/20">
                <span>mla_cache_compression.py</span>
                <span class="text-xs uppercase text-brass-accent font-semibold tracking-wider font-sans">MLA Cache Bottleneck</span>
              </div>
              <pre class="bg-[#131b2e] p-6 overflow-x-auto text-[#eef3fb] font-mono text-xs md:text-sm leading-relaxed"><code>def project_latent_mla(query_vector, key_value_cache):
    # Compresses keys/values into low-rank 512 dimensions dynamically
    W_down = get_projection_matrix("bottleneck_projection")
    latent_bottleneck = matmul(key_value_cache, W_down)
    return latent_bottleneck</code></pre>
            </div>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">DeepSeek-R1: Pure Reinforcement Learning & Chain of Thought</h2>
            <p class="mb-6">
              Unlike classic large-language pipelines which depend primarily on dense supervised instruction datasets (SFT), DeepSeek-R1 utilizes extensive reinforcement learning loops with cold-start rules. It produces a readable "thinking process" enclosed in modular tags, facilitating transparent research pathways and spectacular scores in math and programming.
            </p>
          `,
          author: 'Anik Admin',
          authorRole: 'System Administrator',
          authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
          publishedDate: 'Jun 15, 2026',
          status: 'Published',
          isFeatured: true,
          featuredImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1100&auto=format&fit=crop',
          tags: ['AI', 'DeepSeek', 'MoE', 'MLA'],
          views: 1245,
          readingTime: '6 min read',
          seoTitle: 'DeepSeek-V3 & R1 MoE Architecture Analysis | LLM Review Pro',
          seoDescription: 'Uncover the deep math behind MLA compression, hardware routing rules, and the reinforcement learning structure of DeepSeek models.',
          createdAt: '2026-06-15T11:00:00Z'
        },
        {
          id: 'ai_glm',
          title: 'GLM-4 and Zhipu AI: Mastering Unified Chat and Bilingual Multi-Task Generalisation',
          slug: 'glm-4-zhipu-ai-bilingual-multitask-generalisation',
          category: 'Tech',
          summary: 'The architecture of Zhipu AI’s General Language Model (GLM) framework, featuring bilingual autoregressive pre-training, dual-encoder tuning, and visual reasoning.',
          content: `
            <p class="mb-6 font-body-lg text-body-lg text-charcoal-intense">
              Built on a proprietary autoregressive blank-filling model structure, Zhipu AI’s <strong>GLM-4</strong> suite represents a stunning fusion of highly robust bilingual (Chinese/English) capabilities, agent tool calling mechanics, and multi-modal image-to-text integration.
            </p>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Autoregressive Blank Filling with Sentinel Tokens</h2>
            <p class="mb-6">
              Standard models predict left-to-right text sequences. GLM-4 distinguishes itself by employing a unique objective that randomly masks spans of text and trains the network to autoregressively reconstruct them, yielding superb performance in text editing, paragraph interpolation, and logical inference.
            </p>

            <div class="my-10 shadow-lg rounded-xl overflow-hidden border border-cream-dark font-sans">
              <div class="bg-[#131b2e] text-[#a5badb] px-4 py-3 font-mono text-xs flex justify-between items-center border-b border-cream-dark/20">
                <span>glm_blank_filling.py</span>
                <span class="text-xs uppercase text-brass-accent font-semibold tracking-wider font-sans">Autoregression Infilling Loop</span>
              </div>
              <pre class="bg-[#131b2e] p-6 overflow-x-auto text-[#eef3fb] font-mono text-xs md:text-sm leading-relaxed"><code>def corrupt_span_glm(tokens, mask_start, mask_length):
    # Replaces chosen text spans with sentinel variables to force infill targets
    sentinel_id = get_sentinel_token_id()
    corrupted_sequence = tokens[:mask_start] + [sentinel_id] + tokens[mask_start + mask_length:]
    target_sequence = tokens[mask_start : mask_start + mask_length]
    return corrupted_sequence, target_sequence</code></pre>
            </div>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">The GLM-4 Tool-Calling Agent Loop</h2>
            <p class="mb-6">
              GLM-4 features highly optimized tool calling parameters. The model understands complex nested function schemes and has been extensively validated against real API integrations, performing with exceptional speed and security.
            </p>
          `,
          author: 'Anik Admin',
          authorRole: 'System Administrator',
          authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
          publishedDate: 'Jun 11, 2026',
          status: 'Published',
          isFeatured: false,
          featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1100&auto=format&fit=crop',
          tags: ['AI', 'GLM', 'ZhipuAI', 'Bilingual'],
          views: 384,
          readingTime: '5 min read',
          seoTitle: 'GLM-4 and Zhipu AI Autoregressive Infilling | LLM Review Pro',
          seoDescription: 'Explore the GLM-4 blank-filling model architectures, sentinel tokens, and agent tooling pipelines.',
          createdAt: '2026-06-11T09:00:00Z'
        },
        {
          id: 'ai_minimax',
          title: 'MiniMax abab 6.5: Scaling Non-Linear Conversation Complexity in Social AI Environments',
          slug: 'minimax-abab-scaling-nonlinear-conversational-complexity',
          category: 'AI',
          summary: 'How MiniMax\'s unique abab series leverages specialized linear-attention and Mixture-of-Experts architectures to deliver unprecedented emotional intelligence and fluid multiparty dialogue.',
          content: `
            <p class="mb-6 font-body-lg text-body-lg text-charcoal-intense">
              Social artificial intelligence environments demand a much higher density of emotional nuance, subtle humor, and culture-appropriate references than factual QA pipelines. China\'s startup <strong>MiniMax</strong> has navigated this space with their custom-trained <strong>abab model series</strong>.
            </p>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Hyper-Refined Linear Attention Formulations</h2>
            <p class="mb-6">
              To support hundreds of concurrent active users inside complex digital rooms without huge GPU overhead, MiniMax integrates hybrid linear self-attention layers that reduce complexity from quadratic ($O(N^2)$) to near-linear ($O(N)$), enabling fast sequence generation.
            </p>

            <div class="my-10 shadow-lg rounded-xl overflow-hidden border border-cream-dark font-sans">
              <div class="bg-[#131b2e] text-[#a5badb] px-4 py-3 font-mono text-xs flex justify-between items-center border-b border-cream-dark/20">
                <span>minimax_attention.py</span>
                <span class="text-xs uppercase text-brass-accent font-semibold tracking-wider font-sans">Linearized Kernel Projection</span>
              </div>
              <pre class="bg-[#131b2e] p-6 overflow-x-auto text-[#eef3fb] font-mono text-xs md:text-sm leading-relaxed"><code>def linear_attention_step(query, key, value):
    # Projects Keys and Values through an activation kernel first
    k_projected = relu(key)
    v_projected = value
    
    # Calculate matrix multiplier to avoid key-query quadratic multiplication
    context_matrix = matmul(k_projected.transpose(), v_projected)
    return matmul(relu(query), context_matrix)</code></pre>
            </div>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Native Speech-Text-Video Co-tokenization</h2>
            <p class="mb-6">
              By mapping video clips, natural vocal recordings, and text arrays onto the same sequence tokenizer, MiniMax's abab models excel at emotional narration, multi-participant dialogue modeling, and high-fidelity video rendering.
            </p>
          `,
          author: 'Anik Admin',
          authorRole: 'System Administrator',
          authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
          publishedDate: 'Jun 11, 2026',
          status: 'Published',
          isFeatured: false,
          featuredImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1100&auto=format&fit=crop',
          tags: ['AI', 'MiniMax', 'abab', 'LinearAttention'],
          views: 294,
          readingTime: '5 min read',
          seoTitle: 'MiniMax abab 6.5 Attention Modeling | LLM Review Pro',
          seoDescription: 'An architectural exploration of MiniMax abab models, linear attention parameters, and social conversational scaling.',
          createdAt: '2026-06-11T08:00:00Z'
        },
        {
          id: 'ai_qwen',
          title: 'Qwen 2.5: Alibaba’s Multi-Lingual Behemoth Dominating Open Source Generalization',
          slug: 'qwen-alibaba-multilingual-behemoth-dominating-opensource',
          category: 'Tech',
          summary: 'Exploring Qwen 2.5\'s dense parameter scaling, multilingual instructional alignment, structural coding performance, and native visual-audio-language layers (Qwen-VL).',
          content: `
            <p class="mb-6 font-body-lg text-body-lg text-charcoal-intense">
              While open-weights modeling saw key progress in small parameter ranges, Alibaba Group redefined scale with <strong>Qwen 2.5</strong>. Trained in over 30 languages with highly rigorous compliance alignment, Qwen matching proprietary performance bounds across programming, logic, and multi-turn conversation.
            </p>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Expanded Multilingual Vocab Tokenizers</h2>
            <p class="mb-6">
              Standard tokenizers are heavily biased towards English script, forcing non-English texts to use much larger token quantities per sentence. Qwen resolves this through a massive 151,643 token vocabulary size, optimizing data representation and speeds for Asian and European languages.
            </p>

            <div class="my-10 shadow-lg rounded-xl overflow-hidden border border-cream-dark font-sans">
              <div class="bg-[#131b2e] text-[#a5badb] px-4 py-3 font-mono text-xs flex justify-between items-center border-b border-cream-dark/20">
                <span>qwen_tokenizer_test.py</span>
                <span class="text-xs uppercase text-brass-accent font-semibold tracking-wider font-sans">Multilingual Token Check</span>
              </div>
              <pre class="bg-[#131b2e] p-6 overflow-x-auto text-[#eef3fb] font-mono text-xs md:text-sm leading-relaxed"><code># Simulating Qwen specialized UTF-8 token mappings
def calculate_qwen_efficiency(multilingual_text):
    tokens = qwen_vocab_encoder.encode(multilingual_text)
    token_byte_ratio = len(tokens) / len(multilingual_text.encode('utf-8'))
    return len(tokens), token_byte_ratio</code></pre>
            </div>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Qwen-VL and Native Visual Intelligence</h2>
            <p class="mb-6">
              Beyond pure speech and text, the Qwen suite features <strong>Qwen-VL</strong>, integrating pixel coordinates directly inside language embeddings. This yields high precision on layout analysis, document querying, and visual QA bounds.
            </p>
          `,
          author: 'Anik Admin',
          authorRole: 'System Administrator',
          authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
          publishedDate: 'Jun 15, 2026',
          status: 'Published',
          isFeatured: false,
          featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1100&auto=format&fit=crop',
          tags: ['AI', 'Qwen', 'Alibaba', 'OpenSource'],
          views: 742,
          readingTime: '5 min read',
          seoTitle: 'Qwen 2.5 Open-Source Multilingual Scaling | LLM Review Pro',
          seoDescription: 'Dive deep into Qwen 2.5’s vocabulary tokenizers, multilingual instructional training, and visual-linguistic layers.',
          createdAt: '2026-06-15T09:00:00Z'
        },
        {
          id: 'ai_seedance',
          title: 'ByteDance Seed-LLM & Seed-TTS: Architectural Convergence of Speech and Conversational Reasoning',
          slug: 'bytedance-seed-llm-tts-architectural-convergence-speech-reasoning',
          category: 'AI',
          summary: 'Inside the unified conversational speech-language framework powering zero-shot voice imitation, contextual emotional expressions, and multi-turn audio-to-audio dialogue.',
          content: `
            <p class="mb-6 font-body-lg text-body-lg text-charcoal-intense">
              Most voice conversations with AI models still feel robotic because they rely on modular pipelines (Speech-to-Text, LLM processing, and Text-to-Speech). ByteDance’s <strong>Seed-LLM</strong> and <strong>Seed-TTS</strong> break this paradigm by integrating sound elements natively inside language transformers.
            </p>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Unified Continuous Speech Tokenizers</h2>
            <p class="mb-6">
              Instead of converting waveforms into text characters before processing, Seed tokenizes speech waves into high-dimension continuous representations. These are processed alongside text tokens in the model layers, yielding conversational answers that capture precise human emotional details, brief laughter, and customized emphasis.
            </p>

            <div class="my-10 shadow-lg rounded-xl overflow-hidden border border-cream-dark font-sans">
              <div class="bg-[#131b2e] text-[#a5badb] px-4 py-3 font-mono text-xs flex justify-between items-center border-b border-cream-dark/20">
                <span>seed_speech_tokenizer.py</span>
                <span class="text-xs uppercase text-brass-accent font-semibold tracking-wider font-sans">Waveform Embeddings</span>
              </div>
              <pre class="bg-[#131b2e] p-6 overflow-x-auto text-[#eef3fb] font-mono text-xs md:text-sm leading-relaxed"><code>def wave_to_seed_speech_embeddings(vocal_waveform):
    # Quantize sound vector into unified discrete speech codebook tokens
    speech_encoder = load_seed_vqgan_encoder()
    discrete_vocal_tokens = speech_encoder.quantize_wave(vocal_waveform)
    return discrete_vocal_tokens</code></pre>
            </div>

            <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">Zero-Shot Voice Clones and Accent Nuances</h2>
            <p class="mb-6">
              With less than three seconds of vocal input, Seed-TTS can clone voice timbres and preserve accents accurately. These features enable fluid, human-like voice conversations, making it highly valuable for educational systems, audio-to-audio helpers, and interactive reading loops.
            </p>
          `,
          author: 'Anik Admin',
          authorRole: 'System Administrator',
          authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
          publishedDate: 'Jun 15, 2026',
          status: 'Published',
          isFeatured: false,
          featuredImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=1100&auto=format&fit=crop',
          tags: ['AI', 'SeedLLM', 'SeedTTS', 'ByteDance'],
          views: 618,
          readingTime: '5 min read',
          seoTitle: 'ByteDance Seed Speech-Language Deep Dive | LLM Review Pro',
          seoDescription: 'A technical evaluation of ByteDance’s Seed-LLM speech-to-speech tokens, continuous sound projection, and zero-shot voice synthesis.',
          createdAt: '2026-06-15T09:30:00Z'
        }
      ];

      const insertVisitStmt = db.prepare("INSERT INTO page_visits (id, sessionId, path, timestamp, dayOfWeek) VALUES (?, ?, ?, ?, ?)");
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      for (const a of seedArticles) {
        insertStmt.run(
          a.id,
          a.title,
          a.slug,
          a.category,
          a.summary,
          a.content,
          a.author,
          a.authorRole,
          a.authorAvatar,
          a.publishedDate,
          a.status,
          a.isFeatured ? 1 : 0,
          a.featuredImage,
          JSON.stringify(a.tags),
          a.views,
          a.readingTime,
          a.seoTitle,
          a.seoDescription,
          a.createdAt
        );

        // Seed companion real page visits so that page_visits table aligns with views
        for (let j = 0; j < a.views; j++) {
          const randId = `visit_art_${a.id}_${j}`;
          const sessionId = `sess_art_${a.id}_${Math.floor(j / 2.3)}`;
          const dayIdx = Math.floor(Math.random() * days.length);
          const day = days[dayIdx];
          const timestamp = new Date(Date.now() - (7 - dayIdx) * 24 * 60 * 60 * 1000).toISOString();
          insertVisitStmt.run(randId, sessionId, `/post/${a.slug}`, timestamp, day);
        }
      }
    }
  }
  return db;
}

// REST Backend APIs
// 0. POST login for admin authentication (aniklpu01@gmail.com / 12345678)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'aniklpu01@gmail.com' && password === '12345678') {
    return res.json({
      success: true,
      token: 'vellum_vector_admin_token_2026',
      user: {
        email: 'aniklpu01@gmail.com',
        role: 'Administrator',
        name: 'Anik Admin'
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      error: 'Invalid administrator email or password.'
    });
  }
});

// Helper validation middleware for Admin-only interactions
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCacheManager {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

const apiCache = new MemoryCacheManager();

const requireAdminAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer vellum_vector_admin_token_2026') {
    return res.status(401).json({ error: 'Unauthorized: Admin authorization token is missing or invalid' });
  }
  next();
};

// 1. GET all articles from SQLite
app.get('/api/articles', (req, res) => {
  try {
    const { category, status } = req.query;
    const cacheKey = `articles_list_cat_${category || 'all'}_status_${status || 'all'}`;
    const cachedData = apiCache.get<Article[]>(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const database = initDB();
    const stmt = database.prepare("SELECT * FROM articles ORDER BY createdAt DESC");
    const rows = stmt.all() as any[];

    // Parse structures
    let articlesList: Article[] = rows.map((r) => ({
      ...r,
      isFeatured: r.isFeatured === 1,
      tags: JSON.parse(r.tags || '[]')
    }));

    // In-memory filters (extremely fast + SQL injection proof)
    if (category) {
      articlesList = articlesList.filter(
        (a) => a.category.toLowerCase() === (category as string).toLowerCase()
      );
    }

    if (status && status !== 'all') {
      articlesList = articlesList.filter(
        (a) => a.status.toLowerCase() === (status as string).toLowerCase()
      );
    }

    // Cache the listing for 1 minute (60000ms), cleared instantly on admin updates
    apiCache.set(cacheKey, articlesList, 60000);
    res.json(articlesList);
  } catch (err) {
    console.error("SQL Retrieval Error:", err);
    res.status(500).json({ error: 'Failed to access journal database.' });
  }
});

// 2. GET single article by slug from SQLite
app.get('/api/articles/:slug', (req, res) => {
  try {
    const slug = req.params.slug;
    const cacheKey = `article_slug_${slug}`;
    const cachedData = apiCache.get<Article>(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    const database = initDB();
    const selectStmt = database.prepare("SELECT * FROM articles WHERE slug = ?");
    const row = selectStmt.get(slug) as any;

    if (!row) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updatedRow = {
      ...row,
      isFeatured: row.isFeatured === 1,
      tags: JSON.parse(row.tags || '[]')
    };

    // Cache the single article for 30 seconds to absorb concurrent client surges
    apiCache.set(cacheKey, updatedRow, 30000);
    res.json(updatedRow);
  } catch (err) {
    console.error("SQL Error in Slug retrieval:", err);
    res.status(500).json({ error: 'Database transaction failed.' });
  }
});

// 2.5. Dedicated Content Upload API for External Integration with Custom Token
app.post('/api/content/upload', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let token = '';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.headers['x-upload-token']) {
      token = req.headers['x-upload-token'] as string;
    } else if (req.body && req.body.token) {
      token = req.body.token;
    }

    const EXPECTED_TOKEN = "SAJDHFGJLDFghSDKFGSDKJHJGHLKJGHJHJHGLKSDJKHGFSDJKHfg";
    
    if (!token || token !== EXPECTED_TOKEN) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized. Invalid or missing content upload token.',
        documentation: {
          authenticationMethods: [
            { method: 'Authorization Header', format: 'Bearer SAJDHFGJLDFghSDKFGSDKJHJGHLKJGHJHJHGLKSDJKHGFSDJKHfg' },
            { method: 'X-Upload-Token Header', format: 'SAJDHFGJLDFghSDKFGSDKJHJGHLKJGHJHJHGLKSDJKHGFSDJKHfg' },
            { method: 'JSON Request Body', format: '{"token": "SAJDHFGJLDFghSDKFGSDKJHJGHLKJGHJHJHGLKSDJKHGFSDJKHfg", ...}' }
          ]
        }
      });
    }

    const { 
      title, 
      content, 
      category, 
      summary, 
      author, 
      authorRole, 
      authorAvatar, 
      status, 
      tags, 
      featuredImage, 
      isFeatured, 
      readingTime, 
      seoTitle, 
      seoDescription 
    } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false,
        error: 'Bad Request. "title" and "content" are required fields to upload content.' 
      });
    }

    const database = initDB();
    
    // Generate clean slug
    const titleSlug = (title || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const slug = titleSlug || 'untitled-post';

    // Check if article with this slug already exists to resolve conflicts or update
    let existing = database.prepare("SELECT id, views, createdAt, slug FROM articles WHERE slug = ?").get(slug) as any;

    const articleId = existing ? existing.id : ('ext_' + Date.now().toString());
    const finalCategory = category || 'AI';
    const finalStatus = status || 'Published';
    
    // Strip markdown tags to form summary fallback
    const cleanContext = (content || '').replace(/<[^>]*>/g, '').replace(/[#*`_\[\]]/g, '');
    const finalSummary = summary || (cleanContext.slice(0, 150) + (cleanContext.length > 150 ? '...' : ''));

    const finalTags = Array.isArray(tags) ? tags : (tags ? [tags] : ['AI', 'LLM', 'External']);

    // Map high quality Unsplash illustrations based on category
    const defaultImages: Record<string, string> = {
      'AI': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop',
      'Tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
      'Programming': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop'
    };
    const finalFeaturedImage = featuredImage || defaultImages[finalCategory] || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop';

    const calculatedReadingTime = readingTime || `${Math.max(1, Math.ceil((content || '').split(/\s+/).length / 225))} min read`;

    const article = {
      id: articleId,
      title,
      slug,
      category: finalCategory,
      summary: finalSummary,
      content,
      author: author || 'Anik Admin',
      authorRole: authorRole || 'System Administrator',
      authorAvatar: authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
      publishedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: finalStatus,
      isFeatured: isFeatured === true || isFeatured === 1 || isFeatured === 'true',
      featuredImage: finalFeaturedImage,
      tags: finalTags,
      views: existing ? existing.views : 0,
      readingTime: calculatedReadingTime,
      seoTitle: seoTitle || `${title} | LLM Review Pro`,
      seoDescription: seoDescription || finalSummary,
      createdAt: existing ? existing.createdAt : new Date().toISOString()
    };

    // If newly published post is marked featured, reset other features
    if (article.isFeatured) {
      database.prepare("UPDATE articles SET isFeatured = 0").run();
    }

    if (existing) {
      // Update
      database.prepare(`
        UPDATE articles SET
          title = ?,
          category = ?,
          summary = ?,
          content = ?,
          author = ?,
          authorRole = ?,
          authorAvatar = ?,
          publishedDate = ?,
          status = ?,
          isFeatured = ?,
          featuredImage = ?,
          tags = ?,
          readingTime = ?,
          seoTitle = ?,
          seoDescription = ?,
          slug = ?
        WHERE id = ?
      `).run(
        article.title,
        article.category,
        article.summary,
        article.content,
        article.author,
        article.authorRole,
        article.authorAvatar,
        article.publishedDate,
        article.status,
        article.isFeatured ? 1 : 0,
        article.featuredImage,
        JSON.stringify(article.tags),
        article.readingTime,
        article.seoTitle,
        article.seoDescription,
        slug,
        existing.id
      );
    } else {
      // Insert
      database.prepare(`
        INSERT INTO articles (
          id, title, slug, category, summary, content, author, authorRole,
          authorAvatar, publishedDate, status, isFeatured, featuredImage,
          tags, views, readingTime, seoTitle, seoDescription, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        article.id,
        article.title,
        article.slug,
        article.category,
        article.summary,
        article.content,
        article.author,
        article.authorRole,
        article.authorAvatar,
        article.publishedDate,
        article.status,
        article.isFeatured ? 1 : 0,
        article.featuredImage,
        JSON.stringify(article.tags),
        article.views,
        article.readingTime,
        article.seoTitle,
        article.seoDescription,
        article.createdAt
      );
    }

    // Clear caches instantly
    apiCache.clear();

    const host = req.headers.host || 'llmreviewpro.com';
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const postUrl = `${protocol}://${host}/post/${article.slug}`;

    res.status(existing ? 200 : 201).json({
      success: true,
      message: existing ? 'Content updated successfully via API!' : 'Content uploaded successfully via API!',
      articleUrl: postUrl,
      id: article.id,
      slug: article.slug,
      article: {
        title: article.title,
        category: article.category,
        slug: article.slug,
        status: article.status,
        readingTime: article.readingTime,
        publishedDate: article.publishedDate
      }
    });
  } catch (err) {
    console.error("SQL Error in automated API Content Upload:", err);
    res.status(500).json({ success: false, error: 'Database API write failed.' });
  }
});

// 3. POST write or rewrite article (persist new editorial) in SQLite
app.post('/api/articles', requireAdminAuth, (req, res) => {
  try {
    const database = initDB();
    const newArticle: Partial<Article> = req.body;

    if (!newArticle.title || !newArticle.content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Generate clean slug
    const titleSlug = (newArticle.title || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const slug = titleSlug || 'untitled-post';

    // Check if article with this id or slug already exists to update
    let existing: { id: string; views: number; createdAt: string; slug: string } | undefined;
    if (newArticle.id) {
      existing = database.prepare("SELECT id, views, createdAt, slug FROM articles WHERE id = ?").get(newArticle.id) as any;
    }
    if (!existing) {
      existing = database.prepare("SELECT id, views, createdAt, slug FROM articles WHERE slug = ?").get(slug) as any;
    }

    const article: Article = {
      id: existing ? existing.id : (newArticle.id || Date.now().toString()),
      title: newArticle.title,
      slug: slug,
      category: newArticle.category || 'Tech',
      summary: newArticle.summary || (newArticle.content.replace(/<[^>]*>/g, '').slice(0, 150) + '...'),
      content: newArticle.content,
      author: newArticle.author || 'Anik Admin',
      authorRole: newArticle.authorRole || 'System Administrator',
      authorAvatar: newArticle.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
      publishedDate: newArticle.publishedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: (newArticle.status as 'Draft' | 'Published') || 'Draft',
      isFeatured: newArticle.isFeatured || false,
      featuredImage: newArticle.featuredImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop',
      tags: newArticle.tags || ['General'],
      views: existing ? existing.views : 0,
      readingTime: newArticle.readingTime || '5 min read',
      seoTitle: newArticle.seoTitle || `${newArticle.title} | LLM Review Pro`,
      seoDescription: newArticle.seoDescription || newArticle.summary || '',
      createdAt: existing ? existing.createdAt : new Date().toISOString()
    };

    // If newly published post is marked featured, reset other features
    if (article.isFeatured) {
      database.prepare("UPDATE articles SET isFeatured = 0").run();
    }

    if (existing) {
      // Update
      database.prepare(`
        UPDATE articles SET
          title = ?,
          category = ?,
          summary = ?,
          content = ?,
          author = ?,
          authorRole = ?,
          authorAvatar = ?,
          publishedDate = ?,
          status = ?,
          isFeatured = ?,
          featuredImage = ?,
          tags = ?,
          readingTime = ?,
          seoTitle = ?,
          seoDescription = ?,
          slug = ?
        WHERE id = ?
      `).run(
        article.title,
        article.category,
        article.summary,
        article.content,
        article.author,
        article.authorRole,
        article.authorAvatar,
        article.publishedDate,
        article.status,
        article.isFeatured ? 1 : 0,
        article.featuredImage,
        JSON.stringify(article.tags),
        article.readingTime,
        article.seoTitle,
        article.seoDescription,
        slug,
        existing.id
      );
    } else {
      // Insert
      database.prepare(`
        INSERT INTO articles (
          id, title, slug, category, summary, content, author, authorRole,
          authorAvatar, publishedDate, status, isFeatured, featuredImage,
          tags, views, readingTime, seoTitle, seoDescription, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        article.id,
        article.title,
        article.slug,
        article.category,
        article.summary,
        article.content,
        article.author,
        article.authorRole,
        article.authorAvatar,
        article.publishedDate,
        article.status,
        article.isFeatured ? 1 : 0,
        article.featuredImage,
        JSON.stringify(article.tags),
        article.views,
        article.readingTime,
        article.seoTitle,
        article.seoDescription,
        article.createdAt
      );
    }

    // Clear relevant caches instantly
    apiCache.clear();

    res.json(article);
  } catch (err) {
    console.error("SQL Error in Slug writing/updating:", err);
    res.status(500).json({ error: 'Database write failed.' });
  }
});

// 3.5. DELETE single article by ID from SQLite (secured with admin credentials)
app.delete('/api/articles/:id', requireAdminAuth, (req, res) => {
  try {
    const database = initDB();
    const { id } = req.params;

    // Check if article exists
    const existing = database.prepare("SELECT * FROM articles WHERE id = ?").get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Delete
    database.prepare("DELETE FROM articles WHERE id = ?").run(id);

    // Clear caches instantly on deletion
    apiCache.clear();

    res.json({ success: true, message: 'Article safely deleted.' });
  } catch (err) {
    console.error("SQL Error in article deletion:", err);
    res.status(500).json({ error: 'Database deletion failed.' });
  }
});

// 4. GET dynamic layout stats & history configurations for analytics from SQLite
app.get('/api/analytics', requireAdminAuth, (req, res) => {
  try {
    const database = initDB();

    // Query 1. Total page views count (from real tracked page_visits rows)
    const pvObj = database.prepare("SELECT COUNT(*) as count FROM page_visits").get() as { count: number };
    const pageViews = pvObj.count;

    // Query 2. Unique visitors count
    const uvObj = database.prepare("SELECT COUNT(DISTINCT sessionId) as count FROM page_visits").get() as { count: number };
    const uniqueVisitors = uvObj.count;

    // Query 3. Total visitors count (let's use unique view sessions as baseline)
    const totalVisitors = uniqueVisitors;

    // Query 4. Get active articles, drafts, subscribers, and contact messages
    const articlesCountObj = database.prepare("SELECT COUNT(*) as count FROM articles").get() as { count: number };
    const draftsCountObj = database.prepare("SELECT COUNT(*) as count FROM articles WHERE status = 'Draft'").get() as { count: number };
    const subscribersCountObj = database.prepare("SELECT COUNT(*) as count FROM subscribers").get() as { count: number };
    const messagesCountObj = database.prepare("SELECT COUNT(*) as count FROM contact_messages").get() as { count: number };
    const unreadMessagesCountObj = database.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE isRead = 0").get() as { count: number };

    // Query 5. Build dynamic visitorHistory by retrieving counts grouped by dayOfWeek
    const historyRows = database.prepare(`
      SELECT dayOfWeek, COUNT(*) as count 
      FROM page_visits 
      GROUP BY dayOfWeek
    `).all() as { dayOfWeek: string; count: number }[];

    // Ensure all days of the week are represented in the history response to prevent graph breakage
    const daysOrdered = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const historyMap = new Map<string, number>();
    daysOrdered.forEach(d => historyMap.set(d, 0));
    historyRows.forEach(row => {
      if (historyMap.has(row.dayOfWeek)) {
        historyMap.set(row.dayOfWeek, row.count);
      }
    });

    const visitorHistory = daysOrdered.map(day => ({
      day,
      count: historyMap.get(day) || 0
    }));

    const stats: VisitorStats = {
      totalVisitors,
      uniqueVisitors,
      pageViews,
      visitorHistory
    };

    res.json({
      stats,
      totalArticles: articlesCountObj.count,
      draftsCount: draftsCountObj.count,
      subscribersCount: subscribersCountObj.count,
      messagesCount: messagesCountObj.count,
      unreadMessagesCount: unreadMessagesCountObj.count
    });
  } catch (err) {
    console.error("SQL Analytics failed:", err);
    res.status(500).json({ error: "Analytics sync failure." });
  }
});

// 4.5. POST log a live page or essay view in SQLite page_visits table
app.post('/api/track-view', (req, res) => {
  try {
    const database = initDB();
    const { path, sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId parameter is required' });
    }

    const id = Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toISOString();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = days[new Date().getDay()];

    database.prepare(`
      INSERT INTO page_visits (id, sessionId, path, timestamp, dayOfWeek)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, sessionId, path || '/', timestamp, dayOfWeek);

    // If viewing an individual article essay, update the views column of that article in the database to be 100% real
    if (path && path.startsWith('/post/')) {
      const slug = path.substring(6); // Remove "/post/" prefix
      if (slug) {
        // Compute and update views dynamically from page_visits to ensure 100% match
        database.prepare(`
          UPDATE articles 
          SET views = (SELECT COUNT(*) FROM page_visits WHERE path = ?) 
          WHERE slug = ?
        `).run(path, slug);

        // Instantly invalidate caches so changes are immediately clean to visitors and admin dashboards
        apiCache.clear();
      }
    }

    res.json({ success: true, message: 'View tracked successfully.' });
  } catch (err) {
    console.error("SQL dynamic page tracking failed:", err);
    res.status(500).json({ error: 'Internal tracking failed.' });
  }
});

// 5. POST news subscription in SQLite
app.post('/api/subscribe', (req, res) => {
  try {
    const database = initDB();
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    database.prepare("INSERT OR IGNORE INTO subscribers (email, timestamp) VALUES (?, ?)").run(email, new Date().toISOString());

    res.json({ success: true, message: 'Subscribed to Weekly Insight!' });
  } catch (err) {
    console.error("SQL Subscriber error:", err);
    res.status(500).json({ error: "Subscription pipeline failure." });
  }
});

// 6. POST Submit Contact Form Message
app.post('/api/contact', (req, res) => {
  try {
    const database = initDB();
    const { name, email, subject, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: 'Valid email and message body are required' });
    }

    const id = Date.now().toString();
    const timestamp = new Date().toISOString();

    database.prepare(`
      INSERT INTO contact_messages (id, name, email, subject, message, timestamp, isRead)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(id, name || '', email, subject || '', message, timestamp);

    res.json({ success: true, message: 'Your message has been safely received.' });
  } catch (err) {
    console.error("SQL Support contact submit failed:", err);
    res.status(500).json({ error: "Contact delivery pipeline crashed." });
  }
});

// 7. GET All Contact Form Messages (Admin Secured)
app.get('/api/contact', requireAdminAuth, (req, res) => {
  try {
    const database = initDB();
    const messages = database.prepare("SELECT * FROM contact_messages ORDER BY timestamp DESC").all() as any[];
    const mapped = messages.map(m => ({
      ...m,
      isRead: m.isRead === 1
    }));
    res.json(mapped);
  } catch (err) {
    console.error("SQL Support messages fetch failed:", err);
    res.status(500).json({ error: "Could not fetch customer messages." });
  }
});

// 8. POST Mark Contact Message as Read (Admin Secured)
app.post('/api/contact/:id/read', requireAdminAuth, (req, res) => {
  try {
    const database = initDB();
    const { id } = req.params;
    database.prepare("UPDATE contact_messages SET isRead = 1 WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    console.error("SQL Read flag update failed:", err);
    res.status(500).json({ error: "Could not edit message state." });
  }
});

// 9. DELETE Contact Message (Admin Secured)
app.delete('/api/contact/:id', requireAdminAuth, (req, res) => {
  try {
    const database = initDB();
    const { id } = req.params;
    database.prepare("DELETE FROM contact_messages WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    console.error("SQL Message deletion failed:", err);
    res.status(500).json({ error: "Could not remove message entry." });
  }
});

// 10. Dynamic robots.txt
app.get('/robots.txt', (req, res) => {
  const host = req.headers.host || 'llmreviewpro.com';
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const isDevOrPreview = host.includes('ais-dev-') || host.includes('ais-pre-') || host.includes('localhost') || host.includes('127.0.0.1');
  const baseUrl = isDevOrPreview ? `${protocol}://${host}` : 'https://llmreviewpro.com';
  
  res.type('text/plain');
  res.send(`# ==========================================
# Content Signals for AI & Search Compliance
# ==========================================
# search:yes | ai-train:no

User-agent: *
Content-Signal: search=yes,ai-train=no
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /login/

# ==========================================
# Block Aggressive AI Crawlers & Scrapers
# ==========================================
User-agent: Amazonbot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CloudflareBrowserRenderingCrawler
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: meta-externalagent
Disallow: /

# ==========================================
# Sitemap Location
# ==========================================
Sitemap: ${baseUrl}/sitemap.xml
`);
});

// 11. Dynamic ads.txt for high compliance with Google AdSense crawler
app.get('/ads.txt', (req, res) => {
  const pubId = process.env.ADSENSE_PUB_ID || 'pub-xxxxxxxxxxxxxxxx';
  res.type('text/plain');
  res.send(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`);
});

// 12. Dynamic sitemap.xml for SEO indexing optimization
app.get('/sitemap.xml', (req, res) => {
  try {
    const cacheKey = 'dynamic_sitemap_xml';
    const cachedSitemap = apiCache.get<string>(cacheKey);
    if (cachedSitemap) {
      res.type('application/xml');
      return res.send(cachedSitemap);
    }

    const database = initDB();
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const isDevOrPreview = host.includes('ais-dev-') || host.includes('ais-pre-') || host.includes('localhost') || host.includes('127.0.0.1');
    const baseUrl = isDevOrPreview ? `${protocol}://${host}` : 'https://llmreviewpro.com';

    const activeArticles = database.prepare("SELECT slug, publishedDate, createdAt FROM articles WHERE status = 'Published'").all() as any[];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>2026-06-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

    for (const art of activeArticles) {
      const artDate = art.publishedDate ? new Date(art.publishedDate).toISOString().split('T')[0] : '2026-06-07';
      xml += `
  <url>
    <loc>${baseUrl}/post/${art.slug}</loc>
    <lastmod>${artDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }

    xml += `\n</urlset>`;
    
    // Cache the XML sitemap layout for 1 hour to protect database cycles
    apiCache.set(cacheKey, xml, 3600000);

    res.type('application/xml');
    res.send(xml);
  } catch (err) {
    console.error("Failed to build dynamic XML sitemap:", err);
    res.status(500).send('<error>Could not generate sitemap</error>');
  }
});

// Dynamic SEO HTML renderer for full index.html meta tag injection and soft 404 elimination
function serveDynamicSEOHtml(req: express.Request, res: express.Response) {
  try {
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const isDevOrPreview = host.includes('ais-dev-') || host.includes('ais-pre-') || host.includes('localhost') || host.includes('127.0.0.1');
    const baseUrl = isDevOrPreview ? `${protocol}://${host}` : 'https://llmreviewpro.com';
    
    let requestPath = req.path;
    if (requestPath.length > 1 && requestPath.endsWith('/')) {
      requestPath = requestPath.slice(0, -1);
    }
    const canonicalUrl = `https://llmreviewpro.com${requestPath}`;

    // Prefer dist/index.html in production, fallback to root index.html
    let htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(process.cwd(), 'index.html');
    }
    
    if (!fs.existsSync(htmlPath)) {
      return res.status(500).send('HTML template not found');
    }

    let html = fs.readFileSync(htmlPath, 'utf8');

    // Default metadata
    let title = 'LLM Review Pro | Expert In-depth LLM Evaluations & Analysis';
    let description = 'Unbiased, analytical, and extremely thorough evaluations of large language models, AI frameworks, and creative generation tools.';
    let isArticle = false;
    let articleImage = '';
    let isNotFound = false;
    let isNoIndex = false;
    let bodyHtml = '';
    let preloadedArticleJson = '';
    let preloadedArticlesListJson = '';

    // Check path for specific dynamic values
    const database = initDB();
    if (requestPath.startsWith('/post/')) {
      const slug = requestPath.substring(6);
      if (slug) {
        const art = database.prepare("SELECT * FROM articles WHERE slug = ? AND status = 'Published'").get(slug) as any;
        if (art) {
          const articleData = {
            ...art,
            isFeatured: art.isFeatured === 1,
            tags: JSON.parse(art.tags || '[]')
          };
          title = art.seoTitle || art.title || title;
          description = art.seoDescription || art.summary || description;
          isArticle = true;
          articleImage = art.featuredImage || '';
          preloadedArticleJson = JSON.stringify(articleData).replace(/</g, '\\u003c');
          
          bodyHtml = `
  <div style="max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: Georgia, serif; line-height: 1.8; color: #2a2a28;">
    <header style="margin-bottom: 40px; border-bottom: 1px solid #eae9e6; padding-bottom: 30px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <p style="text-transform: uppercase; letter-spacing: 0.12em; color: #9a9994; font-weight: bold; font-size: 12px; margin: 0 0 10px 0;">${art.category || 'Evaluation'}</p>
      <h1 style="font-size: 38px; margin: 0 0 15px 0; color: #1a1a18; font-weight: 800; line-height: 1.2; letter-spacing: -0.01em;">${art.title}</h1>
      <p style="color: #7c7a72; font-size: 14px; margin: 0; font-style: italic; font-family: Georgia, serif;">By ${art.author || 'Editorial Staff'} • ${art.publishedDate || ''}</p>
    </header>
    ${art.featuredImage ? `<div style="margin-bottom: 40px;"><img src="${art.featuredImage}" alt="${art.title}" style="width: 100%; max-height: 450px; object-fit: cover; border-radius: 8px;" /></div>` : ''}
    <div style="font-size: 18px; color: #2a2a28;">
      ${art.content}
    </div>
  </div>`;
        } else {
          // Slug not found in database! Return 404 to avoid soft-404 SEO penalty
          isNotFound = true;
          title = 'Manuscript Not Found | LLM Review Pro';
          description = 'The requested manuscript could not be found or remains a draft inside the database.';
          
          bodyHtml = `
  <div style="text-align: center; padding: 80px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <h1 style="font-family: Georgia, serif; font-size: 32px; color: #1a1a18;">Manuscript lost in archives</h1>
    <p style="color: #7c7a72; margin-top: 10px;">The article with slug "${slug}" was not found or remains a draft.</p>
    <p style="margin-top: 30px;"><a href="/" style="display: inline-block; padding: 10px 20px; background-color: #1a1a18; color: #fcfbf9; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Return to Feed</a></p>
  </div>`;
        }
      }
    } else if (requestPath === '/about') {
      title = 'About Us | LLM Review Pro';
      description = 'Meet the expert evaluators and learn about our rigorous, independent benchmark methodology for analyzing frontier AI models.';
      bodyHtml = `
  <div style="max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: Georgia, serif; line-height: 1.8; color: #2a2a28;">
    <h1 style="font-size: 36px; margin-bottom: 20px; color: #1a1a18; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">About LLM Review Pro</h1>
    <p style="font-style: italic; font-size: 18px; color: #7c7a72; margin-bottom: 30px;">A modern sandbox for thoughtful LLM critiques, AI assessments, and minimal styling.</p>
    <p>We believe interfaces are written conversations. When reading high-fidelity explanations about hardware, algorithms, or traveling, your attention deserves protection from noisy layouts.</p>
    <p>Our team of analytical engineers runs rigorous, reproducible evaluations on frontier large language models, putting safety, speed, creativity, and reasoning to the test.</p>
  </div>`;
    } else if (requestPath === '/privacy') {
      title = 'Privacy Policy | LLM Review Pro';
      description = 'Read our privacy policy to understand how we protect user data and maintain absolute analytical integrity.';
      bodyHtml = `
  <div style="max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: Georgia, serif; line-height: 1.8; color: #2a2a28;">
    <h1 style="font-size: 36px; margin-bottom: 20px; color: #1a1a18; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Privacy Policy</h1>
    <p>Your privacy is of utmost priority. We do not track or monetize your search behaviors, prompts, or evaluations. This document outlines our data protection commitment.</p>
  </div>`;
    } else if (requestPath === '/terms') {
      title = 'Terms of Service | LLM Review Pro';
      description = 'Review our terms of service for accessing our evaluations, benchmark data, and API playgrounds.';
      bodyHtml = `
  <div style="max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: Georgia, serif; line-height: 1.8; color: #2a2a28;">
    <h1 style="font-size: 36px; margin-bottom: 20px; color: #1a1a18; font-weight: 800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Terms of Service</h1>
    <p>By accessing our evaluations, benchmarks, and sandboxes, you agree to comply with our academic use policy and attribute source credits correctly.</p>
  </div>`;
    } else if (requestPath === '/contact') {
      title = 'Contact Us | LLM Review Pro';
      description = 'Get in touch with our analytical team for reviews, partnerships, custom evaluations, or press inquiries.';
      bodyHtml = `
  <div style="max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; color: #2a2a28;">
    <h1 style="font-size: 36px; margin-bottom: 20px; color: #1a1a18; font-weight: 800; font-family: Georgia, serif;">Contact Us</h1>
    <p>Get in touch with our analytical team for reviews, partnerships, custom evaluations, or press inquiries. Reach us at info@llmreviewpro.com.</p>
  </div>`;
    } else if (requestPath === '/') {
      // Use default meta
      try {
        const activeArticles = database.prepare("SELECT * FROM articles WHERE status = 'Published' ORDER BY publishedDate DESC").all() as any[];
        const articlesList = activeArticles.map(art => ({
          ...art,
          isFeatured: art.isFeatured === 1,
          tags: JSON.parse(art.tags || '[]')
        }));
        preloadedArticlesListJson = JSON.stringify(articlesList).replace(/</g, '\\u003c');
        bodyHtml = `
  <div style="max-width: 1000px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfbf9; color: #1a1a18;">
    <header style="margin-bottom: 50px; text-align: center; border-bottom: 2px double #eae9e6; padding-bottom: 30px;">
      <h1 style="font-size: 42px; font-family: Georgia, serif; font-weight: 800; color: #1a1a18; margin: 0 0 10px 0; letter-spacing: -0.02em;">LLM Review Pro</h1>
      <p style="font-family: Georgia, serif; font-style: italic; color: #7c7a72; font-size: 16px; margin: 0 0 15px 0;">Journal of Rigorous Large Language Model Evaluations & Sandbox Benchmarks</p>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #9a9994; font-weight: bold;">Est. 2026 • Independence & Technical Rigor</div>
    </header>
    <main>
      <h2 style="font-size: 20px; font-family: Georgia, serif; font-style: italic; border-bottom: 1px solid #eae9e6; padding-bottom: 8px; color: #7c7a72; margin-bottom: 25px;">Latest Evaluation Manuscripts</h2>
      <div style="display: grid; gap: 40px;">
        ${activeArticles.map(art => `
          <article style="border-bottom: 1px solid #eae9e6; padding-bottom: 30px;">
            <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 0.12em; color: #9a9994; font-weight: bold; margin: 0 0 8px 0;">${art.category || 'General'}</p>
            <h3 style="margin: 0 0 12px 0; font-family: Georgia, serif; font-size: 24px; font-weight: 700; line-height: 1.2;">
              <a href="/post/${art.slug}" style="color: #1a1a18; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s;" onmouseover="this.style.borderColor='#1a1a18'" onmouseout="this.style.borderColor='transparent'">${art.title}</a>
            </h3>
            <p style="color: #4a4a48; line-height: 1.6; font-size: 15px; margin: 0 0 15px 0;">${art.summary || ''}</p>
            <p style="color: #7c7a72; font-size: 12px; margin: 0; font-family: Georgia, serif; font-style: italic;">By ${art.author || 'Editorial Staff'} • ${art.publishedDate || ''}</p>
          </article>
        `).join('')}
      </div>
    </main>
  </div>`;
      } catch (e) {
        console.warn("Failed to pre-render articles list:", e);
      }
    } else if (requestPath === '/login' || requestPath === '/admin' || requestPath === '/dashboard' || requestPath === '/editor') {
      title = 'Admin Workbench | LLM Review Pro';
      description = 'Administrative secure interface for managing essays, logs, and review drafts.';
      isNoIndex = true;
      bodyHtml = `
  <div style="text-align: center; padding: 100px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1a1a18;">Secure Admin Workbench</h1>
    <p style="color: #7c7a72; margin-top: 10px;">Authorization token required to load dashboard components.</p>
  </div>`;
    } else {
      // Unmapped random route
      isNotFound = true;
      title = 'Page Not Found | LLM Review Pro';
      description = 'The requested page does not exist on LLM Review Pro.';
      bodyHtml = `
  <div style="text-align: center; padding: 100px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <h1 style="font-family: Georgia, serif; font-size: 32px; color: #1a1a18;">Page Not Found</h1>
    <p style="color: #7c7a72; margin-top: 10px;">The requested URL does not exist on LLM Review Pro.</p>
    <p style="margin-top: 30px;"><a href="/" style="display: inline-block; padding: 10px 20px; background-color: #1a1a18; color: #fcfbf9; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Return to Feed</a></p>
  </div>`;
    }

    // Replace default <title> tag with specific title
    html = html.replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`);

    // Prepare SEO head tags
    let headTags = `
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="description" content="${description.replace(/"/g, '&quot;')}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${isArticle ? 'article' : 'website'}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
    `;

    if (articleImage) {
      headTags += `\n    <meta property="og:image" content="${articleImage}" />`;
    }

    headTags += `
    <!-- Twitter -->
    <meta property="twitter:card" content="${articleImage ? 'summary_large_image' : 'summary'}" />
    <meta property="twitter:url" content="${canonicalUrl}" />
    <meta property="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
    `;
    
    if (articleImage) {
      headTags += `\n    <meta property="twitter:image" content="${articleImage}" />`;
    }

    if (isNotFound) {
      headTags += `\n    <meta name="robots" content="noindex, follow" />`;
    } else if (isNoIndex) {
      headTags += `\n    <meta name="robots" content="noindex, nofollow" />`;
    }

    if (preloadedArticleJson) {
      headTags += `\n    <script id="preloaded-article" type="application/json">${preloadedArticleJson}</script>`;
    }
    if (preloadedArticlesListJson) {
      headTags += `\n    <script id="preloaded-articles" type="application/json">${preloadedArticlesListJson}</script>`;
    }

    // Inject before </head>
    html = html.replace('</head>', `${headTags}\n  </head>`);

    // Inject pre-rendered content inside the root div container
    html = html.replace('<div id="root" class="h-full"></div>', `<div id="root" class="h-full">${bodyHtml}</div>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, no-cache, must-revalidate');
    
    if (isNotFound) {
      res.status(404).send(html);
    } else {
      res.status(200).send(html);
    }
  } catch (err) {
    console.error("SEO html injection failed:", err);
    // Fallback safe rendering
    const distPath = path.join(process.cwd(), 'dist');
    let htmlPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(process.cwd(), 'index.html');
    }
    res.sendFile(htmlPath);
  }
}

// Start dev or production asset pipeline
async function serveApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    
    // Aggressive cache settings for Vite production static bundle hashed assets
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '365d',
      immutable: true,
      fallthrough: false
    }));

    // Standard short expiration caching for HTML router and assets in dist folder
    app.use(express.static(distPath, {
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, no-cache, must-revalidate');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=86400');
        }
      }
    }));

    app.get('*', serveDynamicSEOHtml);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express Editorial Server listening at http://localhost:${PORT}`);
  });
}

serveApp();

