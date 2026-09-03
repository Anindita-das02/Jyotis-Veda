import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Tag, Search, X, BookOpen, Clock, Sparkles } from 'lucide-react';
import { BlogPost } from './BlogCarousel';

interface BlogPageProps {
  theme: 'light' | 'dark';
  onBack: () => void;
}

export function BlogPage({ theme, onBack }: BlogPageProps) {
  const isDark = theme === 'dark';
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

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
        console.error('Error fetching blogs in BlogPage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Extract distinct categories
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    blogs.forEach((b) => {
      if (b.category && b.category.trim()) cats.add(b.category.trim());
    });
    return ['All', ...Array.from(cats)];
  }, [blogs]);

  // Filtered blogs
  const filteredBlogs = React.useMemo(() => {
    return blogs.filter((blog) => {
      const matchCat = selectedCategory === 'All' || blog.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCat;

      const titleMatch = blog.title.toLowerCase().includes(q);
      const excerptMatch = (blog.preview || '').toLowerCase().includes(q);
      const catMatch = (blog.category || '').toLowerCase().includes(q);
      const tagsMatch = Array.isArray(blog.tags) && blog.tags.some(t => t.toLowerCase().includes(q));

      return matchCat && (titleMatch || excerptMatch || catMatch || tagsMatch);
    });
  }, [blogs, selectedCategory, searchQuery]);

  return (
    <div className={`min-h-[calc(100vh-5rem)] w-full pb-24 ${isDark ? 'bg-transparent text-[#E5E1D8]' : 'bg-transparent text-[#0D0D0F]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <button 
            onClick={onBack}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all border ${
              isDark 
                ? 'text-[#9E9A90] hover:text-[#C9A050] hover:bg-[#C9A050]/10 border-white/10 hover:border-[#C9A050]/40' 
                : 'text-gray-700 hover:text-amber-800 hover:bg-amber-500/10 border-gray-200 hover:border-amber-600'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to Home</span>
          </button>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics..."
              className={`w-full pl-10 pr-4 py-2 text-sm rounded-full border outline-none transition-all ${
                isDark 
                  ? 'bg-[#18181C] border-[#2A2A2E] text-white focus:border-[#C9A050]' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-amber-600'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#C9A050]/10 border border-[#C9A050]/30 text-[#C9A050] text-[11px] font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sacred Knowledge & Articles</span>
          </div>
          <h1 className={`text-4xl sm:text-5xl font-serif font-bold mb-4 ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
            All <span className="italic font-light text-[#C9A050]">Blogs</span> & Insights
          </h1>
          <p className={`text-sm sm:text-base max-w-2xl mx-auto ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
            Explore authentic Vedic astrology, planetary yogas, kundli matching, and spiritual wisdom directly from our masters.
          </p>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#C9A050] text-[#0D0D0F] shadow-lg shadow-[#C9A050]/20'
                      : isDark
                        ? 'bg-[#18181C] text-[#9E9A90] hover:text-white border border-[#2A2A2E]'
                        : 'bg-white text-gray-600 hover:text-black border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#C9A050] mb-4"></div>
            <p className={`text-sm ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>Loading articles...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBlogs.length === 0 && (
          <div className={`max-w-md mx-auto text-center py-16 px-6 rounded-3xl border ${
            isDark ? 'bg-[#18181C]/60 border-white/5' : 'bg-white border-gray-100'
          }`}>
            <BookOpen className="w-12 h-12 text-[#C9A050]/60 mx-auto mb-4" />
            <h3 className={`text-xl font-serif font-bold mb-2 ${isDark ? 'text-[#F0ECE1]' : 'text-gray-900'}`}>
              {searchQuery ? 'No Matching Articles' : 'No Blogs Published Yet'}
            </h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              {searchQuery 
                ? `No articles found matching "${searchQuery}". Try a different search term.` 
                : 'Blogs created and published from the Admin Panel will appear here.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="px-4 py-2 rounded-full bg-[#C9A050] text-[#0D0D0F] text-xs font-bold uppercase tracking-wider"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Blog Grid */}
        {!loading && filteredBlogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => {
              const tagString = Array.isArray(blog.tags) && blog.tags.length > 0
                ? blog.tags.slice(0, 2).join(' • ')
                : blog.sub_category || 'VEDIC JYOTISH';

              const cleanExcerpt = blog.preview || 
                (blog.content ? blog.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' : '');

              return (
                <div 
                  key={blog.id}
                  onClick={() => setSelectedBlog(blog)}
                  className={`rounded-[2rem] overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-2 duration-300 shadow-xl border group ${
                    isDark 
                      ? 'bg-[#18181C] border-[#2A2A2E] shadow-black/40 hover:border-[#C9A050]/50' 
                      : 'bg-[#FFFFFF] border-[#E5E1D8] shadow-amber-900/5 hover:border-[#C9A050]'
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
                    <div className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${isDark ? 'from-[#18181C]' : 'from-white'} to-transparent opacity-90 pointer-events-none`}></div>
                    
                    {blog.pinned === 1 && (
                      <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#C9A050] text-[#0D0D0F] text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="flex items-center space-x-2 mb-3 flex-wrap gap-y-1">
                      <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${isDark ? 'text-[#C9A050]' : 'text-amber-700'}`}>
                        {blog.category || 'VEDIC ASTROLOGY'}
                      </span>
                      <span className={`text-[10px] ${isDark ? 'text-[#50505A]' : 'text-gray-300'}`}>•</span>
                      <span className={`text-[9px] font-medium uppercase tracking-wider truncate max-w-[170px] ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                        {tagString}
                      </span>
                    </div>

                    <h3 className={`text-xl font-semibold mb-3 leading-snug line-clamp-2 transition-colors ${
                      isDark ? 'text-[#F0ECE1] group-hover:text-[#C9A050]' : 'text-[#0D0D0F] group-hover:text-amber-800'
                    }`}>
                      {blog.title}
                    </h3>
                    
                    <p className={`text-sm leading-relaxed mb-6 line-clamp-3 ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                      {cleanExcerpt}
                    </p>

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                        isDark ? 'text-[#C9A050] group-hover:text-[#E2BD68]' : 'text-amber-700 group-hover:text-amber-600'
                      }`}>
                        Read Article →
                      </span>

                      {blog.created_at && (
                        <div className={`flex items-center space-x-1 text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Article Reading Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div 
            className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border ${
              isDark ? 'bg-[#141417] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedBlog(null)}
              className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-[#C9A050] hover:text-black transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Cover Image */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              <img 
                src={selectedBlog.image_url || '/blog_1.jpg'} 
                alt={selectedBlog.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/blog_1.jpg';
                }}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#141417] via-[#141417]/40' : 'from-white via-white/30'} to-transparent`}></div>
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center space-x-3 mb-2 flex-wrap gap-y-2">
                  <span className="px-3 py-1 rounded-full bg-[#C9A050] text-[#0D0D0F] text-xs font-bold uppercase tracking-wider">
                    {selectedBlog.category || 'Vedic Astrology'}
                  </span>
                  {selectedBlog.sub_category && (
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium">
                      {selectedBlog.sub_category}
                    </span>
                  )}
                  {selectedBlog.created_at && (
                    <span className="text-xs text-gray-300 font-medium">
                      {new Date(selectedBlog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <h1 className={`text-2xl sm:text-4xl font-serif font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>
                  {selectedBlog.title}
                </h1>
              </div>
            </div>

            {/* Modal Body & Content */}
            <div className="p-6 sm:p-10">
              {/* Tags */}
              {Array.isArray(selectedBlog.tags) && selectedBlog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-white/10">
                  {selectedBlog.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                        isDark ? 'bg-white/5 text-[#C9A050] border border-[#C9A050]/20' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Rich Blog Content */}
              <div 
                className={`prose max-w-none space-y-4 leading-relaxed text-base sm:text-lg ${
                  isDark ? 'prose-invert text-[#D0CCC2]' : 'text-gray-800'
                }`}
                style={{
                  lineHeight: '1.8',
                }}
                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
              />

              <div className="mt-12 pt-8 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="px-6 py-2.5 rounded-full bg-[#C9A050] text-[#0D0D0F] text-sm font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-all shadow-lg"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
