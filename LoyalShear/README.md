# SalonTrack - Loyalty Program Management System

A complete loyalty tracking system for barbershops and salons that helps business owners track and reward repeat customers. Built for the Kenyan market with KES pricing and local phone number formats.

## Features

- **Customer Check-ins**: Phone number lookup and QR code scanning
- **Automatic Rewards**: Track visits and award rewards after set number of visits
- **Real-time Analytics**: Comprehensive dashboard with growth metrics and business insights
- **Customer Profiles**: Detailed customer information with contact details and visit history
- **SMS Marketing**: Send thank you messages, reward reminders, and promotional texts
- **Business Intelligence**: Customer retention rates, revenue analysis, and automated recommendations
- **Professional Interface**: Clean tabbed navigation for Dashboard, Customers, Analytics, and Settings

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Charts**: Recharts for analytics visualization
- **State Management**: React Query for server state

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/salontrack.git
   cd salontrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Add your database URL
   DATABASE_URL="your_postgresql_connection_string"
   SESSION_SECRET="your_session_secret_key"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
├── server/          # Express.js backend
│   ├── db.ts           # Database connection
│   ├── routes.ts       # API routes
│   └── storage.ts      # Data access layer
├── shared/          # Shared TypeScript types and schemas
└── package.json     # Dependencies and scripts
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for session management
- `NODE_ENV` - Environment (development/production)

## Business Model

- **Subscription**: KES 200/month per shop
- **QR Codes**: Branded QR codes for customer check-ins
- **SMS Marketing**: Customer engagement and retention tools
- **Analytics**: Business insights and growth tracking

## Development

The project uses a monorepo structure with shared TypeScript types. The frontend and backend are developed together with hot reloading support.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

## License

Private - All rights reserved

## Contact

For business inquiries about SalonTrack, please contact [your-email@domain.com]