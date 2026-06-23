import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container, Typography, Box, TextField, Button, Divider,
  CircularProgress, Grid2 as Grid, alpha, useTheme,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useState } from 'react';
import { apiClient } from '../api/client';
import { useSnackbar } from 'notistack';
import type { RootState } from '../app/store';

const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  line1: z.string().min(1, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State / region is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().length(2, 'Use a 2-letter country code (e.g. HR, US)'),
  phoneNumber: z.string().optional(),
});

const schema = z.object({
  shippingAddress: addressSchema,
  couponCode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { cart } = useSelector((state: RootState) => state.cart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { data: orderId } = await apiClient.post('/orders', {
        shippingAddress: data.shippingAddress,
        billingAddress: data.shippingAddress,
        couponCode: data.couponCode || undefined,
      });
      enqueueSnackbar('Order placed successfully', { variant: 'success' });
      navigate(`/orders/${orderId}`);
    } catch {
      enqueueSnackbar('Could not place order. Please try again.', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const shipping = (cart?.subTotal ?? 0) >= 50 ? 0 : 5.99;
  const total = (cart?.subTotal ?? 0) + shipping;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100dvh - 64px)', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 6 }}>
          Checkout
        </Typography>

        <Grid container spacing={4} alignItems="flex-start">
          {/* Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 0.75,
                    borderRadius: '8px',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                  }}
                >
                  <LocalShippingOutlinedIcon fontSize="small" />
                </Box>
                <Typography variant="h6">Shipping address</Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      {...register('shippingAddress.fullName')}
                      label="Full name"
                      fullWidth
                      autoComplete="name"
                      error={!!errors.shippingAddress?.fullName}
                      helperText={errors.shippingAddress?.fullName?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      {...register('shippingAddress.line1')}
                      label="Address line 1"
                      fullWidth
                      autoComplete="address-line1"
                      error={!!errors.shippingAddress?.line1}
                      helperText={errors.shippingAddress?.line1?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      {...register('shippingAddress.line2')}
                      label="Address line 2 (optional)"
                      fullWidth
                      autoComplete="address-line2"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      {...register('shippingAddress.city')}
                      label="City"
                      fullWidth
                      autoComplete="address-level2"
                      error={!!errors.shippingAddress?.city}
                      helperText={errors.shippingAddress?.city?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      {...register('shippingAddress.state')}
                      label="State / region"
                      fullWidth
                      autoComplete="address-level1"
                      error={!!errors.shippingAddress?.state}
                      helperText={errors.shippingAddress?.state?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      {...register('shippingAddress.postalCode')}
                      label="Postal code"
                      fullWidth
                      autoComplete="postal-code"
                      error={!!errors.shippingAddress?.postalCode}
                      helperText={errors.shippingAddress?.postalCode?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      {...register('shippingAddress.country')}
                      label="Country code"
                      fullWidth
                      autoComplete="country"
                      placeholder="HR"
                      spellCheck={false}
                      inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
                      error={!!errors.shippingAddress?.country}
                      helperText={errors.shippingAddress?.country?.message || '2-letter ISO code: HR, US, DE, GB…'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      {...register('shippingAddress.phoneNumber')}
                      label="Phone number (optional)"
                      fullWidth
                      type="tel"
                      autoComplete="tel"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 0.5 }} />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      {...register('couponCode')}
                      label="Coupon code (optional)"
                      fullWidth
                      spellCheck={false}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  startIcon={!isSubmitting && <LockOutlinedIcon fontSize="small" />}
                  sx={{ mt: 4, borderRadius: 2, py: 1.5 }}
                >
                  {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Place order'}
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Order summary */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                position: { md: 'sticky' },
                top: { md: 88 },
              }}
            >
              <Typography variant="h6" sx={{ mb: 3 }}>
                Order summary
              </Typography>

              {cart?.items.map(item => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0 }} noWrap>
                    {item.productName}
                    <Typography component="span" variant="caption" color="text.secondary">
                      {' '}×{item.quantity}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" fontWeight={600} flexShrink={0}>
                    ${item.totalPrice.toFixed(2)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2.5 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    ${(cart?.subTotal ?? 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  <Typography variant="body2" fontWeight={500} color={shipping === 0 ? 'success.main' : 'text.primary'}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </Typography>
                </Box>
                {shipping > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Free shipping on orders over $50
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h5" fontWeight={800}>
                  ${total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
