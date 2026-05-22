import ReviewsCarousel from "@/components/ReviewsCarousel";
import EnquiryForm from "@/components/EnquiryForm";
import EnrollButton from "@/components/EnrollButton";
import FloatingDock from "@/components/FloatingDock";
import Nav from "@/components/Nav";
import Reveal from "@/components/animations/Reveal";
import { Stagger, StaggerItem } from "@/components/animations/Stagger";
import HeroSlideshow from "@/components/animations/HeroSlideshow";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { CONTACT, SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL } from "@/lib/site";

const YOUTUBE_VIDEOS = [
  {
    id: "jHg8Z4Vk_co",
    title: "DOT 3, DOT 4 Oil & Disc Brake Working — Live Lecture",
  },
  {
    id: "pvmT-F4HAjU",
    title: "8 दिनों में बने BS6 Bike Mechanic Expert — Female Empowerment",
  },
  {
    id: "7hj0rKJ_o14",
    title: "8 दिनों में बने BS6 Expert — Students से पूछेंगे कैसे होती है ट्रेनिंग",
  },
];

const WIRING_BIKES = [
  "Splendor",
  "Old Platina",
  "Passion Pro",
  "Shine SP / CB",
  "Unicorn",
  "Activa Old",
  "Activa 3G / 4G",
  "Activa 5G",
  "Jupiter / Wego",
  "Access Old / New",
  "Apache RTR",
  "Apache Digital",
  "Pulsar 150 / 180",
  "Discover",
  "NS200",
  "iSmart 110",
  "Splendor i3S",
  "Bullet BS3 / BS4",
  "Yamaha FZ / FZ-FI",
  "R15 v1 / v2",
  "Pulsar RS200",
  "XL100",
];

const BS6_BIKES = [
  "Hero Splendor / Xtec",
  "Hero Super Splendor",
  "Hero HF Deluxe",
  "Hero Glamour",
  "Hero Xtreme",
  "Honda Shine CB",
  "Honda Shine SP",
  "Honda Unicorn",
  "Honda Activa",
  "Honda CB200X",
  "Bajaj Platina (E-Carb)",
  "Bajaj Pulsar 150",
  "Bajaj Pulsar 220",
  "TVS Sport",
  "TVS Raider",
  "TVS Apache",
  "TVS Jupiter",
  "TVS XL100",
  "Suzuki Burgman",
  "Suzuki Access 125",
  "Suzuki Gixxer SF250",
  "KTM RC",
  "KTM Duke 200",
  "Jawa 42",
  "+ more",
];

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

const ArrowRight = () => (
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
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
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

const GearIcon = ({ color = "#0f1410" }: { color?: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

const ORG_ID = `${SITE_URL}/#org`;

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      image: `${SITE_URL}/opengraph-image`,
      description: SITE_DESCRIPTION,
      telephone: CONTACT.phoneFormatted,
      foundingDate: "2014",
      areaServed: { "@type": "Country", name: "India" },
      address: {
        "@type": "PostalAddress",
        addressLocality: CONTACT.city,
        addressRegion: CONTACT.region,
        addressCountry: CONTACT.country,
      },
      sameAs: [SOCIAL.instagram, SOCIAL.facebook],
    },
    {
      "@type": "Course",
      name: "4 Months Complete Bike Mechanic Course",
      description:
        "Comprehensive 4-month bike mechanic training covering live engines, BS3/BS4/BS6 wiring, customer bike workshop and EV training.",
      provider: { "@id": ORG_ID },
      inLanguage: ["en", "hi"],
      educationalLevel: "Beginner",
      occupationalCredentialAwarded: "Professional Bike Mechanic",
      timeRequired: "P4M",
      isAccessibleForFree: false,
      offers: {
        "@type": "Offer",
        category: "Tuition",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
      hasCourseInstance: [
        {
          "@type": "CourseInstance",
          courseMode: "in-person",
          courseWorkload: "P4M",
          location: {
            "@type": "Place",
            name: SITE_NAME,
            address: {
              "@type": "PostalAddress",
              addressLocality: CONTACT.city,
              addressRegion: CONTACT.region,
              addressCountry: CONTACT.country,
            },
          },
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": ORG_ID },
      inLanguage: ["en-IN", "hi-IN"],
    },
  ],
};

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      {/* ============== NAV ============== */}
      <Nav />

      {/* ============== HERO ============== */}
      <section className="px-4 md:px-8 mt-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="hero-img-wrap">
            <HeroSlideshow
              images={[
                { src: "/images/hero.png", alt: "Mahesh — founder of Mahesh Bike Institute" },
                {
                  src: "/images/hero-classroom.jpg",
                  alt: "Classroom session at Mahesh Bike Institute — ECU sensors and actuators",
                  objectPosition: "center bottom",
                },
              ]}
            />
            <div className="hero-shade" />

            <div className="relative z-10 flex flex-col justify-between h-full min-h-[540px] p-6 md:p-12">
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-xs uppercase tracking-widest">Pune · Maharashtra</span>
                <span className="w-1 h-1 rounded-full bg-white/60" />
                <span className="text-xs uppercase tracking-widest">Since 2014</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mt-auto">
                <h1 className="display-tight text-white text-[2.4rem] sm:text-[3.2rem] md:text-[4.5rem] max-w-[820px]">
                  Become a <span className="italic">complete</span>
                  <br />
                  Bike Mechanic
                  <br />
                  in just{" "}
                  <u className="decoration-lime decoration-4 underline-offset-[10px]">
                    4&nbsp;months
                  </u>
                  .
                </h1>

                <div className="md:max-w-[320px]">
                  <EnrollButton className="pill-btn">
                    Let&apos;s Talk
                    <span className="arr">
                      <ArrowUpRight />
                    </span>
                  </EnrollButton>
                  <p className="text-white/85 text-sm mt-4 leading-relaxed">
                    India&apos;s most hands-on bike mechanic training — live engines, real customer bikes, BS3 to BS6 wiring and EV technology, all under one roof.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KPI strip */}
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-5" amount={0.05}>
            <StaggerItem className="stat-card">
              <div className="display text-3xl">4 months</div>
              <div className="text-muted text-sm mt-1">Complete training</div>
            </StaggerItem>
            <StaggerItem className="stat-card">
              <div className="display num-mono text-3xl">
                100<span className="text-muted text-base font-sans align-top ml-0.5">+</span>
              </div>
              <div className="text-muted text-sm mt-1">Bike models covered</div>
            </StaggerItem>
            <StaggerItem className="stat-card">
              <div className="display num-mono text-3xl">
                100<span className="text-muted text-base font-sans align-top ml-0.5">–390cc</span>
              </div>
              <div className="text-muted text-sm mt-1">Engine practice range</div>
            </StaggerItem>
            <StaggerItem className="stat-card">
              <div className="display num-mono text-3xl">7</div>
              <div className="text-muted text-sm mt-1">Specialist modules</div>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      {/* ============== ABOUT ============== */}
      <section id="about" className="px-4 md:px-8 mt-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <div>
              <div className="section-tag">(About the Institute)</div>
              <div className="mt-6 space-y-3">
                <div className="feature-pill">
                  <div className="icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 14 4-4" />
                      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">Hands-on workshop training</div>
                    <div className="text-muted text-sm">Real customer bikes, real engines, real problems — every day.</div>
                  </div>
                </div>
                <div className="feature-pill">
                  <div className="icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">BS3, BS4, BS6 &amp; EV</div>
                    <div className="text-muted text-sm">From classic carburettor bikes to fuel-injection and electric vehicles.</div>
                  </div>
                </div>
                <div className="feature-pill">
                  <div className="icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <path d="M9 9h.01" />
                      <path d="M15 9h.01" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">Hostel + Food included</div>
                    <div className="text-muted text-sm">Stay on campus and focus fully on becoming an expert mechanic.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="display text-[2.2rem] md:text-[3rem]">
                From <span className="italic">curious learner</span> to certified bike mechanic — in four focused months.
              </h2>
              <p className="text-muted mt-5 leading-relaxed max-w-[560px]">
                At Mahesh Bike Institute we train freshers to become complete two-wheeler mechanics. Live engines, real wiring boards, customer bikes and BS6 / EV technology — every module is designed for the workshop floor, not the classroom.
              </p>
              <p className="text-muted mt-3 hindi leading-relaxed max-w-[560px]">
                हम यहाँ ४ महीनों में आपको पूरा एक्सपर्ट बाइक मैकेनिक बनाते हैं — Hero, Honda, TVS, Yamaha, Suzuki, Royal Enfield, KTM और अन्य सभी ब्रांड्स की पूरी ट्रेनिंग के साथ।
              </p>
              <div className="mt-7 flex gap-3">
                <a href="#modules" className="pill-btn">
                  See Modules
                  <span className="arr">
                    <ArrowRight />
                  </span>
                </a>
                <a href="#fees" className="ghost-btn">View Fees</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== ENGINE VIDEO ============== */}
      <section className="px-4 md:px-8 mt-28">
        <div className="max-w-[1200px] mx-auto">
          <Reveal>
            <div className="relative">
              <video
                src="/videos/engine-view.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="w-full h-auto block rounded-3xl"
              />
              <div className="absolute top-4 left-4 md:top-6 md:left-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-ink/70 backdrop-blur-md border border-white/15">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-lime animate-ping opacity-70" />
                  <span className="relative w-2 h-2 rounded-full bg-lime" />
                </span>
                <span className="text-white text-xs md:text-sm font-medium tracking-wide">
                  Live Engine Training · 100cc–390cc
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============== MODULES ============== */}
      <section id="modules" className="px-4 md:px-8 mt-28">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="section-tag">(What You&apos;ll Learn)</div>
              <h2 className="display text-[2.2rem] md:text-[3.2rem] mt-5 max-w-[680px]">
                Seven focused modules.
                <br />
                <span className="italic">One complete mechanic.</span>
              </h2>
            </div>
            <p className="text-muted max-w-[380px]">
              Each module is taught on live demo engines and real bikes — so you can fix problems with confidence on day one of the job.
            </p>
          </div>

          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mt-12">
            <StaggerItem className="module-card">
              <div className="icon-box mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="10" rx="2" />
                  <path d="M6 7V5" />
                  <path d="M18 7V5" />
                  <path d="M6 21v-4" />
                  <path d="M18 21v-4" />
                </svg>
              </div>
              <h3 className="font-display text-xl">Demo Engine Practice</h3>
              <p className="text-muted text-sm mt-2">100cc to 390cc — Hero, Honda, TVS, Yamaha, Suzuki, Royal Enfield, KTM.</p>
              <ul className="text-sm mt-4 space-y-1.5 text-ink/80">
                <li>• Working principle</li>
                <li>• Fitting &amp; assembly</li>
                <li>• Problem solving</li>
              </ul>
            </StaggerItem>

            <StaggerItem className="module-card">
              <div className="icon-box mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3 className="font-display text-xl">BS3 &amp; BS4 Wiring</h3>
              <p className="text-muted text-sm mt-2">From the easiest Splendor wiring to the toughest Pulsar 200 — complete colour codes &amp; faults.</p>
              <ul className="text-sm mt-4 space-y-1.5 text-ink/80">
                <li>• Colour code mastery</li>
                <li>• Parts working</li>
                <li>• Fault diagnosis</li>
              </ul>
            </StaggerItem>

            <StaggerItem className="module-card">
              <div className="icon-box mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18" />
                  <path d="M3 12h18" />
                </svg>
              </div>
              <h3 className="font-display text-xl">Live Parts Working</h3>
              <p className="text-muted text-sm mt-2">Hands-on practice on every critical mechanical assembly of a live bike.</p>
              <ul className="text-sm mt-4 space-y-1.5 text-ink/80">
                <li>• Carburettor &amp; FI throttle body</li>
                <li>• Disc brake &amp; suspension</li>
                <li>• Piston, valve &amp; tappet setting</li>
              </ul>
            </StaggerItem>

            <StaggerItem className="module-card">
              <div className="icon-box mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <h3 className="font-display text-xl">Live Engine Training</h3>
              <p className="text-muted text-sm mt-2">Open &amp; rebuild institute bike engines — full disassembly to running condition.</p>
              <ul className="text-sm mt-4 space-y-1.5 text-ink/80">
                <li>• Engine teardown</li>
                <li>• Reassembly</li>
                <li>• Compression testing</li>
              </ul>
            </StaggerItem>

            <StaggerItem className="module-card">
              <div className="icon-box mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <path d="M15 6a1 1 0 0 0 0 2h1.5l1.5 4-3 6" />
                  <path d="M9 18h6" />
                  <path d="M9 18 5.5 7H3" />
                </svg>
              </div>
              <h3 className="font-display text-xl">Customer Bike Workshop</h3>
              <p className="text-muted text-sm mt-2">Our in-house workshop runs real customer jobs — you work directly on them under supervision.</p>
              <ul className="text-sm mt-4 space-y-1.5 text-ink/80">
                <li>• Real-world problem solving</li>
                <li>• Customer handling basics</li>
                <li>• Speed &amp; quality of work</li>
              </ul>
            </StaggerItem>

            <StaggerItem className="module-card">
              <div className="icon-box mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path d="M9 9h6v6H9z" />
                  <path d="M9 1v3" />
                  <path d="M15 1v3" />
                  <path d="M9 20v3" />
                  <path d="M15 20v3" />
                  <path d="M20 9h3" />
                  <path d="M20 14h3" />
                  <path d="M1 9h3" />
                  <path d="M1 14h3" />
                </svg>
              </div>
              <h3 className="font-display text-xl">BS6 Technology</h3>
              <p className="text-muted text-sm mt-2">OBD scanner, FI diagnostics, sensors, actuators — complete BS6 troubleshooting.</p>
              <ul className="text-sm mt-4 space-y-1.5 text-ink/80">
                <li>• Scanning &amp; testing</li>
                <li>• Sensor / actuator knowledge</li>
                <li>• ECU fault clearance</li>
              </ul>
            </StaggerItem>

            <StaggerItem className="module-card lg:col-span-1 sm:col-span-2 lg:col-auto">
              <div className="icon-box mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 10V4.5a1.5 1.5 0 0 0-3 0V13l-3.5-3.5a1.5 1.5 0 1 0-2.12 2.12L9.88 16H6a1.5 1.5 0 0 0 0 3h7l3-3v-3a3 3 0 0 0-2-2.83" />
                </svg>
              </div>
              <h3 className="font-display text-xl">Electric Vehicle (EV)</h3>
              <p className="text-muted text-sm mt-2">Okinawa, Praise Pro, Hero Vida and more — full EV system breakdown.</p>
              <ul className="text-sm mt-4 space-y-1.5 text-ink/80">
                <li>• VCU, MCU, BMS, Battery</li>
                <li>• Motor &amp; controller</li>
                <li>• Hall sensor diagnostics</li>
              </ul>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      {/* ============== WIRING GREEN BANNER ============== */}
      <section id="bikes" className="px-4 md:px-8 mt-28">
        <div className="max-w-[1200px] mx-auto green-section p-8 md:p-14">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-end">
            <div>
              <div className="text-lime/80 text-sm tracking-wider uppercase">Module · Wiring</div>
              <h2 className="display mt-5 text-[2.1rem] md:text-[3rem] leading-[1.02]">
                India&apos;s easiest wiring to India&apos;s toughest —{" "}
                <span className="italic">all on one board.</span>
              </h2>
              <p className="text-white/75 mt-5 max-w-[520px]">
                From Hero Honda Splendor to Bajaj Pulsar 200, every wiring board is taught in detail — colour codes, parts working, common faults and fixes.
              </p>
            </div>

            <div>
              <div className="text-white/60 text-sm mb-4">Bikes covered in wiring training</div>
              <div className="flex flex-wrap gap-2">
                {WIRING_BIKES.map((b) => (
                  <span key={b} className="bike-chip">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== LIVE PARTS + ENGINE ============== */}
      <section className="px-4 md:px-8 mt-28">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="section-tag">(Hands-on Practice)</div>
              <h2 className="display text-[2.2rem] md:text-[3rem] mt-5 max-w-[700px]">
                Live parts. Live engines.
                <br />
                <span className="italic">Real customer bikes.</span>
              </h2>
            </div>
            <p className="text-muted max-w-[380px]">
              Every component you&apos;ll touch in your shop — we put it in your hands first.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-12">
            <div className="rounded-3xl overflow-hidden h-[300px] md:h-[400px] bg-forest relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1547549082-6bc09f2049ae?auto=format&fit=crop&w=900&q=80"
                alt="Motorcycle engine close-up"
                className="w-full h-full object-cover opacity-95"
              />
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-ink/85 to-transparent">
                <div className="text-lime text-xs uppercase tracking-wider">Live Engine</div>
                <div className="text-white font-display text-2xl mt-1">Open · Rebuild · Run</div>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-line p-7 flex flex-col">
              <div className="text-sm text-muted">Live Parts Training</div>
              <ul className="mt-4 space-y-3 text-[15px]">
                <li className="flex justify-between"><span>Carburettor</span><span className="text-muted">Tuning</span></li>
                <li className="flex justify-between"><span>Fuel Injection / Throttle Body</span><span className="text-muted">FI</span></li>
                <li className="flex justify-between"><span>Shock Absorber</span><span className="text-muted">Suspension</span></li>
                <li className="flex justify-between"><span>Disc Brake System</span><span className="text-muted">Hydraulic</span></li>
                <li className="flex justify-between"><span>Oil &amp; Lubricants</span><span className="text-muted">Service</span></li>
                <li className="flex justify-between"><span>Wheel Bearing / Bush</span><span className="text-muted">F &amp; R</span></li>
                <li className="flex justify-between"><span>Piston Rings / Block</span><span className="text-muted">Top-end</span></li>
                <li className="flex justify-between"><span>Valve / Tappet / Head</span><span className="text-muted">Setting</span></li>
                <li className="flex justify-between"><span>Front / Rear Tyre</span><span className="text-muted">Fitment</span></li>
              </ul>
            </div>

            <div className="rounded-3xl overflow-hidden h-[300px] md:h-[400px] bg-forest relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/customer-workshop.png"
                alt="Mahesh Bike Institute customer workshop training"
                className="w-full h-full object-cover object-center opacity-95"
              />
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-ink/95 via-ink/55 to-transparent">
                <div className="text-lime text-xs uppercase tracking-wider">Customer Workshop</div>
                <div className="text-white font-display text-2xl mt-1">Direct customer experience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== BS6 TECHNOLOGY ============== */}
      <section className="px-4 md:px-8 mt-28">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="section-tag">(Module · BS6)</div>
              <h2 className="display text-[2.2rem] md:text-[3rem] mt-5 max-w-[720px]">
                BS6 Technology, <span className="italic">decoded.</span>
              </h2>
              <p className="text-muted mt-5 max-w-[520px]">
                Scanning, sensor &amp; actuator testing, electronic part identification, fault clearance — taught on the bikes that arrive in real workshops today.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:max-w-[420px]">
              <div className="stat-card">
                <div className="text-xs text-muted uppercase tracking-wider">Tool</div>
                <div className="font-display text-lg mt-1">OBD Scanner</div>
              </div>
              <div className="stat-card">
                <div className="text-xs text-muted uppercase tracking-wider">Tool</div>
                <div className="font-display text-lg mt-1">Fuel Pump Tester</div>
              </div>
              <div className="stat-card">
                <div className="text-xs text-muted uppercase tracking-wider">Tool</div>
                <div className="font-display text-lg mt-1">Multimeter</div>
              </div>
              <div className="stat-card">
                <div className="text-xs text-muted uppercase tracking-wider">Tool</div>
                <div className="font-display text-lg mt-1">Fuel Pressure Gauge</div>
              </div>
            </div>
          </div>

          <div className="mt-10 bg-white border border-line rounded-3xl p-7 md:p-9">
            <div className="text-sm text-muted mb-5">BS6 bikes covered in training</div>
            <div className="flex flex-wrap gap-2">
              {BS6_BIKES.map((b) => (
                <span key={b} className="bike-chip">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============== EV TRAINING ============== */}
      <section className="px-4 md:px-8 mt-28">
        <div className="max-w-[1200px] mx-auto">
          <div className="green-section p-8 md:p-14 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <div className="text-lime/80 text-sm tracking-wider uppercase">Module · Electric Vehicles</div>
              <h2 className="display mt-5 text-[2.1rem] md:text-[3rem]">
                The future runs on <span className="italic">electrons.</span>
              </h2>
              <p className="text-white/75 mt-5 max-w-[520px]">
                EV is the fastest-growing two-wheeler segment in India. Our EV module makes sure you&apos;re ready for it — from controller to BMS, motor to hall sensor.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                <span className="bike-chip">Okinawa</span>
                <span className="bike-chip">Praise Pro</span>
                <span className="bike-chip">Hero Vida</span>
                <span className="bike-chip">+ more</span>
              </div>
            </div>

            <Stagger className="grid grid-cols-2 gap-3">
              {[
                ["VCU", "Vehicle Control Unit"],
                ["MCU", "Motor Control Unit"],
                ["BMS", "Battery Management"],
                ["Motor", "Hub & mid-drive"],
                ["Controller", "Logic & faults"],
                ["Hall", "Sensor diagnostics"],
              ].map(([head, sub]) => (
                <StaggerItem key={head} className="bg-moss/60 border border-white/10 rounded-2xl p-5">
                  <div className="text-lime text-2xl font-display">{head}</div>
                  <div className="text-white/70 text-sm mt-1">{sub}</div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ============== FEES + HOSTEL ============== */}
      <section id="fees" className="px-4 md:px-8 mt-28">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="section-tag">(Transparent Fees)</div>
              <h2 className="display text-[2.2rem] md:text-[3rem] mt-5 max-w-[680px]">
                Simple, honest pricing.
                <br />
                <span className="italic">No hidden costs.</span>
              </h2>
            </div>
            <p className="text-muted max-w-[380px]">
              Pay for the training. Hostel is optional but recommended for students from outside Pune.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-12">
            <div className="md:col-span-2 bg-white border border-line rounded-3xl p-8 md:p-10">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-muted text-sm">Complete 4-month course</div>
                  <div className="display num-mono text-[3.2rem] md:text-[4.2rem] mt-1">₹40,000</div>
                </div>
                <div className="hidden md:block text-right">
                  <div className="text-xs uppercase tracking-wider text-muted">Duration</div>
                  <div className="font-display text-2xl">4 months</div>
                </div>
              </div>

              <hr className="my-7 border-line" />

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">One-time Registration</div>
                  <div className="font-display num-mono text-2xl mt-1">₹2,500</div>
                  <p className="text-sm text-muted mt-2">Includes stationery, T-shirts &amp; bike wiring PDFs.</p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">What&apos;s covered</div>
                  <ul className="text-sm mt-2 space-y-1.5">
                    <li>✓ All 7 modules</li>
                    <li>✓ Live engines &amp; customer bikes</li>
                    <li>✓ BS6 + EV training</li>
                    <li>✓ Wiring PDFs &amp; reference material</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <EnrollButton className="pill-btn">
                  Enroll Now
                  <span className="arr">
                    <ArrowRight />
                  </span>
                </EnrollButton>
              </div>
            </div>

            <div className="green-section p-8 flex flex-col justify-between">
              <div>
                <div className="text-lime/80 text-sm uppercase tracking-wider">Optional</div>
                <h3 className="display text-3xl mt-3">Hostel + Food</h3>
                <p className="text-white/75 text-sm mt-3">
                  On-campus stay with full meals — perfect for students travelling from outside Pune.
                </p>
              </div>
              <div className="mt-8">
                <div className="text-lime text-xs uppercase tracking-wider">Monthly</div>
                <div className="display num-mono text-5xl text-white mt-1">₹6,000</div>
                <div className="text-white/60 text-sm mt-1">Stay + Food included</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== REVIEWS ============== */}
      <section id="reviews" className="px-4 md:px-8 mt-28">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="section-tag">(Student Reviews)</div>
              <h2 className="display text-[2.2rem] md:text-[3.2rem] mt-5 max-w-[700px]">
                Real stories from <span className="italic">real students.</span>
              </h2>
            </div>
            <p className="text-muted max-w-[380px]">
              Hear directly from our students about their training journey at Mahesh Bike Institute — straight from our Instagram.
            </p>
          </div>

          <ReviewsCarousel />

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 bg-white border border-line rounded-3xl p-6 md:p-7">
            <div className="flex items-center gap-4">
              <div className="icon-box">
                <InstagramIcon />
              </div>
              <div>
                <div className="font-display text-xl">More reviews on Instagram</div>
                <div className="text-muted text-sm">Follow @bike_mechanic_mahesh for daily updates &amp; student wins.</div>
              </div>
            </div>
            <a
              href="https://www.instagram.com/bike_mechanic_mahesh/"
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn"
            >
              Follow on Instagram
              <span className="arr">
                <ArrowUpRight />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ============== YOUTUBE VIDEOS ============== */}
      <section id="videos" className="px-4 md:px-8 mt-28">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="section-tag">(Latest Videos)</div>
              <h2 className="display text-[2.2rem] md:text-[3.2rem] mt-5 max-w-[700px]">
                Our latest <span className="italic">training videos.</span>
              </h2>
            </div>
            <p className="text-muted max-w-[380px]">
              Fresh training clips straight from our YouTube channel — BS6 troubleshooting, live workshops, real student stories.
            </p>
          </div>

          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {YOUTUBE_VIDEOS.map((v) => (
              <StaggerItem
                key={v.id}
                className="bg-white border border-line rounded-3xl overflow-hidden"
              >
                <div className="aspect-video bg-forest">
                  <YouTubeEmbed videoId={v.id} title={v.title} />
                </div>
                <div className="p-5">
                  <div className="text-[15px] font-medium leading-snug line-clamp-2">
                    {v.title}
                  </div>
                  <div className="text-muted text-xs mt-2">
                    Bike Mechanic Mahesh · YouTube
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 bg-white border border-line rounded-3xl p-6 md:p-7">
            <div className="flex items-center gap-4">
              <div className="icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              <div>
                <div className="font-display text-xl">More on YouTube</div>
                <div className="text-muted text-sm">
                  Subscribe to @BikeMechanicMahesh for weekly mechanic tutorials.
                </div>
              </div>
            </div>
            <a
              href="https://www.youtube.com/@BikeMechanicMahesh"
              target="_blank"
              rel="noopener noreferrer"
              className="pill-btn"
            >
              Watch on YouTube
              <span className="arr">
                <ArrowUpRight />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ============== CONTACT ============== */}
      <section id="contact" className="px-4 md:px-8 mt-28">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-white border border-line rounded-4xl p-8 md:p-14 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <div className="section-tag">(Start Your Career)</div>
              <h2 className="display text-[2.2rem] md:text-[3.2rem] mt-5">
                Four months from now,{" "}
                <span className="italic">
                  you could be a complete bike mechanic.
                </span>
              </h2>
              <p className="text-muted mt-5 max-w-[480px]">
                Call or WhatsApp us today to confirm your seat. Limited batch size — we keep classes small for proper hands-on attention.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="tel:+917972024406" className="pill-btn">
                  Call Now
                  <span className="arr">
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
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                </a>
                <a href="https://wa.me/917972024406" className="ghost-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1c-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4-.1-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2 1.7.7 2.3.8 3.1.7.5-.1 1.6-.6 1.8-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
                  </svg>
                  WhatsApp
                </a>
              </div>

              <div className="mt-8 pt-8 border-t border-line">
                <div className="text-xs uppercase tracking-wider text-muted">Address</div>
                <div className="font-display text-xl mt-2">Mahesh Bike Institute</div>
                <div className="text-muted text-sm mt-1">Pune, Maharashtra, India</div>
              </div>
            </div>

            <div className="bg-cream border border-line rounded-3xl p-7 md:p-9">
              <div className="text-xs uppercase tracking-wider text-muted">Quick Enquiry</div>
              <EnquiryForm />
            </div>
          </div>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="px-4 md:px-8 mt-24 pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-ink text-white/85 rounded-4xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-lime">
                    <GearIcon />
                  </span>
                  <span className="font-display text-xl text-white">
                    Mahesh Bike Institute
                  </span>
                </div>
                <p className="text-white/65 text-sm mt-4 max-w-xs">
                  India&apos;s most practical 4-month bike mechanic training. Pune, Maharashtra.
                </p>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-white/50">Course</div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li><a href="#modules" className="hover:text-lime">Modules</a></li>
                  <li><a href="#bikes" className="hover:text-lime">Bikes covered</a></li>
                  <li><a href="#fees" className="hover:text-lime">Fees</a></li>
                </ul>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-white/50">Contact</div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>Pune, Maharashtra</li>
                  <li><a href="tel:+917972024406" className="hover:text-lime">+91 79720 24406</a></li>
                  <li><a href="https://wa.me/917972024406" className="hover:text-lime">WhatsApp</a></li>
                </ul>
                <div className="flex items-center gap-2 mt-5">
                  <a
                    href="https://www.instagram.com/bike_mechanic_mahesh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-lime hover:text-ink text-white transition"
                  >
                    <InstagramIcon />
                  </a>
                  <a
                    href="https://www.facebook.com/bikemechanicmahesh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-lime hover:text-ink text-white transition"
                  >
                    <FacebookIcon />
                  </a>
                </div>
              </div>
            </div>

            <hr className="border-white/10 my-10" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-white/50">
              <div>© {year} Mahesh Bike Institute. All rights reserved.</div>
              <div>Made for the next generation of bike mechanics.</div>
            </div>
          </div>
        </div>
      </footer>

      <FloatingDock />
    </>
  );
}
