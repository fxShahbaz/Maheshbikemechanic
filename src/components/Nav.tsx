"use client";

import { motion, useScroll, useTransform } from "motion/react";
import EnrollButton from "./EnrollButton";

const GearIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0f1410"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12a10 10 0 1 0-11.56 9.88V14.9H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.79-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.25 0-1.63.77-1.63 1.56V12h2.78l-.44 2.9h-2.34v6.98A10 10 0 0 0 22 12z" />
  </svg>
);

const ArrowUpRight = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

export default function Nav() {
  const { scrollY } = useScroll();
  const background = useTransform(
    scrollY,
    [0, 320],
    ["rgba(255,255,255,0.65)", "rgba(255,255,255,0.95)"]
  );
  const shadow = useTransform(
    scrollY,
    [0, 320],
    ["0 0 0 rgba(15,20,16,0)", "0 10px 32px -22px rgba(15,20,16,0.35)"]
  );

  return (
    <motion.header
      className="px-4 md:px-8 pt-5 sticky top-0 z-50"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.nav
        style={{ background, boxShadow: shadow }}
        className="max-w-[1200px] mx-auto flex items-center justify-between backdrop-blur border border-line rounded-full pl-5 pr-2 py-2"
      >
        <a href="#" className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-lime shrink-0">
            <GearIcon />
          </span>
          <span className="font-display text-[0.95rem] sm:text-[1.15rem] whitespace-nowrap">
            Mahesh Bike Institute
          </span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          <a href="#about" className="nav-link">About</a>
          <a href="#modules" className="nav-link">Course</a>
          <a href="#bikes" className="nav-link">Bikes Covered</a>
          <a href="#fees" className="nav-link">Fees</a>
          <a href="#reviews" className="nav-link">Reviews</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <a
              href="https://www.instagram.com/bike_mechanic_mahesh/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="social-btn"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.facebook.com/bikemechanicmahesh/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="social-btn"
            >
              <FacebookIcon />
            </a>
          </div>
          <EnrollButton className="pill-btn text-sm whitespace-nowrap">
            <span>
              Enroll<span className="hidden sm:inline"> Now</span>
            </span>
            <span className="arr">
              <ArrowUpRight />
            </span>
          </EnrollButton>
        </div>
      </motion.nav>
    </motion.header>
  );
}
