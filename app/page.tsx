"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { GlobeIcon } from "lucide-react";
import {
  motion,
  AnimatePresence,
  type Variants,
  type Transition,
} from "framer-motion";

// UI + AI elements
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/source";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { CometCard } from "@/components/ui/comet-card";

// Animations
const springTransition: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 18,
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const stagger: Variants = { show: { transition: { staggerChildren: 0.08 } } };

const chatReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { ...springTransition, delay: 0.1 } },
};

const models = [
  { name: "GPT 4o", value: "openai/gpt-4o" },
  { name: "Deepseek R1", value: "deepseek/deepseek-r1" },
];

type PersonaId = "hitesh" | "piyush";

const personaOptions = [
  { name: "Hitesh Choudhary", value: "hitesh" },
  { name: "Piyush Garg", value: "piyush" },
] as const;

const hiteshSuggestions = [
  "Haanji, can you teach me JavaScript in simple words?",
  "How do I build my first React project with chai in hand?",
  "Can you explain APIs with a practical example?",
  "What is the best way to learn Python for web development?",
  "Suggest some real-world projects to practice HTML, CSS, and JS.",
  "How do I prepare for a career in full-stack development?",
  "Explain Git and GitHub like you’re teaching a beginner.",
  "Share your favorite tips for staying motivated while coding.",
  "How can I deploy my first Node.js app for free?",
  "Tell me a chai aur code story from your programming journey.",
];

const piyushSuggestions = [
  "How to structure a scalable Next.js app?",
  "Show me a minimal Zod schema for a login API.",
  "What are pragmatic ways to improve API performance?",
  "How to set up testing quickly for a TS project?",
  "What trade-offs between Prisma and Drizzle?",
  "How to add keyset pagination to a list endpoint?",
  "Give a pattern for feature-based architecture in Next.js.",
  "How to avoid N+1 queries with an ORM?",
  "When to use Server Actions vs API routes?",
  "What metrics should I monitor in production?",
];

export default function HomePage() {
  const [showChat, setShowChat] = useState(false);

  // Chat state
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  const [persona, setPersona] = useState<PersonaId>("hitesh");
  const [webSearch, setWebSearch] = useState(false);
  const { messages, sendMessage, status } = useChat();

  const suggestions = useMemo(() => {
    return persona === "hitesh" ? hiteshSuggestions : piyushSuggestions;
  }, [persona]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: { model: model, webSearch: webSearch, persona: persona },
        },
      );
      setInput("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(
      { text: suggestion },
      { body: { model: model, webSearch: webSearch, persona: persona } },
    );
  };

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      {/* Top nav */}
      <div className="absolute right-6 top-6 z-50 flex items-center gap-3">
        <Link
          href="/showcase"
          className="text-sm text-muted-foreground hover:underline"
        >
          Showcase
        </Link>
        <ModeToggle />
      </div>

      {/* Background accents (same as landing) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.2 }}
          className="absolute left-1/2 top-[-10%] size-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-sky-400/20 to-fuchsia-400/20 blur-3xl"
        />
      </div>

      {/* Landing content */}
      <AnimatePresence>
        {!showChat && (
          <motion.section
            key="landing"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.98, filter: "blur(2px)" }}
            className="mx-auto flex max-w-6xl flex-col items-center px-6 pt-28 md:pt-32"
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
              Build AI chats that feel human. Pick a ready-made persona or
              create your own, and start real conversations in minutes.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <Button
                size="lg"
                className="gap-2"
                onClick={() => setShowChat(true)}
              >
                Start Chatting
              </Button>
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

            {/* Features */}
            <section
              id="features"
              className="mx-auto mt-12 w-full max-w-6xl pb-8"
            >
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
                    <div className="mt-1 text-sm text-muted-foreground">
                      {f.desc}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Chat UI */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            key="chat"
            variants={chatReveal}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: 8 }}
            className="max-w-4xl mx-auto p-6 relative size-full min-h-[80dvh]"
          >
            <div className="flex flex-col h-[80dvh]">
              <Conversation className="h-full">
                <ConversationContent>
                  {messages.map((message) => (
                    <div key={message.id}>
                      {message.role === "assistant" && (
                        <Sources>
                          {message.parts.map((part, i) => {
                            switch (part.type) {
                              case "source-url":
                                return (
                                  <>
                                    <SourcesTrigger
                                      count={
                                        message.parts.filter(
                                          (part) => part.type === "source-url",
                                        ).length
                                      }
                                    />
                                    <SourcesContent key={`${message.id}-${i}`}>
                                      <Source
                                        key={`${message.id}-${i}`}
                                        href={part.url}
                                        title={part.url}
                                      />
                                    </SourcesContent>
                                  </>
                                );
                            }
                          })}
                        </Sources>
                      )}
                      <Message from={message.role} key={message.id}>
                        <MessageContent>
                          {message.parts.map((part, i) => {
                            switch (part.type) {
                              case "text":
                                return (
                                  <Response key={`${message.id}-${i}`}>
                                    {part.text}
                                  </Response>
                                );
                              case "reasoning":
                                return (
                                  <Reasoning
                                    key={`${message.id}-${i}`}
                                    className="w-full"
                                    isStreaming={status === "streaming"}
                                  >
                                    <ReasoningTrigger />
                                    <ReasoningContent>
                                      {part.text}
                                    </ReasoningContent>
                                  </Reasoning>
                                );
                              default:
                                return null;
                            }
                          })}
                        </MessageContent>
                      </Message>
                    </div>
                  ))}
                  {status === "submitted" && <Loader />}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>

              <Suggestions>
                {suggestions.map((suggestion) => (
                  <Suggestion
                    key={suggestion}
                    onClick={handleSuggestionClick}
                    suggestion={suggestion}
                  />
                ))}
              </Suggestions>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={springTransition}
              >
                <PromptInput onSubmit={handleSubmit} className="mt-4">
                  <PromptInputTextarea
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                  />
                  <PromptInputToolbar>
                    <PromptInputTools>
                      <PromptInputButton
                        variant={webSearch ? "default" : "ghost"}
                        onClick={() => setWebSearch(!webSearch)}
                      >
                        <GlobeIcon size={16} />
                        <span>Search</span>
                      </PromptInputButton>
                      <PromptInputModelSelect
                        onValueChange={(value) => setModel(value)}
                        value={model}
                      >
                        <PromptInputModelSelectTrigger>
                          <PromptInputModelSelectValue />
                        </PromptInputModelSelectTrigger>
                        <PromptInputModelSelectContent>
                          {models.map((model) => (
                            <PromptInputModelSelectItem
                              key={model.value}
                              value={model.value}
                            >
                              {model.name}
                            </PromptInputModelSelectItem>
                          ))}
                        </PromptInputModelSelectContent>
                      </PromptInputModelSelect>
                      <PromptInputModelSelect
                        onValueChange={(value) =>
                          setPersona(value as PersonaId)
                        }
                        value={persona}
                      >
                        <PromptInputModelSelectTrigger>
                          <PromptInputModelSelectValue />
                        </PromptInputModelSelectTrigger>
                        <PromptInputModelSelectContent>
                          {personaOptions.map((p) => (
                            <PromptInputModelSelectItem
                              key={p.value}
                              value={p.value}
                            >
                              {p.name}
                            </PromptInputModelSelectItem>
                          ))}
                        </PromptInputModelSelectContent>
                      </PromptInputModelSelect>
                    </PromptInputTools>
                    <PromptInputSubmit disabled={!input} status={status} />
                  </PromptInputToolbar>
                </PromptInput>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
