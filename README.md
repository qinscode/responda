<div align="center">

# WA Emergency Dashboard

**Monitor Western Australia emergencies smarter, faster, and better.**  
A modern web dashboard built with **React** and **TypeScript**, designed to display real-time emergency information (bushfire and flood) across Western Australia regions — all in one place.

<p align="center">
  <a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=for-the-badge"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=for-the-badge"></a>
  <a href="https://vitejs.dev/"><img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=for-the-badge"></a>
  <a href="https://tailwindcss.com/"><img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge"></a>
  <a href="https://www.mapbox.com/"><img alt="Mapbox" src="https://img.shields.io/badge/Mapbox-GL_JS-000000?logo=mapbox&logoColor=white&style=for-the-badge"></a>
  <a href="https://recharts.org/"><img alt="Recharts" src="https://img.shields.io/badge/Recharts-Charts-FF7300?logoColor=white&style=for-the-badge"></a>
  <a href="https://www.i18next.com/"><img alt="i18next" src="https://img.shields.io/badge/i18next-Internationalization-26A69A?logoColor=white&style=for-the-badge"></a>
  <a href="https://zustand-demo.pmnd.rs/"><img alt="Zustand" src="https://img.shields.io/badge/Zustand-State_Management-FF6B35?logoColor=white&style=for-the-badge"></a>
</p>
</div>

---

## 📦 Project Status

> **Under Active Development!**

- ✅ Interactive Mapbox-powered WA regional map
- 🚨 Real-time bushfire and flood emergency ratings
- 📊 7-day emergency forecasting system
- 📱 Responsive design with accessibility compliance
- 🗺️ QGIS data integration for live updates

---

## ✨ Main Features

### 🗺️ Interactive Map
- Regional emergency color coding
- Click interactions with detailed popups
- Real-time data synchronization
- Multiple view toggles (map/list)

### 🚨 Emergency Information
- **Bushfire Ratings**: No Rating → Catastrophic (7 levels)
- **Flood Warnings**: No Warning → Major Flooding (4 levels)
- 7-day prediction forecasting
- Action guidelines for each emergency level

### 📱 User Experience
- Search & filter regions by name or emergency type
- Responsive design for all devices
- WCAG 2.1 AA accessibility compliance
- Internationalization (English & Chinese)

### 📊 Data Analytics
- Emergency trend analysis
- Regional risk assessments
- Historical data visualization
- Prediction accuracy metrics

---

## 🔥 Tech Stack

| Area             | Tech                          |
|------------------|-------------------------------|
| Frontend         | React 18 + TypeScript + Vite   |
| Mapping          | Mapbox GL JS                  |
| UI Framework     | Tailwind CSS + Headless UI   |
| State Management | Zustand                       |
| Data Fetching    | TanStack Query                |
| Charts           | Recharts                      |
| Routing          | TanStack Router               |
| Testing          | Vitest + Playwright + RTL     |
| i18n             | i18next                       |
| Data Source      | QGIS Integration              |
| Build Tool       | Vite                          |
| Type Safety      | TypeScript 5                  |

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js `v18+`
- pnpm (recommended) or npm
- Mapbox account & access token

### 2. Installation

```bash
git clone https://github.com/your-org/wa-emergency-dashboard.git
cd wa-emergency-dashboard
pnpm install
```

### 3. Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

**Required Environment Variables:**
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

### 4. Development

```bash
pnpm dev
```

> Access the app at: `http://localhost:5173`

### 5. Production Build

```bash
pnpm build
pnpm preview
```

---

## 🧪 Testing & Quality

### Available Scripts

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

### Test Coverage
- Unit tests with Vitest
- E2E tests with Playwright
- Component testing with React Testing Library

---

## 🗺️ Mapbox Integration

### Setup Steps
1. Create a [Mapbox account](https://www.mapbox.com/)
2. Get your access token from the dashboard
3. Add it to your `.env.local` file
4. Configure map center and zoom for Western Australia

---

## 📊 QGIS Data Integration

### Expected Data Format
The dashboard expects GeoJSON data from QGIS:

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
Development uses mock data from `src/data/mockEmergencyData.ts`

---

## 🎨 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (shadcn/ui)
│   ├── layout/         # Layout components
│   ├── maps/           # Map-related components
│   ├── charts/         # Chart components
│   └── emergency/      # Emergency-specific components
├── data/               # Mock data and constants
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── routes/             # Router configuration
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── lib/                # Utility libraries
└── assets/             # Static assets & i18n
```

---

## 🌎 Internationalization

Supported Languages:
- English 🇺🇸
- Chinese (简体中文 🇨🇳)

Easily extend to more languages with i18next configuration.

---

## 📱 Responsive Design

WA Emergency Dashboard is optimized for:
- 💻 Desktop (1200px+)
- 📱 Tablets (768px - 1199px)
- 📱 Mobile Devices (320px - 767px)

---

## 🐳 Docker Deployment

```bash
# Build Docker image
docker build -t wa-emergency-dashboard .

# Run container
docker run -p 3000:3000 wa-emergency-dashboard
```

---

## 🤝 Contribution Guide

We welcome contributions!

```bash
# Fork the repository
git checkout -b feature/your-feature
# Make your changes
git commit -m "feat: add awesome feature"
git push origin feature/your-feature
# Create a Pull Request 🚀
```

### Development Guidelines
1. Follow TypeScript best practices
2. Write tests for new features
3. Ensure accessibility compliance
4. Use conventional commits

---

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] AI-powered emergency predictions
- [ ] Multi-region support (beyond WA)
- [ ] Historical data analysis dashboard
- [ ] Public API for third-party integration
- [ ] Real-time notifications system
- [ ] Advanced filtering and search

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [Mapbox](https://www.mapbox.com/) - Interactive mapping platform
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Recharts](https://recharts.org/) - Charting library
- [TanStack](https://tanstack.com/) - Powerful React utilities
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

## 📞 Support

For support and questions:
- Create an [issue](https://github.com/your-org/wa-emergency-dashboard/issues)
- Email: support@emergency-dashboard.com

---

**Built with ❤️ for Western Australia emergency preparedness** 