# Real-time Shopping List App

A simple real-time shared shopping list application built with Ionic (Angular) frontend and NestJS backend using WebSockets.

## Features

- ✅ Add shopping items
- ✅ Mark items as completed/pending
- ✅ Delete items
- ✅ Real-time synchronization between multiple users
- ✅ Connection status indicator with visual feedback
- ✅ Modern, responsive UI with Ionic-style components
- ✅ Offline protection and automatic reconnection
- ✅ Persistent JSON file storage (survives server restarts)

## Tech Stack

- **Frontend**: Angular 17 + Custom CSS (Ionic-style UI)
- **Backend**: NestJS + Socket.IO
- **Real-time**: WebSockets
- **Monorepo**: npm workspaces

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

#### Option 1: Run both frontend and backend together
```bash
npm run dev
```

#### Option 2: Run them separately

**Backend (Terminal 1):**
```bash
npm run dev:backend
```
Backend will be available at: http://localhost:3000

**Frontend (Terminal 2):**
```bash
npm run dev:frontend
```
Frontend will be available at: http://localhost:8100

### Testing Real-time Functionality

1. Open the app in your browser: http://localhost:8100
2. Open the same URL in another browser tab/window (or use incognito mode)
3. Add items in one tab and watch them appear in real-time in the other tab
4. Mark items as completed and see the changes sync instantly

## Project Structure

```
shopping-list/
├── apps/
│   ├── backend/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   └── shopping-list.gateway.ts
│   │   ├── shopping-list-data.json # Persistent data storage
│   │   └── package.json
│   └── frontend/                   # Angular frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.component.html
│       │   │   ├── app.component.scss
│       │   │   ├── app.component.ts
│       │   │   ├── app.module.ts
│       │   │   └── services/
│       │   │       └── shopping-list.service.ts
│       │   ├── global.scss
│       │   ├── index.html
│       │   └── main.ts
│       └── package.json
├── .gitignore
├── package.json                    # Root workspace config
└── README.md
```

## WebSocket Events

### Client → Server
- `addItem` - Add a new shopping item
- `toggleItem` - Toggle item completion status
- `deleteItem` - Delete an item
- `getShoppingList` - Request current shopping list

### Server → Client
- `shoppingList` - Complete shopping list update (used for all operations)

## Connection Handling

The app includes robust connection handling for real-world scenarios:

### **Automatic Reconnection**
- Automatically attempts to reconnect if connection is lost
- Retries up to 5 times with 1-second delays
- Requests fresh shopping list data upon reconnection

### **Offline Protection**
- Prevents actions when disconnected (add, toggle, delete)
- Shows clear visual indicators (🟢 Connected / 🔴 Disconnected)
- Disables input form when offline
- Shows helpful error messages for offline actions

### **Conflict Resolution**
- Uses server-side state as the single source of truth
- All clients receive the complete shopping list on reconnection
- No data conflicts - the server state always wins

### **Connection Status**
- Real-time connection status in the header
- Visual feedback for all connection states
- Automatic sync when connection is restored

## Data Storage

The shopping list data is automatically saved to a JSON file (`shopping-list-data.json`) in the backend directory. This means:

- ✅ **Data persists** across server restarts
- ✅ **Automatic saving** after every add, toggle, or delete operation
- ✅ **Automatic loading** when the server starts
- ✅ **No database required** - simple file-based storage

## Getting Started with Data

The app starts with an empty shopping list. Simply:
1. **Add items** using the input field
2. **Mark items as completed** by clicking the checkbox or item
3. **Delete items** using the trash button
4. **Watch real-time sync** between multiple browser tabs

All changes are automatically saved to the JSON file and persist across server restarts.

## Production Deployment

### Backend Production Build

To compile and run the backend for production:

#### 1. Build the Backend
```bash
# Option 1: From root directory
npm run build:backend

# Option 2: From backend directory
cd apps/backend
npm run build
```

This creates a `dist/` folder with the compiled JavaScript files.

#### 2. Run in Production Mode
```bash
# Option 1: From root directory
npm run start:backend

# Option 2: From backend directory
npm run start:prod

# Option 3: Using the compiled files directly
node dist/main.js
```

#### 3. Environment Configuration
For production, you may want to:
- Set the port via environment variable: `PORT=3000`
- Use PM2 for process management: `pm2 start dist/main.js --name shopping-list-api`
- Set up a reverse proxy (nginx) for SSL and load balancing

#### 4. Production Dependencies
Make sure to install only production dependencies:
```bash
npm ci --only=production
```

### Frontend Deployment to GitHub Pages

To deploy the frontend to GitHub Pages:

#### 1. Build the Frontend for Production
```bash
# Option 1: From root directory
npm run build:frontend

# Option 2: From frontend directory
cd apps/frontend
npm run build
```

This creates a `dist/` folder with optimized production files.

#### 2. Configure for GitHub Pages
Update the base href in `angular.json` for GitHub Pages:
```json
"build": {
  "options": {
    "baseHref": "/your-repo-name/"
  }
}
```

#### 3. Deploy to GitHub Pages
```bash
# Install angular-cli-ghpages globally
npm install -g angular-cli-ghpages

# Deploy from the frontend directory
cd apps/frontend
ng build --prod --base-href "/your-repo-name/"
npx angular-cli-ghpages --dir=dist/shopping-list-frontend
```

#### 4. Alternative: Manual Deployment
```bash
# Build the project
cd apps/frontend
npm run build

# Copy dist contents to your GitHub Pages branch
cp -r dist/shopping-list-frontend/* /path/to/gh-pages-branch/

# Commit and push to gh-pages branch
cd /path/to/gh-pages-branch
git add .
git commit -m "Deploy shopping list app"
git push origin gh-pages
```

#### 5. Update Backend URL for Production
If deploying frontend separately, update the WebSocket URL in `shopping-list.service.ts`:
```typescript
this.socket = io('https://your-backend-domain.com', {
  // ... other options
});
```

### Full Stack Deployment Options

#### Option 1: Single Server (VPS/Cloud)
- Deploy backend on port 3000
- Serve frontend from nginx on port 80/443
- Use PM2 for backend process management

#### Option 2: Separate Deployments
- Backend: Deploy to Heroku, Railway, or DigitalOcean
- Frontend: Deploy to GitHub Pages, Netlify, or Vercel

#### Option 3: Docker Deployment
Create a `Dockerfile` for the backend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY apps/backend/package*.json ./
RUN npm ci --only=production
COPY apps/backend/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Quick Production Deployment Summary

For a quick production setup:

1. **Build everything**: `npm run build`
2. **Run backend**: `npm run start:backend`
3. **Deploy frontend**: Follow GitHub Pages steps above

Your app will be production-ready with persistent data storage and real-time synchronization! 🚀

## Notes

- Data is stored in `apps/backend/shopping-list-data.json`
- No authentication is implemented - this is a simple demo app
- The app works best with 2-4 concurrent users for testing
- Connection issues are handled gracefully with automatic recovery
- Data persists across server restarts and survives crashes
