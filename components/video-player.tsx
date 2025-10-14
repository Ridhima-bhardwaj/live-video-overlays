"use client"

import type React from "react"

import Hls from "hls.js"
import { useEffect, useRef } from "react"
import type { Overlay } from "@/lib/types"
import { cn } from "@/lib/utils"

type Props = {
  hlsUrl: string
  overlays: Overlay[]
}

export function VideoPlayer({ hlsUrl, overlays }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl
      video.play().catch(() => {})
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true })
      hlsRef.current = hls
      hls.loadSource(hlsUrl)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {})
      })
    } else {
      // Fallback text
      // eslint-disable-next-line no-console
      console.warn("HLS not supported in this browser.")
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [hlsUrl])

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-card">
      <video
        ref={videoRef}
        controls
        playsInline
        className="w-full h-full object-contain bg-black"
        crossOrigin="anonymous"
      />
      {/* Overlay layer */}
      <div className="pointer-events-none absolute inset-0">
        {overlays.map((ov) => {
          const style: React.CSSProperties = {
            position: "absolute",
            left: `${ov.x}px`,
            top: `${ov.y}px`,
            opacity: ov.opacity ?? 1,
            width: ov.width ? `${ov.width}px` : undefined,
            height: ov.height ? `${ov.height}px` : undefined,
          }
          if (ov.type === "text") {
            return (
              <div key={ov._id} style={style} className={cn("px-2 py-1 rounded")}>
                <span
                  style={{
                    color: ov.color || "white",
                    fontSize: ov.fontSize ? `${ov.fontSize}px` : "18px",
                    fontWeight: 600,
                    textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                    backgroundColor: ov.bgColor || "transparent",
                  }}
                >
                  {ov.text || ""}
                </span>
              </div>
            )
          }
          return (
            <img
              key={ov._id}
              src={ov.url || "/placeholder.svg?height=80&width=120&query=overlay%20logo"} // hard-coded query
              alt={ov.alt || "overlay logo"}
              style={style}
              className="object-contain"
              crossOrigin="anonymous"
            />
          )
        })}
      </div>
    </div>
  )
}
