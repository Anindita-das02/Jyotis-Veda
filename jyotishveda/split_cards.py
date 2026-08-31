import os

file_path = 'src/components/GlobalZodiacView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Move the closing wrapper from the end of the file to right before the Compatibility Matrix
search_middle = """        </div>
      </div>

      {/* Compatibility Matrix Interactive Tool */}"""

replace_middle = """        </div>
      </div>
      </div>
      </>)}

      {/* Compatibility Matrix Interactive Tool */}"""

content = content.replace(search_middle, replace_middle)
content = content.replace(search_middle.replace('\n', '\r\n'), replace_middle.replace('\n', '\r\n'))

# 2. Fix the end of the file to close normally
search_end = """            </div>
          </div>
        </div>
      </div>
      </div>
      </>)}
    </div>
  );
};"""

replace_end = """            </div>
          </div>
        </div>
      </div>
    </div>
  );
};"""

content = content.replace(search_end, replace_end)
content = content.replace(search_end.replace('\n', '\r\n'), replace_end.replace('\n', '\r\n'))

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Split compatibility matrix successfully.")
