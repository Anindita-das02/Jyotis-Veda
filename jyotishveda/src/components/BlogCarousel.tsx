import React from 'react';

export const MOCK_BLOGS = [
  {
    id: 1,
    image: '/blog_1.jpg',
    category: 'VEDIC ASTROLOGY',
    tags: 'PLANETARY TRANSITS • 2026',
    title: 'The Cosmic Dance: Understanding Planetary Transits in 2026',
    excerpt: 'Discover how the major planetary shifts this year will impact your ascendant sign and shape global events.'
  },
  {
    id: 2,
    image: '/blog_2.jpg',
    category: 'NUMEROLOGY',
    tags: 'SACRED GEOMETRY • LIFE PATH',
    title: 'Master Numbers 11, 22, and 33: Decoding the Sacred Frequencies',
    excerpt: 'Unveil the hidden meanings behind master numbers in your birth chart and how they accelerate spiritual growth.'
  },
  {
    id: 3,
    image: '/blog_3.jpg',
    category: 'SPIRITUAL REMEDIES',
    tags: 'LUNAR CYCLES • MANIFESTATION',
    title: 'Moon Magic: Harnessing Lunar Energy for Daily Manifestation',
    excerpt: 'A practical guide to aligning your daily intentions with the Tithi (lunar phases) for maximum abundance.'
  },
  {
    id: 4,
    image: '/blog_4.jpg',
    category: 'ASTROLOGY SCIENCE',
    tags: 'RELATIONSHIPS • SYNERGY',
    title: 'The Science Behind Compatibility: Beyond the Sun Signs',
    excerpt: 'Why Moon signs and Nakshatras play a far more crucial role in long-term romantic synergy than your Sun sign.'
  }
];

export const BlogCarousel = ({ theme }: { theme: 'light' | 'dark' }) => {
  const isDark = theme === 'dark';

  // Duplicate items to create a seamless infinite loop
  const duplicatedBlogs = [...MOCK_BLOGS, ...MOCK_BLOGS];

  return (
    <div className="w-full pt-16 pb-12 relative z-10 overflow-hidden">
      <div className="text-center mb-10 px-4">
        <h2 className={`text-4xl md:text-5xl font-serif mb-4 ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
          Cosmic & <span className="italic font-light text-[#C9A050]">Insights</span>
        </h2>
        <p className={`text-sm md:text-base ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
          Deep dives into the art of astrology, curated for your spiritual journey.
        </p>
      </div>

      <div 
        className="relative w-full overflow-hidden pb-8"
        style={{ 
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
        }}
      >
        <div className="flex w-max animate-marquee gap-6 px-4 hover:pause">
          {duplicatedBlogs.map((blog, idx) => (
            <div 
              key={`${blog.id}-${idx}`}
              className={`shrink-0 w-[320px] md:w-[380px] rounded-[2rem] overflow-hidden flex flex-col cursor-pointer transition-transform hover:-translate-y-1 duration-300 shadow-xl border ${
                isDark ? 'bg-[#18181C] border-[#2A2A2E] shadow-black/40' : 'bg-[#FFFFFF] border-[#E5E1D8] shadow-amber-900/5'
              }`}
            >
              <div className="relative h-[240px] w-full overflow-hidden">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-${isDark ? '[#18181C]' : 'white'} to-transparent opacity-80 pointer-events-none`}></div>
              </div>
              
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex items-center space-x-2 mb-4 flex-wrap gap-y-2">
                  <span className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] ${isDark ? 'text-[#C9A050]' : 'text-amber-700'}`}>
                    {blog.category}
                  </span>
                  <span className={`text-[10px] ${isDark ? 'text-[#50505A]' : 'text-gray-300'}`}>•</span>
                  <span className={`text-[9px] md:text-[10px] font-bold tracking-[0.2em] ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                    {blog.tags}
                  </span>
                </div>

                <h4 className={`text-xl md:text-2xl font-semibold mb-4 leading-snug ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  {blog.title}
                </h4>
                
                <p className={`text-sm leading-relaxed line-clamp-3 mb-2 mt-auto ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                  {blog.excerpt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
