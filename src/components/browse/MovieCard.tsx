
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, ChevronDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieModal from "./MovieModal";
import type { Movie } from "@/types";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(false);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const computePosition = () => {
    if (!cardRef.current) return null;
    const rect = cardRef.current.getBoundingClientRect();
    const overlayWidth = Math.max(rect.width * 1.5, 340);
    const overlayHeight = overlayWidth * 0.5625 + 160;

    let top = rect.top + rect.height / 2 - overlayHeight / 2;
    if (top < 20) top = 20;
    else if (top + overlayHeight > window.innerHeight - 20) top = window.innerHeight - overlayHeight - 20;

    let left = rect.left + rect.width / 2 - overlayWidth / 2;
    if (left < 20) left = 20;
    else if (left + overlayWidth > window.innerWidth - 20) left = window.innerWidth - overlayWidth - 20;

    return { top: Math.round(top), left: Math.round(left), width: Math.round(overlayWidth), height: Math.round(overlayHeight) };
  };

  const showWithDelay = (delay = 200) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      const p = computePosition();
      if (!p) return;
      setPosition(p);
      setShowPreview(true);
    }, delay);
  };

  const cancelShow = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setShowPreview(false);
  };

  // Use pointer events which are more reliable across devices
  const handlePointerEnter = () => showWithDelay(200);
  const handlePointerLeave = () => cancelShow();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancelShow();
        closeModal();
      }
    };
    window.addEventListener("keydown", onKey);

    // If preview is visible, keep position up to date on scroll/resize
    const onScrollOrResize = () => {
      if (showPreview) {
        const p = computePosition();
        if (p) setPosition(p);
      }
    };
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [showPreview]);

  const motionSettings = {
    initial: { opacity: 0, scale: 1, y: 0 },
    animate: { opacity: 1, scale: 1.15, y: -10 },
    exit: { opacity: 0, scale: 1, y: 0 },
    transition: { type: "spring", stiffness: 150, damping: 25, duration: 0.4 },
  };

  return (
    <>
      <div
        ref={cardRef}
        className="group/item relative aspect-video bg-zinc-900 rounded-md transition-transform duration-300 ease-in-out cursor-pointer"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        data-movie-card={movie.id}
      >
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          width={400}
          height={225}
          className="object-cover rounded-md w-full h-full"
          data-ai-hint={movie.imageHint}
        />

        <AnimatePresence>
          {showPreview && position && typeof document !== "undefined" && createPortal(
            <motion.div
              layoutId={`movie-card-${movie.id}`}
              initial={motionSettings.initial}
              animate={motionSettings.animate}
              exit={motionSettings.exit}
              transition={motionSettings.transition}
              onPointerEnter={handlePointerEnter} // keep open when pointer moves to the overlay
              onPointerLeave={handlePointerLeave}
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                width: position.width,
                zIndex: 9999,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.75)",
                borderRadius: "0.5rem",
              }}
              className="bg-zinc-900 overflow-hidden"
            >
              <div className="relative w-full cursor-pointer aspect-video" onClick={openModal}>
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
                  <Image src={movie.posterUrl} alt={`${movie.title} preview`} fill className="object-cover w-full h-full" />
                )}
              </div>

              <div className="p-4 bg-zinc-900 text-white">
                <div className="flex items-center gap-2">
                  <Button size="icon" className="h-9 w-9 rounded-full bg-white text-black flex items-center justify-center">
                    <Play className="h-5 w-5 fill-black" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/40 text-white bg-zinc-800/80">
                    <Plus className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/40 text-white bg-zinc-800/80">
                    <ThumbsUp className="h-5 w-5" />
                  </Button>
                  <div className="ml-auto">
                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/40 text-white bg-zinc-800/80" onClick={openModal}>
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm mt-3">
                  <span className="text-green-400 font-semibold">98% Match</span>
                  <span className="border px-1.5 text-xs rounded">16+</span>
                  <span>2h 15m</span>
                </div>

                <div className="flex flex-wrap gap-x-2 text-xs mt-2 text-white/80">
                  <span>Action</span>
                  <span className="text-white/40">•</span>
                  <span>Sci-Fi</span>
                  <span className="text-white/40">•</span>
                  <span>Thriller</span>
                </div>
              </div>
            </motion.div>,
            document.body
          )}
        </AnimatePresence>
      </div>

      {typeof document !== "undefined" && showModal && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center" onClick={closeModal}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-4xl bg-card rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <MovieModal movie={movie} onClose={closeModal} />
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
}
