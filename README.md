# AppFolio Property Manager

A web application for managing rental properties using the AppFolio Reports API (2.0.0). This application allows you to view properties, units, tenants, and generate reports from your AppFolio property management system.

## Features

- 🏠 **Property Management**: View and manage your rental properties
- 🏢 **Unit Management**: Track individual units within properties
- 👥 **Tenant Management**: Manage tenant information and lease details
- 📊 **Dashboard & Reports**: Generate financial and occupancy reports
- 🔄 **Real-time Data**: Sync with AppFolio Reports API
- 🎨 **Modern UI**: Built with React and Material-UI

## Tech Stack

### Backend
- Node.js with Express
- AppFolio Reports API integration
- Rate limiting for API calls
- CORS enabled for frontend communication

### Frontend
- React with TypeScript
- Material-UI for components
- Axios for API calls
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- AppFolio Reports API credentials

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd connect-appfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your AppFolio credentials:
   ```env
   APPFOLIO_CLIENT_ID=your_client_id
   APPFOLIO_CLIENT_SECRET=your_client_secret
   APPFOLIO_DATABASE_URL=your_database.appfolio.com
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

## API Endpoints

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get specific property

### Units
- `GET /api/units/:propertyId` - Get units for a property

### Tenants
- `GET /api/tenants` - Get all tenants
- `GET /api/tenants?property_id=:id` - Get tenants for a property

### Reports
- `GET /api/reports/overview` - Get overview report
- `GET /api/reports/financial` - Get financial report
- `GET /api/reports/occupancy` - Get occupancy report

### Test Endpoints
- `GET /api/health` - Health check
- `GET /api/test/reports` - Test available AppFolio reports
- `GET /api/simple/properties` - Test properties with rate limiting
- `GET /api/simple/tenants` - Test tenants with rate limiting

## AppFolio API Integration

This application uses the AppFolio Reports API (2.0.0) with the following features:

- **HTTP Basic Authentication**: Uses Client ID and Client Secret
- **Rate Limiting**: Respects AppFolio's 7 requests per 15 seconds limit
- **Rent Roll Report**: Primary data source for properties, units, and tenants
- **Error Handling**: Automatic retry on rate limit errors

### Supported Reports
- `/rent_roll.json` - Main data source (Properties, Units, Tenants)
- `/income_statement.json` - Financial reports (Rate limited)
- `/occupancy.json` - Occupancy reports (Rate limited)

## Project Structure

```
connect-appfolio/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service
│   │   └── App.tsx
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── services/          # AppFolio service
│   └── index.js
├── .env.example           # Environment variables template
├── .gitignore
└── README.md
```

## Development

### Backend Development
```bash
cd server
npm install
npm start
```

### Frontend Development
```bash
cd client
npm install
npm start
```

### Running Tests
```bash
# Test API connection
curl http://localhost:5000/api/health

# Test properties
curl http://localhost:5000/api/simple/properties
```

## Rate Limiting

The application implements rate limiting to comply with AppFolio's API limits:

- **Limit**: 7 requests per 15 seconds
- **Automatic retry**: On 429 errors
- **Queue management**: Prevents exceeding limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues related to:
- **AppFolio API**: Check [AppFolio Reports API Documentation](https://www.appfolio.com/connect/api/reports)
- **Application**: Create an issue in this repository

## Changelog

### v1.0.0
- Initial release
- AppFolio Reports API integration
- Property, Unit, and Tenant management
- Dashboard and reporting features
- Rate limiting implementation