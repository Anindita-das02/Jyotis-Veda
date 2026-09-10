import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Search, 
  X, 
  BookOpen, 
  Clock, 
  Sparkles, 
  Share2, 
  Check, 
  ArrowRight, 
  Compass,
  Bookmark,
  ChevronRight
} from 'lucide-react';
import { BlogPost } from './BlogCarousel';

interface BlogPageProps {
  theme: 'light' | 'dark';
  onBack: () => void;
  initialBlog?: BlogPost | null;
}

export function BlogPage({ theme, onBack, initialBlog = null }: BlogPageProps) {
  const isDark = theme === 'dark';
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(initialBlog);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (initialBlog) {
      setSelectedBlog(initialBlog);
    }
  }, [initialBlog]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [selectedBlog]);

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

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Extract distinct categories
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    blogs.forEach((b) => {
      if (b.category && b.category.trim()) cats.add(b.category.trim());
    });
    return ['All', ...Array.from(cats)];
  }, [blogs]);

  // Filtered blogs for directory view
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

  // Related blogs for the single article view (excluding currently selected blog)
  const relatedBlogs = React.useMemo(() => {
    if (!selectedBlog) return [];
    return blogs
      .filter((b) => b.id !== selectedBlog.id)
      .slice(0, 3);
  }, [blogs, selectedBlog]);

  // Estimate read time
  const readingTime = React.useMemo(() => {
    if (!selectedBlog?.content) return '4 min read';
    const wordCount = selectedBlog.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    const minutes = Math.max(2, Math.ceil(wordCount / 180));
    return `${minutes} min read`;
  }, [selectedBlog]);

  // ==========================================
  // VIEW 1: DEDICATED FULL-PAGE ARTICLE READER
  // ==========================================
  if (selectedBlog) {
    return (
      <div className={`min-h-[calc(100vh-5rem)] w-full pb-24 transition-colors ${
        isDark ? 'bg-[#0D0D0F] text-[#E5E1D8]' : 'bg-[#FAF8F5] text-[#0D0D0F]'
      }`}>
        {/* Sticky Sub-Header Navigation */}
        <div className={`sticky top-20 z-30 w-full backdrop-blur-xl border-b transition-colors ${
          isDark ? 'bg-[#0D0D0F]/95 border-[#2A2A2E]' : 'bg-[#FAF8F5]/95 border-[#E5E1D8]'
        }`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            {/* Back Button to Blogs Directory */}
            <button 
              onClick={() => setSelectedBlog(null)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all border shadow-sm cursor-pointer group ${
                isDark 
                  ? 'text-[#F0ECE1] hover:text-[#C9A050] hover:bg-[#C9A050]/10 border-[#2A2A2E] hover:border-[#C9A050]/40 bg-[#18181C]' 
                  : 'text-gray-800 hover:text-amber-800 hover:bg-amber-500/10 border-gray-200 hover:border-amber-600 bg-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-xs sm:text-sm font-semibold">Back to All Articles</span>
            </button>

            {/* Breadcrumb Info on Desktop */}
            <div className="hidden md:flex items-center space-x-2 text-xs truncate max-w-md">
              <span 
                onClick={() => setSelectedBlog(null)}
                className="cursor-pointer text-[#C9A050] hover:underline font-medium"
              >
                Blogs
              </span>
              <ChevronRight className="w-3 h-3 text-gray-500" />
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {selectedBlog.category || 'Vedic Astrology'}
              </span>
              <ChevronRight className="w-3 h-3 text-gray-500" />
              <span className="truncate text-gray-400 font-medium">
                {selectedBlog.title}
              </span>
            </div>

            {/* Share & Copy Action */}
            <button
              onClick={handleShare}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : isDark
                    ? 'bg-[#18181C] text-[#9E9A90] hover:text-white border-[#2A2A2E] hover:border-[#C9A050]/40'
                    : 'bg-white text-gray-700 hover:text-black border-gray-200 hover:border-amber-500 shadow-sm'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share Article</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Article Reader Main Container */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {/* Header Metadata */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4 flex-wrap gap-y-2">
              <span className="px-3.5 py-1.5 rounded-full bg-[#C9A050] text-[#0D0D0F] text-xs font-bold uppercase tracking-widest shadow-md shadow-[#C9A050]/20">
                {selectedBlog.category || 'Vedic Astrology'}
              </span>
              {selectedBlog.sub_category && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  isDark ? 'bg-[#18181C] text-[#C9A050] border-[#C9A050]/30' : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}>
                  {selectedBlog.sub_category}
                </span>
              )}
              <div className={`flex items-center space-x-1 text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                <Clock className="w-3.5 h-3.5 text-[#C9A050]" />
                <span>{readingTime}</span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className={`text-2xl sm:text-3xl md:text-[32px] lg:text-[34px] font-serif font-bold leading-snug mb-4 sm:mb-5 ${
              isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'
            }`}>
              {selectedBlog.title}
            </h1>

            {/* Author & Publication Bar */}
            <div className={`flex items-center justify-between py-4 border-y flex-wrap gap-4 ${
              isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C9A050] to-[#E2BD68] flex items-center justify-center text-[#0D0D0F] font-serif font-bold shadow-md">
                  <Sparkles className="w-5 h-5 text-[#0D0D0F]" />
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center space-x-1.5">
                    <span className={isDark ? 'text-[#F0ECE1]' : 'text-gray-900'}>JyotishVeda Masters</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A050]/20 text-[#C9A050] font-semibold">
                      Verified
                    </span>
                  </div>
                  <div className={`text-xs flex items-center space-x-2 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
                    <Calendar className="w-3 h-3" />
                    <span>
                      {selectedBlog.created_at
                        ? new Date(selectedBlog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : 'Authentic Vedic Archive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vedic Authenticity Badge */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#C9A050]/10 border border-[#C9A050]/30 text-[#C9A050] text-xs font-semibold">
                <Compass className="w-3.5 h-3.5" />
                <span>Parashari & Jaimini Wisdom</span>
              </div>
            </div>
          </div>

          {/* Hero Featured Cover Image */}
          <div className="relative rounded-3xl overflow-hidden mb-10 shadow-2xl border border-white/10 aspect-[16/9] sm:aspect-[21/9] bg-black/40">
            <img 
              src={selectedBlog.image_url || '/blog_1.jpg'} 
              alt={selectedBlog.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/blog_1.jpg';
              }}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${
              isDark ? 'from-[#0D0D0F]/60 via-transparent' : 'from-black/40 via-transparent'
            } to-transparent pointer-events-none`}></div>
          </div>

          {/* Tags Header */}
          {Array.isArray(selectedBlog.tags) && selectedBlog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {selectedBlog.tags.map((tag, i) => (
                <span 
                  key={i}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isDark 
                      ? 'bg-[#18181C] text-[#C9A050] border border-[#2A2A2E] hover:border-[#C9A050]/50' 
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  <Tag className="w-3 h-3 text-[#C9A050]" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}

          {/* Main Formatted HTML Content */}
          <div 
            className={`article-content prose max-w-none space-y-6 leading-relaxed text-base sm:text-lg font-sans transition-colors ${
              isDark ? 'prose-invert text-[#E5E1D8]' : 'text-gray-900'
            }`}
            style={{
              lineHeight: '1.85',
            }}
            dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
          />

          {/* Vedic Wisdom Callout Card */}
          <div className={`my-12 p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
            isDark 
              ? 'bg-gradient-to-r from-[#18181C] to-[#121215] border-[#C9A050]/30 shadow-xl' 
              : 'bg-gradient-to-r from-amber-50/80 to-white border-amber-200 shadow-md'
          }`}>
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-[#C9A050]/20 text-[#C9A050] shrink-0 mt-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`text-lg font-serif font-bold mb-1.5 ${isDark ? 'text-[#F0ECE1]' : 'text-amber-950'}`}>
                  Vedic Astrological Principle
                </h4>
                <p className={`text-sm sm:text-base italic leading-relaxed ${isDark ? 'text-[#9E9A90]' : 'text-gray-700'}`}>
                  "Yatha pinde tatha brahmande, yatha brahmande tatha pinde." — As is the individual, so is the universe; as is the microcosm, so is the macrocosm. Every planetary placement unfolds karmic blueprints for spiritual and worldly growth.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className={`pt-8 pb-12 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark ? 'border-[#2A2A2E]' : 'border-[#E5E1D8]'
          }`}>
            <button
              onClick={() => setSelectedBlog(null)}
              className={`w-full sm:w-auto px-6 py-3 rounded-full flex items-center justify-center space-x-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                isDark 
                  ? 'bg-[#18181C] text-[#F0ECE1] hover:text-[#C9A050] border border-[#2A2A2E] hover:border-[#C9A050]/50' 
                  : 'bg-white text-gray-800 hover:text-amber-800 border border-gray-200 shadow-sm'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Articles</span>
            </button>

            <button
              onClick={() => {
                setSelectedBlog(null);
                onBack();
              }}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#C9A050] hover:bg-[#D4AF37] text-[#0D0D0F] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C9A050]/20 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Explore Oracle & Charts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Related Articles Section */}
          {relatedBlogs.length > 0 && (
            <div className="pt-8 border-t border-white/10">
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-serif font-bold ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
                  Recommended <span className="italic font-light text-[#C9A050]">Cosmic Insights</span>
                </h3>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                  Continue exploring divine astrological knowledge.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relBlog) => (
                  <div
                    key={relBlog.id}
                    onClick={() => setSelectedBlog(relBlog)}
                    style={{
                      backgroundColor: isDark ? '#141418' : '#FFFFFF',
                    }}
                    className={`rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-1.5 duration-300 border shadow-lg group ${
                      isDark 
                        ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/50' 
                        : 'bg-[#FFFFFF] border-[#E2D9C8] hover:border-[#C9A050] shadow-stone-900/10'
                    }`}
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-black/20">
                      <img 
                        src={relBlog.image_url || '/blog_1.jpg'} 
                        alt={relBlog.title} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/blog_1.jpg';
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className={`p-5 flex-1 flex flex-col ${isDark ? 'bg-[#141418]' : 'bg-[#FFFFFF]'}`}>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
                        {relBlog.category || 'Vedic Wisdom'}
                      </span>
                      <h4 className={`text-sm font-semibold line-clamp-2 leading-snug mb-3 ${
                        isDark ? 'text-[#F0ECE1]' : 'text-[#181614] group-hover:text-[#8C6218] transition-colors'
                      }`}>
                        {relBlog.title}
                      </h4>
                      <span className={`mt-auto text-[11px] font-black uppercase tracking-wider ${
                        isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'
                      }`}>
                        Read Post →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: BLOGS DIRECTORY & GRID VIEW
  // ==========================================
  return (
    <div className={`min-h-[calc(100vh-5rem)] w-full pb-32 transition-colors ${
      isDark ? 'bg-[#0D0D0F] text-[#E5E1D8]' : 'bg-[#FAF8F5] text-[#0D0D0F]'
    }`}>
      {/* Top Control Bar: Full-width matching Navbar's left and right alignment */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <button 
            onClick={onBack}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all border shadow-sm cursor-pointer ${
              isDark 
                ? 'text-[#9E9A90] hover:text-[#C9A050] hover:bg-[#C9A050]/10 border-[#2A2A2E] hover:border-[#C9A050]/40' 
                : 'text-gray-700 hover:text-amber-800 hover:bg-amber-500/10 border-gray-200 hover:border-amber-600 bg-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-semibold">Back to Home</span>
          </button>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics..."
              className={`w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-full border outline-none transition-all ${
                isDark 
                  ? 'bg-[#18181C] border-[#2A2A2E] text-white focus:border-[#C9A050]' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-amber-600 shadow-sm'
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
      </div>

      {/* Main Blog Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title & Tagline */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-3 ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
            All <span className="italic font-light text-[#C9A050]">Blogs</span> & Insights
          </h1>
          <p className={`text-xs sm:text-sm max-w-3xl mx-auto mb-5 ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
            Explore authentic Vedic astrology, planetary yogas, kundli matching, and spiritual wisdom directly from our masters.
          </p>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-[#C9A050] text-[#0D0D0F] border-[#C9A050] shadow-md shadow-[#C9A050]/20'
                      : isDark
                        ? 'bg-[#18181C] text-[#9E9A90] hover:text-white border-[#2A2A2E]'
                        : 'bg-white text-gray-700 hover:text-black border-gray-200 shadow-sm'
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
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C9A050] mb-3"></div>
            <p className={`text-xs ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>Loading articles...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBlogs.length === 0 && (
          <div className={`max-w-md mx-auto text-center py-16 px-6 rounded-3xl border ${
            isDark ? 'bg-[#18181C]/60 border-white/5' : 'bg-white border-gray-100'
          }`}>
            <BookOpen className="w-10 h-10 text-[#C9A050]/60 mx-auto mb-3" />
            <h3 className={`text-lg font-serif font-bold mb-2 ${isDark ? 'text-[#F0ECE1]' : 'text-gray-900'}`}>
              {searchQuery ? 'No Matching Articles' : 'No Blogs Published Yet'}
            </h3>
            <p className={`text-xs mb-5 ${isDark ? 'text-[#9E9A90]' : 'text-gray-500'}`}>
              {searchQuery 
                ? `No articles found matching "${searchQuery}". Try a different search term.` 
                : 'Blogs created and published from the Admin Panel will appear here.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="px-4 py-1.5 rounded-full bg-[#C9A050] text-[#0D0D0F] text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Blog Grid */}
        {!loading && filteredBlogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBlogs.map((blog) => {
              const tagString = Array.isArray(blog.tags) && blog.tags.length > 0
                ? blog.tags.slice(0, 2).join(' • ')
                : blog.sub_category || 'VEDIC JYOTISH';

              const cleanExcerpt = blog.preview || 
                (blog.content ? blog.content.replace(/<[^>]*>?/gm, '').substring(0, 130) + '...' : '');

              return (
                <div 
                  key={blog.id}
                  onClick={() => setSelectedBlog(blog)}
                  style={{
                    backgroundColor: isDark ? '#141418' : '#FFFFFF',
                  }}
                  className={`rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-1.5 duration-300 shadow-xl border group relative z-10 ${
                    isDark 
                      ? 'bg-[#141418] border-[#2A2A2E] shadow-black/60 hover:border-[#C9A050]/60' 
                      : 'bg-[#FFFFFF] border-[#E2D9C8] shadow-xl shadow-stone-900/10 hover:border-[#C9A050] hover:shadow-2xl'
                  }`}
                >
                  {/* Card Image */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-black/20">
                    <img 
                      src={blog.image_url || '/blog_1.jpg'} 
                      alt={blog.title} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/blog_1.jpg';
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {blog.pinned === 1 && (
                      <span className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full bg-[#C9A050] text-[#0D0D0F] text-[10px] font-bold uppercase tracking-wider shadow-md">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  {/* Card Content - 100% Solid White background */}
                  <div 
                    style={{
                      backgroundColor: isDark ? '#141418' : '#FFFFFF',
                    }}
                    className={`p-6 flex-1 flex flex-col ${isDark ? 'bg-[#141418]' : 'bg-[#FFFFFF]'}`}
                  >
                    <div className="flex items-center space-x-2 mb-3 flex-wrap gap-y-1">
                      <span className={`text-[11px] font-extrabold uppercase tracking-[0.15em] ${isDark ? 'text-[#C9A050]' : 'text-[#8C6218]'}`}>
                        {blog.category || 'VEDIC ASTROLOGY'}
                      </span>
                      <span className={`text-[10px] ${isDark ? 'text-[#50505A]' : 'text-[#A0988A]'}`}>•</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider truncate max-w-[170px] ${isDark ? 'text-[#9E9A90]' : 'text-[#5A544A]'}`}>
                        {tagString}
                      </span>
                    </div>

                    <h3 className={`text-lg sm:text-xl font-serif font-bold mb-3 leading-snug line-clamp-2 ${
                      isDark ? 'text-[#F0ECE1]' : 'text-[#181614] group-hover:text-[#8C6218] transition-colors'
                    }`}>
                      {blog.title}
                    </h3>
                    
                    <p className={`text-xs sm:text-sm leading-relaxed mb-5 line-clamp-3 ${
                      isDark ? 'text-[#D0CCC2] font-normal' : 'text-[#4D473E] font-medium'
                    }`}>
                      {cleanExcerpt}
                    </p>

                    <div className={`mt-auto pt-3.5 border-t flex items-center justify-between ${
                      isDark ? 'border-white/10' : 'border-[#EAE3D4]'
                    }`}>
                      <span className={`text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 ${
                        isDark ? 'text-[#C9A050]' : 'text-[#8C6218] group-hover:text-[#63440B]'
                      }`}>
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>

                      {blog.created_at && (
                        <div className={`flex items-center space-x-1.5 text-[11px] font-bold ${isDark ? 'text-gray-400' : 'text-[#7A7366]'}`}>
                          <Calendar className="w-3.5 h-3.5 text-[#C9A050]" />
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
    </div>
  );
}
