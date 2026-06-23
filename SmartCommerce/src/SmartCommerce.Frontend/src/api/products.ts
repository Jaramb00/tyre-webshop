import { apiClient } from './client';
import type { PaginatedList, ProductDto, ProductListDto, ProductSearchParams } from '../types';

export const productsApi = {
  getProducts: async (params: ProductSearchParams): Promise<PaginatedList<ProductListDto>> => {
    const { data } = await apiClient.get('/products', { params });
    return data;
  },

  getProductById: async (id: string): Promise<ProductDto> => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  getProductBySlug: async (slug: string): Promise<ProductDto> => {
    const { data } = await apiClient.get(`/products/slug/${slug}`);
    return data;
  },

  createProduct: async (product: FormData): Promise<string> => {
    const { data } = await apiClient.post('/products', product, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  updateProduct: async (id: string, product: Partial<ProductDto>): Promise<void> => {
    await apiClient.put(`/products/${id}`, product);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  publishProduct: async (id: string): Promise<void> => {
    await apiClient.post(`/products/${id}/publish`);
  },
};
