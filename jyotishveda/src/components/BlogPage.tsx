import React from 'react';
import { MOCK_BLOGS } from './BlogCarousel';
import { ArrowLeft } from 'lucide-react';

interface BlogPageProps {
  theme: 'light' | 'dark';
  onBack: () => void;
}

export function BlogPage({ theme, onBack }: BlogPageProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-[calc(100vh-5rem)] w-full pb-20 ${isDark ? 'bg-transparent text-[#E5E1D8]' : 'bg-transparent text-[#0D0D0F]'}`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-16 text-center relative">
          <button 
            onClick={onBack}
            className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
              isDark ? 'text-[#9E9A90] hover:text-[#C9A050] hover:bg-white/5' : 'text-gray-600 hover:text-amber-700 hover:bg-black/5'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back</span>
          </button>

          <h2 className={`text-4xl md:text-5xl font-serif mb-4 ${isDark ? 'text-[#F0ECE1]' : 'text-[#0D0D0F]'}`}>
            All <span className="italic font-light text-[#C9A050]">Blogs</span> & Stories
          </h2>
          <p className={`text-sm md:text-base max-w-xl ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
            Explore our complete collection of deep dives into Vedic astrology, sacred geometry, and spiritual wisdom.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_BLOGS.map((blog) => (
            <div 
              key={blog.id}
              className={`rounded-[2rem] overflow-hidden flex flex-col cursor-pointer transition-transform hover:-translate-y-2 duration-300 shadow-xl border ${
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
                
                <p className={`text-sm leading-relaxed mb-6 mt-auto ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                  {blog.excerpt}
                </p>

                <div className="mt-auto">
                  <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    isDark ? 'text-[#C9A050] hover:text-[#D4AF37]' : 'text-amber-700 hover:text-amber-600'
                  }`}>
                    Read Article →
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Mock extra blogs to show grid filling out */}
          {MOCK_BLOGS.map((blog) => (
            <div 
              key={`extra-${blog.id}`}
              className={`rounded-[2rem] overflow-hidden flex flex-col cursor-pointer transition-transform hover:-translate-y-2 duration-300 shadow-xl border ${
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
                
                <p className={`text-sm leading-relaxed mb-6 mt-auto ${isDark ? 'text-[#9E9A90]' : 'text-gray-600'}`}>
                  {blog.excerpt}
                </p>

                <div className="mt-auto">
                  <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    isDark ? 'text-[#C9A050] hover:text-[#D4AF37]' : 'text-amber-700 hover:text-amber-600'
                  }`}>
                    Read Article →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
