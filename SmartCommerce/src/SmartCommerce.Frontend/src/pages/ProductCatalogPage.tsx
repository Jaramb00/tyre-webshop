import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Container, Grid2 as Grid, Typography, Box, TextField, Slider,
  FormControl, InputLabel, Select, MenuItem, Pagination, Skeleton,
  Chip, InputAdornment, alpha, useTheme, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { productsApi } from '../api/products';
import ProductCard from '../components/products/ProductCard';
import { demoTyreProducts } from '../data/demoProducts';
import type { ProductListDto } from '../types';

const SEASON_FILTERS = [
  { value: '', label: 'Sve gume' },
  { value: 'summer', label: 'Ljetne' },
  { value: 'winter', label: 'Zimske' },
  { value: 'allseason', label: 'Cjelogodišnje' },
];

function matchesSeason(product: ProductListDto, season: string): boolean {
  if (!season) return true;
  const lower = product.categoryName.toLowerCase();
  if (season === 'summer') return lower.includes('summer') || lower.includes('ljetn');
  if (season === 'winter') return lower.includes('winter') || lower.includes('zimsk');
  if (season === 'allseason') return lower.includes('all season') || lower.includes('all-season');
  return true;
}

export default function ProductCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [season, setSeason] = useState('');
  const theme = useTheme();

  const pageNumber = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', { pageNumber, search, sortBy, priceRange }],
    queryFn: () =>
      productsApi.getProducts({
        pageNumber,
        pageSize: 12,
        search: search || undefined,
        sortBy,
        minPrice: priceRange[0] || undefined,
        maxPrice: priceRange[1] < 5000 ? priceRange[1] : undefined,
        isActive: true,
      }),
  });

  const handleSearch = (value: string) => {
    setSearchParams(prev => {
      value ? prev.set('search', value) : prev.delete('search');
      prev.set('page', '1');
      return prev;
    });
  };

  const handleSort = (value: string) => {
    setSearchParams(prev => {
      prev.set('sortBy', value);
      prev.set('page', '1');
      return prev;
    });
  };

  // When API returns no products, fall back to demo data
  const apiHasProducts = !isLoading && !error && (data?.items.length ?? 0) > 0;
  const usingDemo = !isLoading && !apiHasProducts;

  const demoFiltered = demoTyreProducts
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brandName.toLowerCase().includes(search.toLowerCase()))
    .filter(p => matchesSeason(p, season))
    .filter(p => p.price >= priceRange[0] && p.price <= (priceRange[1] < 5000 ? priceRange[1] : Infinity));

  const displayItems = apiHasProducts
    ? (data?.items ?? []).filter(p => matchesSeason(p, season))
    : demoFiltered;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100dvh' }}>
      {/* Page header */}
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="xl">
          <Typography
            variant="subtitle2"
            color="primary"
            sx={{ mb: 1, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.7rem' }}
          >
            Katalog
          </Typography>
          <Typography variant="h3" sx={{ mb: 0.5, textTransform: 'uppercase' }}>
            Gume
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {usingDemo
              ? `${demoFiltered.length} demo proizvoda`
              : data
              ? `${data.totalCount.toLocaleString()} guma u ponudi`
              : 'Pregledajte našu ponudu'}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Demo notice banner */}
        {usingDemo && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: '8px',
              bgcolor: alpha(theme.palette.warning.main, 0.07),
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.2),
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <WarningAmberOutlinedIcon sx={{ color: 'warning.main', fontSize: 18, flexShrink: 0 }} />
            <Typography variant="body2" color="warning.main" fontWeight={600}>
              Prikazuju se demo proizvodi — privremeni uzorci koji će biti zamijenjeni stvarnim katalogom.
            </Typography>
          </Box>
        )}

        {/* Season filter tabs */}
        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={season}
            exclusive
            onChange={(_, v) => { if (v !== null) setSeason(v); }}
            size="small"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.75,
              '& .MuiToggleButton-root': {
                borderRadius: '6px !important',
                border: '1px solid',
                borderColor: 'divider',
                px: { xs: 1.75, sm: 2.5 },
                py: 0.75,
                minHeight: 40,
                fontFamily: '"Barlow", sans-serif',
                fontWeight: 700,
                fontSize: '0.78rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: '#fff',
                  borderColor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                },
                '&:not(.Mui-selected):hover': {
                  borderColor: 'primary.main',
                  color: 'text.primary',
                },
              },
            }}
          >
            {SEASON_FILTERS.map(f => (
              <ToggleButton key={f.value} value={f.value}>
                {f.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Filters bar */}
        <Box
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            mb: 4,
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                placeholder="Pretraži gume, brendove…"
                defaultValue={search}
                onChange={e => handleSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sortiranje</InputLabel>
                <Select value={sortBy} label="Sortiranje" onChange={e => handleSort(e.target.value)}>
                  <MenuItem value="newest">Najnovije</MenuItem>
                  <MenuItem value="price">Cijena: niža → viša</MenuItem>
                  <MenuItem value="name">Naziv A–Ž</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ px: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Raspon cijena
                  </Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
                    {priceRange[0].toLocaleString()} € – {priceRange[1] === 5000 ? '5.000+ €' : `${priceRange[1].toLocaleString()} €`}
                  </Typography>
                </Box>
                <Slider
                  value={priceRange}
                  onChange={(_, v) => setPriceRange(v as number[])}
                  max={5000}
                  step={10}
                  size="small"
                  valueLabelDisplay="auto"
                  valueLabelFormat={v => `${v} €`}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Active filters */}
          {(search || season) && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {search && (
                <Chip
                  label={`Pretraga: "${search}"`}
                  onDelete={() => handleSearch('')}
                  size="small"
                  variant="outlined"
                />
              )}
              {season && (
                <Chip
                  label={SEASON_FILTERS.find(f => f.value === season)?.label}
                  onDelete={() => setSeason('')}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>

        {/* Error state */}
        {error && !usingDemo && (
          <Box
            sx={{
              p: 4,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'error.main',
              bgcolor: alpha(theme.palette.error.main, 0.06),
              textAlign: 'center',
              mb: 4,
            }}
          >
            <Typography color="error" fontWeight={600}>
              Greška pri učitavanju proizvoda. Provjerite vezu i pokušajte ponovo.
            </Typography>
          </Box>
        )}

        {/* Grid */}
        <Grid container spacing={2.5}>
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Skeleton
                    variant="rectangular"
                    sx={{ borderRadius: '14px', aspectRatio: '3/4' }}
                  />
                </Grid>
              ))
            : displayItems.map(product => (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <ProductCard product={product} />
                </Grid>
              ))}
        </Grid>

        {/* Empty state */}
        {!isLoading && displayItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 16 }}>
            <Typography variant="h5" sx={{ mb: 1, textTransform: 'uppercase' }}>
              Nema pronađenih guma
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pokušajte s drugačijim pojmom pretrage ili uklonite aktivne filtere.
            </Typography>
          </Box>
        )}

        {/* Pagination — only when using real API data */}
        {!usingDemo && data && data.totalPages > 1 && (
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={data.totalPages}
              page={pageNumber}
              onChange={(_, page) =>
                setSearchParams(prev => { prev.set('page', String(page)); return prev; })
              }
              color="primary"
              size="large"
              shape="rounded"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
