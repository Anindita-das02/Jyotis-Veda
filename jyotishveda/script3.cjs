const fs = require('fs');
let c = fs.readFileSync('src/components/GlobalZodiacView.tsx', 'utf8');

// 1. Add state and ref
c = c.replace(
  'const [selectedSignId, setSelectedSignId] = useState<string>(\'aries\');',
  `const [selectedSignId, setSelectedSignId] = useState<string>('aries');
  const [hasSelectedSign, setHasSelectedSign] = useState(false);
  const deepDiveRef = React.useRef<HTMLDivElement>(null);`
);

// 2. Modify onClick
c = c.replace(
  'onClick={() => setSelectedSignId(sign.id)}',
  `onClick={() => {
                setSelectedSignId(sign.id);
                setHasSelectedSign(true);
                setTimeout(() => {
                  deepDiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }}`
);

// 3. Add deepDiveRef to the Deep-Dive container
c = c.replace(
  '{/* Selected Sign Detailed Deep-Dive Container */}',
  `{/* Selected Sign Detailed Deep-Dive Container */}
      {hasSelectedSign && (
        <div ref={deepDiveRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">`
);

// 4. Close the wrapper at the very end of Compatibility Matrix Interactive Tool
c = c.replace(
  '          </div>\n        </div>\n\n      </div>\n    </div>\n  );\n};',
  '          </div>\n        </div>\n        </div>\n      )}\n\n      </div>\n    </div>\n  );\n};'
);

fs.writeFileSync('src/components/GlobalZodiacView.tsx', c);
