
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from 'next/image';
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Check, ChevronDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import MovieModal from "./MovieModal";
import { TMDB_IMAGE_BASE_URL } from '@/lib/tmdb';
import type { Movie } from '@/types';
import { cn } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import { useMyList } from "@/hooks/useMyList";
import { genres } from "@/lib/genres";

interface Top10CardProps {
  movie: Movie;
  rank: number;
}

const Top10Card = ({ movie, rank }: Top10CardProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number; height: number; } | null>(null);
  const showTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { myList, toggleMyList } = useMyList();
  const isInList = myList.includes(movie.id);


  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL.replace('original', 'w500')}${movie.poster_path}`
    : `https://picsum.photos/seed/${movie.id}/400/600`;

  const backdropUrl = movie.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}`
    : `https://picsum.photos/seed/${movie.id}/300/168`;

  const findScrollableAncestor = (el: HTMLElement | null): HTMLElement | null => {
    let node = el?.parentElement ?? null;
    while (node && node !== document.body) {
      if (node.scrollWidth > node.clientWidth + 1) return node;
      node = node.parentElement;
    }
    return null;
  };

  const calculatePosition = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
  
    const scale = 1.5;
    const scaledWidth = rect.width * scale;
    const scaledHeight = scaledWidth / (16 / 9);

    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    let left = cardCenterX - scaledWidth / 2;
    let top = cardCenterY - scaledHeight / 2 - 40; // Adjusted to lift it up slightly

    const scrollable = findScrollableAncestor(cardRef.current);
    const viewportRect = scrollable ? scrollable.getBoundingClientRect() : { left: 0, width: window.innerWidth, top: 0, height: window.innerHeight };

    const margin = 20;
    const viewportLeft = (viewportRect.left ?? 0) + margin;
    const viewportRight = (viewportRect.left ?? 0) + (viewportRect.width ?? window.innerWidth) - margin;

    if (left < viewportLeft) left = viewportLeft;
    if (left + scaledWidth > viewportRight) left = Math.max(viewportRight - scaledWidth, viewportLeft);
    
    setPosition({ 
      top: top + window.scrollY, 
      left: left + window.scrollX, 
      width: scaledWidth, 
      height: 0, // Not needed as height is auto
    });
  };

  const scheduleShow = () => {
    if (isModalOpen) return;
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (showTimeoutRef.current) return;
    showTimeoutRef.current = window.setTimeout(() => {
      calculatePosition();
      setShowPreview(true);
      showTimeoutRef.current = null;
    }, 500);
  };

  const scheduleHide = (delay = 150) => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) return;
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowPreview(false);
      hideTimeoutRef.current = null;
    }, delay);
  };

  const handleCardEnter = () => {
      if (isModalOpen) return;
      scheduleShow();
  };
  const handleCardLeave = () => scheduleHide();

  const handleOverlayEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };
  const handleOverlayLeave = () => scheduleHide(150);

  useEffect(() => {
    const handleScroll = () => showPreview && setShowPreview(false);
    const handleResize = () => {
        if (showPreview) {
            calculatePosition();
        }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [showPreview]);

  const motionSettings = {
    initial: { opacity: 0, scale: 0.96, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 8 },
    transition: { type: "spring", stiffness: 220, damping: 26, duration: 0.28 },
  };

  const openModal = () => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    setShowPreview(false);
    setIsModalOpen(true);
  }

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  }

  const handleToggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMyList(movie);
  };

  const getGenreNames = (ids?: number[]) => {
    if (!ids) return [];
    return ids.map(id => genres[id]).filter(Boolean);
  }

  return (
    <>
      <div 
        ref={cardRef} 
        className="flex items-end cursor-pointer h-full group"
        onMouseEnter={handleCardEnter}
        onMouseLeave={handleCardLeave}
        onClick={handleOpenModal}
      >
        <div 
          className="text-[200px] font-black text-transparent transition-transform duration-300 ease-in-out group-hover:scale-105" 
          style={{
              WebkitTextStroke: '2px rgba(120, 120, 120, 0.8)',
              lineHeight: '0.8',
          }}
        >
          {rank}
        </div>
        <div className="relative -ml-8 w-[150px] h-[225px] rounded-md overflow-hidden transition-transform duration-300 ease-in-out group-hover:scale-110 shadow-lg">
          <StatusBadge movie={movie} />
          <Image
            src={posterUrl}
            alt={movie.title || movie.name || 'Movie poster'}
            width={150}
            height={225}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {isModalOpen && (
            <DialogContent className={cn("p-0 w-[90vw] max-w-[90vw] bg-card border-0 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto hide-scrollbar")}>
                <DialogTitle className="sr-only">{movie.title || movie.name}</DialogTitle>
                <MovieModal movie={movie} onClose={closeModal} />
            </DialogContent>
        )}
      </Dialog>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showPreview && position && (
              <motion.div
                {...motionSettings}
                onMouseEnter={handleOverlayEnter}
                onMouseLeave={handleOverlayLeave}
                style={{
                  position: "absolute",
                  top: position.top,
                  left: position.left,
                  width: position.width,
                  height: 'auto',
                  zIndex: 9999,
                  willChange: "transform, opacity",
                  transformOrigin: "center center",
                }}
                className="bg-zinc-900/95 backdrop-blur-sm rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden ring-1 ring-white/10 flex flex-col"
                role="dialog"
                aria-label={`${movie.title || movie.name} preview`}
              >
                <div className="relative w-full aspect-video cursor-pointer" onClick={handleOpenModal}>
                    <StatusBadge movie={movie} />
                    <Image
                      src={backdropUrl}
                      alt={`${movie.title || movie.name} preview`}
                      fill
                      className="object-cover w-full h-full transition-all duration-300 ease-in-out"
                    />
                </div>

                <div className="p-3 bg-zinc-900 text-white flex-grow flex flex-col justify-between">
                   <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <Button size="icon" className="h-9 w-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform">
                        <Play className="h-5 w-5 fill-black" />
                      </Button>

                      <Button onClick={handleToggleList} size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/40 text-white bg-black/40 hover:border-white hover:scale-105 transition-transform">
                        {isInList ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                      </Button>

                      <Button size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/40 text-white bg-black/40 hover:border-white hover:scale-105 transition-transform">
                        <ThumbsUp className="h-5 w-5" />
                      </Button>

                      <div className="ml-auto">
                        <Button onClick={handleOpenModal} size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/40 text-white bg-black/40 hover:border-white hover:scale-105 transition-transform">
                          <ChevronDown className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-3 text-sm text-white/80">
                      <span className="text-green-400 font-semibold">{movie.vote_average.toFixed(1)}/10 Rating</span>
                      <span className="border px-1 text-[11px] rounded-sm">16+</span>
                      <span>{movie.release_date?.substring(0,4)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-white/70">
                       {getGenreNames(movie.genre_ids).slice(0,3).map((genreName, index, arr) => (
                          <React.Fragment key={genreName}>
                            <span>{genreName}</span>
                            {index < arr.length - 1 && <span className="text-white/40 text-[8px]">&#9679;</span>}
                          </React.Fragment>
                       ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default Top10Card;
