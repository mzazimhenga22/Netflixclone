# **App Name**: StreamClone

## Core Features:

- User Authentication: Enable users to securely sign up, log in, and manage their accounts using email/password and Google OAuth (via Supabase/Firebase). Auto-auth persistence using JWT cookies.
- Profile Management: Allow users to create and manage up to 5 profiles per account with customizable avatars. Implement a profile selection screen.
- Home Screen with Dynamic Carousels: Display a personalized home screen with a sticky top navbar, dynamic background banner (random trending show), and horizontally scrollable carousels populated with movie and TV show data from the TMDB API.
- Movie Details Modal: Implement a modal that displays detailed information about a selected movie or TV show, including title, overview, genres, release year, runtime, and rating. Include "Play", "Add to My List", and "Like/Dislike" buttons, and an autoplay background trailer.
- Video Playback: Create a fullscreen player UI with play/pause, skip, progress bar, subtitles toggle, volume, and fullscreen controls. Save watching progress to the database and enable next episode auto-play for series.
- Global Search: Implement a global search bar in the header with instant results dropdown and a dedicated search results page.
- Personalized 'My List': Allow users to save movies/shows to a personal 'My List' and add/remove items with a toggle button. Persist this list using the Firestore or Supabase database.

## Style Guidelines:

- Primary color: Netflix red (#E50914) to maintain brand recognition and evoke excitement.
- Background color: Near-black (#0A0A0A) to create a cinematic and immersive viewing experience.
- Accent color: Light gray (#E0E0E0) to provide subtle contrast for text and UI elements.
- Body and headline font: 'Inter', sans-serif, for a clean, modern, and readable interface.
- Use simple, minimalist icons from 'shadcn/ui' to provide intuitive visual cues.
- Replicate the Netflix layout with a sticky top navbar, dynamic background banner, and horizontally scrollable carousels. Ensure responsive design for desktop, tablet, and mobile devices.
- Employ subtle animations using Framer Motion for hover effects, transitions, and loading states to enhance the user experience.