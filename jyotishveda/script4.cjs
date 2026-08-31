const fs = require('fs');
let c = fs.readFileSync('src/components/GlobalZodiacView.tsx', 'utf8');

c = c.replace(
  '            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n};',
  '            </div>\n          </div>\n        </div>\n      )}\n      </div>\n    </div>\n  );\n};'
);

fs.writeFileSync('src/components/GlobalZodiacView.tsx', c);
