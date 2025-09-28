import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  IconButton,
} from '@mui/material';
import {
  Refresh,
  FilterList,
  Home,
  People,
  AttachMoney,
} from '@mui/icons-material';
import { unitAPI, Unit } from '../services/api';

const UnitList: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    property_id: '',
  });

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await unitAPI.getAll(filters);
      setUnits(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch units');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleFilterChange = (field: string) => (event: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'occupied':
        return 'success';
      case 'vacant':
        return 'error';
      case 'maintenance':
        return 'warning';
      case 'reserved':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
        <Alert severity="error" action={<Button onClick={fetchUnits}>Retry</Button>}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Units
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
              <MenuItem value="occupied">Occupied</MenuItem>
              <MenuItem value="vacant">Vacant</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="reserved">Reserved</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchUnits}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {units.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No units found
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {units.map((unit) => (
            <Box key={unit.id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Unit {unit.unit_number}
                    </Typography>
                    <Chip
                      label={unit.status}
                      color={getStatusColor(unit.status) as any}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" mb={1}>
                    {unit.property_name}
                  </Typography>

                  <Typography variant="body2" color="textSecondary" mb={2}>
                    {unit.property_address}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center">
                      <Home fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {unit.bedrooms} bed, {unit.bathrooms} bath
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {unit.square_feet} sq ft
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <AttachMoney fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="primary">
                        {formatCurrency(unit.rent_amount)}
                      </Typography>
                    </Box>
                    {unit.tenant_id && (
                      <Box display="flex" alignItems="center">
                        <People fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                          Occupied
                        </Typography>
                      </Box>
                    )}
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

export default UnitList;
