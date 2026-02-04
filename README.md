# Sydney Events Discovery Platform

A modern web application designed to help users discover and capture tickets for events happening across Sydney. This platform aggregates events from multiple sources and provides a seamless user experience for event discovery and lead capture.

## Project Overview

Sydney Events is a full-stack web application built as an assignment project that demonstrates:
- Event discovery and filtering capabilities
- Real-time email lead capture
- Backend integration with Supabase for data persistence
- Modern React architecture with TypeScript
- Responsive UI/UX design with Tailwind CSS

## Features

### Core Features
- **Event Discovery**: Browse and search events happening in Sydney
- **Advanced Filtering**: Filter events by date range and venue/location
- **Event Details**: View comprehensive event information including images, descriptions, and timing
- **Lead Capture**: Collect user emails for ticket notifications with optional newsletter opt-in
- **Event Redirect**: Direct users to original ticket booking pages

### Technical Features
- Real-time event data from Supabase
- Email validation and capture
- Row-level security (RLS) policies for data protection
- Responsive design for mobile and desktop
- Type-safe TypeScript implementation

## Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- shadcn-ui (component library)
- React Query (data fetching and caching)
- React Hook Form (form management)
- Zod (schema validation)

**Backend & Database:**
- Supabase (PostgreSQL database with real-time capabilities)
- PostgreSQL (relational database)
- Row-level Security (RLS) for access control

**Development Tools:**
- Node.js & npm
- ESLint (code linting)
- Vitest (testing framework)
- PostCSS (CSS processing)

## Database Schema

### Events Table
Stores all event information with the following fields:
- `id` (UUID): Primary key
- `title` (TEXT): Event name
- `date_time` (TIMESTAMP): Event date and time
- `venue` (TEXT): Venue name/location
- `city` (TEXT): City (default: Sydney)
- `description` (TEXT): Event description
- `image_url` (TEXT): Event image URL
- `source_name` (TEXT): Event source/provider
- `original_url` (TEXT): Link to booking page
- `status` (ENUM): Event status (new, updated, inactive, imported)
- `created_at`, `updated_at`, `last_scraped_at`: Timestamps

### Leads Table
Captures user information for event ticket notifications:
- `id` (UUID): Primary key
- `email` (TEXT): User email address
- `event_id` (UUID): Foreign key to events
- `email_opt_in` (BOOLEAN): Newsletter subscription preference
- `created_at` (TIMESTAMP): Submission timestamp

## Setup & Installation

### Prerequisites
- Node.js (v16 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Git
- A Supabase project with configured database

### Local Development Setup

```bash
# Step 1: Clone the repository
git clone https://github.com/TheTimeMachine01/SydneyEvents.git

# Step 2: Navigate to project directory
cd SydneyEvents

# Step 3: Install dependencies
npm install

# Step 4: Link to Supabase project
npx supabase link --project-ref <YOUR_PROJECT_REF>

# Step 5: Push database migrations
npx supabase db push

# Step 6: Create .env.local file with Supabase credentials
# Required environment variables:
# VITE_SUPABASE_URL=<your_supabase_url>
# VITE_SUPABASE_ANON_KEY=<your_anon_key>

# Step 7: Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run linter
npm run lint
```

## Project Structure

```
src/
├── components/           # React components
│   ├── EventCard.tsx    # Event display card
│   ├── Header.tsx       # Navigation header
│   ├── LeadCaptureModal.tsx  # Email capture modal
│   └── ui/              # shadcn-ui components
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client setup
├── lib/                 # Utility functions
├── pages/               # Page components
│   ├── Index.tsx        # Home/events listing page
│   ├── Dashboard.tsx    # Admin dashboard
│   ├── Login.tsx        # Authentication
│   └── NotFound.tsx     # 404 page
├── types/               # TypeScript type definitions
└── utils/               # Helper utilities
```

## Key Workflows

### Event Discovery Flow
1. User lands on home page
2. Events are fetched from Supabase and displayed in grid layout
3. User can search by title/venue or filter by date range
4. User clicks "Get Tickets" button on an event

### Lead Capture Flow
1. Modal opens with email input form
2. User enters email and optionally opts into newsletter
3. Email is validated using Zod schema
4. Data is inserted into leads table with event reference
5. User is redirected to original event booking page

## Deployment

The application is configured for deployment on Vercel with the following setup:

```bash
# Build and deploy to Vercel
npm run build
```

Configuration files:
- `vercel.json`: Vercel deployment settings
- `vite.config.ts`: Build and dev server configuration
- `tsconfig.json`: TypeScript configuration

## Security Considerations

- **Row-Level Security (RLS)**: Policies ensure only authorized users can access sensitive data
- **Email Validation**: Client-side and schema validation prevents invalid submissions
- **Type Safety**: TypeScript ensures compile-time type checking
- **Environment Variables**: Sensitive credentials stored in `.env.local`

## Future Enhancements

- User authentication and saved events
- Advanced analytics dashboard
- Event recommendations based on user preferences
- Integration with calendar applications
- Mobile app development
- Multi-city support expansion

## Assignment Requirements

This project demonstrates:
✓ Full-stack web development capabilities
✓ Modern React patterns and hooks
✓ TypeScript for type safety
✓ Database design and management
✓ API integration
✓ Responsive UI/UX design
✓ Form handling and validation
✓ State management with React Query

## Contributing

For development contributions, ensure:
- Code follows ESLint standards
- Components use TypeScript for type safety
- Changes are tested before submission
- Commit messages are descriptive

## License

This project is created as an assignment project.
