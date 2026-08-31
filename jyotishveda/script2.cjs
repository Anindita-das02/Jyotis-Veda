const fs = require('fs');
let c = fs.readFileSync('src/components/GlobalZodiacView.tsx', 'utf8');

// Container 1 (Deep-Dive)
c = c.replace(
  '<div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">',
  '<div className={`rounded-3xl p-6 sm:p-8 space-y-8 transition-colors ${theme === \'dark\' ? \'bg-[#141418] border border-[#2A2A2E] shadow-2xl shadow-[#C9A050]/5\' : \'bg-white border border-[#E5E1D8] shadow-[0_8px_30px_rgb(0,0,0,0.08)]\'}`}>'
);

// Container 1 Header Text
c = c.replace(
  '<h2 className="text-2xl font-bold text-[#F0ECE1]">',
  '<h2 className={`text-2xl font-bold ${theme === \'dark\' ? \'text-[#F0ECE1]\' : \'text-[#0D0D0F]\'}`}>'
);

// Container 2 (Compatibility Matrix)
c = c.replace(
  '<div className="bg-[#0D0D0F] p-6 rounded-xl border border-[#2A2A2E] space-y-6">',
  '<div className={`p-6 rounded-3xl space-y-6 transition-colors ${theme === \'dark\' ? \'bg-[#0D0D0F] border border-[#2A2A2E] shadow-2xl shadow-[#C9A050]/5\' : \'bg-white border border-[#E5E1D8] shadow-[0_8px_30px_rgb(0,0,0,0.08)]\'}`}>'
);

// Container 2 Header Text
c = c.replace(
  '<h3 className="text-base font-bold text-[#F0ECE1] flex items-center space-x-2">',
  '<h3 className={`text-base font-bold flex items-center space-x-2 ${theme === \'dark\' ? \'text-[#F0ECE1]\' : \'text-[#0D0D0F]\'}`}>'
);

fs.writeFileSync('src/components/GlobalZodiacView.tsx', c);
