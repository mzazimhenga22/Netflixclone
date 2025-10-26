"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Check, ChevronDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import MovieModal from "./MovieModal";
import { TMDB_IMAGE_BASE_URL } from "@/lib/tmdb";
import type { Movie } from "@/types";
import { cn } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import { useMyList } from "@/hooks/useMyList";
import { genres } from "@/lib/genres";

interface Top10CardProps {
  movie: Movie;
  rank: number;
}

const Top10Card = ({ movie, rank }: Top10CardProps) => {
  // NOTE: cardRef now points to the actual poster/card (not the wrapper)
  const cardRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number; height: number; } | null>(null);
  const showTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { myList, toggleMyList } = useMyList();
  const isInList = myList.includes(movie.id);

  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL.replace("original", "w500")}${movie.poster_path}`
    : `https://picsum.photos/seed/${movie.id}/400/600`;

  const findScrollableAncestor = (el: HTMLElement | null): HTMLElement | null => {
    let node = el?.parentElement ?? null;
    while (node && node !== document.body) {
      if (node.scrollWidth > node.clientWidth + 1) return node;
      node = node.parentElement;
    }
    return null;
  };

  // Use the poster/card bounding rect for accurate placement
  const calculatePosition = () => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const { top, left, width, height } = rect;
    const scale = 2.1; // poster-friendly scale
    const heightScale = 1.5;
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Add horizontal scroll of scrollable container + window scroll
    const scrollable = findScrollableAncestor(cardRef.current);
    const scrollLeft = (scrollable?.scrollLeft ?? 0) + window.scrollX;
    const scrollTop = window.scrollY;

    const newLeft = centerX - scaledWidth / 2 + scrollLeft;
    // bring hover down a little (user wanted around +35 previously) -> use +35
    const newTop = centerY - scaledHeight / 2.5 + scrollTop + 65;

    setPosition({
      top: newTop,
      left: newLeft,
      width: scaledWidth,
      height: scaledHeight,
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

  const handleCardEnter = (e?: React.MouseEvent) => {
    // ensure pointer comes from the poster area only (pointer-events disabled on rank)
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
    transition: { type: "spring", stiffness: 180, damping: 28, duration: 0.38 },
  };

  const openModal = () => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    setShowPreview(false);
    setIsModalOpen(true);
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleToggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMyList(movie);
  };

  const getGenreNames = (ids?: number[]) => {
    if (!ids) return [];
    return ids.map((id) => genres[id]).filter(Boolean);
  };

  return (
    <>
      {/* wrapperRef contains both rank (absolutely positioned) and poster (cardRef) */}
      <div
        ref={wrapperRef}
        className="relative inline-block mr-2"
        // do NOT attach hover handlers here — attach to cardRef (poster) to avoid whole-row hover feel
      >
        {/* Rank: absolutely positioned so it doesn't affect layout; pointer-events none */}
      <div
  aria-hidden
  className="absolute -left-6 top-1/2 -translate-y-[35%] text-[200px] font-black text-transparent z-0"
  style={{
    WebkitTextStroke: "2px rgba(120, 120, 120, 0.9)",
    lineHeight: "0.8",
    pointerEvents: "none",
    userSelect: "none",
  }}
>
  {rank}
</div>



        {/* Poster/card — THIS is the element we measure and attach hover handlers to */}
        <div
          ref={cardRef}
           className="relative z-10 ml-10 w-[150px] h-[225px] rounded-md overflow-hidden shadow-lg bg-zinc-900 transition-transform duration-300 ease-in-out cursor-pointer"
          onMouseEnter={handleCardEnter}
          onMouseLeave={handleCardLeave}
          onClick={handleOpenModal}
        >
          <StatusBadge movie={movie} />
          <Image
            src={posterUrl}
            alt={movie.title || movie.name || "Movie poster"}
            width={150}
            height={225}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {isModalOpen && (
          <DialogContent
            className={cn(
              "p-0 w-[90vw] max-w-[90vw] bg-card border-0 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto hide-scrollbar"
            )}
          >
            <DialogTitle className="sr-only">{movie.title || movie.name}</DialogTitle>
            <MovieModal movie={movie} onClose={closeModal} />
          </DialogContent>
        )}
      </Dialog>

      {/* Hover preview portal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showPreview && position && (
              <motion.div
                {...motionSettings}
                onMouseEnter={handleOverlayEnter}
                onMouseLeave={handleOverlayLeave}
                transition={{
                  duration: 0.55,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                style={{
                  position: "absolute",
                  top: position.top,
                  left: position.left,
                  width: position.width,
                  height: "auto",
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
                    src={posterUrl}
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
                      <span>{movie.release_date?.substring(0, 4)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-white/70">
                      {getGenreNames(movie.genre_ids).slice(0, 3).map((genreName, index, arr) => (
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
