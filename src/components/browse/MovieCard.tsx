
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, ChevronDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import MovieModal from "./MovieModal";
import type { Movie } from "@/types";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number; height: number; } | null>(null);
  const showTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const scaledHeight = scaledWidth / (16/9); // maintain aspect ratio

    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    let left = cardCenterX - scaledWidth / 2;
    let top = cardCenterY - scaledHeight / 2;

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
      height: scaledHeight 
    });
  };

  const scheduleShow = () => {
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

  const handleCardEnter = () => scheduleShow();
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

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setShowPreview(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        ref={cardRef}
        className="group relative aspect-video bg-zinc-900 rounded-md transition-transform duration-300 ease-out will-change-transform cursor-pointer"
        onMouseEnter={handleCardEnter}
        onMouseLeave={handleCardLeave}
        onClick={handleOpenModal}
      >
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          width={300}
          height={168}
          className="object-cover rounded-md w-full h-full"
          data-ai-hint={movie.imageHint}
          priority
        />
      </div>

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
                aria-label={`${movie.title} preview`}
              >
                <div className="relative w-full aspect-video cursor-pointer" onClick={handleOpenModal}>
                  {movie.previewUrl ? (
                    <video
                      src={movie.previewUrl}
                      autoPlay
                      muted
                      playsInline
                      loop
                      poster={movie.posterUrl}
                      className="object-cover w-full h-full transition-all duration-300 ease-in-out"
                    />
                  ) : (
                    <Image
                      src={movie.posterUrl}
                      alt={`${movie.title} preview`}
                      fill
                      className="object-cover w-full h-full transition-all duration-300 ease-in-out"
                    />
                  )}
                </div>

                <div className="p-3 bg-zinc-900 text-white flex-grow flex flex-col justify-between">
                   <div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" className="h-9 w-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform">
                        <Play className="h-5 w-5 fill-black" />
                      </Button>

                      <Button size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/40 text-white bg-black/40 hover:border-white hover:scale-105 transition-transform">
                        <Plus className="h-5 w-5" />
                      </Button>

                      <Button size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/40 text-white bg-black/40 hover:border-white hover:scale-105 transition-transform">
                        <ThumbsUp className="h-5 w-5" />
                      </Button>

                      <div className="ml-auto">
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <Button onClick={handleOpenModal} size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/40 text-white bg-black/40 hover:border-white hover:scale-105 transition-transform">
                              <ChevronDown className="h-5 w-5" />
                            </Button>
                           <DialogContent className="p-0 w-[90vw] max-w-[90vw] h-[90vh] bg-card border-0 rounded-lg overflow-y-auto">
                                <DialogTitle>
                                    <span className="sr-only">{movie.title}</span>
                                </DialogTitle>
                                <MovieModal movie={movie} onClose={() => setIsModalOpen(false)} />
                            </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-3 text-sm text-white/80">
                      <span className="text-green-400 font-semibold">98% Match</span>
                      <span className="border px-1 text-[11px] rounded-sm">16+</span>
                      <span>2h 15m</span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-white/70">
                      <span>Action</span>
                      <span className="text-white/40">•</span>
                      <span>Sci-Fi</span>
                      <span className="text-white/40">•</span>
                      <span>Thriller</span>
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
}
