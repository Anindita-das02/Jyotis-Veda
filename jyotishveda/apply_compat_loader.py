import os

file_path = 'src/components/GlobalZodiacView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variables
state_search = "const [isScreenLoading, setIsScreenLoading] = useState(false);"
state_replace = """const [isScreenLoading, setIsScreenLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isCompatLoading, setIsCompatLoading] = useState(false);"""

content = content.replace(state_search, state_replace)
content = content.replace(state_search.replace('\n', '\r\n'), state_replace.replace('\n', '\r\n'))

# 2. Reset hasAnalyzed when changing dropdowns
select_a_search = """                <CustomZodiacSelect
                  value={compatSignA}
                  onChange={setCompatSignA}"""
select_a_replace = """                <CustomZodiacSelect
                  value={compatSignA}
                  onChange={(val: string) => {
                    setCompatSignA(val);
                    setHasAnalyzed(false);
                  }}"""

select_b_search = """                <CustomZodiacSelect
                  value={compatSignB}
                  onChange={setCompatSignB}"""
select_b_replace = """                <CustomZodiacSelect
                  value={compatSignB}
                  onChange={(val: string) => {
                    setCompatSignB(val);
                    setHasAnalyzed(false);
                  }}"""

content = content.replace(select_a_search, select_a_replace)
content = content.replace(select_a_search.replace('\n', '\r\n'), select_a_replace.replace('\n', '\r\n'))
content = content.replace(select_b_search, select_b_replace)
content = content.replace(select_b_search.replace('\n', '\r\n'), select_b_replace.replace('\n', '\r\n'))

# 3. Modify Analyze button onClick handler
analyze_search = """              <div className="flex flex-col">
                <label className="text-[11px] block mb-1 opacity-0 select-none pointer-events-none">Analyze</label>
                <button
                  onClick={() => {}}
                  className={`px-6 rounded-lg font-bold text-sm transition shadow-sm flex items-center justify-center h-[40px] ${theme === 'dark' ? 'bg-[#C9A050] text-[#141418] hover:bg-[#D4AF60]' : 'bg-[#C9A050] text-white hover:bg-[#B88E40]'}`}
                >
                  <span>Analyze</span>
                </button>
              </div>"""

analyze_replace = """              <div className="flex flex-col">
                <label className="text-[11px] block mb-1 opacity-0 select-none pointer-events-none">Analyze</label>
                <button
                  onClick={() => {
                    setIsCompatLoading(true);
                    setHasAnalyzed(false);
                    setTimeout(() => {
                      setIsCompatLoading(false);
                      setHasAnalyzed(true);
                    }, 1200);
                  }}
                  className={`px-6 rounded-lg font-bold text-sm transition shadow-sm flex items-center justify-center h-[40px] ${theme === 'dark' ? 'bg-[#C9A050] text-[#141418] hover:bg-[#D4AF60]' : 'bg-[#C9A050] text-white hover:bg-[#B88E40]'}`}
                >
                  <span>Analyze</span>
                </button>
              </div>"""

content = content.replace(analyze_search, analyze_replace)
content = content.replace(analyze_search.replace('\n', '\r\n'), analyze_replace.replace('\n', '\r\n'))

# 4. Wrap Compatibility Breakdown Card with conditional states
card_search = """          {/* Compatibility Breakdown Card */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">"""

card_replace = """          {/* Compatibility Breakdown Card */}
          {isCompatLoading && (
            <div className="flex flex-col items-center justify-center p-12 bg-[#141418] rounded-xl border border-[#2A2A2E] text-center animate-pulse w-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C9A050] mb-4"></div>
              <p className="text-sm font-semibold tracking-wider text-[#C9A050] animate-pulse font-serif">
                {language === 'bn' ? 'গ্রহের সংযোগ এবং নক্ষত্রের সামঞ্জস্য গণনা করা হচ্ছে...' : 'Calculating Cosmic Harmony & Planetary Alignments...'}
              </p>
            </div>
          )}

          {hasAnalyzed && !isCompatLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center animate-in fade-in slide-in-from-bottom-4 duration-500">"""

content = content.replace(card_search, card_replace)
content = content.replace(card_search.replace('\n', '\r\n'), card_replace.replace('\n', '\r\n'))

# 5. Add the closing parenthesis for the card wrapper
end_search = """              <div className="bg-[#141418] p-3 rounded-lg border border-[#2A2A2E]/80">
                <span className={`font-semibold block mb-0.5 ${theme === 'dark' ? 'text-emerald-400' : 'text-[#C9A050]'}`}>Evolution & Remedial Guidance:</span>
                <span className="text-[#9E9A90]">{compatResult.remedialAdvice}</span>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};"""

end_replace = """              <div className="bg-[#141418] p-3 rounded-lg border border-[#2A2A2E]/80">
                <span className={`font-semibold block mb-0.5 ${theme === 'dark' ? 'text-emerald-400' : 'text-[#C9A050]'}`}>Evolution & Remedial Guidance:</span>
                <span className="text-[#9E9A90]">{compatResult.remedialAdvice}</span>
              </div>
            </div>
          </div>
          )}
        </div>
    </div>
  );
};"""

content = content.replace(end_search, end_replace)
content = content.replace(end_search.replace('\n', '\r\n'), end_replace.replace('\n', '\r\n'))

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied compatibility loader changes successfully.")
