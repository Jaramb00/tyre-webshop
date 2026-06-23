import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Paper, Grid2 as Grid,
  IconButton, TextField, Divider, Skeleton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchCart, removeFromCart } from '../app/slices/cartSlice';
import type { RootState, AppDispatch } from '../app/store';
import { apiClient } from '../api/client';
import { useSnackbar } from 'notistack';

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { cart, isLoading } = useSelector((state: RootState) => state.cart);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const handleRemove = async (productId: string) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap();
      enqueueSnackbar('Item removed from cart', { variant: 'info' });
    } catch {
      enqueueSnackbar('Failed to remove item', { variant: 'error' });
    }
  };

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await apiClient.patch(`/cart/items/${productId}`, { quantity });
      dispatch(fetchCart());
    } catch {
      enqueueSnackbar('Failed to update quantity', { variant: 'error' });
    }
  };

  if (isLoading) return <Container><Skeleton variant="rectangular" height={400} sx={{ mt: 3, borderRadius: 2 }} /></Container>;

  if (!cart?.items.length) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
        <Button variant="contained" component={RouterLink} to="/products" sx={{ mt: 2 }}>Browse Products</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" fontWeight={700} gutterBottom>Shopping Cart</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {cart.items.map(item => (
            <Paper key={item.id} sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box component="img" src={item.productImageUrl || '/placeholder.jpg'} sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>{item.productName}</Typography>
                <Typography variant="body2" color="text.secondary">${item.unitPrice.toFixed(2)} each</Typography>
              </Box>
              <TextField
                type="number"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                inputProps={{ min: 1, max: item.maxQuantity || 99, style: { width: 60, textAlign: 'center' } }}
                size="small"
              />
              <Typography variant="subtitle1" fontWeight={700} sx={{ minWidth: 80, textAlign: 'right' }}>
                ${item.totalPrice.toFixed(2)}
              </Typography>
              <IconButton onClick={() => handleRemove(item.productId)} color="error"><DeleteIcon /></IconButton>
            </Paper>
          ))}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Order Summary</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal ({cart.totalItems} items)</Typography>
              <Typography fontWeight={600}>${cart.subTotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Shipping</Typography>
              <Typography color="success.main">{cart.subTotal >= 50 ? 'FREE' : '$5.99'}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" fontWeight={700}>
                ${(cart.subTotal + (cart.subTotal >= 50 ? 0 : 5.99)).toFixed(2)}
              </Typography>
            </Box>
            <Button variant="contained" fullWidth size="large" component={RouterLink} to="/checkout">
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
