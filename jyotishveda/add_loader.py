import os

file_path = 'src/components/GlobalZodiacView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variable
state_search = "const [hasSelectedSign, setHasSelectedSign] = useState(false);"
state_replace = """const [hasSelectedSign, setHasSelectedSign] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(false);"""

# 2. Modify grid click logic to use isScreenLoading
click_search = """onClick={() => {
                setSelectedSignId(sign.id);
                setHasSelectedSign(true);
                setTimeout(() => {
                  deepDiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }}"""

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

# 3. Add the Loader UI at the very top of return JSX
# Let's see the start of the return JSX in GlobalZodiacView
return_search = "return (\n    <div className=\"w-full max-w-7xl mx-auto space-y-12\">"
return_replace = """return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      {/* Screen Middle Loader */}
      {isScreenLoading && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-md flex flex-col items-center justify-center z-[9999] animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#C9A050]"></div>
            <div className="absolute text-xl font-serif text-[#C9A050] animate-pulse">✨</div>
          </div>
          <p className="mt-4 text-sm font-semibold tracking-wider text-[#C9A050] animate-pulse font-serif">
            {language === 'bn' ? 'নক্ষত্র ও কোষ্ঠী বিশ্লেষণ করা হচ্ছে...' : 'Aligning Stars & Consulting Cosmos...'}
          </p>
        </div>
      )}"""

# Replace values
content = content.replace(state_search, state_replace)
content = content.replace(click_search, click_replace)
content = content.replace(click_search.replace('\n', '\r\n'), click_replace.replace('\n', '\r\n'))
content = content.replace(return_search, return_replace)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added screen middle loader successfully.")
