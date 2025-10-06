# StreamClone

This is a Next.js project that replicates the user interface and core features of Netflix. It's built with modern web technologies to serve as a high-quality portfolio piece.

## ✨ Features

- **Netflix-like UI**: Dark-themed, responsive interface that closely matches the real Netflix web app.
- **Landing Page**: A beautiful, responsive marketing page with a hero section and FAQ.
- **Content Browsing**: A `/browse` page with a dynamic banner and horizontally scrolling carousels for different movie categories.
- **Component-Based**: Built with reusable React components using shadcn/ui and Tailwind CSS.
- **Mock Data**: Utilizes local mock data to simulate content from an API.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 14 (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/streamclone.git
    cd streamclone
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Running the Development Server

To start the development server, run:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) (or your configured port) with your browser to see the result.

The main pages are:
- **`/`**: The landing/marketing page.
- **`/browse`**: The main content browsing interface (simulating the post-login experience).

## 📁 Project Structure

```
.
├── src
│   ├── app
│   │   ├── browse          # Main content browsing page
│   │   │   └── page.tsx
│   │   ├── globals.css     # Global styles and theme
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing page
│   ├── components
│   │   ├── browse          # Components for the browse page
│   │   ├── landing         # Components for the landing page
│   │   ├── shared          # Components used across multiple pages
│   │   ├── ui              # shadcn/ui components
│   │   └── Logo.tsx
│   ├── lib
│   │   ├── data.ts         # Mock data for movies, FAQs, etc.
│   │   ├── placeholder-images.json # Image data
│   │   └── utils.ts        # Utility functions
...
```

## 🎨 Theming

The application uses a dark theme exclusively, configured in `src/app/globals.css` with CSS variables. Key colors are:
- **Background**: Near-black (`#0A0A0A`)
- **Primary**: Netflix Red (`#E50914`)

Fonts and other theme properties are configured in `tailwind.config.ts`.
