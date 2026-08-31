import os

file_path = 'src/components/GlobalZodiacView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states and ref
state_search = "const [selectedSignId, setSelectedSignId] = useState<string>('aries');"
state_replace = """const [selectedSignId, setSelectedSignId] = useState<string>('aries');
  const [hasSelectedSign, setHasSelectedSign] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const deepDiveRef = React.useRef<HTMLDivElement>(null);"""

content = content.replace(state_search, state_replace)
content = content.replace(state_search.replace('\n', '\r\n'), state_replace.replace('\n', '\r\n'))

# 2. Add full screen loader at top of return
return_search = """  return (
    <div className="space-y-10 animate-fade-in text-[#E5E1D8]">"""

return_replace = """  return (
    <div className="space-y-10 animate-fade-in text-[#E5E1D8]">
      {/* Screen Middle Loader */}
      {isScreenLoading && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center z-[9999] animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#C9A050]"></div>
            <div className="absolute text-xl font-serif text-[#C9A050] animate-pulse">✨</div>
          </div>
          <p className="mt-4 text-sm font-semibold tracking-wider text-[#C9A050] animate-pulse font-serif">
            {language === 'bn' ? 'নক্ষত্র ও কোষ্ঠী বিশ্লেষণ করা হচ্ছে...' : 'Aligning Stars & Consulting Cosmos...'}
          </p>
        </div>
      )}"""

content = content.replace(return_search, return_replace)
content = content.replace(return_search.replace('\n', '\r\n'), return_replace.replace('\n', '\r\n'))

# 3. Update grid onClick handler
click_search = "onClick={() => setSelectedSignId(sign.id)}"
click_replace = """onClick={() => {
                setIsScreenLoading(true);
                setSelectedSignId(sign.id);
                setTimeout(() => {
                  setIsScreenLoading(false);
                  setHasSelectedSign(true);
                  setTimeout(() => {
                    deepDiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                }, 1200);
              }}"""

content = content.replace(click_search, click_replace)
content = content.replace(click_search.replace('\n', '\r\n'), click_replace.replace('\n', '\r\n'))

# 4. Wrap Deep-Dive container
deepdive_start_search = """      {/* Selected Sign Detailed Deep-Dive Container */}
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">"""

deepdive_start_replace = """      {/* Selected Sign Detailed Deep-Dive Container */}
      {hasSelectedSign && (
        <div ref={deepDiveRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">"""

content = content.replace(deepdive_start_search, deepdive_start_replace)
content = content.replace(deepdive_start_search.replace('\n', '\r\n'), deepdive_start_replace.replace('\n', '\r\n'))

# 5. Close Deep-Dive early before Compatibility Matrix starts
deepdive_end_search = """          </div>
        </div>

        {/* Compatibility Matrix Interactive Tool */}"""

deepdive_end_replace = """          </div>
        </div>
      </div>
      </div>
      )}

      {/* Compatibility Matrix Interactive Tool */}"""

content = content.replace(deepdive_end_search, deepdive_end_replace)
content = content.replace(deepdive_end_search.replace('\n', '\r\n'), deepdive_end_replace.replace('\n', '\r\n'))

# 6. Remove the extra closing div from the end of the file
end_search = """              <div className="bg-[#141418] p-3 rounded-lg border border-[#2A2A2E]/80">
                <span className={`font-semibold block mb-0.5 ${theme === 'dark' ? 'text-emerald-400' : 'text-[#C9A050]'}`}>Evolution & Remedial Guidance:</span>
                <span className="text-[#9E9A90]">{compatResult.remedialAdvice}</span>
              </div>
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
        </div>
    </div>
  );
};"""

content = content.replace(end_search, end_replace)
content = content.replace(end_search.replace('\n', '\r\n'), end_replace.replace('\n', '\r\n'))

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied final clean changes successfully.")
