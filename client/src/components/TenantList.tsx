import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Refresh,
  Email,
  Phone,
  Home,
} from '@mui/icons-material';
import { tenantAPI, Tenant } from '../services/api';
import { format } from 'date-fns';

const TenantList: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    property_id: '',
  });

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tenantAPI.getAll(filters);
      setTenants(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleFilterChange = (field: string) => (event: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      case 'terminated':
        return 'error';
      default:
        return 'default';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={<Button onClick={fetchTenants}>Retry</Button>}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Tenants
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={handleFilterChange('status')}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="terminated">Terminated</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchTenants}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {tenants.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No tenants found
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {tenants.map((tenant) => (
            <Box key={tenant.id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {getInitials(tenant.first_name, tenant.last_name)}
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="h6">
                        {tenant.first_name} {tenant.last_name}
                      </Typography>
                      <Chip
                        label={tenant.status}
                        color={getStatusColor(tenant.status) as any}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Email fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        {tenant.email}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Phone fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        {tenant.phone}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Home fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        Property ID: {tenant.property_id}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Move-in Date
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(tenant.move_in_date), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Lease End
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(tenant.lease_end_date), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TenantList;
