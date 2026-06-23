import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Grid2 as Grid, Typography, Box, Button, Rating,
  Chip, Skeleton, Divider, TextField, Breadcrumbs, Link
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { productsApi } from '../api/products';
import { addToCart } from '../app/slices/cartSlice';
import { useSnackbar } from 'notistack';
import type { RootState, AppDispatch } from '../app/store';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { enqueueSnackbar } = useSnackbar();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getProductBySlug(slug!),
    enabled: !!slug,
  });

  const handleAddToCart = async () => {
    if (!user) { enqueueSnackbar('Please login first', { variant: 'warning' }); return; }
    if (!product) return;
    try {
      await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
      enqueueSnackbar(`${product.name} added to cart!`, { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to add to cart', { variant: 'error' });
    }
  };

  if (isLoading) return <Container><Skeleton variant="rectangular" height={500} sx={{ mt: 3, borderRadius: 2 }} /></Container>;
  if (!product) return <Container><Typography>Product not found</Typography></Container>;

  const images = product.imageUrls?.length ? product.imageUrls : [product.imageUrl || '/placeholder.jpg'];

  return (
    <Container maxWidth="xl">
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/products" underline="hover">Products</Link>
        <Link href="#" underline="hover">{product.categoryName}</Link>
        <Typography>{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box component="img" src={images[activeImage]} sx={{ width: '100%', borderRadius: 2, maxHeight: 500, objectFit: 'cover' }} />
          {images.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <Box key={i} component="img" src={img} onClick={() => setActiveImage(i)}
                  sx={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 1, cursor: 'pointer',
                    border: i === activeImage ? '2px solid' : '2px solid transparent', borderColor: 'primary.main' }} />
              ))}
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Chip label={product.brandName} size="small" sx={{ mb: 1 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>{product.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Rating value={product.averageRating} precision={0.5} readOnly />
            <Typography color="text.secondary">({product.reviewCount} reviews)</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
            <Typography variant="h4" color="primary.main" fontWeight={700}>${product.price.toFixed(2)}</Typography>
            {product.compareAtPrice && (
              <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                ${product.compareAtPrice.toFixed(2)}
              </Typography>
            )}
          </Box>

          {product.shortDescription && (
            <Typography color="text.secondary" sx={{ mb: 3 }}>{product.shortDescription}</Typography>
          )}

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <TextField
              type="number"
              label="Qty"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1, max: product.stockQuantity || 99 }}
              sx={{ width: 100 }}
              size="small"
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={product.isOutOfStock}
              sx={{ flexGrow: 1 }}
            >
              {product.isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </Box>

          {product.stockQuantity !== undefined && (
            <Typography variant="body2" color={product.isLowStock ? 'warning.main' : 'success.main'}>
              {product.isOutOfStock ? 'Out of stock' : product.isLowStock ? `Only ${product.stockQuantity} left!` : `${product.stockQuantity} in stock`}
            </Typography>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="body1">{product.description}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
