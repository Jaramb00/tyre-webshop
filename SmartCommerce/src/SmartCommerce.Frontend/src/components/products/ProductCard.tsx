import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography, Button, Box, IconButton, Tooltip, alpha, useTheme, Chip,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useSnackbar } from 'notistack';
import type { ProductListDto } from '../../types';
import type { RootState, AppDispatch } from '../../app/store';
import { addToCart } from '../../app/slices/cartSlice';
import { isDemoProduct, DEMO_NOTICE } from '../../data/demoProducts';

interface ProductCardProps {
  product: ProductListDto;
}

function extractTyreSize(name: string): string | null {
  const match = name.match(/\d{3}\/\d{2}\s*R\d{2}/i);
  return match ? match[0].replace(/\s+/, ' ') : null;
}

function getSeasonTag(categoryName: string): { label: string; color: 'summer' | 'winter' | 'allseason' } | null {
  const lower = categoryName.toLowerCase();
  if (lower.includes('summer') || lower.includes('ljetn')) return { label: 'Ljetna', color: 'summer' };
  if (lower.includes('winter') || lower.includes('zimsk')) return { label: 'Zimska', color: 'winter' };
  if (lower.includes('all season') || lower.includes('all-season')) return { label: 'Cjelogodišnja', color: 'allseason' };
  return null;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      enqueueSnackbar('Prijavite se za dodavanje u košaricu', { variant: 'warning' });
      return;
    }
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
      enqueueSnackbar(`${product.name} dodano u košaricu`, { variant: 'success' });
    } catch {
      enqueueSnackbar('Nije moguće dodati u košaricu. Pokušajte ponovo.', { variant: 'error' });
    }
  };

  const discountPercent = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  const isOutOfStock = product.stockQuantity === 0;
  const tyreSize = extractTyreSize(product.name);
  const season = getSeasonTag(product.categoryName);
  const isDemo = isDemoProduct(product.id);

  return (
    <Box
      sx={{
        borderRadius: '14px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s cubic-bezier(0.32,0.72,0,1), box-shadow 0.3s cubic-bezier(0.32,0.72,0,1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 16px 40px ${alpha(theme.palette.mode === 'dark' ? '#000' : '#111', 0.10)}`,
        },
        '&:hover .card-cta': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      }}
    >
      {/* Image */}
      <Box
        component={RouterLink}
        to={`/products/${product.slug}`}
        sx={{
          display: 'block',
          m: 1.25,
          borderRadius: '9px',
          overflow: 'hidden',
          bgcolor: theme.palette.mode === 'dark' ? '#1E1E1E' : '#EBEBEB',
          position: 'relative',
          flexShrink: 0,
          aspectRatio: '4/3',
        }}
      >
        <Box
          component="img"
          src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/450`}
          alt={product.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.32,0.72,0,1)',
            '.MuiBox-root:hover &': { transform: 'scale(1.04)' },
          }}
        />

        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          {season && (
            <Box sx={seasonBadgeSx(season.color)}>{season.label}</Box>
          )}
          {product.isFeatured && !season && (
            <Box sx={badgeSx('amber')}>Istaknuto</Box>
          )}
          {discountPercent && (
            <Box sx={badgeSx('red')}>−{discountPercent}%</Box>
          )}
          {product.isLowStock && !isOutOfStock && (
            <Box sx={badgeSx('orange')}>Malo na zalihi</Box>
          )}
        </Box>

        {/* Wishlist */}
        <Tooltip title="Spremi za kasnije">
          <IconButton
            size="small"
            aria-label="Spremi na listu želja"
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              bgcolor: alpha('#fff', 0.9),
              backdropFilter: 'blur(4px)',
              color: 'text.secondary',
              width: { xs: 38, md: 32 },
              height: { xs: 38, md: 32 },
              '&:hover': { bgcolor: '#fff', color: 'error.main' },
              transition: 'all 0.2s',
            }}
          >
            <FavoriteBorderIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2, pb: 2, pt: 1, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, letterSpacing: '0.04em', mb: 0.5, textTransform: 'uppercase', fontSize: '0.68rem' }}
        >
          {product.brandName}
        </Typography>

        <Typography
          variant="subtitle1"
          component={RouterLink}
          to={`/products/${product.slug}`}
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'text.primary',
            textDecoration: 'none',
            fontWeight: 600,
            lineHeight: 1.3,
            mb: tyreSize ? 0.5 : 1,
            '&:hover': { color: 'primary.main' },
            transition: 'color 0.15s',
            fontFamily: '"Barlow", sans-serif',
          }}
        >
          {tyreSize
            ? product.name.replace(tyreSize, '').trim().replace(/\s+$/, '')
            : product.name}
        </Typography>

        {/* Tyre size chip */}
        {tyreSize && (
          <Box sx={{ mb: 1 }}>
            <Chip
              label={tyreSize}
              size="small"
              sx={{
                fontFamily: '"Barlow Condensed", sans-serif',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(166,124,60,0.12)'
                  : 'rgba(166,124,60,0.08)',
                color: 'primary.main',
                border: '1px solid',
                borderColor: alpha('#A67C3C', 0.2),
                height: 22,
                borderRadius: '4px',
                '& .MuiChip-label': { px: 1 },
              }}
            />
          </Box>
        )}

        {/* Rating */}
        {product.averageRating > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <StarRoundedIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
            <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1 }}>
              {product.averageRating.toFixed(1)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
              ({product.reviewCount})
            </Typography>
          </Box>
        )}

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 'auto', mb: 1.5 }}>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              fontFamily: '"Barlow Condensed", sans-serif',
              letterSpacing: '-0.01em',
              color: discountPercent ? 'error.main' : 'text.primary',
            }}
          >
            {product.price.toFixed(2)} €
          </Typography>
          {product.compareAtPrice && (
            <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              {product.compareAtPrice.toFixed(2)} €
            </Typography>
          )}
        </Box>

        {/* Demo notice */}
        {isDemo && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mb: 1.25,
              px: 1,
              py: 0.4,
              borderRadius: '4px',
              bgcolor: alpha('#D97706', 0.08),
              border: '1px solid',
              borderColor: alpha('#D97706', 0.2),
            }}
          >
            <WarningAmberOutlinedIcon sx={{ fontSize: 12, color: 'warning.main', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'warning.main', lineHeight: 1.3 }}>
              {DEMO_NOTICE}
            </Typography>
          </Box>
        )}

        {/* CTA */}
        <Button
          className="card-cta"
          variant={isOutOfStock ? 'outlined' : 'contained'}
          fullWidth
          size="small"
          startIcon={!isOutOfStock && <ShoppingBagOutlinedIcon fontSize="small" />}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          sx={{
            borderRadius: '6px',
            fontFamily: '"Barlow", sans-serif',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontSize: '0.78rem',
            minHeight: { xs: 44, md: 36 }, // touch-friendly on mobile
            transition: 'opacity 0.2s, transform 0.2s cubic-bezier(0.32,0.72,0,1)',
            ...(isOutOfStock
              ? {}
              : {
                  opacity: 0.88,
                  transform: 'translateY(3px)',
                }),
            // Touch devices have no hover — keep the CTA fully visible
            '@media (hover: none)': { opacity: 1, transform: 'none' },
          }}
        >
          {isOutOfStock ? 'Nema na zalihi' : 'Dodaj u košaricu'}
        </Button>
      </Box>
    </Box>
  );
}

const seasonBadgeSx = (type: 'summer' | 'winter' | 'allseason') => {
  const map = {
    summer: { bg: alpha('#DC8500', 0.15), text: '#DC8500', border: alpha('#DC8500', 0.3) },
    winter: { bg: alpha('#1D6FCC', 0.15), text: '#1D6FCC', border: alpha('#1D6FCC', 0.3) },
    allseason: { bg: alpha('#166534', 0.15), text: '#166534', border: alpha('#166534', 0.3) },
  };
  const c = map[type];
  return {
    px: 1,
    py: 0.25,
    borderRadius: '4px',
    bgcolor: c.bg,
    border: `1px solid ${c.border}`,
    color: c.text,
    fontSize: '0.65rem',
    fontFamily: '"Barlow", sans-serif',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    lineHeight: 1.6,
    backdropFilter: 'blur(4px)',
  };
};

const badgeSx = (color: 'amber' | 'red' | 'orange') => {
  const map = {
    amber: { bg: alpha('#B45309', 0.15), text: '#B45309', border: alpha('#B45309', 0.3) },
    red: { bg: alpha('#DC2626', 0.12), text: '#DC2626', border: alpha('#DC2626', 0.25) },
    orange: { bg: alpha('#D97706', 0.12), text: '#D97706', border: alpha('#D97706', 0.25) },
  };
  const c = map[color];
  return {
    px: 1,
    py: 0.25,
    borderRadius: '4px',
    bgcolor: c.bg,
    border: `1px solid ${c.border}`,
    color: c.text,
    fontSize: '0.65rem',
    fontFamily: '"Barlow", sans-serif',
    fontWeight: 700,
    letterSpacing: '0.06em',
    lineHeight: 1.6,
    backdropFilter: 'blur(4px)',
  };
};
