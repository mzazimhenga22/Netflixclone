
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, ChevronDown, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieModal from "./MovieModal";

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  previewUrl?: string;
  imageHint?: string;
}

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const hoverTimerRef = useRef<number | null>(null);

  const [position, setPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const computePosition = () => {
    if (!cardRef.current) return null;
    const rect = cardRef.current.getBoundingClientRect();

    const maxWidth = Math.min(640, window.innerWidth - 40);
    const cardWidth = rect.width;
    const overlayWidth = Math.min(maxWidth, Math.max(cardWidth * 1.45, 420));
    
    const heroHeight = Math.round((overlayWidth * 9) / 16);
    const infoHeight = 160;
    const overlayHeight = heroHeight + infoHeight;

    let topPreferAbove = rect.top - overlayHeight + rect.height * 0.15;
    if (topPreferAbove < 12) {
      topPreferAbove = Math.max(12, Math.min(rect.top - Math.round(rect.height * 0.6), window.innerHeight - overlayHeight - 12));
    }

    const leftCenter = rect.left + rect.width / 2 - overlayWidth / 2;
    const left = Math.min(Math.max(12, leftCenter), Math.max(12, window.innerWidth - overlayWidth - 12));

    return { top: Math.round(topPreferAbove), left: Math.round(left), width: Math.round(overlayWidth), height: overlayHeight };
  };

  const startHover = () => {
    setIsHovering(true);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    hoverTimerRef.current = window.setTimeout(() => {
      if(isHovering) {
        const p = computePosition();
        if (!p) return;
        setPosition(p);
        setShowPreview(true);
      }
    }, 500);
  };

  const stopHover = () => {
    setIsHovering(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setShowPreview(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stopHover();
        closeModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const motionSettings = {
    initial: { opacity: 0, scale: 0.985, y: 10 },
    animate: { opacity: 1, scale: 1.0, y: -10 },
    exit: { opacity: 0, scale: 0.995, y: 8 },
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 22,
      mass: 0.9,
      duration: 0.36,
    },
  };

  const overlayRestStyle = {
    transformOrigin: "bottom center",
    boxShadow: "0 30px 80px rgba(0,0,0,0.65)",
    borderRadius: 12,
    overflow: "hidden",
  } as React.CSSProperties;

  return (
    <>
      <div
        ref={cardRef}
        className="group/item relative aspect-video bg-zinc-900 rounded-md transition-transform duration-300 ease-in-out cursor-pointer"
        onMouseEnter={startHover}
        onMouseLeave={stopHover}
        tabIndex={0}
        onFocus={startHover}
        onBlur={stopHover}
        aria-haspopup="true"
        aria-expanded={showPreview}
      >
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          width={400}
          height={225}
          className="object-cover rounded-md w-full h-full"
          data-ai-hint={movie.imageHint}
        />
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showPreview && position && (
              <motion.div
                ref={overlayRef}
                initial={motionSettings.initial}
                animate={motionSettings.animate}
                exit={motionSettings.exit}
                transition={motionSettings.transition}
                onMouseEnter={startHover}
                onMouseLeave={stopHover}
                style={{
                  position: "fixed",
                  top: position.top,
                  left: position.left,
                  width: position.width,
                  zIndex: 99999,
                  ...overlayRestStyle,
                  transform: "none",
                }}
                className="bg-black/90 pointer-events-auto"
                role="dialog"
                aria-label={`${movie.title} preview`}
              >
                <div className="relative w-full cursor-pointer" style={{ aspectRatio: "16/9" }} onClick={openModal}>
                  {movie.previewUrl ? (
                    <video
                      src={movie.previewUrl}
                      autoPlay
                      muted
                      playsInline
                      loop
                      poster={movie.posterUrl}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Image
                      src={movie.posterUrl}
                      alt={`${movie.title} preview`}
                      width={position.width}
                      height={Math.round((position.width * 9) / 16)}
                      className="object-cover w-full h-full"
                    />
                  )}

                  <div className="absolute right-3 top-3 rounded-full bg-black/30 p-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white opacity-95">
                      <path d="M7 9v6h4l5 5V4l-5 5H7z" fill="white" />
                    </svg>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/95 backdrop-blur-sm text-white">
                  <div className="flex items-center gap-3">
                    <Button size="icon" className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-10 w-10 rounded-full border-white/25 text-white bg-black/40">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-10 w-10 rounded-full border-white/25 text-white bg-black/40">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-10 w-10 rounded-full border-white/25 text-white bg-black/40">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    <div className="ml-auto">
                      <Button size="icon" variant="outline" className="h-10 w-10 rounded-full border-white/25 text-white bg-black/40" onClick={openModal}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm mt-3 text-white/80">
                    <span className="text-green-400 font-semibold">98% Match</span>
                    <span className="border px-1 text-[11px] rounded-sm">16+</span>
                    <span>2h 15m</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs mt-2 text-white/70">
                    <span>Action</span>
                    <span className="text-white/40">•</span>
                    <span>Sci-Fi</span>
                    <span className="text-white/40">•</span>
                    <span>Thriller</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {typeof document !== "undefined" && showModal && createPortal(
            <AnimatePresence>
                <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center" onClick={closeModal}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="w-full max-w-4xl bg-card rounded-lg overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the modal content
                    >
                        <MovieModal movie={movie} onClose={closeModal} />
                    </motion.div>
                </div>
            </AnimatePresence>,
            document.body
        )}
    </>
  );
}
