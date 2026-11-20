"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Countdown } from "@/components/invitation/countdown";
import { RsvpSlide } from "@/components/invitation/rsvp-slide";
import { InvitationVideo } from "@/components/invitation/invitation-video";

const TRACKS = [
  { src: "/invitation/track1.mp3", title: "Hari Bahagia", artist: "Memora" },
  { src: "/invitation/track2.mp3", title: "Kisah Kita", artist: "Memora" },
  { src: "/invitation/track3.mp3", title: "Selamanya", artist: "Memora" },
];

export function WeddingInvitation() {
  const [opened, setOpened] = useState(false);
  const [fading, setFading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const trackIndexRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Lock page scroll while the cover is shown
  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  const handleOpen = useCallback(() => {
    setFading(true);
    // Slide 1 disappears completely once the fade finishes
    window.setTimeout(() => setOpened(true), 700);
  }, []);

  const playTrack = useCallback((index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = TRACKS[index].src;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, []);

  const selectTrack = useCallback(
    (index: number) => {
      const next = (index + TRACKS.length) % TRACKS.length;
      trackIndexRef.current = next;
      setTrackIndex(next);
      // Only auto-play if music was already playing
      if (playing) {
        playTrack(next);
      }
    },
    [playing, playTrack]
  );

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      playTrack(trackIndexRef.current);
    }
  }, [playing, playTrack]);

  const handleAudioEnded = useCallback(() => {
    // Auto-advance to the next track, keep playing
    const next = (trackIndexRef.current + 1) % TRACKS.length;
    trackIndexRef.current = next;
    setTrackIndex(next);
    playTrack(next);
  }, [playTrack]);

  const currentTrack = TRACKS[trackIndex];

  return (
    <div className="min-h-screen bg-white">
      {/* ===== Slide 1: cover (disappears after Open) ===== */}
      {!opened && (
        <div
          className={`fixed inset-0 z-50 flex justify-center overflow-hidden bg-white transition-opacity duration-700 ${
            fading ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          role="dialog"
          aria-label="Undangan pernikahan Tama & Septi"
        >
          <div className="relative h-full aspect-[9/16] max-w-full @container">
            <InvitationVideo
              src="/invitation/slide1.mp4"
              ariaLabel="Undangan pernikahan Tama & Septi - Getting Merried 10.07.2027"
              loop={false}
            />
            <div className="absolute left-1/2 top-[80.5%] h-[5%] w-[24%] -translate-x-1/2">
              <button
                onClick={handleOpen}
                className="animate-open-btn font-hand h-full w-full rounded-full bg-[#e0587a] text-[3.4cqw] text-white shadow-lg transition-all hover:scale-105 hover:bg-[#c74b69] active:scale-95"
              >
                Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Slides 2-7 ===== */}
      <main className="mx-auto w-full max-w-[520px] bg-white shadow-2xl">
        {/* Slide 2: quote + music player */}
        <section aria-label="Ayat suci Q.S Arrum 21" className="relative aspect-[9/16] w-full @container">
          <InvitationVideo
            src="/invitation/slide2.mp4"
            ariaLabel="Q.S Arrum:21 - The Wedding of Tama & Septi"
          />
          <div className="absolute left-[27.5%] top-[9.4%] flex h-[11.6%] w-[45%] flex-col items-center justify-center">
            <div className="flex items-center gap-[2.4cqw]">
              <button
                onClick={() => selectTrack(trackIndexRef.current - 1)}
                aria-label="Lagu sebelumnya"
                className="flex h-[7cqw] w-[7cqw] items-center justify-center rounded-full border-2 border-[#e0587a] bg-white text-[#e0587a] shadow-sm transition-all hover:scale-105 hover:bg-[#fdf0f4] active:scale-95"
              >
                <SkipBack className="h-[55%] w-[55%]" aria-hidden />
              </button>
              <button
                onClick={toggleMusic}
                aria-label={playing ? "Jeda musik" : "Putar musik"}
                className="relative flex h-[9.6cqw] w-[9.6cqw] items-center justify-center rounded-full bg-[#e0587a] text-white shadow-md transition-all hover:scale-105 hover:bg-[#c74b69] active:scale-95"
              >
                {playing && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#e0587a] opacity-30" />
                )}
                {playing ? (
                  <Pause className="relative h-[42%] w-[42%]" aria-hidden />
                ) : (
                  <Play className="relative ml-[4%] h-[42%] w-[42%]" aria-hidden />
                )}
              </button>
              <button
                onClick={() => selectTrack(trackIndexRef.current + 1)}
                aria-label="Lagu berikutnya"
                className="flex h-[7cqw] w-[7cqw] items-center justify-center rounded-full border-2 border-[#e0587a] bg-white text-[#e0587a] shadow-sm transition-all hover:scale-105 hover:bg-[#fdf0f4] active:scale-95"
              >
                <SkipForward className="h-[55%] w-[55%]" aria-hidden />
              </button>
            </div>
            <div key={trackIndex} className="animate-track-swap mt-[0.9cqw] text-center">
              <p className="font-hand text-[3.4cqw] font-bold leading-tight text-[#e0587a]">
                {currentTrack.title}
              </p>
              <p className="font-hand text-[2.7cqw] leading-tight text-[#99a581]">
                {currentTrack.artist}
              </p>
            </div>
          </div>
        </section>

        {/* Slide 3: bride & groom */}
        <section aria-label="Mempelai bride and groom" className="relative aspect-[9/16] w-full">
          <InvitationVideo
            src="/invitation/slide3.mp4"
            ariaLabel="Bride & Groom - Maestro Ade Pratama dan Farida Septiani"
          />
        </section>

        {/* Slide 4: save the date + countdown */}
        <section aria-label="Save the date dan countdown" className="relative aspect-[9/16] w-full @container">
          <InvitationVideo
            src="/invitation/slide4.mp4"
            ariaLabel="Save The Date - Akad Nikah dan Resepsi di Ayana Jakarta"
          />
          <Countdown />
        </section>

        {/* Slide 5: love story & wedding gift */}
        <section aria-label="Love story dan wedding gift" className="relative aspect-[9/16] w-full">
          <InvitationVideo
            src="/invitation/slide5.mp4"
            ariaLabel="Love Story dan Wedding Gift - BCA a.n Maestro Ade Pratama & Farida Septiani"
          />
        </section>

        {/* Slide 6: RSVP */}
        <RsvpSlide />

        {/* Slide 7: closing */}
        <section aria-label="Penutup undangan" className="relative aspect-[9/16] w-full">
          <InvitationVideo
            src="/invitation/slide7.mp4"
            ariaLabel="See You At Our Wedding Day - With love, Tama & Septi"
          />
        </section>
      </main>

      <audio
        ref={audioRef}
        src={TRACKS[0].src}
        preload="metadata"
        onEnded={handleAudioEnded}
        className="hidden"
      />
    </div>
  );
}
