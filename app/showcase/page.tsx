"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllPersonas, buildSystemPrompt } from '@/lib/personas';
import { ModeToggle } from '@/components/ui/mode-toggle';
import Image from 'next/image';

const personas = getAllPersonas();

export default function ShowcasePage() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Persona Showcase</h1>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            Chat
          </Link>
          <ModeToggle />
        </div>
      </div>

      <Tabs defaultValue="data" className="w-full">
        <TabsList>
          <TabsTrigger value="data">Data Summary</TabsTrigger>
          <TabsTrigger value="samples">Sample Chats</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {personas.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle>{p.displayName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Tone</div>
                    <ul className="text-sm list-disc pl-5">
                      <li>Language: {p.tone.language}</li>
                      <li>Style: {p.tone.style.join(', ')}</li>
                      <li>Catchphrases: {p.tone.catchphrases.join(' | ')}</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Defaults</div>
                    <ul className="text-sm list-disc pl-5">
                      <li>Stack: {p.defaults.stack.join(', ')}</li>
                      <li>Tools: {p.defaults.tools.join(', ')}</li>
                      <li>Deployment: {p.defaults.deployment.join(', ')}</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Guidelines</div>
                    <ul className="text-sm list-disc pl-5">
                      {p.guidelines.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Sources</div>
                    <ul className="text-sm list-disc pl-5">
                      {p.sources.map((s) => (
                        <li key={s.url}>
                          <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                            {s.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="samples" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {personas.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle>Sample chats - {p.displayName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {p.fewShots.map((fs, i) => (
                    <div key={i} className="text-sm">
                      <div className="font-medium">User</div>
                      <div className="mb-2">{fs.user}</div>
                      <div className="font-medium">{p.displayName}</div>
                      <pre className="whitespace-pre-wrap leading-6 p-3 rounded-md bg-muted/50">
                        {fs.assistant}
                      </pre>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
