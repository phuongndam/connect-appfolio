import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Home,
  LocationOn,
  People,
  AttachMoney,
  Visibility,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { propertyAPI, Property } from '../services/api';

const PropertyList: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    property_type: '',
  });

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertyAPI.getAll(filters);
      setProperties(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFilterChange = (field: string) => (event: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setDetailsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'apartment':
        return '🏢';
      case 'house':
        return '🏠';
      case 'condo':
        return '🏘️';
      case 'townhouse':
        return '🏘️';
      default:
        return '🏠';
    }
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
        <Alert severity="error" action={<Button onClick={fetchProperties}>Retry</Button>}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Properties
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
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.property_type}
              label="Type"
              onChange={handleFilterChange('property_type')}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="apartment">Apartment</MenuItem>
              <MenuItem value="house">House</MenuItem>
              <MenuItem value="condo">Condo</MenuItem>
              <MenuItem value="townhouse">Townhouse</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchProperties}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {properties.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No properties found
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {properties.map((property) => (
            <Box key={property.id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                      {getPropertyTypeIcon(property.property_type)} {property.name}
                    </Typography>
                    <Chip
                      label={property.status}
                      color={getStatusColor(property.status) as any}
                      size="small"
                    />
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {property.address}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="textSecondary" mb={2}>
                    {property.city}, {property.state} {property.zip}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <People fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {property.occupied_units || 0}/{property.total_units || 0} units
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {property.occupancy_rate?.toFixed(1) || 0}% occupied
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Visibility />}
                    onClick={() => handleViewDetails(property)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Property Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Property Details
        </DialogTitle>
        <DialogContent>
          {selectedProperty && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Property Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedProperty.name}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Property Type
                  </Typography>
                  <Typography variant="body1">
                    {selectedProperty.property_type}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedProperty.status}
                    color={getStatusColor(selectedProperty.status) as any}
                    size="small"
                  />
                </Box>
                <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Units
                  </Typography>
                  <Typography variant="body1">
                    {selectedProperty.total_units || 0}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Occupancy Rate
                  </Typography>
                  <Typography variant="body1">
                    {selectedProperty.occupancy_rate?.toFixed(1) || 0}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertyList;
