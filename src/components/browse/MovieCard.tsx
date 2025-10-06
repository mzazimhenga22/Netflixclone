
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, ChevronDown, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MovieModal from "./MovieModal";
import type { Movie } from "@/types";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calculatePosition = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    const overlayWidth = Math.min(window.innerWidth * 0.9, 380);
    const overlayHeight = overlayWidth * 1.3;

    let top = rect.top + window.scrollY + rect.height / 2 - overlayHeight / 2;
    let left = rect.left + window.scrollX + rect.width / 2 - overlayWidth / 2;

    // Adjust if off-screen
    if (top < 20 + window.scrollY) top = 20 + window.scrollY;
    if (left < 20 + window.scrollX) left = 20 + window.scrollX;

    if (left + overlayWidth > window.innerWidth - 20) {
      left = window.innerWidth - overlayWidth - 20;
    }
     if (top + overlayHeight > window.innerHeight + window.scrollY - 20) {
      top = window.innerHeight + window.scrollY - overlayHeight - 20;
    }

    setPosition({ top, left, width: overlayWidth });
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      calculatePosition();
      setShowPreview(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowPreview(false);
  };


  useEffect(() => {
    const handleScroll = () => {
        if(showPreview) {
            setShowPreview(false);
        }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('scroll', handleScroll);
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
    };
  }, [showPreview]);

  const motionSettings = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
    transition: { type: "spring", stiffness: 200, damping: 25, duration: 0.3 },
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        ref={cardRef}
        className="group relative aspect-[2/3] bg-zinc-900 rounded-md transition-transform duration-300 ease-in-out md:hover:scale-105"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          width={300}
          height={450}
          className="object-cover rounded-md w-full h-full"
          data-ai-hint={movie.imageHint}
        />
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showPreview && position && (
              <motion.div
                {...motionSettings}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                  position: "absolute",
                  top: position.top,
                  left: position.left,
                  width: position.width,
                  zIndex: 9999,
                }}
                className="bg-zinc-900 rounded-lg shadow-2xl overflow-hidden"
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
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Image
                      src={movie.posterUrl}
                      alt={`${movie.title} preview`}
                      fill
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>

                <div className="p-3 bg-zinc-900 text-white">
                  <div className="flex items-center gap-2">
                    <Button size="icon" className="h-9 w-9 rounded-full bg-white text-black flex items-center justify-center">
                      <Play className="h-5 w-5 fill-black" />
                    </Button>

                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/40 text-white bg-black/40 hover:border-white">
                      <Plus className="h-5 w-5" />
                    </Button>
                    
                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/40 text-white bg-black/40 hover:border-white">
                      <ThumbsUp className="h-5 w-5" />
                    </Button>

                    <div className="ml-auto">
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={handleOpenModal} size="icon" variant="outline" className="h-9 w-9 rounded-full border-white/40 text-white bg-black/40 hover:border-white">
                                    <ChevronDown className="h-5 w-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="p-0 max-w-4xl bg-card border-0">
                               <DialogTitle>
                                 <span className="sr-only">{movie.title}</span>
                               </DialogTitle>
                               <MovieModal movie={movie} onClose={() => setIsModalOpen(false)} />
                            </DialogContent>
                        </Dialog>
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
    </>
  );
}
