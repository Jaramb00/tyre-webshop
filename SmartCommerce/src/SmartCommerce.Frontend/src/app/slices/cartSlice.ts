import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';
import type { CartDto } from '../../types';

interface CartState {
  cart: CartDto | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = { cart: null, isLoading: false, error: null };

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get<CartDto>('/cart');
    return data;
  } catch (e) {
    return rejectWithValue('Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ productId, quantity }: { productId: string; quantity: number }, { dispatch, rejectWithValue }) => {
    try {
      await apiClient.post('/cart/items', { productId, quantity });
      dispatch(fetchCart());
    } catch (e) {
      return rejectWithValue('Failed to add item to cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId: string, { dispatch, rejectWithValue }) => {
    try {
      await apiClient.delete(`/cart/items/${productId}`);
      dispatch(fetchCart());
    } catch (e) {
      return rejectWithValue('Failed to remove item');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default cartSlice.reducer;
