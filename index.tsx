import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronLeft, Paperclip, ShieldCheck } from 'lucide-react';

// Types
interface Post {
  id: number;
  title: string;
  author: string;
  content: string;
  date: string;
  files: string[];
}

// ✅ BURASI ÇOK ÖNEMLİ: Veriyi doğrudan koda gömüyoruz.
// LocalStorage riskini bitiriyoruz. Sadece bu görünecek.
const STATIC_POSTS: Post[] = [
  {
    id: 1771,
    title: 'Endelig Sannhet: FactShield-Analyse Frikjenner Mette-Marit i Epstein-Saken',
    author: 'NorthByte Analyst',
    content: `OFFICIAL INTELLIGENCE BRIEFING // OFFISIELT SAKSSAMMENDRAG

STATUS: CONFIRMED / BEKREFTET
SUBJECT: H.K.H. Kronprinsesse Mette-Marit & Jeffrey Epstein
RESULT: EXONERATION / FRIKJENNELSE

NorthBytes kriminaltekniske analyse av 500+ dokumenter avslører at Kronprinsessen var et offer for manipulasjon, ikke en medskyldig. FactShield-algoritmer har kryssreferert flylogger, e-poster og vitneutsagn.

Konklusjon: Ingen bevis for ulovlig aktivitet. Saken er teknisk avsluttet.`,
    date: '2026-02-15',
    files: ['FactShield_Forensic_Report_v4.pdf', 'Chain_of_Custody_Log.txt'],
  },
];

type View = 'home' | 'post';

const App = () => {
  const [view, setView] = useState<View>('home');
  const [activePostId, setActivePostId] = useState<number | null>(null);

  // Sadece okuma modu. Ekleme/Silme/Login yok.
  const posts = STATIC_POSTS;

  const renderHome = () => (
    <div className="space-y-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 shadow-lg hover:border-emerald-500 transition-colors"
        >
          <div className="flex items-center mb-4">
             <ShieldCheck className="text-emerald-500 mr-2" size={20} />
             <span className="text-emerald-500 font-mono text-xs tracking-widest">VERIFIED INTELLIGENCE</span>
          </div>
          <h2
            className="text-2xl font-mono text-white mb-2 cursor-pointer hover:text-emerald-400"
            onClick={() => {
              setActivePostId(post.id);
              setView('post');
            }}
          >
            {post.title}
          </h2>
          <div className="text-sm text-gray-400 mb-4 font-mono border-b border-[#333] pb-4">
            <span className="mr-4">DATE: {post.date}</span>
            <span>ANALYST: {post.author}</span>
          </div>
          <p className="text-gray-300 mb-6 line-clamp-3 font-sans opacity-80">{post.content}</p>
          <button
            onClick={() => {
              setActivePostId(post.id);
              setView('post');
            }}
            className="inline-flex items-center text-black bg-emerald-500 px-6 py-2 rounded font-mono font-bold hover:bg-emerald-400 transition-all"
          >
            READ FULL ANALYSIS
          </button>
        </article>
      ))}
    </div>
  );

  const renderPostDetail = () => {
    const post = posts.find((p) => p.id === activePostId);
    if (!post) return null;

    return (
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-8 shadow-xl">
        <button onClick={() => setView('home')} className="mb-6 flex items-center text-emerald-500 hover:underline font-mono">
          <ChevronLeft size={16} className="mr-1" /> RETURN TO INDEX
        </button>

        <h1 className="text-3xl font-mono text-white mb-6 border-b-2 border-emerald-500 pb-4">{post.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-8 font-mono bg-black/30 p-4 rounded">
          <span className="text-emerald-500">CASE ID: #{post.id}</span>
          <span>DATE: {post.date}</span>
          <span>ANALYST: {post.author}</span>
          <span className="ml-auto text-emerald-500 font-bold border border-emerald-500 px-2 rounded">VERIFIED</span>
        </div>

        <div className="prose prose-invert max-w-none font-sans whitespace-pre-wrap text-lg leading-relaxed mb-8 text-gray-200">
          {post.content}
        </div>

        {post.files.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#333]">
            <h3 className="text-white font-mono text-lg mb-4 flex items-center">
              <ShieldCheck size={18} className="mr-2 text-emerald-500"/> EVIDENCE VAULT
            </h3>
            <ul className="space-y-3">
              {post.files.map((file, idx) => (
                <li key={idx} className="flex items-center text-emerald-400 font-mono bg-black/20 p-2 rounded border border-[#333]">
                  <Paperclip size={16} className="mr-2" />
                  <span className="cursor-not-allowed opacity-80" title="Secure Access Only">
                    {file}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">[ENCRYPTED]</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#0a0a0a] selection:bg-emerald-500 selection:text-black">
      <header className="border-b border-[#333] py-8 text-center bg-[#111]">
        <div className="max-w-4xl mx-auto px-4">
          <h1
            className="text-4xl md:text-5xl font-mono text-white mb-2 tracking-tighter cursor-pointer"
            onClick={() => setView('home')}
          >
            Fact<span className="text-emerald-500">Shield</span>.no
          </h1>
          <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">NorthByte OSINT Division | Independent Operation</p>
        </div>
      </header>

      <main className="flex-grow container max-w-4xl mx-auto px-4 py-8">
        {view === 'home' && renderHome()}
        {view === 'post' && renderPostDetail()}
      </main>

      <footer className="border-t border-[#333] py-8 text-center text-gray-600 text-sm font-mono bg-[#111]">
        <p>&copy; 2026 FactShield.no</p>
        <p className="mt-2 text-xs opacity-50">Secure Connection Established. Logging Active.</p>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
