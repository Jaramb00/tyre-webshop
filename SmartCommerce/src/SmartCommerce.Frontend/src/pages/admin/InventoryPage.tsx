import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Chip, LinearProgress, Paper, Grid2 as Grid } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import WarningIcon from '@mui/icons-material/Warning';
import { apiClient } from '../../api/client';

export default function InventoryPage() {
  const { data: lowStock, isLoading } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: async () => {
      const { data } = await apiClient.get('/inventory/low-stock');
      return data;
    },
  });

  const columns: GridColDef[] = [
    { field: 'productName', headerName: 'Product', flex: 1 },
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'quantityInStock', headerName: 'Stock', width: 100 },
    { field: 'lowStockThreshold', headerName: 'Threshold', width: 110 },
    {
      field: 'stockLevel', headerName: 'Level', width: 150,
      renderCell: ({ row }) => {
        const pct = Math.min(100, (row.quantityInStock / row.lowStockThreshold) * 100);
        return (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress variant="determinate" value={pct} color={pct < 50 ? 'error' : 'warning'} sx={{ flex: 1 }} />
            <Typography variant="caption">{row.quantityInStock}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'status', headerName: 'Status', width: 120,
      renderCell: ({ row }) => (
        <Chip
          icon={<WarningIcon />}
          label={row.quantityInStock === 0 ? 'Out of Stock' : 'Low Stock'}
          color={row.quantityInStock === 0 ? 'error' : 'warning'}
          size="small"
        />
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Inventory Management</Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Low Stock Items', value: lowStock?.length || 0, color: 'warning.main' },
          { label: 'Out of Stock', value: lowStock?.filter((i: { quantityInStock: number }) => i.quantityInStock === 0).length || 0, color: 'error.main' },
        ].map(stat => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              <Typography variant="h4" fontWeight={700} color={stat.color}>{stat.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={600} gutterBottom>Low Stock Alerts</Typography>
      <DataGrid
        rows={lowStock || []}
        columns={columns}
        loading={isLoading}
        autoHeight
        pageSizeOptions={[25, 50]}
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
      />
    </Box>
  );
}
