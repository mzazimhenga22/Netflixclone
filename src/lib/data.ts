import { PlaceHolderImages } from "@/lib/placeholder-images";

const landscapeImages = PlaceHolderImages.filter(img => !img.id.startsWith('movie-poster'));
const posterImages = PlaceHolderImages.filter(img => img.id.startsWith('movie-poster'));

const allMovieImages = [...landscapeImages, ...posterImages];

export const movieCategories = [
  {
    title: "Trending Now",
    movies: allMovieImages.slice(0, 10).map((img, index) => ({
      id: index + 1,
      title: `Trending Movie ${index + 1}`,
      posterUrl: img.imageUrl,
      imageHint: img.imageHint,
    })),
  },
  {
    title: "Popular on StreamClone",
    movies: [...allMovieImages].reverse().slice(0, 10).map((img, index) => ({
      id: index + 11,
      title: `Popular Movie ${index + 1}`,
      posterUrl: img.imageUrl,
      imageHint: img.imageHint,
    })),
  },
  {
    title: "Sci-Fi & Fantasy",
    movies: allMovieImages.slice(2, 12).map((img, index) => ({
      id: index + 21,
      title: `Sci-Fi Movie ${index + 1}`,
      posterUrl: img.imageUrl,
      imageHint: img.imageHint,
    })),
  },
    {
    title: "Action & Adventure",
    movies: allMovieImages.slice(4, 10).concat(allMovieImages.slice(0,4)).map((img, index) => ({
      id: index + 31,
      title: `Action Movie ${index + 1}`,
      posterUrl: img.imageUrl,
      imageHint: img.imageHint,
    })),
  },
];

export const faqData = [
    {
      question: 'What is StreamClone?',
      answer: "StreamClone is a Netflix clone built for demonstration purposes. It showcases a modern web application with a feature set similar to Netflix, including browsing content, user profiles, and a personal watchlist. It is not a real streaming service.",
    },
    {
      question: 'How much does StreamClone cost?',
      answer: 'StreamClone is completely free to use as it is a portfolio project and does not offer real content. There are no subscription fees or charges.',
    },
    {
      question: 'Where can I watch?',
      answer: 'You can "watch" on this web application across various devices like desktops, tablets, and mobile phones. The video player is a demonstration and does not stream actual movies or TV shows.',
    },
    {
      question: 'How do I cancel?',
      answer: 'There is no need to cancel as there is no subscription. You can simply stop using the application at any time.',
    },
    {
      question: 'What can I watch on StreamClone?',
      answer: 'StreamClone uses placeholder data and images from public APIs to simulate a content library. You cannot watch actual movies or TV shows.',
    },
    {
      question: 'Is StreamClone good for kids?',
      answer: "The content displayed is random and not curated. As such, it's not specifically designed for kids. A 'Kids Profile' feature could be a future addition to filter content appropriately.",
    },
];

export const footerLinks = [
  'FAQ',
  'Help Center',
  'Account',
  'Media Center',
  'Investor Relations',
  'Jobs',
  'Ways to Watch',
  'Terms of Use',
  'Privacy',
  'Cookie Preferences',
  'Corporate Information',
  'Contact Us',
  'Speed Test',
  'Legal Notices',
  'Only on StreamClone',
];
