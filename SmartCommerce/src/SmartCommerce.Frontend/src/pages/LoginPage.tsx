import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, TextField, Typography, Container, Link,
  Alert, CircularProgress,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { loginAsync } from '../app/slices/authSlice';
import type { RootState, AppDispatch } from '../app/store';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const onSubmit = (data: FormData) => {
    dispatch(loginAsync(data));
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100dvh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 8,
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xs">
        {/* Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: 'primary.main',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.1rem',
              mb: 3,
            }}
          >
            S
          </Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your SmartCommerce account
          </Typography>
        </Box>

        {/* Form card */}
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                {...register('email')}
                label="Email address"
                type="email"
                fullWidth
                autoComplete="email"
                spellCheck={false}
                error={!!errors.email}
                helperText={errors.email?.message}
                size="medium"
              />
              <TextField
                {...register('password')}
                label="Password"
                type="password"
                fullWidth
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                size="medium"
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              endIcon={!isLoading && <ArrowForwardIcon />}
              sx={{ mt: 3.5, borderRadius: 2, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
            </Button>
          </Box>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 3 }} color="text.secondary">
          No account yet?{' '}
          <Link component={RouterLink} to="/register" fontWeight={600} color="primary" underline="hover">
            Create one free
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
