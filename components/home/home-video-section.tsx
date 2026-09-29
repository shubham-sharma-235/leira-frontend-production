"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

type HomeVideoItem = {
  _id: string;
  title: string;
  subtitle?: string;
  videoUrl: string;
  posterUrl?: string;
};

type Props = {
  videos: HomeVideoItem[];
};

import { resolveMediaUrl } from "@/lib/mediaUrl";

const toPlayableUrl = (url: string) => resolveMediaUrl(url);

export default function HomeVideoSection({ videos }: Props) {
  const videoRefs = React.useRef<Record<string, HTMLVideoElement | null>>({});

  React.useEffect(() => {
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        });
      },
      { threshold: 0.55 }
    );

    Object.values(videoRefs.current).forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [videos]);

  if (!videos.length) return null;

  return (
    <section className="relative overflow-hidden bg-[#FAF9F6] px-4 py-14 sm:px-6 sm:py-20 md:py-24">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-pink-200/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-rose-100/35 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-20 mx-auto h-px max-w-6xl bg-linear-to-r from-transparent via-pink-200/70 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 text-center sm:mb-10 md:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pink-600 sm:text-xs sm:tracking-[0.28em]">
            Video Stories
          </p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl md:text-5xl">
            Watch Leira in Motion
          </h2>
          <p className="mx-auto mt-3 max-w-2xl px-1 text-sm leading-relaxed text-neutral-600 md:text-base">
            Real product moments, premium visuals, and confidence-led stories curated by our team.
          </p>
        </div>

        <div
          className={`grid min-w-0 gap-5 sm:gap-6 ${videos.length === 1 ? "grid-cols-1 place-items-stretch sm:place-items-center" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
        >
          {videos.map((item, index) => (
            <motion.article
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className={`group relative w-full min-w-0 overflow-hidden rounded-2xl border border-pink-100/70 bg-white/95 shadow-[0_18px_45px_rgba(236,72,153,0.12)] sm:rounded-3xl ${
                videos.length === 1 ? "max-w-full sm:max-w-md md:max-w-lg" : ""
              }`}
            >
              <div className="relative aspect-9/12 w-full overflow-hidden bg-neutral-900">
                <video
                  ref={(node) => {
                    videoRefs.current[item._id] = node;
                  }}
                  src={toPlayableUrl(item.videoUrl)}
                  poster={item.posterUrl ? toPlayableUrl(item.posterUrl) : undefined}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  controls
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />
                <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-700">
                  <PlayCircle className="mr-1 inline h-3.5 w-3.5" />
                  Video
                </div>
              </div>
              <div className="p-5">
                <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-neutral-900">{item.title}</h3>
                {item.subtitle ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-600">{item.subtitle}</p>
                ) : null}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

