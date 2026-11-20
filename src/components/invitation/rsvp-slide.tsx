"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2, MessageCircleHeart, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

type Wish = {
  id: string;
  name: string;
  attendance: "HADIR" | "TIDAK_HADIR";
  guests: number;
  message: string;
  createdAt: string;
};

export function RsvpSlide() {
  const { toast } = useToast();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<"HADIR" | "TIDAK_HADIR">("HADIR");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");

  const loadWishes = useCallback(async () => {
    try {
      const res = await fetch("/api/rsvp", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setWishes(data.wishes ?? []);
      setTotal(data.stats?.total ?? 0);
    } catch {
      // silently keep previous list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishes();
  }, [loadWishes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama belum diisi ya");
      return;
    }
    if (!message.trim()) {
      setError("Ucapan belum diisi ya");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          attendance,
          guests: Math.min(10, Math.max(1, guests || 1)),
          message: message.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim ucapan");
        return;
      }

      setMessage("");
      toast({
        title: "Terkirim!",
        description: "Terima kasih atas ucapan & doa restunya.",
      });
      await loadWishes();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi ya.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="rsvp"
      aria-label="RSVP dan ucapan"
      className="relative aspect-[9/16] w-full overflow-hidden bg-white @container"
    >
      <div className="relative flex h-full flex-col px-[6cqw] pb-[5cqw] pt-[8.5cqw]">
        {/* header */}
        <div className="text-center">
          <p className="font-script text-[9cqw] leading-tight text-[#e0587a]">RSVP &amp; Ucapan</p>
          <p className="font-hand mt-[1cqw] text-[3.3cqw] text-[#99a581]">
            Konfirmasi kehadiran &amp; kirim doa restu untuk kami
          </p>
        </div>

        {/* form */}
        <form
          onSubmit={handleSubmit}
          className="mt-[3.5cqw] flex flex-col gap-[2.4cqw] rounded-[3.5cqw] border-2 border-[#f2bccb] bg-white/85 p-[4cqw] shadow-sm"
        >
          <div>
            <label
              htmlFor="rsvp-name"
              className="font-hand mb-[0.8cqw] block text-[3.2cqw] font-bold text-[#e0587a]"
            >
              Nama
            </label>
            <input
              id="rsvp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="Tulis nama kamu"
              className="font-hand h-[10cqw] w-full rounded-[2cqw] border-2 border-[#f2bccb] bg-white px-[3cqw] text-[3.8cqw] text-neutral-800 outline-none placeholder:text-neutral-300 focus:border-[#e0587a]"
            />
          </div>

          <div>
            <span className="font-hand mb-[0.8cqw] block text-[3.2cqw] font-bold text-[#e0587a]">
              Konfirmasi Kehadiran
            </span>
            <div className="grid grid-cols-2 gap-[2cqw]">
              <button
                type="button"
                onClick={() => setAttendance("HADIR")}
                aria-pressed={attendance === "HADIR"}
                className={`font-hand h-[9.5cqw] rounded-full border-2 text-[3.4cqw] transition-colors ${
                  attendance === "HADIR"
                    ? "border-[#e0587a] bg-[#e0587a] text-white"
                    : "border-[#f2bccb] bg-white text-[#e0587a]"
                }`}
              >
                Hadir
              </button>
              <button
                type="button"
                onClick={() => setAttendance("TIDAK_HADIR")}
                aria-pressed={attendance === "TIDAK_HADIR"}
                className={`font-hand h-[9.5cqw] rounded-full border-2 text-[3.4cqw] transition-colors ${
                  attendance === "TIDAK_HADIR"
                    ? "border-[#e0587a] bg-[#e0587a] text-white"
                    : "border-[#f2bccb] bg-white text-[#e0587a]"
                }`}
              >
                Tidak Hadir
              </button>
            </div>
          </div>

          {attendance === "HADIR" && (
            <div>
              <label
                htmlFor="rsvp-guests"
                className="font-hand mb-[0.8cqw] block text-[3.2cqw] font-bold text-[#e0587a]"
              >
                Jumlah Tamu
              </label>
              <input
                id="rsvp-guests"
                type="number"
                min={1}
                max={10}
                inputMode="numeric"
                value={guests === 0 ? "" : guests}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setGuests(Number.isNaN(v) ? 0 : Math.min(10, v));
                }}
                onBlur={() => {
                  if (guests < 1) setGuests(1);
                }}
                placeholder="Isi jumlah tamu"
                className="font-hand h-[10cqw] w-full rounded-[2cqw] border-2 border-[#f2bccb] bg-white px-[3cqw] text-center text-[3.8cqw] text-neutral-800 outline-none placeholder:text-neutral-300 focus:border-[#e0587a]"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="rsvp-message"
              className="font-hand mb-[0.8cqw] block text-[3.2cqw] font-bold text-[#e0587a]"
            >
              Ucapan &amp; Doa
            </label>
            <textarea
              id="rsvp-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Tulis ucapan & doa terbaikmu..."
              className="font-hand nice-scroll h-[17cqw] w-full resize-none rounded-[2cqw] border-2 border-[#f2bccb] bg-white px-[3cqw] py-[2cqw] text-[3.8cqw] leading-snug text-neutral-800 outline-none placeholder:text-neutral-300 focus:border-[#e0587a]"
            />
          </div>

          {error && (
            <p className="font-hand text-center text-[3cqw] text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="font-hand flex h-[11cqw] items-center justify-center gap-[2cqw] rounded-full bg-[#e0587a] text-[4.2cqw] text-white shadow-md transition-colors hover:bg-[#c74b69] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="h-[4.2cqw] w-[4.2cqw] animate-spin" aria-hidden />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="h-[4cqw] w-[4cqw]" aria-hidden />
                Kirim Ucapan
              </>
            )}
          </button>
        </form>

        {/* wishes */}
        <div className="mt-[3.5cqw] flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-[1cqw]">
            <p className="font-hand flex items-center gap-[1.5cqw] text-[4cqw] font-bold text-[#e0587a]">
              <MessageCircleHeart className="h-[4.5cqw] w-[4.5cqw]" aria-hidden />
              Ucapan &amp; Doa
            </p>
            <span className="font-hand rounded-full bg-[#fbe3ea] px-[2.4cqw] py-[0.6cqw] text-[2.8cqw] text-[#e0587a]">
              {total} ucapan
            </span>
          </div>

          <div className="nice-scroll mt-[2cqw] flex min-h-0 flex-1 flex-col gap-[2.2cqw] overflow-y-auto pr-[1cqw]">
            {loading ? (
              <>
                <div className="h-[16cqw] animate-pulse rounded-[2.5cqw] bg-[#fae3ea]" />
                <div className="h-[16cqw] animate-pulse rounded-[2.5cqw] bg-[#fae3ea]" />
                <div className="h-[16cqw] animate-pulse rounded-[2.5cqw] bg-[#fae3ea]" />
              </>
            ) : wishes.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-[1.5cqw] rounded-[2.5cqw] border-2 border-dashed border-[#f2bccb] py-[5cqw] text-center">
                <Heart className="h-[6cqw] w-[6cqw] text-[#f0a8bc]" aria-hidden />
                <p className="font-hand px-[4cqw] text-[3.2cqw] text-[#bd7d92]">
                  Belum ada ucapan. Jadilah yang pertama mengirim doa!
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {wishes.map((wish) => (
                  <motion.article
                    key={wish.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-[2.5cqw] border border-[#f6d7e0] bg-[#fdf1f5] p-[3cqw]"
                  >
                    <div className="flex items-center gap-[2.2cqw]">
                      <span className="font-hand flex h-[8cqw] w-[8cqw] shrink-0 items-center justify-center rounded-full bg-[#e0587a] text-[3.6cqw] text-white">
                        {wish.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-[1.5cqw]">
                          <p className="font-hand truncate text-[3.6cqw] font-bold text-[#e0587a]">
                            {wish.name}
                          </p>
                          <span
                            className={`font-hand rounded-full px-[1.8cqw] py-[0.3cqw] text-[2.4cqw] ${
                              wish.attendance === "HADIR"
                                ? "bg-[#fbe3ea] text-[#e0587a]"
                                : "bg-neutral-200 text-neutral-600"
                            }`}
                          >
                            {wish.attendance === "HADIR"
                              ? `Hadir${wish.guests > 1 ? ` (${wish.guests} org)` : ""}`
                              : "Tidak Hadir"}
                          </span>
                        </div>
                        <p className="font-hand text-[2.6cqw] text-neutral-400">
                          {formatDistanceToNow(new Date(wish.createdAt), {
                            addSuffix: true,
                            locale: localeId,
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="font-hand mt-[1.8cqw] text-[3.3cqw] leading-snug text-neutral-700">
                      {wish.message}
                    </p>
                  </motion.article>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
