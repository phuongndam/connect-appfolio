import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PropertyList from './components/PropertyList';
import UnitList from './components/UnitList';
import TenantList from './components/TenantList';
import TestConnection from './components/TestConnection';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState('test');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'properties':
        return <PropertyList />;
      case 'units':
        return <UnitList />;
      case 'tenants':
        return <TenantList />;
      case 'reports':
        return <Dashboard />; // Placeholder for reports page
      case 'test':
        return <TestConnection />;
      case 'settings':
        return (
          <div style={{ padding: '20px' }}>
            <h2>Settings</h2>
            <p>Settings page coming soon...</p>
          </div>
        );
      default:
        return <TestConnection />; // Start with test page
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
    </ThemeProvider>
  );
}

export default App;