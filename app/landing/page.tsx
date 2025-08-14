"use client";

import { motion } from "framer-motion";
import type { Variants, Transition } from "framer-motion";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { CometCard } from "@/components/ui/comet-card";

const springTransition: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 18,
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

const stagger: Variants = {
  show: { transition: { staggerChildren: 0.08 } },
};

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      {/* Top nav */}
      <div className="absolute right-6 top-6 z-50 flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          Chat
        </Link>
        <ModeToggle />
      </div>

      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.2 }}
          className="absolute left-1/2 top-[-10%] size-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-sky-400/20 to-fuchsia-400/20 blur-3xl"
        />
      </div>

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pt-28 md:pt-32">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex w-full flex-col items-center text-center"
        >
          <motion.span
            variants={fadeInUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <span className="inline-block size-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="font-mono uppercase tracking-wide">beta</span>
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-balance text-4xl font-semibold leading-tight text-transparent md:text-6xl"
          >
            Chat with Personality
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg"
          >
            Build AI chats that feel human. Pick a ready-made persona or create
            your own, and start real conversations in minutes.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link href="/">
              <Button size="lg" className="gap-2">
                Start Chatting
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline">
                See Features
              </Button>
            </a>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="relative mt-12 w-full max-w-5xl"
          >
            <CometCard className="w-full">
              <motion.button
                initial={{ filter: "saturate(0)" }}
                whileHover={{ filter: "saturate(1)" }}
                transition={{ ease: "circInOut", duration: 0.4 }}
                type="button"
                className="my-10 flex w-full cursor-pointer flex-col items-stretch rounded-[16px] border-0 bg-[#1F2121] p-2 md:my-20 md:p-4"
                aria-label="View invite F7RA"
                style={{
                  transformStyle: "preserve-3d",
                  transform: "none",
                  opacity: 1,
                }}
              >
                <div className="mx-2 flex-1">
                  <div className="relative mt-2 aspect-[16/9] w-full">
                    <img
                      loading="lazy"
                      className="absolute inset-0 h-full w-full rounded-[16px] bg-[#000000] object-cover contrast-75"
                      alt="Invite background"
                      src="/GenAI_with_JS_lyst1753790039806.jpg"
                      style={{
                        boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px",
                        opacity: 1,
                      }}
                    />
                  </div>
                </div>
              </motion.button>
            </CometCard>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto mt-24 max-w-6xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Realtime UI",
              desc: "Streamed tokens render as they arrive for that snappy feel.",
            },
            {
              title: "Personas",
              desc: "Swap between curated personas like Hitesh and Piyush.",
            },
            {
              title: "Web search toggle",
              desc: "Add citations and sources on demand.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                delay: i * 0.05,
                type: "spring",
                stiffness: 140,
                damping: 18,
              }}
              className="rounded-xl border p-5"
            >
              <div className="text-sm font-medium text-primary">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-2 text-lg font-semibold">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
