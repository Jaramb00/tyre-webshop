import { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge,
  Menu, MenuItem, Avatar, Box, Container, Tooltip, Divider, alpha,
  Drawer, List, ListItemButton, ListItemText, ListItemIcon,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import TireRepairOutlinedIcon from '@mui/icons-material/TireRepairOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import type { RootState, AppDispatch } from '../../app/store';
import { logout } from '../../app/slices/authSlice';
import { ColorModeContext } from '../../App';
import { useTheme } from '@mui/material/styles';

export default function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { cart } = useSelector((state: RootState) => state.cart);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setAnchorEl(null);
    setDrawerOpen(false);
    navigate('/');
  };

  const isAdmin = user?.roles.some(r => ['Admin', 'Manager', 'WarehouseWorker'].includes(r));
  const isDark = theme.palette.mode === 'dark';

  const navLinkSx = (path: string) => ({
    color: location.pathname.startsWith(path) ? theme.palette.text.primary : theme.palette.text.secondary,
    fontWeight: location.pathname.startsWith(path) ? 600 : 500,
    fontSize: '0.9rem',
    px: 1.5,
    py: 0.75,
    borderRadius: 2,
    transition: 'color 0.15s, background 0.15s',
    '&:hover': { color: theme.palette.text.primary, bgcolor: alpha(theme.palette.text.primary, 0.06) },
  });

  const iconBtnSx = {
    color: 'text.secondary',
    borderRadius: 2,
    '&:hover': { color: 'text.primary', bgcolor: alpha(theme.palette.text.primary, 0.06) },
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: isDark ? alpha(theme.palette.background.default, 0.88) : alpha('#FAFAF8', 0.88),
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 64 }, gap: 1 }}>
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              mr: { xs: 0, md: 4 },
              color: 'text.primary',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: { xs: 32, md: 36 },
                height: { xs: 32, md: 36 },
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                component="img"
                src={isDark ? '/brand/zeljko-mark-dark.png' : '/brand/zeljko-mark.png'}
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
                  color: 'text.secondary',
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
                  fontSize: { xs: '1.05rem', md: '1.15rem' },
                  letterSpacing: '0.06em',
                  color: 'text.primary',
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                }}
              >
                Željko
              </Typography>
            </Box>
          </Box>

          {/* Desktop nav links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            <Button component={RouterLink} to="/products" sx={navLinkSx('/products')}>
              Tyres
            </Button>
            {isAdmin && (
              <Button component={RouterLink} to="/admin" sx={navLinkSx('/admin')}>
                Admin
              </Button>
            )}
          </Box>

          {/* Spacer for mobile (pushes actions right) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'block', md: 'none' } }} />

          {/* ── Desktop actions ── */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
              <IconButton onClick={colorMode.toggleColorMode} size="small" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} sx={iconBtnSx}>
                {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {user ? (
              <>
                <Tooltip title="Notifications">
                  <IconButton size="small" aria-label="Notifications" sx={iconBtnSx}>
                    <Badge badgeContent={unreadCount || null} color="error" variant="dot">
                      <NotificationsNoneIcon fontSize="small" />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Shopping bag">
                  <IconButton component={RouterLink} to="/cart" size="small" aria-label="Shopping bag" sx={iconBtnSx}>
                    <Badge badgeContent={cart?.totalItems || null} color="primary">
                      <ShoppingBagOutlinedIcon fontSize="small" />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Tooltip title={user.fullName}>
                  <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ p: 0, ml: 0.5 }} aria-label={`Account menu for ${user.fullName}`}>
                    <Avatar src={user.avatarUrl} alt={user.fullName} sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 700, border: '2px solid', borderColor: 'divider' }}>
                      {user.fullName[0].toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{ sx: { mt: 1, minWidth: 180, border: '1px solid', borderColor: 'divider', boxShadow: 4 } }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{user.fullName}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{user.email}</Typography>
                  </Box>
                  <Divider />
                  <MenuItem component={RouterLink} to="/profile" onClick={() => setAnchorEl(null)}>Profile</MenuItem>
                  <MenuItem component={RouterLink} to="/orders" onClick={() => setAnchorEl(null)}>My orders</MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Sign out</MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                <Button component={RouterLink} to="/login" variant="text" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.9rem', '&:hover': { color: 'text.primary' } }}>
                  Sign in
                </Button>
                <Button component={RouterLink} to="/register" variant="contained" size="small" sx={{ borderRadius: 2, px: 2 }}>
                  Get started
                </Button>
              </Box>
            )}
          </Box>

          {/* ── Mobile actions (cart + hamburger) ── */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.5 }}>
            {user && (
              <IconButton component={RouterLink} to="/cart" aria-label="Shopping bag" sx={{ ...iconBtnSx, width: 44, height: 44 }}>
                <Badge badgeContent={cart?.totalItems || null} color="primary">
                  <ShoppingBagOutlinedIcon />
                </Badge>
              </IconButton>
            )}
            <IconButton onClick={() => setDrawerOpen(true)} aria-label="Open menu" sx={{ ...iconBtnSx, width: 44, height: 44 }}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* ── Mobile drawer ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '82vw', sm: 360 }, maxWidth: 360, bgcolor: 'background.paper' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Izbornik
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu" sx={{ width: 44, height: 44 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ py: 1 }}>
          <ListItemButton component={RouterLink} to="/products" onClick={() => setDrawerOpen(false)} sx={{ minHeight: 52 }}>
            <ListItemIcon sx={{ minWidth: 40 }}><TireRepairOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Gume" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
          {isAdmin && (
            <ListItemButton component={RouterLink} to="/admin" onClick={() => setDrawerOpen(false)} sx={{ minHeight: 52 }}>
              <ListItemIcon sx={{ minWidth: 40 }}><DashboardOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Admin" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          )}
          <ListItemButton onClick={colorMode.toggleColorMode} sx={{ minHeight: 52 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>{isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}</ListItemIcon>
            <ListItemText primary={isDark ? 'Svijetli način' : 'Tamni način'} primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </List>

        <Divider />

        {user ? (
          <List sx={{ py: 1 }}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" fontWeight={700} noWrap>{user.fullName}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{user.email}</Typography>
            </Box>
            <ListItemButton component={RouterLink} to="/profile" onClick={() => setDrawerOpen(false)} sx={{ minHeight: 52 }}>
              <ListItemIcon sx={{ minWidth: 40 }}><PersonOutlineIcon /></ListItemIcon>
              <ListItemText primary="Profil" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/orders" onClick={() => setDrawerOpen(false)} sx={{ minHeight: 52 }}>
              <ListItemIcon sx={{ minWidth: 40 }}><ReceiptLongOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Narudžbe" />
            </ListItemButton>
            <ListItemButton onClick={handleLogout} sx={{ minHeight: 52, color: 'error.main' }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}><LogoutOutlinedIcon /></ListItemIcon>
              <ListItemText primary="Odjava" />
            </ListItemButton>
          </List>
        ) : (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button component={RouterLink} to="/register" onClick={() => setDrawerOpen(false)} variant="contained" fullWidth size="large" sx={{ borderRadius: 2, minHeight: 48 }}>
              Registracija
            </Button>
            <Button component={RouterLink} to="/login" onClick={() => setDrawerOpen(false)} variant="outlined" fullWidth size="large" sx={{ borderRadius: 2, minHeight: 48 }}>
              Prijava
            </Button>
          </Box>
        )}
      </Drawer>
    </AppBar>
  );
}
