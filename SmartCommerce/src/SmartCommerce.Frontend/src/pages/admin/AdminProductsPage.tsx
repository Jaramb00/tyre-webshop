import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Button, Chip } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { productsApi } from '../../api/products';

export default function AdminProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => productsApi.getProducts({ pageNumber: 1, pageSize: 100 }),
  });

  const columns: GridColDef[] = [
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'price', headerName: 'Price', width: 100, valueFormatter: (v) => `$${Number(v).toFixed(2)}` },
    { field: 'categoryName', headerName: 'Category', width: 130 },
    { field: 'brandName', headerName: 'Brand', width: 130 },
    { field: 'stockQuantity', headerName: 'Stock', width: 90 },
    {
      field: 'isActive', headerName: 'Status', width: 100,
      renderCell: ({ value }) => <Chip label={value ? 'Active' : 'Inactive'} color={value ? 'success' : 'default'} size="small" />,
    },
    { field: 'averageRating', headerName: 'Rating', width: 80, valueFormatter: (v) => Number(v).toFixed(1) },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>Add Product</Button>
      </Box>
      <DataGrid
        rows={data?.items || []}
        columns={columns}
        loading={isLoading}
        autoHeight
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
      />
    </Box>
  );
}
