import React, { useState, useRef, useMemo, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import { Plus, List, FileText, Folder, FolderOpen, Tag, ChevronDown, Image as ImageIcon, Search, Edit, Trash2, BookOpen, CheckCircle, Clock, LayoutGrid } from 'lucide-react';

interface AdminBlogsViewProps {
  theme?: 'dark' | 'light';
}

export const AdminBlogsView: React.FC<AdminBlogsViewProps> = ({ theme = 'dark' }) => {
  const editor = useRef(null);
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'categories'>('list');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data State
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  // Form State - Categories
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState('');
  
  // Form State - Blogs
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    sub_category: '',
    status: 'Published',
    tags: '',
    image_url: '',
    pinned: false,
    content: ''
  });

  const config = useMemo(() => ({
    readonly: false, 
    theme: theme === 'dark' ? 'dark' : 'default',
    height: 500,
    toolbarAdaptive: false,
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'video', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'fullsize'
    ],
    style: {
      background: theme === 'dark' ? '#0D0D0F' : '#FFFFFF',
      color: theme === 'dark' ? '#E5E1D8' : '#0D0D0F',
    }
  }), [theme]);

  // Load Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [blogsRes, catsRes, subCatsRes] = await Promise.all([
        fetch('http://localhost:5001/api/blogs'),
        fetch('http://localhost:5001/api/categories'),
        fetch('http://localhost:5001/api/subcategories')
      ]);
      
      const blogsData = await blogsRes.json();
      const catsData = await catsRes.json();
      const subCatsData = await subCatsRes.json();
      
      if (blogsData.status === 'success') setBlogs(blogsData.data);
      if (catsData.status === 'success') setCategories(catsData.data);
      if (subCatsData.status === 'success') setSubcategories(subCatsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter subcategories for the current blog form
  const availableSubcategories = subcategories.filter(sub => {
    const parentCat = categories.find(c => c.name === formData.category);
    return parentCat && sub.category_id === parentCat.id;
  });

  // Category Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    try {
      const res = await fetch('http://localhost:5001/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNewCategoryName('');
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Delete this category? This will also delete its subcategories.')) return;
    try {
      await fetch(`http://localhost:5001/api/categories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryName.trim() || !selectedCategoryForSub) return;
    
    try {
      const res = await fetch('http://localhost:5001/api/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newSubcategoryName.trim(), 
          category_id: parseInt(selectedCategoryForSub) 
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNewSubcategoryName('');
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    if (!window.confirm('Delete this subcategory?')) return;
    try {
      await fetch(`http://localhost:5001/api/subcategories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Blog Form Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      // If category changes, reset sub_category
      ...(name === 'category' ? { sub_category: '' } : {})
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: '',
      sub_category: '',
      status: 'Published',
      tags: '',
      image_url: '',
      pinned: false,
      content: ''
    });
  };

  const handleCreateNew = () => {
    resetForm();
    setViewMode('create');
  };

  const handleEdit = (blog: any) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title || '',
      category: blog.category || '',
      sub_category: blog.sub_category || '',
      status: blog.status || 'Published',
      tags: blog.tags ? blog.tags.join(', ') : '',
      image_url: blog.image_url || '',
      pinned: blog.pinned === 1,
      content: blog.content || ''
    });
    setViewMode('create');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/blogs/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.status === 'success') {
        fetchData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog.');
    }
  };

  const handleSave = async (statusOverride?: string) => {
    if (!formData.title || !formData.content) {
      alert('Title and Content are required!');
      return;
    }

    const payload = {
      ...formData,
      status: statusOverride || formData.status,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      preview: formData.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...',
    };

    try {
      const url = editingId 
        ? `http://localhost:5001/api/blogs/${editingId}` 
        : 'http://localhost:5001/api/blogs';
        
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        alert('Blog saved successfully!');
        resetForm();
        setViewMode('list');
        fetchData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog.');
    }
  };


  // Filter blogs based on search query
  const filteredBlogs = blogs.filter(b => 
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedCount = blogs.filter(b => b.status === 'Published').length;
  const draftCount = blogs.filter(b => b.status === 'Draft').length;

  return (
    <div className={`p-6 rounded-xl border shadow-xl ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#E5E1D8] text-[#0D0D0F]'}`}>
      <style>{`
        /* --- Premium JyotishVeda Jodit Theme Override --- */
        .jodit-toolbar__box, .jodit-toolbar, .jodit-workplace {
          background-color: ${theme === 'dark' ? '#141418' : '#F9F7F1'} !important;
          border-color: ${theme === 'dark' ? '#2A2A2E' : '#E5E1D8'} !important;
        }
        .jodit-container:not(.jodit_inline) {
          border-color: ${theme === 'dark' ? '#2A2A2E' : '#E5E1D8'} !important;
        }
        .jodit-ui-button__icon svg, .jodit-toolbar-button__icon svg {
          fill: ${theme === 'dark' ? '#E5E1D8' : '#0D0D0F'} !important;
        }
        .jodit-ui-button__icon_trigger svg {
          fill: ${theme === 'dark' ? '#9E9A90' : '#6C6960'} !important;
        }
        html body .jodit-toolbar-button[aria-pressed="true"],
        html body .jodit-ui-button[aria-pressed="true"], 
        html body .jodit-toolbar-button_active,
        html body .jodit-ui-button_active,
        html body .jodit-ui-button_active:not([disabled]) {
          background-color: ${theme === 'dark' ? '#C9A050' : 'rgba(201, 160, 80, 0.25)'} !important;
          border: 1px solid #C9A050 !important;
          border-radius: 6px !important;
        }
        html body .jodit-toolbar-button[aria-pressed="true"] svg,
        html body .jodit-ui-button[aria-pressed="true"] svg, 
        html body .jodit-toolbar-button_active svg,
        html body .jodit-ui-button_active svg,
        html body .jodit-ui-button_active:not([disabled]) svg {
          fill: ${theme === 'dark' ? '#0D0D0F' : '#C9A050'} !important;
        }
      `}</style>
      
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#2A2A2E]/50 pb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif mb-2 text-[#C9A050]">Manage Blogs</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>
            {viewMode === 'create' 
              ? (editingId ? 'Edit your blog post.' : 'Write and format new articles using the rich text editor.') 
              : viewMode === 'categories'
              ? 'Manage dynamic categories and subcategories for your blogs.'
              : 'View, edit, and manage existing blog posts.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
              viewMode === 'list'
                ? 'bg-[#C9A050] text-[#0D0D0F] font-semibold shadow-md'
                : theme === 'dark' 
                ? 'bg-transparent text-[#9E9A90] border border-[#2A2A2E] hover:border-[#C9A050]/50 hover:text-[#E5E1D8]' 
                : 'bg-transparent text-[#6C6960] border border-[#D5D1C8] hover:border-[#C9A050]/50 hover:text-[#0D0D0F]'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Blogs</span>
          </button>
          <button
            onClick={handleCreateNew}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
              viewMode === 'create'
                ? 'bg-[#C9A050] text-[#0D0D0F] font-semibold shadow-md'
                : theme === 'dark' 
                ? 'bg-transparent text-[#9E9A90] border border-[#2A2A2E] hover:border-[#C9A050]/50 hover:text-[#E5E1D8]' 
                : 'bg-transparent text-[#6C6960] border border-[#D5D1C8] hover:border-[#C9A050]/50 hover:text-[#0D0D0F]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingId ? 'Edit Post' : 'Create New'}</span>
          </button>
          <button
            onClick={() => setViewMode('categories')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
              viewMode === 'categories'
                ? 'bg-[#C9A050] text-[#0D0D0F] font-semibold shadow-md'
                : theme === 'dark' 
                ? 'bg-transparent text-[#9E9A90] border border-[#2A2A2E] hover:border-[#C9A050]/50 hover:text-[#E5E1D8]' 
                : 'bg-transparent text-[#6C6960] border border-[#D5D1C8] hover:border-[#C9A050]/50 hover:text-[#0D0D0F]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Categories</span>
          </button>
        </div>
      </div>
      
      {viewMode === 'list' ? (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9A90]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by title, category, or content..." 
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                theme === 'dark' 
                  ? 'bg-[#08080A]/50 border-[#2A2A2E] text-[#E5E1D8] placeholder-[#6C6960]' 
                  : 'bg-[#F9F7F1]/50 border-[#D5D1C8] text-[#0D0D0F] placeholder-[#9E9A90]'
              }`}
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
              <div>
                <p className={`text-xs uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>Total Posts</p>
                <h3 className="text-2xl font-bold font-serif text-[#C9A050]">{blogs.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#C9A050]/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#C9A050]" />
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
              <div>
                <p className={`text-xs uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>Published</p>
                <h3 className="text-2xl font-bold font-serif text-green-500">{publishedCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'bg-[#1A1A1E] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
              <div>
                <p className={`text-xs uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>Drafts</p>
                <h3 className={`text-2xl font-bold font-serif ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>{draftCount}</h3>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-[#2A2A2E]' : 'bg-[#E5E1D8]'}`}>
                <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`} />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className={`rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-[#1A1A1E]/50 border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className={`text-xs uppercase ${theme === 'dark' ? 'bg-[#08080A] text-[#9E9A90] border-b border-[#2A2A2E]' : 'bg-[#F9F7F1] text-[#6C6960] border-b border-[#E5E1D8]'}`}>
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Preview</th>
                    <th className="px-4 py-3 font-medium">Image</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Tags</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2E]/50">
                  {loading && blogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-[#9E9A90]">Loading blogs...</td>
                    </tr>
                  ) : filteredBlogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-[#9E9A90]">No blogs found.</td>
                    </tr>
                  ) : filteredBlogs.map((blog) => (
                    <tr key={blog.id} className={`transition-colors ${theme === 'dark' ? 'hover:bg-[#2A2A2E]/30' : 'hover:bg-[#F9F7F1]'}`}>
                      <td className="px-4 py-4">{blog.id}</td>
                      <td className="px-4 py-4">
                        <div className="font-semibold max-w-[200px] truncate" title={blog.title}>{blog.title}</div>
                        {blog.pinned === 1 && <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#C9A050]/20 text-[#C9A050] mt-1 inline-block">Pinned</span>}
                      </td>
                      <td className={`px-4 py-4 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>
                        <div className="max-w-[200px] truncate" title={blog.preview}>{blog.preview}</div>
                      </td>
                      <td className="px-4 py-4">
                        {blog.image_url ? (
                           <img src={blog.image_url} alt="Thumb" className="w-8 h-8 rounded object-cover" />
                        ) : (
                           <div className={`w-8 h-8 rounded flex items-center justify-center ${theme === 'dark' ? 'bg-[#2A2A2E]' : 'bg-[#E5E1D8]'}`}>
                             <ImageIcon className="w-4 h-4 text-[#9E9A90]" />
                           </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-[#4A90E2]">{blog.category}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1 flex-wrap max-w-[150px]">
                          {blog.tags && blog.tags.map((tag: string) => (
                            <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#E5E1D8] text-[#0D0D0F]'}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-medium ${blog.status === 'Published' ? 'text-green-500' : 'text-gray-500'}`}>{blog.status}</span>
                      </td>
                      <td className={`px-4 py-4 text-xs ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>
                        {new Date(blog.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(blog)} className="p-1.5 rounded-md hover:bg-[#C9A050]/20 text-[#C9A050] transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(blog.id)} className="p-1.5 rounded-md hover:bg-red-500/20 text-red-500 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : viewMode === 'categories' ? (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          
          {/* Categories Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Create Category */}
            <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-[#1A1A1E]/50 border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
              <h3 className="text-lg font-bold font-serif mb-4 text-[#C9A050]">Add Category</h3>
              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Astrology" 
                  className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[#08080A] border-[#2A2A2E] text-[#E5E1D8]' 
                      : 'bg-[#F9F7F1] border-[#D5D1C8] text-[#0D0D0F]'
                  }`}
                  required
                />
                <button type="submit" className="px-4 py-2 bg-[#C9A050] text-[#0D0D0F] font-semibold rounded-lg hover:bg-[#B89040] transition-colors">
                  Add
                </button>
              </form>

              <div className="mt-6 border-t border-[#2A2A2E]/50 pt-4">
                <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>Existing Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <div key={cat.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${theme === 'dark' ? 'bg-[#08080A] border-[#2A2A2E]' : 'bg-[#F9F7F1] border-[#D5D1C8]'}`}>
                      <span>{cat.name}</span>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && <span className={`text-sm ${theme === 'dark' ? 'text-[#6C6960]' : 'text-[#9E9A90]'}`}>No categories found.</span>}
                </div>
              </div>
            </div>

            {/* Create Subcategory */}
            <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-[#1A1A1E]/50 border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#E5E1D8]'}`}>
              <h3 className="text-lg font-bold font-serif mb-4 text-[#C9A050]">Add Subcategory</h3>
              <form onSubmit={handleCreateSubcategory} className="flex flex-col gap-3">
                <select 
                  value={selectedCategoryForSub}
                  onChange={(e) => setSelectedCategoryForSub(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[#08080A] border-[#2A2A2E] text-[#E5E1D8]' 
                      : 'bg-[#F9F7F1] border-[#D5D1C8] text-[#0D0D0F]'
                  }`}
                  required
                >
                  <option value="">Select Parent Category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="e.g. Daily Horoscope" 
                    className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                      theme === 'dark' 
                        ? 'bg-[#08080A] border-[#2A2A2E] text-[#E5E1D8]' 
                        : 'bg-[#F9F7F1] border-[#D5D1C8] text-[#0D0D0F]'
                    }`}
                    required
                  />
                  <button type="submit" className="px-4 py-2 bg-[#C9A050] text-[#0D0D0F] font-semibold rounded-lg hover:bg-[#B89040] transition-colors">
                    Add
                  </button>
                </div>
              </form>

              <div className="mt-6 border-t border-[#2A2A2E]/50 pt-4">
                <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>Existing Subcategories</h4>
                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map(cat => {
                    const subsForCat = subcategories.filter(s => s.category_id === cat.id);
                    if (subsForCat.length === 0) return null;
                    return (
                      <div key={cat.id}>
                        <p className={`text-xs uppercase mb-2 ${theme === 'dark' ? 'text-[#6C6960]' : 'text-[#9E9A90]'}`}>{cat.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {subsForCat.map(sub => (
                            <div key={sub.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E]' : 'bg-[#FFFFFF] border-[#D5D1C8]'}`}>
                              <span>{sub.name}</span>
                              <button onClick={() => handleDeleteSubcategory(sub.id)} className="text-red-500 hover:text-red-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {subcategories.length === 0 && <span className={`text-sm ${theme === 'dark' ? 'text-[#6C6960]' : 'text-[#9E9A90]'}`}>No subcategories found.</span>}
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Post Metadata Form */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl border ${theme === 'dark' ? 'bg-[#08080A]/50 border-[#2A2A2E]' : 'bg-[#F9F7F1]/50 border-[#D5D1C8]'}`}>
            
            {/* Title */}
            <div className="col-span-1 md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Title</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9A90]" />
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter post title" 
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder-[#6C6960]' 
                      : 'bg-[#FFFFFF] border-[#D5D1C8] text-[#0D0D0F] placeholder-[#9E9A90]'
                  }`}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Category</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9A90]" />
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] appearance-none transition-colors cursor-pointer ${
                      theme === 'dark' 
                        ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' 
                        : 'bg-[#FFFFFF] border-[#D5D1C8] text-[#0D0D0F]'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="_add_new_">+ Add New Category</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9A90] pointer-events-none" />
                </div>
              </div>
              
              {formData.category === '_add_new_' && (
                <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter new category name..."
                    className={`flex-1 px-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] transition-colors ${
                      theme === 'dark' ? 'bg-[#08080A] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#D5D1C8] text-[#0D0D0F]'
                    }`}
                  />
                  <button 
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-4 py-2 text-sm bg-[#C9A050] text-[#0D0D0F] font-semibold rounded-lg hover:bg-[#B89040]"
                  >
                    Save
                  </button>
                  <button type="button" onClick={() => setFormData(prev => ({...prev, category: ''}))} className="px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg">Cancel</button>
                </div>
              )}
            </div>

            {/* Sub Category */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Sub Category</label>
              <div className="relative">
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9A90]" />
                <select 
                  name="sub_category"
                  value={formData.sub_category}
                  onChange={handleInputChange}
                  disabled={!formData.category || formData.category === '_add_new_'}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] appearance-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === 'dark' 
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8]' 
                      : 'bg-[#FFFFFF] border-[#D5D1C8] text-[#0D0D0F]'
                  }`}
                >
                  <option value="">Select Sub Category</option>
                  {availableSubcategories.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                  {formData.category && formData.category !== '_add_new_' && (
                    <option value="_add_new_">+ Add New Subcategory</option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9A90] pointer-events-none" />
              </div>

              {formData.sub_category === '_add_new_' && (
                <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="Enter new subcategory..."
                    className={`flex-1 px-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] transition-colors ${
                      theme === 'dark' ? 'bg-[#08080A] border-[#2A2A2E] text-[#E5E1D8]' : 'bg-[#F9F7F1] border-[#D5D1C8] text-[#0D0D0F]'
                    }`}
                  />
                  <button 
                    type="button"
                    onClick={async () => {
                      if (!newSubcategoryName.trim()) return;
                      const parentCat = categories.find(c => c.name === formData.category);
                      if (!parentCat) return;
                      
                      try {
                        const res = await fetch('http://localhost:5001/api/subcategories', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            name: newSubcategoryName.trim(),
                            category_id: parentCat.id
                          })
                        });
                        const data = await res.json();
                        if (data.status === 'success') {
                          await fetchData();
                          setFormData(prev => ({ ...prev, sub_category: data.data.name }));
                          setNewSubcategoryName('');
                        } else {
                          alert(data.message);
                        }
                      } catch (error) {
                        console.error(error);
                      }
                    }}
                    className="px-4 py-2 text-sm bg-[#C9A050] text-[#0D0D0F] font-semibold rounded-lg hover:bg-[#B89040]"
                  >
                    Save
                  </button>
                  <button type="button" onClick={() => setFormData(prev => ({...prev, sub_category: ''}))} className="px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg">Cancel</button>
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Status</label>
              <div className="flex items-center space-x-6 py-2.5">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="radio" name="status" value="Published" checked={formData.status === 'Published'} onChange={handleInputChange} className="w-4 h-4 text-[#C9A050] bg-transparent border-[#2A2A2E] focus:ring-[#C9A050] cursor-pointer" />
                  <span className={`text-sm flex items-center transition-colors group-hover:text-[#C9A050] ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>
                    <span className={`w-2 h-2 rounded-full bg-green-500 mr-2 ${formData.status === 'Published' ? 'shadow-[0_0_8px_rgba(34,197,94,0.5)]' : ''}`}></span> Published
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="radio" name="status" value="Draft" checked={formData.status === 'Draft'} onChange={handleInputChange} className="w-4 h-4 text-[#C9A050] bg-transparent border-[#2A2A2E] focus:ring-[#C9A050] cursor-pointer" />
                  <span className={`text-sm flex items-center transition-colors group-hover:text-[#C9A050] ${theme === 'dark' ? 'text-[#9E9A90]' : 'text-[#6C6960]'}`}>
                    <span className="w-2 h-2 rounded-full bg-gray-500 mr-2"></span> Draft
                  </span>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Tags (comma separated)</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9A90]" />
                <input 
                  type="text" 
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g. Health, Anxiety, Recovery" 
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A050] focus:border-[#C9A050] transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[#141418] border-[#2A2A2E] text-[#E5E1D8] placeholder-[#6C6960]' 
                      : 'bg-[#FFFFFF] border-[#D5D1C8] text-[#0D0D0F] placeholder-[#9E9A90]'
                  }`}
                />
              </div>
            </div>

            {/* Featured Image - For now, we will use a text input for image URL since full file upload isn't implemented */}
            <div className="col-span-1 md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Featured Image URL</label>
              <div className={`flex items-center space-x-4 p-4 rounded-lg border border-dashed transition-colors ${theme === 'dark' ? 'bg-[#141418] border-[#2A2A2E] hover:border-[#C9A050]/50' : 'bg-[#F9F7F1] border-[#D5D1C8] hover:border-[#C9A050]/50'}`}>
                <ImageIcon className="w-4 h-4 text-[#9E9A90]" />
                <input 
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="Enter image URL..."
                  className="w-full bg-transparent border-none focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Pin Checkbox - Full Width */}
            <div className="col-span-1 md:col-span-2 pt-2 border-t border-[#2A2A2E]/50">
              <label className="flex items-center space-x-3 cursor-pointer group w-fit">
                <div className="relative flex items-center">
                  <input type="checkbox" name="pinned" checked={formData.pinned} onChange={handleInputChange} className="peer w-5 h-5 opacity-0 absolute cursor-pointer" />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                    theme === 'dark' 
                      ? 'border-[#2A2A2E] bg-[#141418] peer-checked:bg-[#C9A050] peer-checked:border-[#C9A050]' 
                      : 'border-[#D5D1C8] bg-[#FFFFFF] peer-checked:bg-[#C9A050] peer-checked:border-[#C9A050]'
                  }`}>
                    <svg className="w-3 h-3 text-[#0D0D0F] opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className={`text-sm font-medium transition-colors group-hover:text-[#C9A050] ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Pin this post to top</span>
              </label>
            </div>
          </div>

          {/* Text Editor */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#E5E1D8]' : 'text-[#0D0D0F]'}`}>Post Content</label>
            <div className="custom-jodit-wrapper w-full rounded-xl overflow-hidden shadow-sm border border-[#2A2A2E]">
              <JoditEditor
                ref={editor}
                value={formData.content}
                config={config}
                onBlur={newContent => setFormData(prev => ({...prev, content: newContent}))}
                onChange={newContent => {}}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#2A2A2E]/50">
            <button 
              onClick={() => handleSave('Draft')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors border ${
              theme === 'dark'
                ? 'bg-transparent border-[#2A2A2E] text-[#E5E1D8] hover:bg-[#2A2A2E]/50'
                : 'bg-transparent border-[#D5D1C8] text-[#0D0D0F] hover:bg-[#D5D1C8]/50'
            }`}>
              Save as Draft
            </button>
            <button 
              onClick={() => handleSave('Published')}
              className="px-6 py-2.5 bg-[#C9A050] text-[#0D0D0F] text-sm font-bold rounded-lg hover:bg-[#B89040] transition-colors shadow-lg shadow-[#C9A050]/20">
              Publish Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


