const fs = require('fs');
let c = fs.readFileSync('src/components/PanjikaCalendarView.tsx', 'utf8');
c = c.replace(/dark:[^\s"']+/g, '');
c = c.replace(/min-h-screen/g, '');
c = c.replace(/lg:space-y-12/g, 'lg:space-y-4');
c = c.replace(/space-y-8/g, 'space-y-4');
c = c.replace(/lg:p-10/g, 'lg:p-6');
c = c.replace(/p-4 sm:p-6/g, 'p-4');
fs.writeFileSync('src/components/PanjikaCalendarView.tsx', c);
