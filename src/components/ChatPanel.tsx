"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { submitEnquiry } from "@/app/actions/enquiries";

type Step = "name" | "phone" | "city" | "interest" | "submitting" | "done";

type Message =
  | { id: number; role: "bot"; text: string }
  | { id: number; role: "user"; text: string };

const INTEREST_OPTIONS = [
  "4-month Complete Course",
  "BS6 Technology only",
  "EV Training only",
  "Wiring Training",
] as const;

const PHONE = "+917972024406";
const WHATSAPP_NUMBER = PHONE.replace("+", "");

const INTRO: Omit<Message, "id">[] = [
  { role: "bot", text: "Hi! 👋 Welcome to Mahesh Bike Institute." },
  { role: "bot", text: "A few quick questions and our team will call you back. What's your full name?" },
];

const NEXT_PROMPT: Record<Exclude<Step, "submitting" | "done" | "name">, string> = {
  phone: "Great, {name}! What's your 10-digit phone number?",
  city: "Got it. Which city are you in? (You can type 'skip' if you'd rather not say.)",
  interest: "Last one — which training are you most interested in?",
};

export default function ChatPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<Step>("name");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const answersRef = useRef<{
    name: string;
    phone: string;
    city: string;
    interest: string;
  }>({ name: "", phone: "", city: "", interest: "" });

  const nextId = useCallback(() => {
    idRef.current += 1;
    return idRef.current;
  }, []);

  const pushBot = useCallback(
    (text: string) => {
      setMessages((prev) => [...prev, { id: nextId(), role: "bot", text }]);
    },
    [nextId]
  );

  const pushUser = useCallback(
    (text: string) => {
      setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
    },
    [nextId]
  );

  const reset = useCallback(() => {
    idRef.current = 0;
    answersRef.current = { name: "", phone: "", city: "", interest: "" };
    setMessages(INTRO.map((m) => ({ ...m, id: ++idRef.current })));
    setStep("name");
    setInput("");
    setError(undefined);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) reset();
  }, [open, messages.length, reset]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, step, pending]);

  useEffect(() => {
    if (!open) return;
    if (step === "submitting" || step === "done") return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [open, step]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    document.documentElement.classList.add("no-scroll");
    window.__lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
      window.__lenis?.start();
    };
  }, [open, onClose]);

  const placeholder = useMemo(() => {
    switch (step) {
      case "name":
        return "Your name";
      case "phone":
        return "9876543210";
      case "city":
        return "Your city";
      default:
        return "";
    }
  }, [step]);

  function advance(after: Exclude<Step, "name" | "submitting" | "done">) {
    setStep(after);
    const template = NEXT_PROMPT[after];
    const text = template.replace("{name}", answersRef.current.name || "there");
    window.setTimeout(() => pushBot(text), 220);
  }

  function handleSend(e?: FormEvent) {
    e?.preventDefault();
    if (pending) return;
    setError(undefined);

    if (step === "name") {
      const value = input.trim();
      if (!value) {
        setError("Please share your name to continue.");
        return;
      }
      if (value.length > 120) {
        setError("That name is a bit long — keep it under 120 characters.");
        return;
      }
      answersRef.current.name = value;
      pushUser(value);
      setInput("");
      advance("phone");
      return;
    }

    if (step === "phone") {
      const digits = input.replace(/\D/g, "");
      if (digits.length !== 10) {
        setError("Phone must be a 10-digit number.");
        return;
      }
      answersRef.current.phone = digits;
      pushUser(`+91 ${digits}`);
      setInput("");
      advance("city");
      return;
    }

    if (step === "city") {
      const value = input.trim();
      if (value.toLowerCase() === "skip" || value === "") {
        answersRef.current.city = "";
        pushUser(value === "" ? "Skip" : value);
      } else {
        if (value.length > 120) {
          setError("Keep the city name under 120 characters.");
          return;
        }
        answersRef.current.city = value;
        pushUser(value);
      }
      setInput("");
      advance("interest");
      return;
    }
  }

  function chooseInterest(option: string) {
    if (pending) return;
    answersRef.current.interest = option;
    pushUser(option);
    submit();
  }

  function submit() {
    setStep("submitting");
    setError(undefined);
    window.setTimeout(() => pushBot("Saving your details…"), 180);

    const fd = new FormData();
    fd.set("name", answersRef.current.name);
    fd.set("phone", answersRef.current.phone);
    fd.set("city", answersRef.current.city);
    fd.set("interest", answersRef.current.interest);
    fd.set("source", "chat");

    startTransition(async () => {
      const result = await submitEnquiry(fd);
      if (result.ok) {
        setStep("done");
        pushBot(
          `Thanks, ${answersRef.current.name.split(" ")[0] || "there"}! Our team will call you on +91 ${answersRef.current.phone} shortly.`
        );
        window.setTimeout(
          () => pushBot("Need us right away? Reach out below ↓"),
          400
        );
      } else {
        setStep("interest");
        setError(result.error);
        pushBot("Hmm, that didn't go through. Please pick again or give us a call.");
      }
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
            className="fixed inset-0 z-[55] bg-ink/40 backdrop-blur-md"
          />
        <motion.div
          key="chat-panel"
          initial={{ y: 24, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 16, opacity: 0, scale: 0.97 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="fixed z-[60] left-1/2 -translate-x-1/2 bottom-20 md:bottom-24 w-[calc(100vw-1.5rem)] max-w-[380px]"
          role="dialog"
          aria-modal="true"
          aria-label="Chat with Mahesh Bike Institute"
        >
          <div className="w-full bg-white border border-line rounded-3xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col max-h-[calc(100dvh-9rem)] sm:max-h-[560px]">
            <header className="flex items-center gap-3 px-4 py-3 bg-forest text-white">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-lime text-ink">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold leading-tight">
                  Mahesh Bike Institute
                </div>
                <div className="text-[11px] text-white/70 leading-tight">
                  Typically replies within a few minutes
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close chat"
                className="shrink-0 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition"
              >
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-cream/40 px-3 py-4 space-y-2"
            >
              {messages.map((m) => (
                <Bubble key={m.id} role={m.role} text={m.text} />
              ))}
              {pending && <TypingDots />}
            </div>

            {error && (
              <div className="px-4 py-2 text-xs text-red-700 bg-red-50 border-t border-red-200">
                {error}
              </div>
            )}

            <div className="border-t border-line bg-white">
              {step === "interest" ? (
                <div className="px-3 py-3">
                  <div className="text-[11px] text-muted uppercase tracking-wider mb-2 px-1">
                    Choose one
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        disabled={pending}
                        onClick={() => chooseInterest(opt)}
                        className="text-xs px-3 py-2 rounded-full border border-forest/40 text-forest bg-white hover:bg-forest hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : step === "done" ? (
                <div className="px-3 py-3 space-y-2.5">
                  <div className="text-[11px] text-muted uppercase tracking-wider px-1">
                    Reach us directly
                  </div>
                  <div className="flex items-stretch gap-2">
                    <a
                      href={`tel:${PHONE}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-forest text-white hover:bg-forest/90 transition text-sm font-medium"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#1da856] transition text-sm font-medium"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1c-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4-.1-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2 1.7.7 2.3.8 3.1.7.5-.1 1.6-.6 1.8-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
                      </svg>
                      WhatsApp
                    </a>
                  </div>
                  <div className="flex items-center justify-between px-1 pt-0.5">
                    <button
                      type="button"
                      onClick={reset}
                      className="text-[11px] text-muted hover:text-ink transition"
                    >
                      ↺ Start over
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-[11px] text-muted hover:text-ink transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSend}
                  className="flex items-stretch gap-2 p-2"
                >
                  {step === "phone" && (
                    <span className="inline-flex items-center px-3 text-sm text-muted bg-cream/70 border border-line rounded-xl select-none">
                      +91
                    </span>
                  )}
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      if (step === "phone") {
                        setInput(e.target.value.replace(/\D/g, "").slice(0, 10));
                      } else {
                        setInput(e.target.value);
                      }
                    }}
                    type={step === "phone" ? "tel" : "text"}
                    inputMode={step === "phone" ? "numeric" : "text"}
                    autoComplete={
                      step === "phone"
                        ? "tel-national"
                        : step === "name"
                          ? "name"
                          : step === "city"
                            ? "address-level2"
                            : "off"
                    }
                    maxLength={step === "phone" ? 10 : 120}
                    placeholder={placeholder}
                    disabled={pending || step === "submitting"}
                    className={
                      "flex-1 bg-white border border-line rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-forest disabled:opacity-60 " +
                      (step === "phone" ? "num-mono" : "")
                    }
                  />
                  <button
                    type="submit"
                    disabled={pending || step === "submitting"}
                    aria-label="Send"
                    className="shrink-0 inline-flex items-center justify-center w-11 rounded-xl bg-forest text-white hover:bg-forest/90 transition disabled:opacity-60"
                  >
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
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Bubble({ role, text }: { role: "bot" | "user"; text: string }) {
  const isBot = role === "bot";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex ${isBot ? "justify-start" : "justify-end"}`}
    >
      <div
        className={
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-snug shadow-sm " +
          (isBot
            ? "bg-white border border-line text-ink rounded-bl-md"
            : "bg-forest text-white rounded-br-md")
        }
      >
        {text}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-line rounded-2xl rounded-bl-md px-3 py-2 shadow-sm">
        <span className="inline-flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-muted/70 animate-bounce [animation-delay:-0.2s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted/70 animate-bounce [animation-delay:-0.1s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted/70 animate-bounce" />
        </span>
      </div>
    </div>
  );
}
