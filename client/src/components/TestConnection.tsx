import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import api from '../services/api';

const TestConnection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Test health check endpoint
      const response = await api.get('/health');
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const testProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Test properties endpoint
      const response = await api.get('/properties');
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const testReports = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Test available reports endpoints
      const response = await api.get('/test/reports');
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSimpleProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Test simple properties endpoint with rate limiting
      const response = await api.get('/simple/properties');
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSimpleTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Test simple tenants endpoint with rate limiting
      const response = await api.get('/simple/tenants');
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Test API Connection
      </Typography>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Button
          variant="contained"
          onClick={testAPI}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Test Health Check
        </Button>
        <Button
          variant="outlined"
          onClick={testSimpleProperties}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Test Properties (Rate Limited)
        </Button>
        <Button
          variant="outlined"
          onClick={testSimpleTenants}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Test Tenants (Rate Limited)
        </Button>
        <Button
          variant="outlined"
          onClick={testReports}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Test Available Reports
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              API Response:
            </Typography>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TestConnection;
