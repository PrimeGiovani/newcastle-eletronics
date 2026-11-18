import { ImageResponse } from "next/og";
export const alt = "Newcastle Electronics – Smart Living Made Easy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#F5F5F7", color: "#1D1D1F", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 30, color: "#E8590C", fontWeight: 600 }}>NEWCASTLE ELECTRONICS</div>
      <div style={{ fontSize: 92, fontWeight: 600, letterSpacing: -3, marginTop: 16, lineHeight: 1.05 }}>Smart Living Made Easy.</div>
      <div style={{ fontSize: 34, marginTop: 24, color: "#6E6E73" }}>Air Conditioners · Sound System · Kitchen · Solar</div>
    </div>, size);
}
