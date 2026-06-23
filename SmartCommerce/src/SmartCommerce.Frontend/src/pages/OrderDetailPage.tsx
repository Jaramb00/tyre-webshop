import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Container, Typography, Paper, Grid2 as Grid, Chip, Box, Divider, Skeleton } from '@mui/material';
import { apiClient } from '../api/client';
import type { OrderDto } from '../types';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await apiClient.get<OrderDto>(`/orders/${id}`);
      return data;
    },
  });

  if (isLoading) return <Container><Skeleton variant="rectangular" height={500} sx={{ mt: 3, borderRadius: 2 }} /></Container>;
  if (!order) return <Container><Typography>Order not found</Typography></Container>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Order #{order.orderNumber}</Typography>
        <Chip label={order.status} color="primary" />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Items</Typography>
            {order.items.map(item => (
              <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <Box component="img" src={item.productImageUrl || '/placeholder.jpg'} sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight={600}>{item.productName}</Typography>
                  <Typography variant="body2" color="text.secondary">SKU: {item.productSku} · Qty: {item.quantity}</Typography>
                </Box>
                <Typography fontWeight={600}>${item.totalPrice.toFixed(2)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Subtotal</Typography><Typography>${order.subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Shipping</Typography><Typography>${order.shippingCost.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Tax</Typography><Typography>${order.taxAmount.toFixed(2)}</Typography>
            </Box>
            {order.discountAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                <Typography>Discount</Typography><Typography>-${order.discountAmount.toFixed(2)}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total</Typography><Typography variant="h6" fontWeight={700}>${order.total.toFixed(2)}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Shipping Address</Typography>
            <Typography>{order.shippingAddress.fullName}</Typography>
            <Typography>{order.shippingAddress.line1}</Typography>
            {order.shippingAddress.line2 && <Typography>{order.shippingAddress.line2}</Typography>}
            <Typography>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</Typography>
            <Typography>{order.shippingAddress.country}</Typography>
          </Paper>

          {order.shipment && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Shipment</Typography>
              <Typography variant="body2">Carrier: {order.shipment.carrier}</Typography>
              <Typography variant="body2">Tracking: {order.shipment.trackingNumber}</Typography>
              <Typography variant="body2">Status: <Chip label={order.shipment.status} size="small" /></Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
