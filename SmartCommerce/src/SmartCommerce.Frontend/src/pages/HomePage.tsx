import { Suspense, lazy } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography, Grid2 as Grid, alpha, useTheme, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import RotateRightOutlinedIcon from '@mui/icons-material/RotateRightOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ProductCard from '../components/products/ProductCard';
import Reveal from '../components/motion/Reveal';
import { demoTyreProducts } from '../data/demoProducts';

// 3D tyre hero — lazy so the R3F/three bundle never blocks first paint
const TyreHero = lazy(() => import('../components/three/TyreHero'));

// Brand logos with realistic color
const BRANDS = ['Michelin', 'Continental', 'Pirelli', 'Goodyear', 'Bridgestone', 'Hankook', 'Yokohama', 'Dunlop'];

export default function HomePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const featuredProducts = demoTyreProducts.filter(p => p.isFeatured).slice(0, 4);

  return (
    <Box>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: isDark
            ? 'linear-gradient(150deg, #0D0D0D 0%, #111111 50%, #161616 100%)'
            : 'linear-gradient(150deg, #111111 0%, #1A1A1A 50%, #222222 100%)',
          minHeight: { xs: '88dvh', md: '92dvh' },
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Tread-pattern SVG overlay — subtle technical texture */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.035,
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 18px,
              rgba(255,255,255,0.6) 18px,
              rgba(255,255,255,0.6) 20px
            ), repeating-linear-gradient(
              90deg,
              transparent,
              transparent 48px,
              rgba(255,255,255,0.6) 48px,
              rgba(255,255,255,0.6) 50px
            )`,
            pointerEvents: 'none',
          }}
        />

        {/* Gold arc glow — top right, wheel-inspired */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: { xs: '70vw', md: '50vw' },
            height: { xs: '70vw', md: '50vw' },
            borderRadius: '50%',
            border: '1px solid rgba(166,124,60,0.12)',
            background: 'radial-gradient(circle at 60% 40%, rgba(166,124,60,0.12) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        {/* Outer ring echo */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: '-30%',
            right: '-18%',
            width: { xs: '90vw', md: '65vw' },
            height: { xs: '90vw', md: '65vw' },
            borderRadius: '50%',
            border: '1px solid rgba(166,124,60,0.06)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 10, md: 16 } }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left: copy */}
            <Grid size={{ xs: 12, md: 7 }}>
              {/* Eyebrow */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  bgcolor: 'rgba(166,124,60,0.12)',
                  border: '1px solid rgba(166,124,60,0.28)',
                  borderRadius: '20px',
                  px: 2,
                  py: 0.5,
                  mb: 4,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#A67C3C',
                    animation: 'heroPulse 2.4s ease-in-out infinite',
                    '@keyframes heroPulse': {
                      '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                      '50%': { opacity: 0.55, transform: 'scale(0.8)' },
                    },
                  }}
                />
                <Typography
                  component="span"
                  sx={{
                    color: '#C49A52',
                    fontFamily: '"Barlow", sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontSize: '0.68rem',
                  }}
                >
                  Profesionalni vulkanizer · Split
                </Typography>
              </Box>

              {/* Headline */}
              <Typography
                variant="h1"
                sx={{
                  color: '#F2F2F0',
                  fontSize: { xs: '2.6rem', sm: '3.5rem', md: '4.5rem', lg: '5.5rem' },
                  maxWidth: '16ch',
                  mb: 3,
                  lineHeight: 1.0,
                  textTransform: 'uppercase',
                }}
              >
                Premijerne gume.{' '}
                <Box
                  component="span"
                  sx={{
                    color: 'transparent',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    backgroundImage: 'linear-gradient(135deg, #A67C3C 0%, #C49A52 50%, #D4A855 100%)',
                  }}
                >
                  Stručna montaža.
                </Box>
              </Typography>

              <Typography
                sx={{
                  color: '#8A8A8A',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  maxWidth: '50ch',
                  lineHeight: 1.75,
                  mb: 6,
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                }}
              >
                Od ljetnih sportskih guma do zimskih sigurnosnih — savjetujemo, montiramo i
                balansiramo. Brzo, pouzdano, po odličnoj cijeni.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={RouterLink}
                  to="/products"
                  variant="contained"
                  size="large"
                  endIcon={
                    <ArrowForwardIcon
                      sx={{
                        transition: 'transform 0.2s',
                        '.MuiButton-root:hover &': { transform: 'translateX(4px)' },
                      }}
                    />
                  }
                  sx={{
                    borderRadius: '6px',
                    px: 3.5,
                    background: 'linear-gradient(135deg, #8A6430 0%, #A67C3C 60%, #C49A52 100%)',
                    fontFamily: '"Barlow", sans-serif',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7A5628 0%, #8A6430 60%, #A67C3C 100%)',
                      boxShadow: '0 8px 24px rgba(166,124,60,0.35)',
                    },
                  }}
                >
                  Pregledaj gume
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderRadius: '6px',
                    px: 3.5,
                    borderColor: 'rgba(242,242,240,0.18)',
                    color: '#F2F2F0',
                    fontFamily: '"Barlow", sans-serif',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                    '&:hover': {
                      borderColor: 'rgba(242,242,240,0.4)',
                      bgcolor: 'rgba(242,242,240,0.06)',
                    },
                  }}
                >
                  Naruči termin
                </Button>
              </Box>

              {/* Stats row */}
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 3, md: 5 },
                  mt: 8,
                  pt: 6,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { value: '15+', label: 'godina iskustva' },
                  { value: '200+', label: 'brendova guma' },
                  { value: '30min', label: 'prosj. montaža' },
                  { value: '4.9★', label: 'ocjena servisa' },
                ].map(stat => (
                  <Box key={stat.label}>
                    <Typography
                      sx={{
                        color: '#F2F2F0',
                        fontFamily: '"Barlow Condensed", sans-serif',
                        fontWeight: 800,
                        fontSize: { xs: '1.5rem', md: '1.75rem' },
                        letterSpacing: '-0.02em',
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#5A5A5A',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        mt: 0.5,
                        fontFamily: '"Barlow", sans-serif',
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Right: 3D tyre hero */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Suspense
                fallback={
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 340, sm: 420, md: 560 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Elegant loading state — pulsing wheel silhouette */}
                    <Box
                      sx={{
                        width: { xs: 180, md: 260 },
                        height: { xs: 180, md: 260 },
                        borderRadius: '50%',
                        border: '2px solid rgba(166,124,60,0.25)',
                        borderTopColor: '#A67C3C',
                        animation: 'tyreSpin 1s linear infinite',
                        '@keyframes tyreSpin': {
                          to: { transform: 'rotate(360deg)' },
                        },
                      }}
                    />
                  </Box>
                }
              >
                <TyreHero />
              </Suspense>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Brand logos strip ─────────────────────────────────────────────── */}
      <Box
        sx={{
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: isDark ? 'background.paper' : '#F0EFEC',
          py: 3,
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 4, md: 6 },
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              pb: 0.5,
            }}
          >
            <Typography
              sx={{
                color: 'text.secondary',
                fontFamily: '"Barlow", sans-serif',
                fontWeight: 700,
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                mr: 1,
              }}
            >
              Zastupamo
            </Typography>
            {BRANDS.map(brand => (
              <Typography
                key={brand}
                sx={{
                  fontFamily: '"Barlow Condensed", sans-serif',
                  fontWeight: 800,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'color 0.15s',
                  '&:hover': { color: 'primary.main' },
                  cursor: 'default',
                }}
              >
                {brand}
              </Typography>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Services section ──────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: 'background.default', py: { xs: 10, md: 16 } }}>
        <Container maxWidth="xl">
          <Reveal>
            <Box sx={{ mb: { xs: 6, md: 10 } }}>
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ mb: 2, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.7rem' }}
              >
                Usluge
              </Typography>
              <Typography
                variant="h2"
                sx={{ mb: 2, fontSize: { xs: '2rem', md: '2.75rem' }, textTransform: 'uppercase', maxWidth: '20ch' }}
              >
                Sve što vaš automobil treba
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '52ch' }}>
                Od montaže do poravnanja kotača — svaki servis obavljamo s preciznom opremom i
                višegodišnjim iskustvom.
              </Typography>
            </Box>
          </Reveal>

          <Grid container spacing={2.5}>
            {SERVICES.map((svc, i) => (
              <Grid key={svc.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Reveal delay={i * 0.08} style={{ height: '100%' }}>
                  <ServiceCard service={svc} featured={i === 0} />
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Featured tyres ────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: isDark ? 'background.default' : '#F5F4F0',
          borderTop: '1px solid',
          borderColor: 'divider',
          py: { xs: 10, md: 16 },
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'flex-end' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              mb: { xs: 6, md: 8 },
            }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ mb: 2, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.7rem' }}
              >
                Istaknuti proizvodi
              </Typography>
              <Typography
                variant="h2"
                sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, textTransform: 'uppercase' }}
              >
                Najprodavanije gume
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/products"
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: '6px', flexShrink: 0 }}
            >
              Sve gume
            </Button>
          </Box>

          {/* Demo notice */}
          <Box
            sx={{
              mb: 4,
              p: 2,
              borderRadius: '8px',
              bgcolor: alpha(theme.palette.warning.main, 0.08),
              border: '1px solid',
              borderColor: alpha(theme.palette.warning.main, 0.2),
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <VerifiedOutlinedIcon sx={{ color: 'warning.main', fontSize: 18, flexShrink: 0 }} />
            <Typography variant="body2" color="warning.main" fontWeight={600}>
              Demo prikaz — Svi proizvodi su privremeni uzorci i bit će zamijenjeni stvarnim katalogom.
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {featuredProducts.map(product => (
              <Grid key={product.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Trust strip ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {TRUST_ITEMS.map(item => (
              <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA strip ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(150deg, #111111 0%, #1A1A1A 50%, #222222 100%)',
          py: { xs: 10, md: 14 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60vw',
            height: '60vw',
            borderRadius: '50%',
            border: '1px solid rgba(166,124,60,0.08)',
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '40vw',
            height: '40vw',
            borderRadius: '50%',
            border: '1px solid rgba(166,124,60,0.12)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Chip
            label="Uvijek otvoreni za vas"
            size="small"
            sx={{
              mb: 3,
              bgcolor: 'rgba(166,124,60,0.15)',
              color: '#C49A52',
              border: '1px solid rgba(166,124,60,0.3)',
              fontFamily: '"Barlow", sans-serif',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontSize: '0.65rem',
            }}
          />
          <Typography
            variant="h2"
            sx={{
              color: '#F2F2F0',
              mb: 2,
              fontSize: { xs: '1.8rem', md: '2.5rem' },
              textTransform: 'uppercase',
            }}
          >
            Naručite se danas
          </Typography>
          <Typography
            sx={{
              color: '#666',
              mb: 5,
              lineHeight: 1.7,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            Brza montaža, povoljne cijene, stručni savjeti. Posjetite nas ili naručite gume online.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={RouterLink}
              to="/products"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: '6px',
                px: 3.5,
                background: 'linear-gradient(135deg, #8A6430 0%, #A67C3C 60%, #C49A52 100%)',
                fontFamily: '"Barlow", sans-serif',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7A5628 0%, #8A6430 100%)',
                  boxShadow: '0 8px 24px rgba(166,124,60,0.35)',
                },
              }}
            >
              Pregledaj katalog
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              size="large"
              sx={{
                borderRadius: '6px',
                px: 3.5,
                borderColor: 'rgba(242,242,240,0.18)',
                color: '#F2F2F0',
                fontFamily: '"Barlow", sans-serif',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                '&:hover': {
                  borderColor: 'rgba(242,242,240,0.4)',
                  bgcolor: 'rgba(242,242,240,0.06)',
                },
              }}
            >
              Registrirajte se
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    icon: <RotateRightOutlinedIcon fontSize="medium" />,
    title: 'Montaža guma',
    description: 'Profesionalna montaža svih vrsta guma za putnička i teretna vozila. Balansiranje uključeno.',
    tag: 'Najtraženije',
  },
  {
    icon: <SpeedOutlinedIcon fontSize="medium" />,
    title: 'Geometrija kotača',
    description: 'Precizno poravnanje kotača računalnom opremom. Produljuje vijek trajanja guma.',
    tag: null,
  },
  {
    icon: <BuildOutlinedIcon fontSize="medium" />,
    title: 'Popravak i vulkanizacija',
    description: 'Sanacija oštećenja, krpanje probušenih guma, popravak felgi. Brzo i kvalitetno.',
    tag: null,
  },
  {
    icon: <CalendarMonthOutlinedIcon fontSize="medium" />,
    title: 'Sezonska izmjena',
    description: 'Izmjena ljetnih i zimskih guma uz mogućnost skladištenja kompleta u radionici.',
    tag: null,
  },
];

const TRUST_ITEMS = [
  {
    icon: <VerifiedOutlinedIcon />,
    title: 'Originalne gume',
    desc: 'Isključivo ovlašteni distributeri. Nikakve kopije ili rabljene gume.',
  },
  {
    icon: <SpeedOutlinedIcon />,
    title: 'Montaža za 30 min',
    desc: 'Bez dugog čekanja. Dogovaramo termin unaprijed.',
  },
  {
    icon: <LocalShippingOutlinedIcon />,
    title: 'Dostava na adresu',
    desc: 'Naručite gume online, dostavimo ih na vašu adresu ili u radionicu.',
  },
  {
    icon: <BuildOutlinedIcon />,
    title: 'Jamstvo na montažu',
    desc: 'Svaki posao garantiramo. Problemi se rješavaju besplatno.',
  },
];

// ── Service card ────────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: {
    icon: React.ReactNode;
    title: string;
    description: string;
    tag: string | null;
  };
  featured?: boolean;
}

function ServiceCard({ service, featured }: ServiceCardProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: { xs: 3, md: 3.5 },
        borderRadius: '12px',
        border: '1px solid',
        borderColor: featured ? alpha(theme.palette.primary.main, 0.3) : 'divider',
        bgcolor: featured
          ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04)
          : 'background.paper',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.25s cubic-bezier(0.32,0.72,0,1), box-shadow 0.25s cubic-bezier(0.32,0.72,0,1), border-color 0.25s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 4,
          borderColor: alpha(theme.palette.primary.main, 0.4),
        },
      }}
    >
      {service.tag && (
        <Box
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            px: 1,
            py: 0.25,
            borderRadius: '4px',
            bgcolor: alpha(theme.palette.primary.main, 0.15),
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.3),
            color: 'primary.main',
            fontFamily: '"Barlow", sans-serif',
            fontWeight: 700,
            fontSize: '0.6rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {service.tag}
        </Box>
      )}
      <Box
        sx={{
          display: 'inline-flex',
          p: 1.25,
          borderRadius: '9px',
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          color: 'primary.main',
          mb: 2.5,
        }}
      >
        {service.icon}
      </Box>
      <Typography
        variant="h5"
        sx={{ mb: 1.25, fontFamily: '"Barlow", sans-serif', fontWeight: 700, textTransform: 'uppercase', fontSize: '1.05rem', letterSpacing: '0.01em' }}
      >
        {service.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
        {service.description}
      </Typography>
    </Box>
  );
}
