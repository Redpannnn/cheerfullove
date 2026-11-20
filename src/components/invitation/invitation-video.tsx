"use client";

import { useEffect, useRef } from "react";

type InvitationVideoProps = {
  src: string;
  ariaLabel: string;
  loop?: boolean;
};

/**
 * Auto-playing muted video that only plays while visible in the viewport.
 * When `loop` is false the video freezes on its final frame after playing.
 */
export function InvitationVideo({ src, ariaLabel, loop = true }: InvitationVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      aria-label={ariaLabel}
      muted
      playsInline
      autoPlay
      loop={loop}
      preload="auto"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
