import NextImage from "next/image";
import { cn } from "@/lib/utils";
import type { Experimental_GeneratedImage } from "ai";

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
};

export const Image = ({
  base64,
  uint8Array,
  mediaType,
  ...props
}: ImageProps) => {
  // Convert uint8Array to base64 string if needed
  const imageData = uint8Array
    ? `data:${mediaType};base64,${Buffer.from(uint8Array).toString("base64")}`
    : `data:${mediaType};base64,${base64}`;

  return (
    <NextImage
      {...props}
      src={imageData}
      alt={props.alt || ""}
      width={0}
      height={0}
      className={cn(
        "max-w-full h-auto rounded-md overflow-hidden",
        props.className,
      )}
    />
  );
};
