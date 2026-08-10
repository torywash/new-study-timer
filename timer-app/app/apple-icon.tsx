import { ImageResponse } from "next/og";
import { PencilIcon } from "@/lib/pencil-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<PencilIcon size={size.width} />, { ...size });
}
