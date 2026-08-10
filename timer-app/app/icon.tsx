import { ImageResponse } from "next/og";
import { PencilIcon } from "@/lib/pencil-icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<PencilIcon size={size.width} />, { ...size });
}
