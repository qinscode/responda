# Western Australia Emergency Dashboard - Requirements Document

## 1. Project Overview

### 1.1 Project Description
The Western Australia Emergency Dashboard is a web-based application designed to provide real-time emergency information for bushfire and flood incidents across Western Australia. The system integrates with QGIS data sources to display interactive maps, danger ratings, and affected areas to help residents, tourists, and emergency personnel make informed decisions.

### 1.2 Project Objectives
- Provide a unified platform for emergency information visualization
- Display real-time bushfire and flood danger ratings across WA regions
- Offer interactive map-based and list-based views
- Enable quick location-based searches and filtering
- Support multi-day forecasting for emergency planning
- Ensure responsive design for desktop and mobile devices

### 1.3 Target Audience
- **Primary**: WA residents and tourists seeking emergency information
- **Secondary**: Emergency services personnel and local government officials
- **Tertiary**: Media and public safety organizations

## 2. Functional Requirements

### 2.1 Core Features

#### 2.1.1 Emergency Type Management
- **FR-001**: System shall support two primary emergency types: Bushfire and Flood
- **FR-002**: Each emergency type shall have distinct visual indicators and color schemes
- **FR-003**: Users shall be able to filter view by emergency type (Bushfire only, Flood only, or Both)

#### 2.1.2 Geographic Coverage
- **FR-004**: System shall cover all Western Australia regions and local government areas
- **FR-005**: Map shall be centered on Western Australia with appropriate zoom levels
- **FR-006**: System shall support region-based data aggregation and display

#### 2.1.3 Danger Rating System
- **FR-007**: Bushfire ratings shall include: No Rating, Low-Moderate, High, Very High, Severe, Extreme, Catastrophic
- **FR-008**: Flood ratings shall include: No Warning, Minor Flooding, Moderate Flooding, Major Flooding
- **FR-009**: Each rating level shall have associated colors and visual indicators
- **FR-010**: Ratings shall be displayed using gauge-style indicators in popups

#### 2.1.4 Temporal Features
- **FR-011**: System shall display current day emergency ratings by default
- **FR-012**: Users shall be able to view forecasts for up to 7 days ahead
- **FR-013**: Date selection shall be available via tabs or dropdown interface
- **FR-014**: Historical data viewing shall be supported (optional enhancement)

#### 2.1.5 Interactive Map Interface
- **FR-015**: Map shall be built using Mapbox or similar mapping library
- **FR-016**: Users shall be able to zoom, pan, and interact with map regions
- **FR-017**: Clicking on a region shall display detailed information popup
- **FR-018**: Map shall support multiple view modes: satellite, terrain, street view
- **FR-019**: Region boundaries shall be clearly defined and clickable

#### 2.1.6 List View Interface
- **FR-020**: System shall provide a sortable list view of all regions and their current ratings
- **FR-021**: List items shall be clickable and sync with map highlighting
- **FR-022**: List shall support sorting by region name, rating level, and emergency type
- **FR-023**: Search functionality shall filter list results in real-time

#### 2.1.7 Search and Location Features
- **FR-024**: Global search bar shall support region name, postcode, and landmark searches
- **FR-025**: "Find Me" geolocation feature shall center map on user's current location
- **FR-026**: Search results shall highlight relevant regions on both map and list
- **FR-027**: Recent searches shall be stored for quick access

#### 2.1.8 Information Display
- **FR-028**: Region popup shall display: region name, current rating, affected local government areas, last updated time
- **FR-029**: "View More" links shall provide detailed emergency information and recommendations
- **FR-030**: Emergency contact information (000) shall be prominently displayed
- **FR-031**: System shall display data source and last update timestamps

### 2.2 Data Integration Requirements

#### 2.2.1 QGIS Data Integration
- **FR-032**: System shall consume GeoJSON data from QGIS exports
- **FR-033**: Data refresh shall occur at configurable intervals (default: 15 minutes)
- **FR-034**: System shall handle QGIS data format variations and missing data gracefully
- **FR-035**: Backup data sources shall be available in case of primary data source failure

#### 2.2.2 Data Validation
- **FR-036**: All incoming data shall be validated for completeness and accuracy
- **FR-037**: Invalid or missing data shall not break the user interface
- **FR-038**: Data quality indicators shall be displayed to users when appropriate

### 2.3 User Interface Requirements

#### 2.3.1 Navigation
- **FR-039**: Top navigation shall include: Dashboard, Bushfire Info, Flood Info, Preparedness, About
- **FR-040**: Emergency contact button shall be prominently placed and always visible
- **FR-041**: Breadcrumb navigation shall be available for deep-linked pages

#### 2.3.2 Responsive Design
- **FR-042**: Interface shall be fully responsive across desktop, tablet, and mobile devices
- **FR-043**: Touch gestures shall be supported for mobile map interaction
- **FR-044**: Minimum supported screen resolution: 320px width

#### 2.3.3 Accessibility
- **FR-045**: Interface shall meet WCAG 2.1 AA accessibility standards
- **FR-046**: Color schemes shall maintain sufficient contrast ratios
- **FR-047**: Screen reader compatibility shall be ensured for all interactive elements
- **FR-048**: Keyboard navigation shall be fully supported

## 3. Non-Functional Requirements

### 3.1 Performance Requirements
- **NFR-001**: Initial page load shall complete within 3 seconds on standard broadband
- **NFR-002**: Map interactions shall respond within 500ms
- **NFR-003**: Data updates shall not interrupt user interaction
- **NFR-004**: System shall support concurrent usage by 10,000+ users

### 3.2 Reliability Requirements
- **NFR-005**: System uptime shall be 99.5% or higher
- **NFR-006**: Graceful degradation shall occur during data source outages
- **NFR-007**: Error messages shall be user-friendly and actionable

### 3.3 Security Requirements
- **NFR-008**: All data transmission shall use HTTPS encryption
- **NFR-009**: No personal user data shall be stored without explicit consent
- **NFR-010**: API endpoints shall implement rate limiting and abuse prevention

### 3.4 Compatibility Requirements
- **NFR-011**: Support for modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **NFR-012**: Progressive Web App (PWA) capabilities for offline access
- **NFR-013**: SEO optimization for search engine discoverability

## 4. Technical Constraints

### 4.1 Technology Stack
- **TC-001**: Frontend framework: React 18+ with TypeScript
- **TC-002**: Build tool: Vite 4+
- **TC-003**: Mapping library: Mapbox GL JS or similar
- **TC-004**: State management: Zustand or Redux Toolkit
- **TC-005**: Styling: Tailwind CSS with responsive utilities

### 4.2 Data Constraints
- **TC-006**: QGIS data shall be provided in GeoJSON format
- **TC-007**: Maximum region data size: 10MB per emergency type
- **TC-008**: Data update frequency: Every 15-30 minutes during active incidents

## 5. User Stories

### 5.1 Resident User Stories
- **US-001**: As a WA resident, I want to quickly check the bushfire danger rating for my area so I can plan my day safely
- **US-002**: As a traveler, I want to search for emergency information by location so I can avoid dangerous areas
- **US-003**: As a parent, I want to see both current and forecast emergency ratings so I can plan school activities

### 5.2 Emergency Personnel User Stories
- **US-004**: As an emergency services officer, I want to see real-time data across multiple regions so I can coordinate response efforts
- **US-005**: As a local government official, I want to access detailed information about affected areas in my jurisdiction

### 5.3 General User Stories
- **US-006**: As a mobile user, I want the interface to work seamlessly on my phone so I can check emergency information while traveling
- **US-007**: As a user with accessibility needs, I want to access all information using screen readers and keyboard navigation

## 6. Data Model Requirements

### 6.1 Region Data Structure
```typescript
interface Region {
  id: string;
  name: string;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  localGovernmentAreas: string[];
  emergencyData: {
    bushfire: DangerRating;
    flood: FloodWarning;
  };
  lastUpdated: Date;
  forecasts: EmergencyForecast[];
}
```

### 6.2 Emergency Rating Structures
```typescript
interface DangerRating {
  level: 'no-rating' | 'low-moderate' | 'high' | 'very-high' | 'severe' | 'extreme' | 'catastrophic';
  description: string;
  color: string;
  recommendations: string[];
}

interface FloodWarning {
  level: 'no-warning' | 'minor' | 'moderate' | 'major';
  description: string;
  color: string;
  affectedAreas: string[];
  recommendations: string[];
}
```

## 7. Success Criteria

### 7.1 User Experience Metrics
- **SC-001**: Average page load time < 3 seconds
- **SC-002**: User task completion rate > 90% for finding regional emergency information
- **SC-003**: Mobile usability score > 85% in user testing

### 7.2 Technical Metrics
- **SC-004**: System availability > 99.5%
- **SC-005**: Data refresh success rate > 98%
- **SC-006**: Cross-browser compatibility verified across target browsers

### 7.3 Content Metrics
- **SC-007**: All WA regions represented with current data
- **SC-008**: Emergency rating accuracy verified against official sources
- **SC-009**: Forecast data available for minimum 3 days ahead

## 8. Project Deliverables

### 8.1 Phase 1 - Core MVP (4-6 weeks)
- Basic map interface with region boundaries
- Emergency rating display for current day
- Search and filter functionality
- Responsive design implementation
- Mock data integration

### 8.2 Phase 2 - Enhanced Features (2-3 weeks)
- Multi-day forecast display
- Advanced filtering and sorting
- Detailed information popups
- Performance optimization
- Accessibility improvements

### 8.3 Phase 3 - Production Ready (2-3 weeks)
- QGIS data integration
- Error handling and validation
- Testing and quality assurance
- Documentation and deployment

## 9. Assumptions and Dependencies

### 9.1 Assumptions
- **A-001**: QGIS data will be available in standard GeoJSON format
- **A-002**: WA region boundaries are well-defined and stable
- **A-003**: Emergency rating systems are standardized across agencies

### 9.2 Dependencies
- **D-001**: QGIS data source configuration and access
- **D-002**: Official emergency rating definitions and color schemes
- **D-003**: WA government region boundary data
- **D-004**: Hosting and deployment infrastructure

## 10. Risks and Mitigation

### 10.1 Technical Risks
- **R-001**: QGIS data format changes - Mitigation: Flexible data parsing with fallback options
- **R-002**: Third-party mapping service limitations - Mitigation: Multiple mapping provider support
- **R-003**: Performance issues with large datasets - Mitigation: Data optimization and caching strategies

### 10.2 Operational Risks
- **R-004**: Data source unavailability - Mitigation: Backup data sources and graceful degradation
- **R-005**: User accessibility concerns - Mitigation: Early accessibility testing and compliance verification

This requirements document serves as the foundation for developing the Western Australia Emergency Dashboard system and should be reviewed and updated throughout the development process. 