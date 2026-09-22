import Image from "next/image";

export default function BrandLogo() {
  return (
    <span className="brand-logo">
      <Image
        src="/brand/realnpc-logo.png"
        alt="RealNPC"
        width={2574}
        height={1088}
        className="brand-logo-image"
        loading="eager"
        unoptimized
      />
    </span>
  );
}
