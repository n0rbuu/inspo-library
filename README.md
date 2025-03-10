# Inspo Library

A personal design inspiration bookmarks manager for product designers. This application allows you to store, organize, and browse design inspiration from various sources.

## Features

- Store bookmark entries with optional URLs and titles
- Add multiple media items per bookmark (screenshots, videos)
- Add tags to bookmarks for easy categorization
- Add timestamped comments about how you might use the inspiration
- Home page with randomized view of media items for inspiration
- Filtering by tags
- Intelligent search through comments, tags, and titles
- Support for non-web inspirations (iOS apps, Mac apps, real-world items)
- Backup and restore functionality to prevent data loss

## Tech Stack

- [Next.js](https://nextjs.org/) with TypeScript
- [shadcn/ui](https://ui.shadcn.com/) for components
- [fs-extra](https://github.com/jprichardson/node-fs-extra) for file system operations
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/inspo-library.git
cd inspo-library
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Adding Bookmarks

1. Click the "Add Bookmark" button in the navigation bar
2. Fill in the title, optional URL, and tags
3. Submit the form to create a new bookmark

### Adding Media

1. Navigate to a bookmark detail page
2. Use the media uploader to:
   - Drag and drop images or videos
   - Paste from clipboard (Ctrl+V / Cmd+V)
   - Select files from your device
3. Add an optional caption
4. Click "Add Media" to save

### Adding Comments

1. Navigate to a bookmark detail page
2. Go to the "Comments" tab
3. Enter your comment text
4. Click "Add Comment" to save

### Browsing Inspiration

- The home page shows a random selection of media items
- Click "Refresh" to see a new selection
- Click on any media item to go to its bookmark page

### Filtering and Searching

- Use the search bar on the bookmarks page to find specific bookmarks
- Click on tags to filter bookmarks by tag
- Visit the tags page to see all available tags

### Backup and Restore

1. Go to the Settings page
2. Click "Download Backup" to save a backup of all your data
3. Click "Restore from Backup" to restore from a previously created backup

## Architecture

This application uses a client-server architecture:

1. **Client-side**: React components that interact with the server through API calls
2. **Server-side**: Next.js API routes that handle file operations

### Data Storage

Your data is stored locally in the `data/` directory:

- `data/bookmarks/` - Contains JSON files for each bookmark
- `data/media/` - Contains media files and metadata

This directory is excluded from Git via `.gitignore`, ensuring your personal data isn't committed to the repository.

### API Routes

The application uses Next.js API routes to handle server-side operations:

- `/api/bookmarks` - CRUD operations for bookmarks
- `/api/media` - CRUD operations for media items
- `/api/comments` - CRUD operations for comments
- `/api/tags` - Get all tags
- `/api/backup` - Backup and restore functionality

## Privacy

This application stores all data locally on your computer. No data is sent to any external server.

## Future Plans

- Supabase integration for cross-device synchronization
- Enhanced media handling capabilities
- Advanced filtering and organization options

## License

This project is licensed under the MIT License - see the LICENSE file for details.
