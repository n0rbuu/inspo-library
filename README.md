# Inspo Library

A Next.js webapp that helps users save photos and screenshots of things that inspire them.

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/inspo-library.git
cd inspo-library
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Variables

This project uses Supabase for authentication and data storage. You need to set up environment variables for it to work properly.

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Fill in your Supabase credentials in the `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

You can find these values in your Supabase dashboard.

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - UI components
- `/lib` - Utility functions and API clients, including Supabase integration
- `/public` - Static assets
- `/styles` - Global styles and theme configuration
- `/types` - TypeScript type definitions

## Features

- Upload and manage inspiring content
- Organize items with tags
- Add multiple images and URLs to each item
- Notes for additional context

## License

See the [LICENSE](LICENSE) file for details. 
