# SalonTrack - Loyalty Program Management System

## Overview

SalonTrack is a complete loyalty tracking system for barbershops and salons that helps business owners track and reward repeat customers. The system supports both phone number lookup and QR code check-ins, automatically tracking visits and rewarding loyal customers. Built for the Kenyan market with KES pricing and local phone number formats.

**Key Features:**
- Phone number and QR code customer check-ins
- Automatic visit tracking and reward calculations
- Real-time dashboard with comprehensive business statistics
- Enhanced customer profiles with detailed information and history
- Advanced analytics dashboard with interactive charts
- SMS notification system for customer engagement
- Customer management with progress visualization
- Customizable loyalty program settings
- Growth tracking and business insights
- Professional tabbed navigation interface
- Printable QR codes for easy customer access

## System Architecture

### Full-Stack Monorepo Structure
- **Frontend**: React with TypeScript and Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Radix UI components with Tailwind CSS
- **State Management**: React Query for server state management

### Folder Structure
```
├── client/          # Frontend React application
├── server/          # Backend Express.js application
├── shared/          # Shared TypeScript types and schemas
├── migrations/      # Database migrations
└── dist/           # Build output
```

## Key Components

### Frontend Architecture
- **React with TypeScript**: Main UI framework using functional components and hooks
- **Vite**: Fast build tool and development server
- **Radix UI + Tailwind CSS**: Component library with utility-first styling
- **React Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing

### Backend Architecture  
- **Express.js**: RESTful API server
- **TypeScript**: Type-safe backend development
- **Drizzle ORM**: Database operations with PostgreSQL
- **Neon Database**: Serverless PostgreSQL hosting
- **Repository Pattern**: Clean separation of data access logic

### Database Schema
The application uses four main entities:
- **businesses**: Store business information and loyalty program settings
- **customers**: Customer profiles with visit counts and reward tracking
- **visits**: Individual customer visit records
- **rewards**: Earned and redeemed rewards tracking

## Data Flow

1. **Customer Check-in**: Phone number lookup → Customer creation/retrieval → Visit recording → Reward calculation
2. **Dashboard Updates**: Real-time statistics via React Query invalidation
3. **Settings Management**: Business configuration updates propagated to all components
4. **Analytics**: Aggregated data queries for dashboard metrics

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI components
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- TSX for backend development with auto-restart
- Shared TypeScript configuration across client/server

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- ESBuild bundles backend into `dist/index.js`
- Single Node.js process serves both static files and API

### Database Management
- Drizzle Kit for schema migrations (`db:push` command)
- Environment-based configuration via `DATABASE_URL`
- Serverless PostgreSQL via Neon Database

## Recent Changes

**January 2, 2025:**
- ✓ Complete loyalty tracking system implemented and deployed
- ✓ Database schema created with businesses, customers, visits, rewards, and SMS notifications
- ✓ Enhanced customer profiles with contact details, preferences, and spending history
- ✓ Advanced analytics dashboard with interactive charts and growth metrics
- ✓ SMS notification system for customer engagement and marketing
- ✓ Professional tabbed navigation (Dashboard, Customers, Analytics, Settings)
- ✓ Phone number lookup and QR code check-in functionality working
- ✓ Sample data added for demonstration (Sample Salon with 5 customers)
- ✓ Reward calculation and progress tracking fully functional
- ✓ Business insights and recommendations based on data analysis
- ✓ Customer retention rate and revenue analytics
- ✓ Service popularity tracking and top customer identification

**System Status:** ✅ Fully functional with advanced features - ready for business deployment

## Monetization Features Built-In

- **Monthly Subscription Ready:** KES 200/month per shop tracking
- **QR Code Generation:** Printable branded QR codes for customer check-ins
- **Advanced Analytics:** Comprehensive dashboard with growth metrics and business insights
- **SMS Marketing System:** Complete SMS notification system for customer engagement
- **Customer Profiling:** Detailed customer management for targeted marketing
- **Revenue Tracking:** Service-level revenue analysis and customer lifetime value
- **Business Intelligence:** Automated recommendations and retention analysis

## User Preferences

```
Preferred communication style: Simple, everyday language.
```