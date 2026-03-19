"use client";
import { useState, useRef, useEffect } from 'react';
type Html2Pdf = typeof import('html2pdf.js');
let html2pdfInstance: any = null;

const sanitizeOutput = (html: string) => {
  if (typeof window === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const allElements = doc.body.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    allElements[i].removeAttribute('style');
  }
  return doc.body.innerHTML;
};

const IconGuide = () => <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const IconFlow = () => <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconScript = () => <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

export default function FilmScriptAI() {
  const [formData, setFormData] = useState({
    theme: '', genre: 'Action', language: 'Roman Hindi/Urdu', structure: 'Movie',
    episodes: 1, durationType: 'Minutes', durationValue: '', hasPlot: false,
    plot: { start: '', mid: '', climax: '', end: '', twist: '' }
  });
  
  const [characters, setCharacters] = useState([{ name: '', gender: 'Male', role: 'Lead' }]);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // 🆕 new state
  const [usedCredits, setUsedCredits] = useState(0); 
  const MAX_FREE_CREDITS = 3;

  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import('html2pdf.js').then((module) => {
      html2pdfInstance = module.default ? module.default : module;
    });

    // 🆕 checking old credits after refreshing pages
    const savedCredits = localStorage.getItem('exorbis_script_credits');
    if (savedCredits) {
      setUsedCredits(parseInt(savedCredits, 10));
    }
  }, []);

  const genres = ["Action", "Romance", "Sci-Fi", "Thriller", "Horror", "Comedy", "Drama"];
  const languages = ["Roman Hindi/Urdu", "Hindi", "Marathi", "Turkish", "English"];
  const roles = ["Lead", "Supporting", "Positive", "Negative", "Villain"];

  const handleAddCharacter = () => setCharacters([...characters, { name: '', gender: 'Male', role: 'Lead' }]);
  const handleCharChange = (index: number, field: string, value: string) => {
    const newChars = [...characters];
    newChars[index] = { ...newChars[index], [field]: value };
    setCharacters(newChars);
  };

  const simulateProgress = () => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress(prev => (prev >= 95 ? 95 : prev + Math.random() * 10));
    }, 400);
    return interval;
  };

  const generateScript = async () => {
    // 🆕 BLOCKAGE LOGIC
    if (usedCredits >= MAX_FREE_CREDITS) {
      alert("⚠️ Free Limit Reached! Bhai, tere 3 free scripts khatam ho gaye hain. Unlimited access ke liye Exorbis Pro plan le.");
      return;
    }

    setLoading(true);
    setOutput('');
    const progressInterval = simulateProgress();
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, characters }),
      });
      const data = await res.json();
      
      if (!res.ok || data.error) throw new Error(data.error || "Backend error");
      if (data.script) {
        setOutput(data.script);
        setLoadingProgress(100);
        
        
        const newCreditCount = usedCredits + 1;
        setUsedCredits(newCreditCount);
        localStorage.setItem('exorbis_script_credits', newCreditCount.toString());
        
      } else {
        throw new Error("AI output empty");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoadingProgress(0);
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!outputRef.current) return;
    
    // Button dabne par hi library load hogi (Best & Safest approach)
    const module = await import('html2pdf.js');
    const html2pdf = module.default ? module.default : module;

    const opt = {
      margin: 10,
      filename: `${formData.theme ? formData.theme.substring(0, 10).trim() : 'Exorbis'}_Script.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 }, 
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(outputRef.current).save();
  };

  // Remaining free credits calculation
  const creditsLeft = Math.max(0, MAX_FREE_CREDITS - usedCredits);
  const isBlocked = usedCredits >= MAX_FREE_CREDITS;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans p-6 md:p-12 relative">
      <header className="mb-12 border-b border-gray-800 pb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-300 tracking-tight">
          FilmScript AI
        </h1>
        <p className="text-gray-400 mt-2 text-sm tracking-widest uppercase">
          Developed by Sufiyan Raza | Powered by Exorbis Tech Labs
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-10">
          <div className="bg-[#111111] border border-gray-800 p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Project Parameters</h2>
              
              {/* 🆕 CREDIT BADGE */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${isBlocked ? 'bg-red-900/50 text-red-400 border border-red-700' : 'bg-cyan-900/50 text-cyan-400 border border-cyan-700'}`}>
                {isBlocked ? 'Free Plan Exhausted' : `${creditsLeft} Free Scripts Left`}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase">Structure</label>
                <select className="w-full p-3 mt-1 bg-black border border-gray-700 rounded-lg focus:border-cyan-500 outline-none"
                  value={formData.structure} onChange={(e) => setFormData({...formData, structure: e.target.value})}>
                  <option>Movie</option>
                  <option>Series</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Genre</label>
                <select className="w-full p-3 mt-1 bg-black border border-gray-700 rounded-lg"
                  value={formData.genre} onChange={(e) => setFormData({...formData, genre: e.target.value})}>
                  {genres.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
               <div>
                <label className="text-xs text-gray-500 uppercase">Duration Type</label>
                <select className="w-full p-3 mt-1 bg-black border border-gray-700 rounded-lg outline-none focus:border-cyan-500"
                  value={formData.durationType} onChange={(e) => setFormData({...formData, durationType: e.target.value})}>
                  <option>Minutes</option><option>Scenes</option><option>Words</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Target Value</label>
                <input type="number" className="w-full p-3 mt-1 bg-black border border-gray-700 rounded-lg outline-none focus:border-cyan-500"
                  placeholder="e.g. 120" 
                  value={formData.durationValue} 
                  onChange={(e) => setFormData({...formData, durationValue: e.target.value})} />
              </div>
            </div>

              <div>
                <label className="text-xs text-gray-500 uppercase">Output Language</label>
                <select className="w-full p-3 mt-1 bg-black border border-gray-700 rounded-lg"
                  value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})}>
                  {languages.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase">Core Theme / Logline</label>
              <textarea className="w-full p-3 mt-1 bg-black border border-gray-700 rounded-lg h-20"
                placeholder="A street artist falls in love with an heiress..."
                value={formData.theme} onChange={(e) => setFormData({...formData, theme: e.target.value})} />
            </div>

            <div className="pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-cyan-400">Characters</label>
                <button onClick={handleAddCharacter} className="text-xs bg-gray-800 px-3 py-1 rounded hover:bg-gray-700">+ Add</button>
              </div>
              {characters.map((char, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input placeholder="Name" className="w-1/3 p-2 bg-black border border-gray-700 rounded text-sm"
                    value={char.name} onChange={(e) => handleCharChange(index, 'name', e.target.value)} />
                  <select className="w-1/3 p-2 bg-black border border-gray-700 rounded text-sm"
                    value={char.gender} onChange={(e) => handleCharChange(index, 'gender', e.target.value)}>
                    <option>Male</option><option>Female</option>
                  </select>
                  <select className="w-1/3 p-2 bg-black border border-gray-700 rounded text-sm"
                    value={char.role} onChange={(e) => handleCharChange(index, 'role', e.target.value)}>
                    {roles.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              ))}
            
            </div>

            {/* 🆕 PLOT SECTION */}
            <div className="pt-4 border-t border-gray-800 pb-4">
               <label className="flex items-center space-x-2 cursor-pointer mb-3">
                <input type="checkbox" className="form-checkbox text-cyan-500 bg-black border-gray-700 h-4 w-4"
                  checked={formData.hasPlot} onChange={(e) => setFormData({...formData, hasPlot: e.target.checked})} />
                <span className="text-sm font-bold text-cyan-400">I have a ready plot structure</span>
              </label>
              
              {formData.hasPlot && (
                <div className="space-y-2">
                  {['start', 'mid', 'twist', 'climax', 'end'].map((point) => (
                    <input key={point} placeholder={`${point.charAt(0).toUpperCase() + point.slice(1)} Event`} 
                      className="w-full p-2 bg-black border border-gray-700 rounded text-sm outline-none focus:border-cyan-500"
                      value={(formData.plot as any)[point]} onChange={(e) => setFormData({...formData, plot: {...formData.plot, [point]: e.target.value}})} />
                  ))}
                </div>
              )}
            </div>
            
          

            {/* 🆕 UPGRADED BUTTON LOGIC */}
            <button 
              onClick={generateScript} 
              disabled={loading || isBlocked}
              className={`w-full relative font-bold py-4 rounded-xl transition-all shadow-lg overflow-hidden group 
                ${isBlocked 
                  ? 'bg-gradient-to-r from-red-800 to-gray-900 text-gray-300 cursor-not-allowed border border-red-700' 
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                }`}
            >
              {loading && !isBlocked && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300 ease-linear rounded-l-xl" 
                  style={{ width: `${loadingProgress}%` }} 
                />
              )}
              
              <span className="relative z-10">
                {isBlocked 
                  ? "🔒 Unlock Exorbis Pro to Generate More" 
                  : loading 
                    ? `Exorbis AI is writing... ${Math.round(loadingProgress)}%` 
                    : `Generate Masterpiece (${creditsLeft} Left)`}
              </span>
            </button>
          </div>
      
        {/* OUTPUT SECTION (Clean PDF Code intact) */}
        <div className="relative bg-[#ececec] text-black p-8 rounded-2xl min-h-[600px] shadow-2xl font-serif">
          {output ? (
            <>
              <button 
                onClick={downloadPDF} 
                disabled={loading || !output}
                className="absolute top-6 right-6 z-10 bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-red-700 font-sans disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95">
                {loading ? "Writing..." : "Download PDF"}
              </button>
              
              <div className="flex items-center gap-2 mb-6 font-sans">
                <IconScript />
                <span className="text-lg font-bold uppercase text-gray-700 border-l-2 border-black pl-3 tracking-wider">Screenplay Output</span>
              </div>
              
              <div id="script-output" className="p-8 font-serif" style={{ backgroundColor: '#ffffff', color: '#000000' }} ref={outputRef}>
                <style>{`
                  #script-output h2 { font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; }
                  #script-output p { margin-bottom: 12px; font-size: 12pt; line-height: 1.6; }
                  #script-output b { text-transform: uppercase; font-weight: bold; }
                `}</style>

                <div dangerouslySetInnerHTML={{ __html: sanitizeOutput(output) }} />
                
                <div style={{ marginTop: '60px', paddingTop: '15px', borderTop: '1px solid #cccccc', textAlign: 'center', color: '#666666', fontSize: '10pt', fontFamily: 'sans-serif' }}>
                  Script generated by FilmScript AI <br/>
                  A project by Sufiyan Raza | Exorbis Tech Labs
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 italic font-sans text-center gap-4">
              <IconScript />
              "Set parameters to start writing..." <br/> - Exorbis AI
            </div>
          )}
        </div>
        </div>
      </div>
  );
}