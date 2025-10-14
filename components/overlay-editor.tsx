"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import type { Overlay } from "@/lib/types"

type Props = {
  streamKey: string
  overlays: Overlay[]
  onChanged?: () => void
}

const emptyOverlay: Overlay = {
  _id: "",
  stream_key: "",
  type: "text",
  x: 24,
  y: 24,
  width: undefined,
  height: undefined,
  text: "Live",
  color: "#ffffff",
  bgColor: "rgba(0,0,0,0.2)",
  fontSize: 20,
  opacity: 1,
  url: "",
  alt: "logo",
}

export function OverlayEditor({ streamKey, overlays, onChanged }: Props) {
  const [editing, setEditing] = useState<Overlay>({ ...emptyOverlay, stream_key: streamKey })
  const isNew = useMemo(() => !editing._id, [editing._id])

  function selectForEdit(ov: Overlay) {
    setEditing({ ...ov })
  }

  async function save() {
    const payload = { ...editing, stream_key: streamKey }
    const res = await fetch(isNew ? `${api.base}/api/overlays` : `${api.base}/api/overlays/${editing._id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      // eslint-disable-next-line no-alert
      alert("Failed to save overlay")
      return
    }
    setEditing({ ...emptyOverlay, stream_key: streamKey })
    onChanged?.()
  }

  async function remove(id: string) {
    const res = await fetch(`${api.base}/api/overlays/${id}`, { method: "DELETE" })
    if (!res.ok) {
      // eslint-disable-next-line no-alert
      alert("Failed to delete overlay")
      return
    }
    if (editing._id === id) {
      setEditing({ ...emptyOverlay, stream_key: streamKey })
    }
    onChanged?.()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overlays</CardTitle>
        <CardDescription>Create or edit text and logo overlays.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label>Type</Label>
          <Select value={editing.type} onValueChange={(v) => setEditing((s) => ({ ...s, type: v as Overlay["type"] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="image">Image</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {editing.type === "text" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="text">Text</Label>
              <Input
                id="text"
                value={editing.text || ""}
                onChange={(e) => setEditing((s) => ({ ...s, text: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Text Color</Label>
              <Input
                id="color"
                type="color"
                value={editing.color || "#ffffff"}
                onChange={(e) => setEditing((s) => ({ ...s, color: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bgColor">Background</Label>
              <Input
                id="bgColor"
                value={editing.bgColor || ""}
                onChange={(e) => setEditing((s) => ({ ...s, bgColor: e.target.value }))}
                placeholder="e.g. rgba(0,0,0,0.2)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Input
                id="fontSize"
                type="number"
                value={editing.fontSize || 18}
                onChange={(e) => setEditing((s) => ({ ...s, fontSize: Number(e.target.value || 0) }))}
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="imgUrl">Image URL</Label>
              <Input
                id="imgUrl"
                value={editing.url || ""}
                onChange={(e) => setEditing((s) => ({ ...s, url: e.target.value }))}
                placeholder="/logo.png or https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="alt">Alt</Label>
              <Input
                id="alt"
                value={editing.alt || ""}
                onChange={(e) => setEditing((s) => ({ ...s, alt: e.target.value }))}
              />
            </div>
          </div>
        )}

        <Separator />

        <div className="grid gap-3 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="x">X</Label>
            <Input
              id="x"
              type="number"
              value={editing.x}
              onChange={(e) => setEditing((s) => ({ ...s, x: Number(e.target.value || 0) }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="y">Y</Label>
            <Input
              id="y"
              type="number"
              value={editing.y}
              onChange={(e) => setEditing((s) => ({ ...s, y: Number(e.target.value || 0) }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="opacity">Opacity</Label>
            <Input
              id="opacity"
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={editing.opacity ?? 1}
              onChange={(e) => setEditing((s) => ({ ...s, opacity: Number(e.target.value || 0) }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="width">Width (px)</Label>
            <Input
              id="width"
              type="number"
              value={editing.width ?? ""}
              onChange={(e) =>
                setEditing((s) => ({ ...s, width: e.target.value ? Number(e.target.value) : undefined }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="height">Height (px)</Label>
            <Input
              id="height"
              type="number"
              value={editing.height ?? ""}
              onChange={(e) =>
                setEditing((s) => ({ ...s, height: e.target.value ? Number(e.target.value) : undefined }))
              }
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={save}>{!isNew ? "Update Overlay" : "Create Overlay"}</Button>
          {!isNew && (
            <Button variant="destructive" onClick={() => remove(editing._id!)}>
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={() => setEditing({ ...emptyOverlay, stream_key: streamKey })}>
            Reset
          </Button>
        </div>

        <Separator />

        <div className="grid gap-3">
          <Label>Existing Overlays</Label>
          <div className="grid gap-2">
            {overlays.length === 0 && <p className="text-muted-foreground">No overlays yet.</p>}
            {overlays.map((ov) => (
              <div key={ov._id} className="flex items-center justify-between rounded-md border p-3">
                <div className="text-sm">
                  <div className="font-medium">{ov.type.toUpperCase()}</div>
                  {ov.type === "text" ? (
                    <div className="text-muted-foreground">{ov.text}</div>
                  ) : (
                    <div className="text-muted-foreground">{ov.url}</div>
                  )}
                  <div className="text-muted-foreground">
                    pos: ({ov.x}, {ov.y})
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => selectForEdit(ov)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(ov._id!)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
