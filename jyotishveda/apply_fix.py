import os

file_path = 'src/components/GlobalZodiacView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State
state_search = "const [selectedSignId, setSelectedSignId] = useState<string>('aries');"
state_replace = """const [selectedSignId, setSelectedSignId] = useState<string>('aries');
  const [hasSelectedSign, setHasSelectedSign] = useState(false);
  const deepDiveRef = React.useRef<HTMLDivElement>(null);"""

# 2. Grid Click
click_search = "onClick={() => setSelectedSignId(sign.id)}"
click_replace = """onClick={() => {
                setSelectedSignId(sign.id);
                setHasSelectedSign(true);
                setTimeout(() => {
                  deepDiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }}"""

# 3. Card Container Start
start_search = """      {/* Selected Sign Detailed Deep-Dive Container */}
      <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">"""

start_replace = """      {/* Selected Sign Detailed Deep-Dive Container */}
      {hasSelectedSign && (
        <>
          <div ref={deepDiveRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">"""

# 4. End closing tags
end_search = """            </div>
          </div>
        </div>
      </div>
    </div>
  );
};"""

end_replace = """            </div>
          </div>
        </div>
      </div>
      </div>
      </>)}
    </div>
  );
};"""

# Perform replacement
content = content.replace(state_search, state_replace)
content = content.replace(click_search, click_replace)
content = content.replace(start_search, start_replace)
content = content.replace(end_search, end_replace)

# Try with \r\n
content = content.replace(state_search.replace('\n', '\r\n'), state_replace.replace('\n', '\r\n'))
content = content.replace(click_search.replace('\n', '\r\n'), click_replace.replace('\n', '\r\n'))
content = content.replace(start_search.replace('\n', '\r\n'), start_replace.replace('\n', '\r\n'))
content = content.replace(end_search.replace('\n', '\r\n'), end_replace.replace('\n', '\r\n'))

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied replacements successfully.")
