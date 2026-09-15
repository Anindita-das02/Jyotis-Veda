import { api } from './api';
import { API_ENDPOINTS } from '../config/api_config';

export interface BlogPost {
  id: number;
  title: string;
  category: string;
  sub_category?: string;
  author: string;
  date: string;
  read_time: string;
  views: number;
  status: 'Published' | 'Draft';
  tags: string[];
  image_url: string;
  pinned: number;
  preview?: string;
  content: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

export const blogApi = {
  getBlogs: async (): Promise<BlogPost[]> => {
    return api.get<BlogPost[]>(API_ENDPOINTS.BLOGS.LIST);
  },

  getBlog: async (id: string | number): Promise<BlogPost> => {
    return api.get<BlogPost>(API_ENDPOINTS.BLOGS.DETAIL(id));
  },

  createBlog: async (payload: any): Promise<any> => {
    return api.post(API_ENDPOINTS.BLOGS.LIST, payload);
  },

  updateBlog: async (id: string | number, payload: any): Promise<any> => {
    return api.put(API_ENDPOINTS.BLOGS.DETAIL(id), payload);
  },

  deleteBlog: async (id: string | number): Promise<any> => {
    return api.delete(API_ENDPOINTS.BLOGS.DETAIL(id));
  },

  getCategories: async (): Promise<Category[]> => {
    return api.get<Category[]>(API_ENDPOINTS.BLOGS.CATEGORIES);
  },

  createCategory: async (name: string): Promise<any> => {
    return api.post(API_ENDPOINTS.BLOGS.CATEGORIES, { name });
  },

  deleteCategory: async (id: number): Promise<any> => {
    return api.delete(API_ENDPOINTS.BLOGS.CATEGORY_DETAIL(id));
  },

  getSubcategories: async (): Promise<Subcategory[]> => {
    return api.get<Subcategory[]>(API_ENDPOINTS.BLOGS.SUBCATEGORIES);
  },

  createSubcategory: async (name: string, categoryId: number): Promise<any> => {
    return api.post(API_ENDPOINTS.BLOGS.SUBCATEGORIES, { name, category_id: categoryId });
  },

  deleteSubcategory: async (id: number): Promise<any> => {
    return api.delete(API_ENDPOINTS.BLOGS.SUBCATEGORY_DETAIL(id));
  },
};
