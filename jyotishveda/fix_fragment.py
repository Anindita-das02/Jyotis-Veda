import os

file_path = 'src/components/GlobalZodiacView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the start:
# {hasSelectedSign && (
#   <div ref={deepDiveRef}
content = content.replace(
    "{hasSelectedSign && (\n        <div ref={deepDiveRef}",
    "{hasSelectedSign && (<>\n        <div ref={deepDiveRef}"
)

# Fix the end:
#       </div>\n      )}\n    </div>
search_end = """      </div>
      )}
    </div>
  );
};"""
replace_end = """      </div>
      </>)}
    </div>
  );
};"""
content = content.replace(search_end, replace_end)

# Fallback for \r\n
content = content.replace(search_end.replace('\n', '\r\n'), replace_end.replace('\n', '\r\n'))

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
