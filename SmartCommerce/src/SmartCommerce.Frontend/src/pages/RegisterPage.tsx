import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, TextField, Typography, Container, Link,
  Alert, CircularProgress, Grid2 as Grid,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { registerAsync } from '../app/slices/authSlice';
import type { RootState, AppDispatch } from '../app/store';
import { useEffect } from 'react';

const schema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase')
      .regex(/[a-z]/, 'Must contain lowercase')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    dispatch(registerAsync(data));
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
      <Container maxWidth="sm">
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
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join SmartCommerce and start shopping in minutes
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
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register('firstName')}
                  label="First name"
                  fullWidth
                  autoComplete="given-name"
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register('lastName')}
                  label="Last name"
                  fullWidth
                  autoComplete="family-name"
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register('email')}
                  label="Email address"
                  type="email"
                  fullWidth
                  autoComplete="email"
                  spellCheck={false}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register('password')}
                  label="Password"
                  type="password"
                  fullWidth
                  autoComplete="new-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register('confirmPassword')}
                  label="Confirm password"
                  type="password"
                  fullWidth
                  autoComplete="new-password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              endIcon={!isLoading && <ArrowForwardIcon />}
              sx={{ mt: 3.5, borderRadius: 2, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
            </Button>
          </Box>
        </Box>

        <Typography variant="body2" align="center" sx={{ mt: 3 }} color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" fontWeight={600} color="primary" underline="hover">
            Sign in
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
