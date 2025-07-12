// src/features/auth/components/login.tsx (or LoginPage.tsx)
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Step 1: Import navigation hooks
// import { signIn } from '../api/auth-api'; // Step 2: We'll use context's login instead
import { useAuth } from '../../../context/AuthContext'; // Step 3: Import useAuth (ADJUST PATH if needed)

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Renamed from isSubmitting to match your code

  const { login } = useAuth(); // Step 4: Get login function from context
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password); // Step 5: Call the login function from AuthContext
      navigate(from, { replace: true }); // Step 6: Navigate on success
    } catch (err: any) {
      console.error('Login page submission error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        // background: theme => theme.palette.background.default, // Ensure theme is available if you use this
        backgroundColor: 'background.default', // Simpler if theme provider is at root
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper sx={{ maxWidth: 400, width: '100%', p: { xs: 2, sm: 4 } }}>
        {' '}
        {/* Adjusted padding for responsiveness */}
        <Stack spacing={3}>
          {' '}
          {/* Increased spacing slightly */}
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            {' '}
            {/* Added component and gutterBottom */}
            Admin Sign In
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {' '}
            {/* Added noValidate to form */}
            <Stack spacing={2}>
              <TextField
                label="Email Address" // More descriptive label
                type="email"
                name="email" // Good practice to add name attribute
                autoComplete="email" // For browser autofill
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoFocus // Focus on email field initially
                disabled={loading}
              />
              <TextField
                label="Password"
                type="password"
                name="password" // Good practice
                autoComplete="current-password" // For browser autofill
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ mt: 1 }} // Added a bit of margin top
              >
                {loading ? 'Signing In…' : 'Sign In'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
