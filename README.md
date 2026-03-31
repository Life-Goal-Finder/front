# Life Goal Finder - Frontend

This is the client-side Web Application for **Life Goal Finder** (formerly Side-Quest Roulette). 

It provides an interactive, gamified "Roulette" interface that challenges users with random daily quests or side-quests depending on chosen categories (Sport, Culture, Social, Creativity, Nature, etc), limits, and conditions. 

## 🚀 Tech Stack

- **Vite & React 19**: Blazing fast UI environment
- **TypeScript**: For robust and type-safe components
- **Tailwind CSS v4 & Radix UI**: Responsive, modern and accessible design system components
- **Framer Motion**: Smooth spring physics for immersive interface animations
- **React Router Dom**: Client-side routing

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm (or npm / yarn)
- Ensure the backend API is running locally (usually on port 3000)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Configuration
Create a `.env` file in the root relative to the backend endpoint:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### Running the App
```bash
# Starts the development server on port 5173
pnpm run dev
```

The application will be accessible at: `http://localhost:5173`.
