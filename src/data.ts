import { Article } from './types';

export const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'The Quiet Architecture of Functional Programming',
    slug: 'the-quiet-architecture-of-functional-programming',
    category: 'Programming',
    summary: 'Exploring how immutability and pure functions are reshaping modern frontend frameworks beyond the standard paradigm shift.',
    content: `
      <p class="mb-6 font-body-lg text-body-lg">
        In modern application development, we are constantly seeking ways to manage state more deterministically. The architectures that dominate our libraries have evolved from imperative mutations to declarative mappings. Beneath this shift lies a quiet revolution: functional programming paradigms, once relegated to academic literature, have become the standard structural blueprint for scalable software.
      </p>

      <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">The Essence of Immutability</h2>
      <p class="mb-4">
        By discarding standard point-in-time state alteration in favor of immutable facts, functional architectures completely eliminate race conditions, simplify concurrent rendering pipelines, and facilitate predictive debugging pathways.
      </p>

      <blockquote class="border-l-4 border-secondary px-8 py-4 my-12 bg-surface-container-low italic font-headline-md text-headline-md text-on-surface-variant">
        "Pure functions represent a contract of absolute predictability. Given the same inputs, they will yield the same outputs, safeguarding our application's cognitive flow."
      </blockquote>

      <h3 class="font-headline-md text-headline-md text-primary mt-10 mb-4">A Paradigm of Purity</h3>
      <p class="mb-6">
        When components remain stateless wrappers translating plain data properties into layout, testing is transformed from a tedious exercise in component environment mocking into straightforward, simple assert statements. State management becomes a centralized store that pipelines sequential revisions via action tracking.
      </p>
    `,
    author: 'Marcus Thorne',
    authorRole: 'Chief Editor & Lead Architect',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
    publishedDate: 'Oct 24, 2024',
    status: 'Published',
    isFeatured: true,
    featuredImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAET0iJerMYlZh90kPinVLhugn7k1P_n27WoRsXq4jR1uMbmK1dtAm5bcmPU-jLL_gGHAMIQNkV9n_aSQiZqvRJwg8jIVWQCGjiWrCAoUh8CA80JBEpxCL9KfX-TAefzon4NU6APpoNP4EIcg31Vkulc4JJwGaGjOH-qvQy3lBChvAnXXtWnT_67y-EC3xRMnA2SZIotUI3n_JfotJniiTVtqw5am0jwwQSR7TpLqz9Q0exajVslvVEmGXdYy40dyXeNURdPOYVBUTc',
    tags: ['Programming', 'Functional', 'Clean Code', 'Web Architecture'],
    views: 12402,
    readingTime: '12 min read',
    seoTitle: 'The Quiet Architecture of Functional Programming | LLM Review Pro',
    seoDescription: 'Discover how functional programming principles like immutability and state purity are driving modern frontend application architecture.',
    createdAt: '2024-10-24T10:00:00Z'
  },
  {
    id: '2',
    title: 'Beyond Components: The Quiet Revolution of Generative UI Systems',
    slug: 'beyond-components-the-quiet-revolution',
    category: 'Programming',
    summary: 'Exploring how modern writer-focused platforms are shifting from rigid templates to fluid, intent-driven layouts that respect the long-form reading experience.',
    content: `
      <p class="font-body-lg text-body-lg mb-8">
        In the landscape of modern web development, we've spent a decade perfecting the "component." We built design systems of atomic buttons, inputs, and cards. Yet, for the digital writer, these rigid structures often feel like a cage. The next frontier isn't just better components; it's the intelligence that arranges them.
      </p>

      <h2 class="font-headline-lg text-headline-lg text-primary mt-12 mb-6">The Minimalism of Thought</h2>
      <p class="font-body-lg text-body-lg mb-8">
        An editorial experience should be invisible. When you read a classic broadsheet, you don't notice the grid until it's broken. This "Quiet Luxury" in UI design demands that we prioritize vertical rhythm and white space above decorative flourishes.
      </p>

      <blockquote class="border-l-4 border-secondary px-8 py-4 my-12 bg-surface-container-low italic font-headline-md text-headline-md text-on-surface-variant">
        "Design is not just what it looks like and feels like. Design is how it works for the reader's cognitive flow."
      </blockquote>

      <h3 class="font-headline-md text-headline-md text-primary mt-10 mb-4">Implementing Fluid Logic</h3>
      <p class="font-body-lg text-body-lg mb-6">
        In our CMS, we've implemented a Python-driven layout engine that calculates the "visual weight" of a paragraph versus a code block. Below is a snippet of the core logic used to determine spacing ratios:
      </p>

      <!-- CODE BLOCK SYSTEM -->
      <div class="my-10 shadow-lg rounded-lg overflow-hidden border border-outline-variant font-sans">
        <div class="bg-[#131b2e] text-[#7c839b] px-4 py-2 font-mono text-xs flex justify-between items-center">
          <span>layout_engine.py</span>
          <div class="flex gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          </div>
        </div>
        <pre class="bg-[#131b2e] p-6 overflow-x-auto text-on-primary-container font-mono text-xs md:text-sm leading-relaxed text-[#7c839b]"><code class="text-indigo-200">def calculate_reading_rhythm(element_type, density_score):
    """
    Adjusts vertical margins based on the semantic weight 
    of the surrounding content.
    """
    baseline = 8  # 8px grid system
    
    if element_type == "HEADING_XL":
        return baseline * 12
    elif element_type == "CODE_BLOCK":
        return baseline * density_score
    
    return baseline * 4

# Execute layout shift
spacing = calculate_reading_rhythm("HEADING_XL", 1.5)
print(f"Applied spacing: {spacing}px")</code></pre>
      </div>

      <p class="font-body-lg text-body-lg mb-8">
        The results are striking. By dynamically adjusting margins, we reduce the "wall of text" effect that plagues many developer blogs.
      </p>

      <!-- COLUMN DETAILS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-12 items-center">
        <div class="rounded-xl overflow-hidden border border-outline-variant bg-surface-container-high aspect-square">
          <img alt="Minimalist writing tool" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCq8--XXHy8bm1Wlllct9ReGhQQMMuOAzuEnravN9Nfhvc2kf3zgopjDcVmSD9sBNobrojLZ8neKewK7E7FI324m9UKhwxtmthh-gmnCrqIEZlb4O2oGOMRlGhAt9LyoI87QLs5AAFhy4NypP9HKXmczdh_fudcpGH0K3V_T_6H85sE8vezqbe8yCfRPfNz9RI1i8k8G7snenySuNkie5V7ZcRGr-SpaSQrNskOrsmY_wtwculdk3K1NwEx9f7I3UEMF97b88pEYD60"/>
        </div>
        <div class="flex flex-col justify-center p-8 bg-surface-container-low border border-outline-variant rounded-xl h-full">
          <h4 class="font-headline-md text-headline-md text-primary mb-4">Tactile Digitalism</h4>
          <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Our goal was to translate the physical sensation of high-quality stationery into a digital interface. This meant focusing on subtler gradients and high-contrast typography.
          </p>
          <ul class="mt-6 space-y-3 font-sans">
            <li class="flex items-center gap-3 text-label-md font-label-md text-on-surface-variant">
              <span class="text-secondary text-base">✓</span>
              Newsreader for elegant serifs
            </li>
            <li class="flex items-center gap-3 text-label-md font-label-md text-on-surface-variant">
              <span class="text-secondary text-base">✓</span>
              Inter for technical precision
            </li>
            <li class="flex items-center gap-3 text-label-md font-label-md text-on-surface-variant">
              <span class="text-secondary text-base">✓</span>
              8px Baseline grid alignment
            </li>
          </ul>
        </div>
      </div>

      <!-- VIDEO EMBED PRESENTATION -->
      <div class="my-16 rounded-xl overflow-hidden bg-[#131b2e] aspect-video relative group border border-outline-variant shadow-xl cursor-pointer">
        <div class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all z-10">
          <div class="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-white shadow-2xl scale-100 group-hover:scale-110 transition-all">
            <span class="text-2xl ml-1">▶</span>
          </div>
        </div>
        <img alt="Video Preview" class="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJZdR4eGOLeBhe2gsmwbu-DNxN2sqjXItINa5Y8NDvGoIo4GMTVkAh_A4vP-SJ5MBERq1znE3smp8LQcAAhK8dslb7OEvFs0AUjmOFLdDdhKRKZfFEVY9LexyEb4BCnXLCuvbWRYLfujd98DSZJHURKCvetiy9aHi7V2rWhq9FXiO0U6ZmoaxxWlgVPiTww-WZSTKT7hoV5ALX5DR1kAixZ-De3Yrse3P6oklyMJTAnSX1aGg0C6XowYx_q2kPWJd9uZwlkA-7eZUq"/>
        <div class="absolute bottom-6 left-6 text-white z-10 font-sans">
          <p class="font-label-sm text-xs uppercase tracking-widest opacity-80 mb-1">Watch Presentation</p>
          <p class="font-headline-md text-headline-md font-serif text-lg md:text-xl">The 2024 Design Manifesto</p>
        </div>
      </div>

      <p class="font-body-lg text-body-lg mb-12">
        As we move forward, the role of the designer shifts from creating fixed pages to creating systems of intent. The blog post is no longer a static document; it is a living conversation between the author's words and the system's presentation.
      </p>
    `,
    author: 'Julian Thorne',
    authorRole: 'Senior Design Engineer & Columnist',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCQCtbsQ8SHLsN4khkM_n2jjnja2yfo7YwY_I7cRrIr_XQ3DGQLOBUp4uhyny-iLKiTEr3SJcIF8vSPdMyql1d00MBmQooV1KdFl9PG0qUY51QGNpsni1PESBQTn5Yf3TbzMlUjgqptnX6y-JhHYX0Bp0JdbkVi0jH1dX32M39uKSJQINpX4KaJJN57u6mtLQu2faiZIYbtfLo8aJI9nQ0ERtD2R-eYwh33RjgIisNLlGIvAnot6XycyMmhl1yDItFPUmGDU5ywjjl',
    publishedDate: 'Oct 24, 2023',
    status: 'Published',
    isFeatured: false,
    featuredImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7k9rlRr78j1nWS1_0yFRlMUMkQ1uFkIwe6rS-b-jNcqOrZtHX8XuwNDVrjs11sAb1ey1VQC12qFRfzXTx59gfydrQxbDB7slbTIhnVodl1YMzvLuHR1Ue55Y5xcVPuNiC9q265tTdZeNo9BTwmLVNc-nlHK4YLefy9Ux5-FbvktavlaYS6Vf02JKpCFQ9jJOVHEYKS7PKCeAi4XCjNYTvDlZ9IBnfyd_AZb2Efy_2pBdYnjaco1e41kY3YaZEKKmbSYxNIP8rr1We',
    tags: ['UXDesign', 'Frontend', 'Editorial', 'Typography'],
    views: 8119,
    readingTime: '8 min read',
    seoTitle: 'Beyond Components: The Quiet Revolution of Generative UI Systems',
    seoDescription: 'Exploring how modern writer platforms are shifting from templates to fluid layouts powered by intent-driven designs.',
    createdAt: '2023-10-24T08:00:00Z'
  },
  {
    id: '3',
    title: 'The Security Implications of Edge Computing',
    slug: 'the-security-implications-of-edge-computing',
    category: 'Tech',
    summary: 'As we move processing power closer to the user, the attack surface expands. Here’s how to secure the distributed frontier.',
    content: `
      <p class="font-body-lg text-body-lg mb-6">
        Edge computing solves latency by drawing infrastructure closer to localized devices. However, removing centralization fractures security models.
      </p>
      <p>
        Securing hundreds of edge machines requires a shift to zero-trust networks, automated container auditing, and hardware-level root of trust keys.
      </p>
    `,
    author: 'Marcus Thorne',
    authorRole: 'Chief Editor',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
    publishedDate: 'Nov 12, 2024',
    status: 'Published',
    isFeatured: false,
    featuredImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWeQ8kjo8STnE1mO9JHgMswUpXBLR31Klw9Ad_l2jc-BzjlGn1aoXszqExcUgKCMXW1nqoy43R8PpQmoUeMPZBhbrN8p7x61Th0ekJdOlAkcgFhaTo8QS_TL1QEwmoU7Ifws7vWQe47vhvfjYBxdgqOFcSzyIzZfllI-WTS1pFYKj91iQmEXjASPcbuKMgBqFMuREVAgJbP2gsHGnyAWnu9Lb66-l_XLX-4QxU7aUMTY6dP2mUA0bWdf-M1vBD6FztuQOufU_SfOY9',
    tags: ['Tech', 'EdgeComputing', 'Security', 'DevOps'],
    views: 4210,
    readingTime: '6 min read',
    seoTitle: 'Edge Computing Security Risks & Solutions | LLM Review Pro',
    seoDescription: 'Discover the distinct cybersecurity risks brought by server distribution and the top solutions for securing edge infrastructures.',
    createdAt: '2024-11-12T12:00:00Z'
  },
  {
    id: '4',
    title: 'TypeScript 5.0 and Beyond',
    slug: 'typescript-5-0-and-beyond',
    category: 'Programming',
    summary: 'A deep dive into the new decorator proposal and how it changes our approach to metaprogramming in large-scale apps.',
    content: `
      <p class="font-body-lg text-body-lg mb-6">
        Decorators are finally a standard parts of ECMAScript. TypeScript 5.0 introduces native support for highly performant, standard-based decorator patterns.
      </p>
      <p>
        By moving away from experimental flags, decorators offer clean routes to track measurements, handle transactions, and enforce runtime assertions easily.
      </p>
    `,
    author: 'Julian Thorne',
    authorRole: 'Senior Design Engineer',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCQCtbsQ8SHLsN4khkM_n2jjnja2yfo7YwY_I7cRrIr_XQ3DGQLOBUp4uhyny-iLKiTEr3SJcIF8vSPdMyql1d00MBmQooV1KdFl9PG0qUY51QGNpsni1PESBQTn5Yf3TbzMlUjgqptnX6y-JhHYX0Bp0JdbkVi0jH1dX32M39uKSJQINpX4KaJJN57u6mtLQu2faiZIYbtfLo8aJI9nQ0ERtD2R-eYwh33RjgIisNLlGIvAnot6XycyMmhl1yDItFPUmGDU5ywjjl',
    publishedDate: 'Dec 05, 2024',
    status: 'Published',
    isFeatured: false,
    featuredImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGPO6D_c5grCKMdyLTx8wH1rQgCOOeP7SaHk7S0slTHRZOLl_Y-zoXnTLtvln1FmpJa1j3udgmO1OxIQPyuX07vEMiL8N7HUUSPFXRsLK6cdK0I4QtpNmGRNMIOz-cVk3egCf7UWpyvYKxihdgzpdekA9PO1tftPWHdqUPl3AE3PtotBX1Hd3Pas1_mODEo3uX12f8mMxEVtukNt6IFYDahZMnKlcbD-oTeeviBbnuulQTVvL4hruq00T5ecgjM9T0uRre0PF-tzFk',
    tags: ['Programming', 'TypeScript', 'Metaprogramming', 'WebDevelopment'],
    views: 8940,
    readingTime: '9 min read',
    seoTitle: 'TypeScript 5.0 New Decorator Guide | LLM Review Pro',
    seoDescription: 'Master modern ECMA standard decorators introduced natively in TS 5.0 with code illustrations and practical design patterns.',
    createdAt: '2024-12-05T09:00:00Z'
  },
  {
    id: '5',
    title: 'Finding Stillness in Kyoto',
    slug: 'finding-stillness-in-kyoto',
    category: 'Travel',
    summary: 'Reflecting on the intersection of ancient traditions and the frantic pace of digital life during a month-long sabbatical.',
    content: `
      <p class="font-body-lg text-body-lg mb-6">
        Walking through the moss-covered gardens of Kyoto, the persistent noise of digital notifications begins to dissolve.
      </p>
      <p>
        In a world defined by the speed of execution, Kyoto is a celebration of pause. The deliberate structures, Zen rock configurations, and historical temples are physical testaments to mindful layout.
      </p>
    `,
    author: 'Marcus Thorne',
    authorRole: 'Chief Editor',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
    publishedDate: 'Jan 15, 2025',
    status: 'Published',
    isFeatured: false,
    featuredImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJlRoFh60SCZ46aXatKdWrj9qeoDlIiTWMgmMkJ_8sEK_0elW37511V_e3HC_TryqnjdqqWHTz_pz5U8s3_6tCfls-pKGCpZYREeUUqZgiffwdzqEP5E8p03dtkQ-VtaK0goSu_Q6jLxTBGIhYHNUi7eBiAH8Irga_n4kuPECrewgIV2jVnr6p6S9bAQK-JJGeFqEE0j22aNZf-Bo5LGk-kHZ_XtBkahOmVVu6EF_Cez_vGp-5ybbEeN4ejJOfVVMW7Svnevu_ddpP',
    tags: ['Travel', 'Kyoto', 'Mindfulness', 'Sabbatical'],
    views: 3205,
    readingTime: '5 min read',
    seoTitle: 'My Kyoto Sabbatical Mindful Reflections | LLM Review Pro',
    seoDescription: 'Read about Zen aesthetics, quiet garden paths, and finding focus outside of the technology pipeline in historic Kyoto, Japan.',
    createdAt: '2025-01-15T15:00:00Z'
  },
  {
    id: '6',
    title: 'The Language of Shadows',
    slug: 'the-language-of-shadows',
    category: 'Photography',
    summary: 'How to use negative space and harsh shadows to create compelling urban street photography that tells a story.',
    content: `
      <p class="font-body-lg text-body-lg mb-6">
        When we compose an image, our instinct is to seek the light. Yet, the story is often written in what remains dark.
      </p>
      <p>
        By leveraging heavy midday shadows and stark highlights, photographic compositions gain dramatic depth and direct the observer's absolute gaze.
      </p>
    `,
    author: 'Marcus Thorne',
    authorRole: 'Chief Editor',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
    publishedDate: 'Feb 18, 2025',
    status: 'Published',
    isFeatured: false,
    featuredImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_pT0ygBAD2ZupBRoyekzxPwyh9zNPxU6xjV_CdyZPc_zFUfFjvJVVb70z5NdgEE0xRlPDg99Pts7n2z8L3T2GWNb7zMKYzRQmAs_CFt9SiPCRZoj8U_qH7nLNbcX_cwsh1cb6ni1TBFSU8yGpgTSrmanBOe0E6CGh7-KQ1XclpAEyfNsWapd_1Cx6iFB5kYhz72YtAOTmdRkJPpF2ubiC3h6mpgZ7R_9jlSDCoMi0Zf9sJlPhq-nbew2MTaJpE7tBDfTUK_LWCK_j',
    tags: ['Photography', 'StreetArt', 'Composition', 'ShadowWork'],
    views: 1852,
    readingTime: '7 min read',
    seoTitle: 'Chiaroscuro & Shadow Composition in Photography | LLM Review Pro',
    seoDescription: 'Explore advanced photography guidelines on how to harness contrast, exposure bias, and deep negative space to craft outstanding visual narratives.',
    createdAt: '2025-02-18T18:00:00Z'
  },
  {
    id: '7',
    title: 'The Pythonic Path to Scalability',
    slug: 'the-pythonic-path-to-scalability',
    category: 'Programming',
    summary: 'How we migrated our legacy core to a modern microservices architecture without losing data.',
    content: `
      <p class="font-body-lg text-body-lg mb-6">
        When a monolithic codebase matures, team velocity often encounters frictional overhead. Python offers elegant options via modular package distributions.
      </p>
      <p>
        By splitting critical logic pipelines into distinct gRPC services and utilizing asynchronous worker loops, we scaled our application to handle millions of queries securely.
      </p>
    `,
    author: 'Julian Thorne',
    authorRole: 'Senior Design Engineer',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCQCtbsQ8SHLsN4khkM_n2jjnja2yfo7YwY_I7cRrIr_XQ3DGQLOBUp4uhyny-iLKiTEr3SJcIF8vSPdMyql1d00MBmQooV1KdFl9PG0qUY51QGNpsni1PESBQTn5Yf3TbzMlUjgqptnX6y-JhHYX0Bp0JdbkVi0jH1dX32M39uKSJQINpX4KaJJN57u6mtLQu2faiZIYbtfLo8aJI9nQ0ERtD2R-eYwh33RjgIisNLlGIvAnot6XycyMmhl1yDItFPUmGDU5ywjjl',
    publishedDate: 'Mar 10, 2025',
    status: 'Published',
    isFeatured: false,
    featuredImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCa-rRGGWjFFiLuV1_r00DgOhi3grufIt2ZFOUjpeOVo51bnlNWW89BZ3PcFPQhA-HZnkbnwPvjVrSamY-GD1kEnYfbYXcXz4VhX4PniTMpRZGgtYmGyHPGZY5iomzGWQa4FCIZuRaaVQ9Ud-Wp9W-vcfUYqW5rnGIMTB4RrJ96pNNNuhHGNtStcMIa2Ye7WG5OkDVDBRQhPuUAzUkbXte1dY7QRCeiAS7B-fguAdBvMRlt4YUr9rWO2c1AiRlOrICYEAHi6dI1JYUB',
    tags: ['Programming', 'Python', 'Microservices', 'SystemDesign'],
    views: 5691,
    readingTime: '9 min read',
    seoTitle: 'Legacy Code to Python Microservices Migration | LLM Review Pro',
    seoDescription: 'Step-by-step case study detailing how our design team partitioned monolithic routines into scalable asynchrononous routines in Python.',
    createdAt: '2025-03-10T11:00:00Z'
  },
  {
    id: '8',
    title: 'Legacy Tools in a Modern Era',
    slug: 'legacy-tools-in-a-modern-era',
    category: 'Tech',
    summary: 'Why the resurgence of mechanical keyboards and analogue tools is helping digital focus.',
    content: `
      <p class="font-body-lg text-body-lg mb-6">
        As keyboards became paper-thin and interfaces grew entirely luminous, our relationship with touch suffered a silent dilution.
      </p>
      <p>
        The mechanical key stroke provides explicit sensory acknowledgement, grounding the creative process and boosting focus metrics by 30%.
      </p>
    `,
    author: 'Julian Thorne',
    authorRole: 'Senior Design Engineer',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCQCtbsQ8SHLsN4khkM_n2jjnja2yfo7YwY_I7cRrIr_XQ3DGQLOBUp4uhyny-iLKiTEr3SJcIF8vSPdMyql1d00MBmQooV1KdFl9PG0qUY51QGNpsni1PESBQTn5Yf3TbzMlUjgqptnX6y-JhHYX0Bp0JdbkVi0jH1dX32M39uKSJQINpX4KaJJN57u6mtLQu2faiZIYbtfLo8aJI9nQ0ERtD2R-eYwh33RjgIisNLlGIvAnot6XycyMmhl1yDItFPUmGDU5ywjjl',
    publishedDate: 'Apr 02, 2025',
    status: 'Published',
    isFeatured: false,
    featuredImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIAnQXWOyWFtSLDnqufo0Jfuob3wLDdJxXpmDwibGEWYbP_o339DBUvjkdVdpEAbiE0eh0t3EnF1UM7drM7FqGVVptF83KeWoBqWHrOYuygF5l4HCozK1_95rv25Ac2U2JR8fdY862RQO7CZ8bSRaQUfDBh4hyW_jk2tLvxGx80svzu1dMFMGH7Eq24MMoN7o5kCpMSGh3BHChMpzyQ7uvUAuhi7o7NGVo5ufc2K66-PPzr1Okyxqh_SDQs_qXMdUmDEOy8CUXb91h',
    tags: ['Tech', 'MechanicalKeyboards', 'Focus', 'AnalogueTools'],
    views: 4099,
    readingTime: '6 min read',
    seoTitle: 'Sensory Haptics: The Mechanical Keyboards Revival | LLM Review Pro',
    seoDescription: 'Find out why mechanical typing and static journaling are trending upwards inside modern deep focus engineering labs.',
    createdAt: '2025-04-02T14:00:00Z'
  },
  {
    id: '9',
    title: 'Capturing Negative Space',
    slug: 'capturing-negative-space',
    category: 'Photography',
    summary: 'A masterclass in using empty areas to drive viewer focus in architectural photography.',
    content: `
      <p class="font-body-lg text-body-lg mb-6">
        Great design is characterized by what we elect to omit. In architectural photography, empty space is structurally functional.
      </p>
      <p>
        By giving structures room to breathe, negative space highlights functional geometry, shadows, and natural balances in breathtaking fashion.
      </p>
    `,
    author: 'Marcus Thorne',
    authorRole: 'Chief Editor',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5vTgbsr1E8Hhy4Y-JjHUZfuVLzXs5nqz51rwxSXGwSn0Z_w-lwx6mY7BRE0kJ8stMNUsoEm616tggpFxo-lGs9kyZhfYlRahxysK0tEVrhkm_6XFO1_NPP5NX_NTDeS5SSCgS4oZ2NDJXw10D0o_aCYUSbV4PdAEdMOCtZulbggSlMUQ-Sk12p4p-TJ8CUSNBkNZRq2srjgHvnggNnjig4JMj8pGNIh58FtOhe-tRfJSyEmuxZlIej-kTDMFuOzUvdXaGleArmuM7',
    publishedDate: 'May 16, 2025',
    status: 'Published',
    isFeatured: false,
    featuredImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvwCzAbGEKPVE6gcQU3tQaNhn5YQ-ATG4iM17Q9IsvYvuxJ5rzDIkMSAtnAwd2bcLODYST51A_O1xU03i7JDrkt24RWSgzU4ifHT917TB1iD6weHOGt88f4dr6K-krvrjkNzUBF7bUSmd4Ri82wDR46yCrjS-mYwUtk1qLxyOnkf58girSRE27TT8Ttf0PlS8pektsr9_Z1mxdk5ZCE3zYZuszNuhNwOBaMJKd8p9UflW-7ETjy3lGQ6hAli7aXw8fnQOzg90R9iYa',
    tags: ['Photography', 'Architecture', 'NegativeSpace', 'Minimalism'],
    views: 3712,
    readingTime: '8 min read',
    seoTitle: 'Architectural Framing and Negative Space | LLM Review Pro',
    seoDescription: 'Master negative space compositions inside modern architectural spaces with flat perspectives and minimal frame weight.',
    createdAt: '2025-05-16T10:00:00Z'
  }
];
