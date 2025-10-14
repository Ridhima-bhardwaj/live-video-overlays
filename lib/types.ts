export type Overlay = {
  _id?: string
  stream_key: string
  type: "text" | "image"
  x: number
  y: number
  width?: number
  height?: number
  opacity?: number

  // Text fields
  text?: string
  color?: string
  bgColor?: string
  fontSize?: number

  // Image fields
  url?: string
  alt?: string
}
