"use client";

import { useEffect, useState } from "react";

const TARGET = new Date("2027-07-10T09:00:00+07:00").getTime();

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    const raf = requestAnimationFrame(update);
    const timer = setInterval(update, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
    };
  }, []);

  const diff = now === null ? null : Math.max(0, TARGET - now);
  const days = diff === null ? "--" : Math.floor(diff / 86_400_000).toString();
  const hours = diff === null ? "--" : pad(Math.floor((diff % 86_400_000) / 3_600_000));
  const minutes = diff === null ? "--" : pad(Math.floor((diff % 3_600_000) / 60_000));
  const seconds = diff === null ? "--" : pad(Math.floor((diff % 60_000) / 1000));

  const items = [
    { value: days, label: "Hari" },
    { value: hours, label: "Jam" },
    { value: minutes, label: "Menit" },
    { value: seconds, label: "Detik" },
  ];

  return (
    <div
      aria-label="Countdown menuju hari pernikahan"
      className="absolute left-[8%] top-[79.7%] flex h-[7.3%] w-[84%] items-center justify-center"
    >
      <div className="flex w-full items-end justify-center gap-[2cqw]">
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-col items-center leading-none">
            <span className="font-hand text-[4.6cqw] font-bold tabular-nums text-[#e0587a]">
              {item.value}
            </span>
            <span className="font-hand mt-[0.8cqw] text-[2.5cqw] text-[#99a581]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
