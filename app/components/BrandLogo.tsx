import Image from "next/image";
import Link from "next/link";
import {
  BRAND_LOGO_ALT,
  BRAND_LOGO_PATH,
  BRAND_NAME,
} from "@/app/lib/brand/logo";

const sizeMap = {
  sm: { className: "h-8 w-8", size: 32 },
  md: { className: "h-11 w-11", size: 44 },
  lg: { className: "h-12 w-12", size: 48 },
} as const;

type BrandLogoProps = {
  size?: keyof typeof sizeMap;
  showWordmark?: boolean;
  href?: string;
  className?: string;
  wordmarkClassName?: string;
  priority?: boolean;
};

export function BrandLogo({
  size = "sm",
  showWordmark = true,
  href,
  className = "",
  wordmarkClassName = "",
  priority = false,
}: BrandLogoProps) {
  const dimensions = sizeMap[size];

  const content = (
    <>
      <Image
        src={BRAND_LOGO_PATH}
        alt={BRAND_LOGO_ALT}
        width={dimensions.size}
        height={dimensions.size}
        priority={priority}
        className={`${dimensions.className} shrink-0 rounded-[4px] object-cover ${className}`}
      />
      {showWordmark ? (
        <span className={wordmarkClassName}>{BRAND_NAME}</span>
      ) : null}
    </>
  );

  const wrapperClass = showWordmark
    ? "flex items-center gap-2"
    : "inline-flex items-center justify-center";

  if (href) {
    return (
      <Link
        href={href}
        className={`pressable ${wrapperClass} transition-opacity hover:opacity-70 active:opacity-50`}
      >
        {content}
      </Link>
    );
  }

  return <span className={wrapperClass}>{content}</span>;
}
