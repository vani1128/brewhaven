# BrewHaven - AI Coffee Recommendations

An AI-powered coffee recommendation application built with React, TypeScript, Vite, and Supabase. Chat with Venessa at BrewHaven to discover your perfect coffee match based on your preferences and mood.

## Features

- 🤖 **AI-Powered Recommendations**: Chat with an AI barista to get personalized coffee suggestions
- 🔐 **Authentication**: Secure user authentication with Supabase
- 👤 **User Profiles**: View your profile and chat history
- 🛡️ **Admin Dashboard**: Manage coffee items, add images, and view statistics (admin only)
- 🛒 **E-Commerce**: Shop for coffee products, manage cart, and place orders
- 💬 **Chat History**: Save and view your conversation history
- 🎨 **Modern UI**: Beautiful, responsive interface built with shadcn/ui and Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Edge Functions)
- **State Management**: React Context API, TanStack Query
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd coffee-ai-brew

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the root directory:
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Backend Setup

📖 **See `BACKEND_SETUP.md` for complete step-by-step backend setup guide**

Quick steps:
1. Create Supabase project
2. Run `FRESH_SETUP.sql` in Supabase SQL Editor
3. Deploy edge function for chatbot
4. Set environment variables
5. Add admin role for your user

## Deployment

Deploy to any platform that supports Node.js:

- **Vercel**: Connect GitHub repo → Deploy
- **Netlify**: Connect GitHub repo → Deploy
- **Railway**: Deploy from GitHub
- **Any Node.js hosting**: Build with `npm run build` and serve the `dist` folder

### Before Deploying

- ✅ Complete backend setup (see `BACKEND_SETUP.md`)
- ✅ Set environment variables in Vercel/hosting platform
- ✅ Update Supabase redirect URLs to your production domain

## Project Structure

```
coffee-ai-brew/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # Supabase client setup
│   ├── lib/           # Utility functions
│   └── pages/         # Page components
├── supabase/
│   ├── functions/     # Edge functions
│   └── migrations/    # Database migrations
└── public/            # Static assets
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
