import React, { useState, useEffect } from 'react';

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  preview?: string;
  image_url?: string;
  category?: string;
  sub_category?: string;
  status: string;
  tags?: string[];
  pinned?: number;
  created_at?: string;
  updated_at?: string;
}

interface BlogCarouselProps {
  theme: 'light' | 'dark';
  onSelectBlog?: (blog: BlogPost) => void;
  onViewAll?: () => void;
}

export const BlogCarousel: React.FC<BlogCarouselProps> = ({ theme, onSelectBlog, onViewAll }) => {
  const isDark = theme === 'dark';
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5001/api/blogs');
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data)) {
          const published = json.data.filter((b: BlogPost) => b.status === 'Published');
          setBlogs(published.length > 0 ? published : json.data);
        }
      } catch (err) {
        console.error('Error fetching blogs for carousel:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Compute duplicated items for seamless infinite marquee
  const displayBlogs = React.useMemo(() => {
    if (blogs.length === 0) return [];
    if (blogs.length === 1) return [...blogs, ...blogs, ...blogs, ...blogs];
    if (blogs.length === 2) return [...blogs, ...blogs, ...blogs];
    return [...blogs, ...blogs];
  }, [blogs]);

  if (loading) {
    return (
      <div className="w-full pt-16 pb-12 relative z-10 overflow-hidden flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C9A050] mb-4"></div>
        <p className={`text-xs uppercase tracking-widest ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>Loading Cosmic Insights...</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="w-full pt-16 pb-12 relative z-10 overflow-hidden">
      <div className="text-center mb-10 px-4">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <h2 className={`text-4xl md:text-5xl font-serif ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
            Cosmic & <span className="italic font-light text-[#C9A050]">Insights</span>
          </h2>
        </div>
        <p className={`text-sm md:text-base ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
          Deep dives into authentic Vedic astrology, planetary yogas, and spiritual wisdom.
        </p>
      </div>

      <div 
        className="relative w-full overflow-hidden pb-8"
        style={{ 
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
        }}
      >
        <div className="flex w-max animate-marquee gap-6 px-4 hover:pause">
          {displayBlogs.map((blog, idx) => {
            const tagString = Array.isArray(blog.tags) && blog.tags.length > 0
              ? blog.tags.slice(0, 2).join(' • ')
              : blog.sub_category || 'VEDIC JYOTISH';

            const cleanExcerpt = blog.preview || 
              (blog.content ? blog.content.replace(/<[^>]*>?/gm, '').substring(0, 110) + '...' : '');

            return (
                <div 
                  key={`${blog.id}-${idx}`}
                  onClick={() => {
                    if (onSelectBlog) onSelectBlog(blog);
                    else if (onViewAll) onViewAll();
                  }}
                  style={{
                    backgroundColor: isDark ? '#141418' : '#FFFFFF',
                  }}
                  className={`shrink-0 w-[320px] md:w-[380px] rounded-[2rem] overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-2 duration-300 shadow-xl border group ${
                    isDark 
                      ? 'bg-[#141418] border-[#2A2A2E] shadow-black/60 hover:border-[#C9A050]/60' 
                      : 'bg-white border-[#E2D9C8] shadow-amber-900/10 hover:border-[#C9A050]'
                  }`}
                >
                  <div className="relative h-[220px] w-full overflow-hidden bg-black/20">
                    <img 
                      src={blog.image_url || '/blog_1.jpg'} 
                      alt={blog.title} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/blog_1.jpg';
                      }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {blog.pinned === 1 && (
                      <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#C9A050] text-[#0D0D0F] text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <div 
                    style={{
                      backgroundColor: isDark ? '#141418' : '#FFFFFF',
                    }}
                    className={`p-6 md:p-7 flex-1 flex flex-col ${isDark ? 'bg-[#141418]' : 'bg-white'}`}
                  >
                    <div className="flex items-center space-x-2 mb-3 flex-wrap gap-y-1">
                      <span className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${isDark ? 'text-[#C9A050]' : 'text-black'}`}>
                        {blog.category || 'VEDIC ASTROLOGY'}
                      </span>
                      <span className={`text-[10px] ${isDark ? 'text-[#50505A]' : 'text-gray-600'}`}>•</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider truncate max-w-[170px] ${isDark ? 'text-[#9E9A90]' : 'text-gray-900'}`}>
                        {tagString}
                      </span>
                    </div>

                    <h4 className={`text-lg md:text-xl font-serif font-bold mb-3 leading-snug line-clamp-2 ${
                      isDark ? 'text-[#F0ECE1]' : 'text-black'
                    }`}>
                      {blog.title}
                    </h4>
                    
                    <p className={`text-xs md:text-sm leading-relaxed line-clamp-3 mb-4 mt-auto ${
                      isDark ? 'text-[#D0CCC2] font-normal' : 'text-gray-950 font-medium'
                    }`}>
                      {cleanExcerpt}
                    </p>

                    <div className={`pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                      isDark ? 'border-white/10' : 'border-gray-200'
                    }`}>
                      <span className={`font-black uppercase tracking-wider ${
                        isDark ? 'text-[#C9A050]' : 'text-black'
                      }`}>
                        Read Article →
                      </span>
                      {blog.created_at && (
                        <span className={`text-[11px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-900'}`}>
                          {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
