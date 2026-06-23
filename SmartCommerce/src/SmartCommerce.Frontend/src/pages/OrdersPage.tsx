import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Paper, Box, Chip, Button, Skeleton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { apiClient } from '../api/client';
import type { PaginatedList, OrderSummaryDto } from '../types';

const statusColor: Record<string, 'default' | 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  Pending: 'warning', Confirmed: 'info', Processing: 'primary', Shipped: 'primary',
  Delivered: 'success', Cancelled: 'error', Refunded: 'default',
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'my'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedList<OrderSummaryDto>>('/orders/my');
      return data;
    },
  });

  if (isLoading) return <Container><Skeleton variant="rectangular" height={400} sx={{ mt: 3, borderRadius: 2 }} /></Container>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" fontWeight={700} gutterBottom>My Orders</Typography>
      {!data?.items.length ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" gutterBottom>No orders yet</Typography>
          <Button variant="contained" component={RouterLink} to="/products">Start Shopping</Button>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map(order => (
                <TableRow key={order.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{order.itemCount}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell><Chip label={order.status} color={statusColor[order.status] || 'default'} size="small" /></TableCell>
                  <TableCell>
                    <Button size="small" component={RouterLink} to={`/orders/${order.id}`}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
