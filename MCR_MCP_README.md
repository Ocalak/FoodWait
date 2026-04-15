# MCR MCP - Queue Intelligence Platform

A premium real-time queue management and restaurant discovery application built with React, Tailwind CSS, and Leaflet maps.

## 🎯 Features

### Premium UI/UX
- **Modern Design**: Clean, professional interface with teal and gold accent colors
- **Responsive Layout**: Fully responsive design optimized for desktop and mobile
- **Smooth Animations**: Micro-interactions and transitions for enhanced user experience
- **Accessibility**: Proper contrast, keyboard navigation, and semantic HTML

### Search Functionality
- **Flexible Search**: Search by food type and location
- **GPS Integration**: One-click location detection using browser geolocation
- **City Search**: Geocoding support for city-based searches
- **Real-time Results**: Instant restaurant discovery with queue data

### Map Integration
- **Interactive Leaflet Map**: Full-featured map with zoom and pan controls
- **Color-Coded Markers**: Visual indicators for wait times (green/amber/red)
- **User Location**: Shows your current position on the map
- **Popup Information**: Click markers to see restaurant details

### Results Display
- **Queue Visualization**: Animated dot indicators for queue length
- **Wait Time Badges**: Color-coded wait time estimates
- **Distance Information**: Shows distance from your location
- **Expandable Cards**: Click to see additional restaurant details
- **Sorted Results**: Results automatically sorted by distance

### Queue Intelligence
- **Real-time Wait Times**: Estimated wait times for each restaurant
- **Queue Length**: Number of people currently waiting
- **Status Indicators**: Quick visual status (Low Wait/Moderate/High Wait)
- **Smart Sorting**: Results organized by proximity and wait time

## 🏗️ Architecture

```
client/
├── src/
│   ├── pages/
│   │   ├── Home.tsx          # Main search and results page
│   │   └── NotFound.tsx      # 404 page
│   ├── components/
│   │   ├── SearchResults.tsx # Results list with queue visualization
│   │   ├── MapComponent.tsx  # Leaflet map integration
│   │   └── ui/               # shadcn/ui components
│   ├── App.tsx               # Router and layout
│   ├── main.tsx              # React entry point
│   └── index.css             # Global styles with design tokens
├── index.html                # HTML template
└── public/                   # Static assets
```

## 🎨 Design System

### Color Palette
- **Primary**: Deep Teal (#0D7377) - Main brand color
- **Accent**: Warm Gold (#F4A261) - Secondary highlights
- **Background**: Clean White with subtle gradients
- **Text**: Dark Slate for readability

### Typography
- **Display**: Inter Bold for headings
- **Body**: Inter Regular for content
- **Hierarchy**: Clear visual distinction between levels

### Spacing & Layout
- **Container**: Max-width 1280px with responsive padding
- **Grid**: 3-column layout on desktop, stacked on mobile
- **Gaps**: Consistent 8px, 16px, 24px spacing system

## 🚀 Getting Started

### Installation
```bash
cd mcr-mcp-foodwait
pnpm install
```

### Development
```bash
pnpm dev
```
Server runs at `http://localhost:3000`

### Build
```bash
pnpm build
```

## 📱 Key Components

### SearchResults Component
Displays restaurants with:
- Ranking badges (#1, #2, etc.)
- Wait time color-coded badges
- Queue length visualization
- Distance information
- Expandable details panel

### MapComponent
Features:
- OpenStreetMap tiles via Leaflet
- User location marker
- Color-coded restaurant markers
- Popup information on click
- Auto-fit bounds to show all results

### Home Page
Includes:
- Premium search form
- GPS and city search options
- Error handling with user feedback
- Loading states
- Empty state messaging
- Results grid layout

## 🔧 API Integration

### Geoapify API
- Used for restaurant discovery
- Filters by category (catering.restaurant)
- Returns 30 results within 3km radius
- Provides coordinates and addresses

### Nominatim Geocoding
- OpenStreetMap geocoding service
- Converts city names to coordinates
- Free and open-source

## 🎯 User Experience Highlights

1. **Intuitive Search**: Clear input fields with helpful placeholders
2. **Quick Actions**: GPS button for one-click location detection
3. **Visual Feedback**: Loading states and error messages
4. **Interactive Map**: Click markers to see details
5. **Smart Results**: Sorted by distance, color-coded by wait time
6. **Expandable Details**: Click cards to see more information
7. **Responsive Design**: Works seamlessly on all devices

## 🔐 Performance Optimizations

- Lazy loading of Leaflet library
- Optimized component rendering
- Efficient state management
- CSS-in-JS for dynamic styling
- Responsive image handling

## 📊 Data Structure

Each restaurant includes:
```typescript
{
  id: string;           // Unique identifier
  name: string;         // Restaurant name
  address: string;      // Full address
  lat: number;          // Latitude
  lon: number;          // Longitude
  distance: number;     // Distance in km
  waitTime?: number;    // Estimated wait in minutes
  queueLength?: number; // Number of people waiting
}
```

## 🌟 Premium Features

- **Gradient Backgrounds**: Subtle color gradients for depth
- **Shadow Effects**: Elevation and depth through shadows
- **Smooth Transitions**: All interactions have smooth animations
- **Hover Effects**: Interactive elements respond to user interaction
- **Border Styling**: Consistent border colors and widths
- **Icon Integration**: Lucide React icons throughout

## 📝 Future Enhancements

- Real-time queue updates via WebSocket
- User reviews and ratings
- Restaurant filtering by cuisine type
- Favorite restaurants bookmarking
- Push notifications for queue alerts
- Dark mode support
- Multi-language support

## 🛠️ Technologies Used

- **React 19**: Modern UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling
- **Leaflet**: Interactive maps
- **Lucide React**: Icon library
- **shadcn/ui**: Component library
- **Wouter**: Client-side routing
- **Vite**: Fast build tool

## 📄 License

MIT License - Feel free to use and modify

---

Built with ❤️ for MCR MCP - Making queue management intelligent
