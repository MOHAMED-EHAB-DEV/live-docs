export const heroData = {
  badge: "Real-Time Collaboration Engine 2.0",
  titleLine1: "Write Together.",
  titleLine2: "Think Faster.",
  subtitle:
    "A next-generation collaborative workspace engineered with sub-10ms CRDT synchronization, AST code highlighting, live threads, and instant permissions.",
  ctaPrimary: "Start Writing Free",
  ctaSecondary: "Explore Interactive Demo",
};

export const comparisonData = {
  title: "The Old Way vs. Live Docs",
  subtitle: "Say goodbye to merge conflicts, lost edits, and disconnected workflows.",
  oldWay: {
    title: "Traditional Document Tools",
    points: [
      "Merge conflicts and duplicate file versions ('doc_v2_final_FINAL.docx')",
      "Locked documents preventing simultaneous edits",
      "Clunky delayed comment threads scattered in email chains",
      "Slow polling that drains mobile battery and causes lag",
    ],
  },
  newWay: {
    title: "Live Docs Real-Time Platform",
    points: [
      "Sub-10ms conflict-free sync powered by Yjs CRDT algorithms",
      "Multiplayer live colored cursors & presence indicators",
      "Instant real-time comment threads with unread notification badges",
      "Direct WebSocket streams optimized for low-end devices & mobile",
    ],
  },
};

export const bentoFeatures = [
  {
    id: "collab",
    tag: "Multiplayer",
    title: "Real-Time CRDT Sync",
    description:
      "Collaborate simultaneously with zero locking. Color-coded presence cursors let you see teammates typing in real time.",
    span: "col-span-1 md:col-span-2",
    accent: "from-blue-500/20 to-purple-500/20 border-blue-500/30",
  },
  {
    id: "code",
    tag: "Developer Ready",
    title: "Syntax Highlighting & Themes",
    description:
      "Full AST highlighting across 14+ languages with VS Code Dark, One Dark, Dracula, and Cyberpunk themes.",
    span: "col-span-1",
    accent: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  },
  {
    id: "comments",
    tag: "Discussions",
    title: "Live Threads & Mobile Sheets",
    description:
      "Instant comment threads with live unread counter badges, delete permissions, and auto-scrolling mobile drawers.",
    span: "col-span-1",
    accent: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
  },
  {
    id: "security",
    tag: "Access Control",
    title: "Granular Role Permissions",
    description:
      "Instantly toggle roles between Document Owner, Editor, and Viewer with live permission gates.",
    span: "col-span-1 md:col-span-2",
    accent: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30",
  },
];

export const techStackData = [
  { name: "Next.js 16", desc: "React 19 App Router & Server Actions" },
  { name: "TipTap & ProseMirror", desc: "Headless extensible rich-text engine" },
  { name: "Yjs CRDTs", desc: "Conflict-free distributed state consensus" },
  { name: "Socket.IO & WS", desc: "Low-latency binary transport" },
  { name: "MongoDB & Mongoose", desc: "Scalable document persistence" },
  { name: "Tailwind CSS v4", desc: "Modern styling & RTL logical properties" },
];

export const faqData = [
  {
    question: "How does real-time collaboration work without conflicts?",
    answer:
      "Live Docs uses Yjs, a high-performance CRDT (Conflict-free Replicated Data Type) framework. Instead of locking documents or overwriting edits, operations are mathematically resolved in real-time across all connected clients with zero data loss.",
  },
  {
    question: "Is Live Docs mobile-friendly?",
    answer:
      "Yes! The editor features a responsive horizontal touch-scrolling toolbar, adaptive typography, and dedicated slide-up drawer sheets for comments on mobile and tablet screens.",
  },
  {
    question: "Can I customize code blocks and formatting?",
    answer:
      "Live Docs supports rich text formatting (bold, italic, underline, strikethrough, blockquotes, lists) and advanced code blocks with 14 programming languages, 5 developer syntax themes, and one-click copy.",
  },
  {
    question: "Who built Live Docs?",
    answer:
      "Live Docs is designed and engineered by Mohammed. Explore his portfolio and projects at mohammedehab.vercel.app.",
  },
];
