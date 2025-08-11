import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt?: string;
  className?: string;
};

export function PitchImage({ src, alt = "Pitch image", className }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={90}
      height={90}
      className={cn("h-[90px] w-[90px] object-cover rounded-2xl", className)}
      quality={95}
      priority={true}
    />
  );
}
