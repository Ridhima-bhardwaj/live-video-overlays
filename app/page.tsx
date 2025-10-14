"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverlayEditor } from "@/components/overlay-editor"
import { VideoPlayer } from "@/components/video-player"
import { fetcher, api } from "@/lib/api"
import type { Overlay } from "@/lib/types"

export default function HomePage() {
  const [streamKey, setStreamKey] = useState("default")
  const [rtspUrl, setRtspUrl] = useState("rtsp://username:password@camera-ip/stream")

  // HLS URL served by Flask: http://localhost:5000/hls/{streamKey}/index.m3u8
  const hlsUrl = (process.env.NEXT_PUBLIC_HLS_BASE || "http://localhost:5000/hls") + `/${streamKey}/index.m3u8`

  const { data: overlays, mutate } = useSWR<Overlay[]>(
    `${api.base}/api/overlays?stream_key=${encodeURIComponent(streamKey)}`,
    fetcher,
  )

  const [starting, setStarting] = useState(false)

  async function startStream() {
    try {
      setStarting(true)
      await fetch(`${api.base}/api/stream/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stream_key: streamKey, rtsp_url: rtspUrl }),
      })
    } finally {
      setStarting(false)
    }
  }

  return (
    <main className="min-h-dvh p-6 md:p-10">
      <div className="mx-auto max-w-6xl grid gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">RTSP Live with Overlays</h1>
          <Button asChild>
            <a href="/docs">Docs</a>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Stream Controls</CardTitle>
            <CardDescription>Provide your RTSP URL and a stream key, then start transcoding to HLS.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="streamKey">Stream Key</Label>
              <Input
                id="streamKey"
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
                placeholder="default"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="rtsp">RTSP URL</Label>
              <Input
                id="rtsp"
                value={rtspUrl}
                onChange={(e) => setRtspUrl(e.target.value)}
                placeholder="rtsp://username:password@camera-ip/stream"
              />
            </div>
            <div className="md:col-span-3">
              <Button onClick={startStream} disabled={starting} className="w-full md:w-auto">
                {starting ? "Starting…" : "Start Stream (FFmpeg)"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3">
            <VideoPlayer hlsUrl={hlsUrl} overlays={overlays || []} />
          </div>
          <div className="md:col-span-2">
            <Tabs defaultValue="overlays">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="overlays">Overlays</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overlays">
                <OverlayEditor streamKey={streamKey} overlays={overlays || []} onChanged={() => mutate()} />
              </TabsContent>
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Frontend Settings</CardTitle>
                    <CardDescription>
                      HLS Base: {process.env.NEXT_PUBLIC_HLS_BASE || "http://localhost:5000/hls"}
                      <br />
                      API Base: {api.base}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  )
}
