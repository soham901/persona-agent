"use client";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllPersonas } from "@/lib/personas";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { motion } from "framer-motion";

const personas = getAllPersonas();
export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-8 py-20 space-y-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-bold tracking-tight">Showcase</h1>
          <div className="w-24 h-px bg-border mx-auto"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore the personas and their unique teaching styles
          </p>
        </div>
        <Tabs defaultValue="data" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="data">Data Summary</TabsTrigger>
            <TabsTrigger value="samples">Sample Chats</TabsTrigger>
          </TabsList>
          <TabsContent value="data" className="mt-8">
            <div className="grid gap-8">
              {personas.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden">
                    <CardHeader className="bg-card border-b pb-6">
                      <div className="flex items-center gap-6 p-2">
                        <motion.div
                          className="relative w-32 flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="relative overflow-hidden rounded-xl border bg-muted shadow">
                            <AspectRatio ratio={1 / 1}>
                              <motion.div
                                className="w-full h-full"
                                initial={{ filter: "grayscale(100%)" }}
                                whileHover={{ filter: "grayscale(0%)" }}
                                transition={{ duration: 0.7 }}
                              >
                                <Image
                                  src={
                                    p.id === "hitesh"
                                      ? "/hitesh.jpg"
                                      : "/piyush.jpeg"
                                  }
                                  alt={`${p.displayName} photo`}
                                  fill
                                  className="object-cover"
                                />
                              </motion.div>
                            </AspectRatio>
                          </div>
                        </motion.div>
                        <div className="flex-1">
                          <CardTitle className="text-3xl font-bold tracking-tight">
                            {p.displayName}
                          </CardTitle>
                          <p className="text-muted-foreground text-base leading-relaxed text-pretty">
                            {p.bio ||
                              "Expert instructor with deep knowledge in software development and teaching methodologies."}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      <motion.div
                        className="bg-muted rounded-xl p-6 border"
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-xl font-bold">Tone & Style</h3>
                        </div>
                        <div className="space-y-3 text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <span className="font-semibold min-w-[5rem]">
                              Language:
                            </span>
                            <span>{p.tone.language}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-semibold min-w-[5rem]">
                              Style:
                            </span>
                            <span>{p.tone.style.join(" • ")}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-semibold min-w-[5rem]">
                              Phrases:
                            </span>
                            <span>
                              {'"' + p.tone.catchphrases.join('" • "') + '"'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                      <motion.div
                        className="bg-muted rounded-xl p-6 border"
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-xl font-bold">Tech Stack</h3>
                        </div>
                        <div className="space-y-3 text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <span className="font-semibold min-w-[6rem]">
                              Stack:
                            </span>
                            <span>{p.defaults.stack.join(" • ")}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-semibold min-w-[6rem]">
                              Tools:
                            </span>
                            <span>{p.defaults.tools.join(" • ")}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-semibold min-w-[6rem]">
                              Deploy:
                            </span>
                            <span>{p.defaults.deployment.join(" • ")}</span>
                          </div>
                        </div>
                      </motion.div>
                      <motion.div
                        className="bg-muted rounded-xl p-6 border"
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-xl font-bold">Guidelines</h3>
                        </div>
                        <ul className="space-y-2 text-muted-foreground">
                          {p.guidelines.map((g) => (
                            <li key={g} className="flex items-start gap-3">
                              <span className="text-muted-foreground mt-1">
                                •
                              </span>
                              <span className="leading-relaxed">{g}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                      <motion.div
                        className="bg-muted rounded-xl p-6 border"
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-xl font-bold">Sources</h3>
                        </div>
                        <ul className="space-y-2 text-muted-foreground">
                          {p.sources.map((s) => (
                            <li key={s.url} className="flex items-start gap-3">
                              <span className="text-muted-foreground mt-1">
                                •
                              </span>
                              <a
                                className="underline decoration-muted-foreground/40 hover:decoration-muted-foreground/60 hover:text-foreground transition-colors duration-300"
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {s.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="samples" className="mt-8">
            <div className="space-y-8">
              {personas.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="bg-card border shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden">
                    <CardHeader className="bg-card border-b pb-6">
                      <div className="flex items-center gap-6 p-2">
                        <motion.div
                          className="relative w-24 flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="relative overflow-hidden rounded-lg border bg-muted shadow">
                            <AspectRatio ratio={1 / 1}>
                              <Image
                                src={
                                  p.id === "hitesh"
                                    ? "/hitesh.jpg"
                                    : "/piyush.jpeg"
                                }
                                alt={`${p.displayName} photo`}
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-out hover:scale-110"
                              />
                            </AspectRatio>
                          </div>
                        </motion.div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl font-bold">
                            Sample Chats - {p.displayName}
                          </CardTitle>
                          <p className="text-muted-foreground text-sm mt-1 text-pretty">
                            {p.bio ||
                              "Expert instructor with deep knowledge in software development and teaching methodologies."}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      {p.fewShots.map((fs, i) => (
                        <motion.div
                          key={i}
                          className="bg-muted rounded-xl p-6 border"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.1 }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-5 bg-muted-foreground/30 rounded-full"></div>
                                <span className="font-bold">User</span>
                              </div>
                              <div className="text-foreground bg-card rounded-lg p-4 border shadow-sm">
                                {fs.user}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-5 bg-muted-foreground/30 rounded-full"></div>
                                <span className="font-bold">
                                  {p.displayName}
                                </span>
                              </div>
                              <pre className="whitespace-pre-wrap leading-relaxed p-4 rounded-lg bg-muted border text-foreground shadow-sm">
                                {fs.assistant}
                              </pre>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
