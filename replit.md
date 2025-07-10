# WanderNotes - AI Travel Concierge

## Overview
WanderNotes is an AI-powered travel planning platform featuring conversational AI interface with Google OAuth authentication, personalized travel experiences through multiple AI models, travel memory scrapbook creator, and comprehensive travel planning with interactive flight selection and day-wise activity customization.

## Recent Changes
- **2025-06-25**: Created comprehensive landing page based on executive summary document
- **2025-06-25**: Implemented subscription model with three tiers (Explorer, Wanderer, Travel Pro)
- **2025-06-25**: Added backend API routes for subscription management
- **2025-06-25**: Removed WanderNotes branding from home page header only (kept in App Header/Footer)
- **2025-06-25**: Completed "Create Report" functionality with downloadable Markdown reports
- **2025-06-25**: Fixed flight card display issues with comprehensive IATA code database
- **2025-06-25**: Implemented proper airport code mapping and accurate date calculations
- **2025-06-25**: Changed "Phone Number" to "WhatsApp Connect" with icon and pre-filled message in landing page footer
- **2025-06-25**: Integrated chat history with travel planner in unified interface with resizable panels
- **2025-06-25**: Made application mobile-responsive with collapsible sidebars, mobile menu, and adaptive layouts
- **2025-06-25**: Simplified mobile interface to reduce clutter with smaller fonts, compressed layouts, and streamlined components
- **2025-06-27**: Updated company branding to "Wander Notes by TabTapAI PTE LTD Singapore" with © 2025 All rights reserved
- **2025-06-27**: Redesigned mobile interface with clean, minimal header and decluttered navigation
- **2025-06-27**: Fixed mobile header layout using AppHeader component with proper responsive design
- **2025-06-29**: Enhanced SEO with comprehensive meta tags, structured data, and sitemap
- **2025-06-29**: Added complete booking management system with database schema and UI components
- **2025-06-29**: Updated pricing structure to $1.99 (Explorer), $2.99 (Wanderer), $9.99 (Travel Pro)
- **2025-06-29**: Added sponsor button component with Google integration for project funding
- **2025-07-01**: Fixed navigation menu items visibility by making "My Account" section open by default in both desktop and mobile views
- **2025-07-01**: Updated sponsor button to use PayPal link (https://paypal.me/VSaripaka?country.x=SG&locale.x=en_GB)
- **2025-07-10**: Removed chat history panel from accordion menu as requested
- **2025-07-10**: Added Business Information section with company details, team info, products, and roadmap
- **2025-07-10**: Implemented comprehensive chat preservation functionality using localStorage
- **2025-07-10**: Added context reset functionality with "Reset Context" button in header
- **2025-07-10**: Enhanced travel itinerary planning with flight preference options and comprehensive flight generation

## Project Architecture

### Frontend (React + TypeScript)
- **Landing Page**: Professional marketing page with subscription model integration
- **Home Page**: Main travel planning interface with AI chat
- **Authentication**: Google OAuth + local auth with session management
- **Travel Planning**: Interactive forms with flight selector and itinerary builder
- **Scrapbook**: Travel memory creation and management system
- **Subscription Management**: Three-tier pricing model with feature restrictions

### Backend (Express + Node.js)
- **API Routes**: RESTful endpoints for all features including subscriptions
- **AI Integration**: Multiple LLM providers (OpenAI, Gemini) with dynamic routing
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with Google OAuth2 and local strategies
- **External APIs**: Google Maps, Weather, Flight data integration

### Database Schema
- Users with Google OAuth support
- Chat sessions and messages
- Travel trips and itineraries  
- Subscriptions with plan types and features
- Scrapbooks and travel memories
- Hotels and attractions data

### Key Features
1. **AI Travel Concierge**: Multi-model AI chat for travel planning
2. **Flight Search**: Real-time flight data with fallback generation
3. **Interactive Itinerary**: Day-wise activity customization
4. **Travel Reports**: Downloadable comprehensive trip summaries
5. **Subscription Model**: Explorer ($1.99), Wanderer ($2.99), Travel Pro ($9.99)
6. **Memory Scrapbook**: Visual travel memory creation and sharing
7. **Safety Alerts**: Destination safety information integration

## User Preferences
- Clean, minimal UI design inspired by Perplexity.ai
- Professional branding positioned as "Notion + ChatGPT of travel"
- Collapsible sidebar for better space utilization
- Real-time data preferred over placeholder content
- Mobile-responsive design throughout

## Technical Decisions
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM (no migrations, direct schema push)
- **AI Models**: Dynamic LLM routing between OpenAI and Gemini
- **Authentication**: Session-based with Google OAuth integration

## Deployment
- Configured for Replit deployment
- Environment variables managed through Replit secrets
- Auto-restart workflow on code changes
- No Docker/virtualization (uses Nix environment)