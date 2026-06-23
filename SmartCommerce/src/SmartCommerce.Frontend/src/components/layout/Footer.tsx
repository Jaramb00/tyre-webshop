import { Box, Container, Typography, Link, Grid2 as Grid, useTheme, alpha } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

export default function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: isDark ? '#0D0D0D' : '#111111',
        py: { xs: 8, md: 10 },
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={5}>
          {/* Brand */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <Box
                  component="img"
                  src="/brand/zeljko-mark-dark.png"
                  alt="Vulkanizer Željko"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <Box sx={{ lineHeight: 1 }}>
                <Typography
                  component="span"
                  sx={{
                    display: 'block',
                    fontFamily: '"Barlow Condensed", sans-serif',
                    fontWeight: 800,
                    fontSize: '0.62rem',
                    letterSpacing: '0.18em',
                    color: '#5A5A5A',
                    lineHeight: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Vulkanizer
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    display: 'block',
                    fontFamily: '"Barlow Condensed", sans-serif',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    letterSpacing: '0.06em',
                    color: '#F2F2F0',
                    lineHeight: 1.1,
                    textTransform: 'uppercase',
                  }}
                >
                  Željko
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: '#555', maxWidth: '36ch', lineHeight: 1.75, fontFamily: '"Plus Jakarta Sans", sans-serif' }}
            >
              Profesionalni vulkanizer s 15+ godina iskustva. Montaža, balansiranje, poravnanje
              kotača i sezonska izmjena guma.
            </Typography>

            {/* Contact info */}
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { icon: <PhoneOutlinedIcon sx={{ fontSize: 15 }} />, text: '+385 21 XXX XXX' },
                { icon: <EmailOutlinedIcon sx={{ fontSize: 15 }} />, text: 'info@vulkanizer-zeljko.hr' },
                { icon: <LocationOnOutlinedIcon sx={{ fontSize: 15 }} />, text: 'Split, Hrvatska' },
              ].map(item => (
                <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: '#A67C3C', flexShrink: 0 }}>{item.icon}</Box>
                  <Typography sx={{ color: '#666', fontSize: '0.85rem', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Services */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography
              sx={{
                color: '#3A3A3A',
                fontFamily: '"Barlow", sans-serif',
                fontWeight: 700,
                fontSize: '0.65rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                mb: 2,
              }}
            >
              Usluge
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {['Montaža guma', 'Balansiranje', 'Geometrija kotača', 'Vulkanizacija', 'Sezonska izmjena'].map(s => (
                <Typography
                  key={s}
                  sx={{
                    color: '#555',
                    fontSize: '0.88rem',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    cursor: 'default',
                    '&:hover': { color: '#A67C3C' },
                    transition: 'color 0.15s',
                  }}
                >
                  {s}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Shop */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography
              sx={{
                color: '#3A3A3A',
                fontFamily: '"Barlow", sans-serif',
                fontWeight: 700,
                fontSize: '0.65rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                mb: 2,
              }}
            >
              Trgovina
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Link component={RouterLink} to="/products" underline="none" sx={footerLinkSx}>
                Sve gume
              </Link>
              <Link component={RouterLink} to="/products?category=summer" underline="none" sx={footerLinkSx}>
                Ljetne gume
              </Link>
              <Link component={RouterLink} to="/products?category=winter" underline="none" sx={footerLinkSx}>
                Zimske gume
              </Link>
              <Link component={RouterLink} to="/products?category=allseason" underline="none" sx={footerLinkSx}>
                Cjelogodišnje
              </Link>
            </Box>
          </Grid>

          {/* Account + Legal */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 6 }}>
                <Typography
                  sx={{
                    color: '#3A3A3A',
                    fontFamily: '"Barlow", sans-serif',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    mb: 2,
                  }}
                >
                  Račun
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  <Link component={RouterLink} to="/profile" underline="none" sx={footerLinkSx}>Profil</Link>
                  <Link component={RouterLink} to="/orders" underline="none" sx={footerLinkSx}>Narudžbe</Link>
                  <Link component={RouterLink} to="/login" underline="none" sx={footerLinkSx}>Prijava</Link>
                  <Link component={RouterLink} to="/register" underline="none" sx={footerLinkSx}>Registracija</Link>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography
                  sx={{
                    color: '#3A3A3A',
                    fontFamily: '"Barlow", sans-serif',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    mb: 2,
                  }}
                >
                  Pravno
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  <Link href="#" underline="none" sx={footerLinkSx}>Privatnost</Link>
                  <Link href="#" underline="none" sx={footerLinkSx}>Uvjeti korištenja</Link>
                  <Link href="#" underline="none" sx={footerLinkSx}>Kolačići</Link>
                </Box>
              </Grid>
            </Grid>

            {/* Working hours */}
            <Box
              sx={{
                mt: 4,
                p: 2,
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)',
                bgcolor: 'rgba(255,255,255,0.02)',
              }}
            >
              <Typography
                sx={{
                  color: '#A67C3C',
                  fontFamily: '"Barlow", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  mb: 1.5,
                }}
              >
                Radno vrijeme
              </Typography>
              {[
                { day: 'Pon – Pet', hours: '07:00 – 18:00' },
                { day: 'Subota', hours: '08:00 – 14:00' },
                { day: 'Nedjelja', hours: 'Zatvoreno' },
              ].map(row => (
                <Box key={row.day} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography sx={{ color: '#555', fontSize: '0.82rem', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    {row.day}
                  </Typography>
                  <Typography
                    sx={{
                      color: row.hours === 'Zatvoreno' ? '#444' : '#888',
                      fontSize: '0.82rem',
                      fontFamily: '"Barlow Condensed", sans-serif',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {row.hours}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Bottom bar */}
        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography
            sx={{
              color: '#3A3A3A',
              fontSize: '0.78rem',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            &copy; {new Date().getFullYear()} Vulkanizer Željko. Sva prava pridržana.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {['Michelin', 'Continental', 'Pirelli'].map(brand => (
              <Typography
                key={brand}
                sx={{
                  color: '#2A2A2A',
                  fontSize: '0.72rem',
                  fontFamily: '"Barlow Condensed", sans-serif',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {brand}
              </Typography>
            ))}
            <Box
              sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: alpha('#A67C3C', 0.4),
              }}
            />
            <Typography sx={{ color: '#2A2A2A', fontSize: '0.72rem', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              +5 više
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

const footerLinkSx = {
  color: '#555',
  fontSize: '0.88rem',
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  transition: 'color 0.15s',
  '&:hover': { color: '#A67C3C' },
};
