# BrewHaven

A modern coffee e-commerce platform built with React and Supabase. Browse and order coffee products with a full-featured shopping experience, user authentication, and admin management capabilities.

![Tech Stack](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Supabase](https://img.shields.io/badge/Supabase-Latest-green) ![Vite](https://img.shields.io/badge/Vite-5.4-purple)

## Features

### E-Commerce Platform
- **Browse Coffee Catalog**: Explore a wide variety of coffee products with detailed descriptions
- **Smart Filtering**: Filter by category, type (Hot/Cold), price range, and search by name
- **Shopping Cart**: Add items, update quantities, and manage your cart
- **Order Management**: Complete checkout flow with shipping details and order tracking
- **Order History**: View all your past orders with full details

### User Features
- **Authentication**: Secure sign-up and login with Supabase Auth
- **User Profiles**: Manage your profile information
- **Protected Routes**: Secure access to user-specific pages
- **Session Management**: Persistent authentication state

### Admin Dashboard
- **Coffee Management**: Add, edit, and delete coffee products
- **Inventory Control**: Manage stock levels and product availability
- **Statistics Overview**: View user counts, order statistics, and chat metrics
- **Image Upload**: Add product images with URL support
- **Category Management**: Organize products by categories

### Modern UI/UX
- **Beautiful Design**: Built with shadcn/ui and Tailwind CSS
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Ready**: Theme support with next-themes
- **Loading States**: Smooth loading indicators and error boundaries
- **Toast Notifications**: User-friendly feedback for all actions

### Coming Soon
- **AI Chat Bot**: AI-powered chat interface for personalized coffee recommendations (coming soon)

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **TanStack Query** - Server state management
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible primitives

### Backend
- **Supabase** - Backend-as-a-Service
  - Authentication (Email/Password)
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Edge Functions (Deno)
  - Storage (for future image uploads)

### Coming Soon
- **AI Chat Integration** - AI-powered coffee recommendations (coming soon)

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- A **Supabase account** (free tier available)

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd coffee-ai-brew
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

**Important**: The `.env` file is already in `.gitignore` and will not be committed to version control.

### 4. Set Up Supabase Backend

**See `BACKEND_SETUP.md` for complete step-by-step backend setup guide**

Quick summary:
1. Create a new Supabase project
2. Run `FRESH_SETUP.sql` in Supabase SQL Editor to create all tables and policies
3. Add admin role for your user (see BACKEND_SETUP.md)

Note: AI chat feature is coming soon and will be available in a future update.

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Project Structure

```
coffee-ai-brew/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── ChatDiagnostic.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── LoadingSpinner.tsx
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.tsx # Authentication state
│   │   └── CartContext.tsx # Shopping cart state
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # External service integrations
│   │   └── supabase/      # Supabase client and types
│   ├── lib/               # Utility functions
│   │   ├── env.ts         # Environment validation
│   │   └── utils.ts       # General utilities
│   └── pages/             # Page components
│       ├── Landing.tsx    # Homepage
│       ├── Auth.tsx       # Login/Signup
│       ├── Chat.tsx       # AI chat interface (optional)
│       ├── Shop.tsx       # Product catalog
│       ├── Cart.tsx       # Shopping cart
│       ├── Checkout.tsx   # Checkout process
│       ├── Orders.tsx     # Order history
│       ├── Profile.tsx    # User profile
│       └── Admin.tsx      # Admin dashboard
├── supabase/
│   ├── functions/         # Edge functions
│   │   └── coffee-chat/   # AI chat endpoint (optional)
│   └── migrations/        # Database migrations
├── public/                # Static assets
└── BACKEND_SETUP.md       # Detailed backend setup guide
```

## Available Scripts

- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Deployment

The app can be deployed to any platform that supports Node.js and static hosting:

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Deploy

### Other Platforms

- **Netlify**: Connect GitHub repo → Set build command: `npm run build` → Publish directory: `dist`
- **Railway**: Deploy from GitHub
- **Any Node.js hosting**: Build with `npm run build` and serve the `dist` folder

### Before Deploying

- Complete backend setup (see `BACKEND_SETUP.md`)
- Set environment variables in your hosting platform
- Update Supabase redirect URLs to your production domain

## Security

- **Row Level Security (RLS)**: All database tables have RLS policies enabled
- **Environment Variables**: Sensitive keys are never committed to version control
- **Protected Routes**: User and admin routes are protected with authentication
- **API Security**: Edge Functions use Supabase's built-in authentication

## Documentation

- **`BACKEND_SETUP.md`** - Complete step-by-step backend setup guide
- **`FRONTEND_TABLES_REFERENCE.md`** - Database schema reference for frontend developers

## Troubleshooting

### Admin panel not accessible?
- Run the admin role SQL query (see `BACKEND_SETUP.md` Step 8)
- Sign out and sign back in to refresh your session
- Check browser console for errors

### Database errors?
- Re-run `FRESH_SETUP.sql` in Supabase SQL Editor
- Verify all tables and policies were created successfully

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the amazing component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Google Gemini](https://ai.google.dev/) for optional AI capabilities

---

Made with coffee and dedication
