// Simple API wrapper for Flask backend
export const api = {
  base: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000",
}

export async function fetcher(url: string) {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Network error")
  return res.json()
}
