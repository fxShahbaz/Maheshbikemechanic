"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import Script from "next/script";
import { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

const REELS = [
  "https://www.instagram.com/p/DXyGT9kPw0N/",
  "https://www.instagram.com/p/DXqXmX4EeM_/",
  "https://www.instagram.com/p/DXgD9UUER16/",
  "https://www.instagram.com/p/DW5hRyzDD9f/",
];

export default function ReviewsCarousel() {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Swiper
        modules={[Navigation, Autoplay]}
        loop
        slidesPerView={1}
        spaceBetween={20}
        speed={700}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
        onBeforeInit={(swiper: SwiperType) => {
          const nav = swiper.params.navigation;
          if (nav && typeof nav !== "boolean") {
            nav.prevEl = prevRef.current;
            nav.nextEl = nextRef.current;
          }
        }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onInit={() => {
          setTimeout(() => window.instgrm?.Embeds.process(), 800);
        }}
        onSlideChangeTransitionEnd={() => {
          window.instgrm?.Embeds.process();
        }}
        className="reviews-swiper mt-12"
      >
        {REELS.map((url) => (
          <SwiperSlide key={url}>
            <div className="ig-card">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={`${url}?utm_source=ig_embed&utm_campaign=loading`}
                data-instgrm-version="14"
                style={{
                  background: "#FFF",
                  border: 0,
                  borderRadius: 18,
                  margin: 0,
                  maxWidth: 540,
                  minWidth: 326,
                  padding: 0,
                  width: "100%",
                }}
              />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on Instagram"
                className="absolute inset-0 z-10"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="reviews-nav">
        <button ref={prevRef} type="button" aria-label="Previous review">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button ref={nextRef} type="button" aria-label="Next review">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <Script
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
      />
    </>
  );
}
