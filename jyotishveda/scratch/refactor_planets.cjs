const fs = require('fs');
const file = 'src/components/HoroscopeTraditionsView.tsx';
let content = fs.readFileSync(file, 'utf8');

const badge = `
const PlanetBadge = ({ p, isDiamond }: { p: any, isDiamond?: boolean }) => (
  <div className="group relative z-50">
    <span className={\`cursor-help transition-all duration-300 hover:scale-110 block \${isDiamond ? 'text-[10px] font-sans font-bold text-[#E5E1D8] bg-[#1A1A1E] px-1 rounded border border-[#C9A050]/40 shadow-sm hover:shadow-[#C9A050]/30' : 'text-[9px] font-bold text-[#C9A050] hover:text-[#F0ECE1] hover:drop-shadow-[0_0_4px_rgba(201,160,80,0.8)]'}\`}>
      {p.name.slice(0, 2)}
    </span>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-[#141418]/95 backdrop-blur-xl border border-[#C9A050]/40 text-[#E5E1D8] text-[10px] rounded-lg px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] flex flex-col items-center translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100">
      <span className="font-bold text-[#C9A050] text-xs">{p.name} ({p.sanskritName})</span>
      <div className="flex items-center gap-1.5 mt-1 opacity-90">
        {p.isRetrograde && <span className="text-rose-400 uppercase tracking-wider text-[8px] font-bold bg-rose-500/15 px-1 rounded border border-rose-500/30">Retrograde</span>}
        <span>{p.degree.toFixed(2)}° {p.signName}</span>
      </div>
      <div className="mt-1 text-[9px] text-[#9E9A90]">{p.nakshatra} (Pada {p.pada})</div>
      <div className="mt-0.5 text-[8px] text-[#C9A050]/90 uppercase tracking-widest bg-[#C9A050]/10 px-1.5 rounded-sm">{p.dignity}</div>
    </div>
  </div>
);
`;

// Insert the badge component right after imports
content = content.replace(/(import .*?\n)+/, match => match + badge);

// Replace the span patterns with the component
content = content.replace(/<span key={p\.id} className="text-\[10px\] font-sans font-bold text-\[#E5E1D8\] bg-\\[#1A1A1E\\] px-1 rounded border border-\\[#C9A050\\]\/40">[\s\S]*?<\/span>/g, '<PlanetBadge key={p.id} p={p} isDiamond={true} />');
content = content.replace(/<span key={p\.id} className="text-\[9px\] font-bold text-\\[#C9A050\\]">[\s\S]*?<\/span>/g, '<PlanetBadge key={p.id} p={p} isDiamond={false} />');

fs.writeFileSync(file, content);
console.log('Refactor complete!');
