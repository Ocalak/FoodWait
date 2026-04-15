# MCR MCP FoodWait — Design Brainstorm

## Design Philosophy: Chosen Approach

**Design Movement:** Modern Minimalism with Premium Depth
**Aesthetic:** Sophisticated, high-tech, data-driven interface with elegant simplicity

### Core Principles
1. **Clarity Over Decoration** — Every visual element serves a functional purpose; no ornamental clutter
2. **Depth Through Subtlety** — Soft shadows, layered cards, and micro-interactions create premium feel without visual noise
3. **Data Visualization First** — Queue times, maps, and results are the heroes; UI guides attention to insights
4. **Responsive Elegance** — Scales beautifully from mobile to desktop without losing sophistication

### Color Philosophy
- **Primary: Deep Teal (#0D7377)** — Trust, technology, sophistication; represents real-time data accuracy
- **Secondary: Warm Gold (#F4A261)** — Accent for wait times and CTAs; creates visual warmth and urgency
- **Neutral: Charcoal (#1A1A1A) & Off-White (#F8F9FA)** — Clean backgrounds; excellent contrast for readability
- **Status Colors:** Green (low wait), Amber (moderate), Red (high wait) — Intuitive queue status

**Reasoning:** The palette balances tech-forward confidence (teal) with approachable warmth (gold), avoiding cold sterility while maintaining premium positioning.

### Layout Paradigm
- **Asymmetric Grid** — Search box anchored top-left, map dominates right side, results list below
- **Card-Based Hierarchy** — Shop results as distinct, interactive cards with hover elevation
- **Sticky Search** — Search controls remain accessible while scrolling through results
- **Map-First on Desktop** — Large screens show map + list side-by-side; mobile stacks vertically

### Signature Elements
1. **Animated Queue Dots** — Visual representation of queue length with subtle pulse animation
2. **Gradient Wait-Time Badge** — Dynamic color gradient reflecting wait severity (green → amber → red)
3. **Floating Action Button** — GPS search button with elevation and micro-interaction feedback

### Interaction Philosophy
- **Smooth Transitions** — 300ms easing for all state changes (search, modal open, card hover)
- **Hover Elevation** — Cards lift slightly on hover with shadow depth increase
- **Loading States** — Skeleton screens with gentle pulse animation; never show blank states
- **Feedback Loops** — Toast notifications for search results, errors, and confirmations

### Animation Guidelines
- **Entrance:** Fade + slight slide-up (200ms, ease-out-quad)
- **Hover:** Scale 1.02 + shadow increase (150ms, ease-out)
- **Loading:** Pulse opacity (1.5s loop) for skeleton screens
- **Modal:** Scale + fade (250ms, cubic-bezier for bounce)

### Typography System
- **Display Font:** Inter 800 (headings, large numbers)
- **Body Font:** Inter 400/500 (descriptions, labels)
- **Accent Font:** Inter 700 (queue status, badges)
- **Hierarchy:** 
  - H1: 32px (page title)
  - H2: 24px (shop name)
  - H3: 16px (section headers)
  - Body: 14px (descriptions)
  - Caption: 12px (metadata)

---

## Implementation Checklist
- [ ] Replace FoodWait branding with MCR MCP throughout
- [ ] Implement teal/gold color scheme in CSS variables
- [ ] Build premium search box with glassmorphism effect
- [ ] Create enhanced map integration with better markers
- [ ] Design elevated shop cards with queue visualization
- [ ] Add smooth animations and transitions
- [ ] Optimize mobile responsiveness
- [ ] Test accessibility (WCAG AA compliance)
