import { useSelector } from 'react-redux';
import { Container, Typography, Paper, Avatar, Box, Chip } from '@mui/material';
import type { RootState } from '../app/store';

export default function ProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user) return null;

  return (
    <Container maxWidth="md">
      <Typography variant="h4" fontWeight={700} gutterBottom>My Profile</Typography>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar src={user.avatarUrl} sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
            {user.fullName[0]}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>{user.fullName}</Typography>
            <Typography color="text.secondary">{user.email}</Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              {user.roles.map(role => <Chip key={role} label={role} size="small" color="primary" variant="outlined" />)}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
