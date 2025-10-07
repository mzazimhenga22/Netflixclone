"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Props:
 * - videoRef: React ref attached to the <video> element
 * - showThumbnails: boolean - if true, expects a sprite-sheet with metadata (see comments)
 * - thumbnailData: { url, spriteWidth, spriteHeight, framesPerRow, frameCount, interval } optional
 */

export default function NetflixProgress({
  videoRef,
  showThumbnails = false,
  thumbnailData = null,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  showThumbnails?: boolean;
  thumbnailData?: any;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [bufferedRanges, setBufferedRanges] = useState<{start: number, end: number}[]>([]); // [{start, end}, ...]
  const [isDragging, setDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoaded = () => setDuration(v.duration || 0);
    const onTime = () => setCurrent(v.currentTime || 0);
    const onProgress = () => {
      if (!v.buffered) return;
      const ranges = [];
      for (let i = 0; i < v.buffered.length; i++) {
        ranges.push({ start: v.buffered.start(i), end: v.buffered.end(i) });
      }
      setBufferedRanges(ranges);
    };

    onLoaded();
    onProgress();

    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("progress", onProgress);
    v.addEventListener("durationchange", onLoaded);

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("durationchange", onLoaded);
    };
  }, [videoRef]);

  // Convert clientX to time based on bar bounding rect
  const clientXToTime = (clientX: number) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const clamped = Math.max(rect.left, Math.min(clientX, rect.right));
    const ratio = (clamped - rect.left) / rect.width;
    return ratio * (duration || 0);
  };

  const handleSeek = (time: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = Math.max(0, Math.min(time, duration));
  };

  // Mouse interactions: click to seek
  const onBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleSeek(clientXToTime(e.clientX));
  };

  // Hover tooltip
  const onBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
    const t = clientXToTime(e.clientX);
    setHoverTime(t);
  };

  const onBarLeave = () => {
    setHoverTime(null);
  };

  // Dragging (scrubbing)
  const onThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
    // capture pointer events
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    const t = clientXToTime(e.clientX);
    setCurrent(t); // live update UI while dragging
    setHoverTime(t);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!isDragging) return;
    setDragging(false);
    const t = clientXToTime(e.clientX);
    handleSeek(t);
    setHoverTime(null);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  // Helper to format time
  const formatTime = (s = 0) => {
    if (!isFinite(s)) return "0:00";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const playedPercent = duration ? (current / duration) * 100 : 0;

  // Thumbnail calculation (sprite sheet)
  const renderThumbnailPreview = () => {
    if (!showThumbnails || !thumbnailData || hoverTime == null) return null;
    const { url, spriteWidth, spriteHeight, framesPerRow, frameCount, interval } = thumbnailData;
    // which frame index
    const idx = Math.min(frameCount - 1, Math.floor(hoverTime / interval));
    const row = Math.floor(idx / framesPerRow);
    const col = idx % framesPerRow;
    const bgX = -col * spriteWidth;
    const bgY = -row * spriteHeight;
    const thumbStyle: React.CSSProperties = {
      width: `${spriteWidth}px`,
      height: `${spriteHeight}px`,
      backgroundImage: `url(${url})`,
      backgroundPosition: `${bgX}px ${bgY}px`,
      backgroundRepeat: "no-repeat",
      imageRendering: "pixelated",
    };
    return (
      <div
        className="absolute -top-20 transform -translate-x-1/2 p-0 rounded-sm overflow-hidden shadow-lg"
        style={{ left: hoverX }}
      >
        <div style={thumbStyle} />
        <div className="text-xs text-white bg-black bg-opacity-70 text-center py-1">
          {formatTime(hoverTime)}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full select-none group">
      {/* Time text (left: current, right: duration) - hidden by default, shown on hover */}
      <div className="flex justify-between text-xs text-gray-300 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div>{formatTime(current)}</div>
        <div>{formatTime(duration)}</div>
      </div>

      {/* Progress bar container */}
      <div
        ref={barRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration || 0}
        aria-valuenow={current}
        tabIndex={0}
        onClick={onBarClick}
        onMouseMove={onBarMouseMove}
        onMouseLeave={onBarLeave}
        className="relative h-1 bg-[#4d4d4d] rounded-sm cursor-pointer group-hover:h-[5px] transition-all duration-200"
      >
        {/* Buffered ranges */}
        {bufferedRanges.map((r, i) => {
          const startPct = (r.start / (duration || 1)) * 100;
          const endPct = (r.end / (duration || 1)) * 100;
          const widthPct = Math.max(0, endPct - startPct);
          return (
            <div
              key={i}
              className="absolute top-0 h-full bg-gray-500 opacity-40 rounded-sm"
              style={{ left: `${startPct}%`, width: `${widthPct}%` }}
            />
          );
        })}

        {/* Played bar */}
        <div
          className="absolute top-0 h-full bg-red-600 rounded-sm"
          style={{ width: `${playedPercent}%` }}
        />

        {/* Seek knob - only visible on hover */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${playedPercent}%`, touchAction: "none" }}
          onPointerDown={onThumbPointerDown}
          role="presentation"
        />

        {/* Hover time tooltip */}
        {hoverTime != null && !isDragging && !showThumbnails && (
          <div
            className="absolute -top-6 text-xs py-0.5 px-1.5 rounded-sm bg-black/80 text-white pointer-events-none transform -translate-x-1/2"
            style={{ left: hoverX }}
          >
            {formatTime(hoverTime)}
          </div>
        )}

        {/* Thumbnail preview */}
        {renderThumbnailPreview()}
      </div>
    </div>
  );
}