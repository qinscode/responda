# Western Australia Emergency Dashboard

An interactive web dashboard for displaying real-time emergency information (bushfire and flood) across Western Australia regions, integrated with QGIS data sources.

## 🚨 Project Overview

This dashboard provides:
- **Interactive Map**: Mapbox-powered map showing WA regions with emergency ratings
- **Real-time Data**: Integration with QGIS for current bushfire and flood warnings
- **Multi-day Forecasting**: 7-day emergency prediction display
- **Responsive Design**: Mobile and desktop optimized interface
- **Accessibility**: WCAG 2.1 AA compliant for all users

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Mapping**: Mapbox GL JS
- **UI Framework**: Tailwind CSS + Headless UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Charts**: Recharts
- **Testing**: Vitest + Playwright + React Testing Library
- **Internationalization**: i18next

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/wa-emergency-dashboard.git
   cd wa-emergency-dashboard
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open browser**
   Navigate to `http://localhost:5173`

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run all tests |
| `pnpm test:unit` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm lint` | Lint code |
| `pnpm format` | Format code |

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# QGIS API Configuration  
VITE_QGIS_API_URL=http://localhost:8000/api
VITE_ENABLE_MOCK_DATA=true

# App Configuration
VITE_DEFAULT_CENTER_LAT=-31.9505
VITE_DEFAULT_CENTER_LNG=115.8605
VITE_DEFAULT_ZOOM=6
```

### Mapbox Setup

1. Create a [Mapbox account](https://www.mapbox.com/)
2. Get your access token from the dashboard
3. Add it to your `.env.local` file

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── layout/         # Layout components
│   ├── maps/           # Map-related components
│   └── charts/         # Chart components
├── data/               # Mock data and constants
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── routes/             # Router configuration
├── services/           # API and data services
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🗺️ Features

### Interactive Map
- **Region Display**: All WA regions with emergency color coding
- **Click Interactions**: Popup details for each region
- **Real-time Updates**: Live data synchronization
- **Multiple Views**: Map and list view toggles

### Emergency Information
- **Bushfire Ratings**: No Rating → Catastrophic (7 levels)
- **Flood Warnings**: No Warning → Major Flooding (4 levels)
- **Forecasting**: 7-day prediction data
- **Recommendations**: Action guidelines for each level

### User Experience
- **Search & Filter**: Find regions by name or emergency type
- **Responsive Design**: Works on all devices
- **Accessibility**: Screen reader support, keyboard navigation
- **Internationalization**: English and Chinese support

## 🧪 Testing

### Unit Tests
```bash
pnpm test:unit
pnpm test:unit:coverage
```

### End-to-End Tests
```bash
pnpm test:e2e
pnpm test:e2e:report
```

## 📦 Deployment

### Build for Production
```bash
pnpm build
```

### Preview Production Build
```bash
pnpm preview
```

### Docker Deployment
```bash
docker build -t wa-emergency-dashboard .
docker run -p 3000:3000 wa-emergency-dashboard
```

## 🔗 API Integration

### QGIS Data Format
The dashboard expects GeoJSON data from QGIS in this format:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "region_id": "wa-region-1",
        "region_name": "Perth Metro",
        "bushfire_rating": "high",
        "flood_rating": "no-warning",
        "last_updated": "2024-01-01T00:00:00Z"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [...]
      }
    }
  ]
}
```

### Mock Data
For development, mock data is available in `src/data/mockEmergencyData.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an [issue](https://github.com/your-org/wa-emergency-dashboard/issues)
- Email: support@emergency-dashboard.com

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] AI-powered predictions
- [ ] Multi-region support
- [ ] Historical data analysis
- [ ] API for third-party integration

---

Built with ❤️ for Western Australia emergency preparedness 