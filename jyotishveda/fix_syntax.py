import os

file_path = 'src/components/GlobalZodiacView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find the string:
#              </div>\n            </div>\n          </div>\n        </div>\n      )}\n      </div>\n    </div>\n  );\n};

search_str = """              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
"""

replace_str = """              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
"""

content = content.replace(search_str, replace_str)
# also try with \r\n
search_str2 = search_str.replace('\n', '\r\n')
replace_str2 = replace_str.replace('\n', '\r\n')
content = content.replace(search_str2, replace_str2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
