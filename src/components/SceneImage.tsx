import heroSmall from "@/media/hero-1280.webp";
import heroMedium from "@/media/hero-1920.webp";
import heroLarge from "@/media/hero-2880.webp";
import heroPortrait from "@/media/hero-portrait.webp";
import assemblySmall from "@/media/assembly-1280.webp";
import assemblyMedium from "@/media/assembly-1920.webp";
import assemblyLarge from "@/media/assembly-2880.webp";

const IMAGES = {
  hero: [heroSmall, heroMedium, heroLarge],
  assembly: [assemblySmall, assemblyMedium, assemblyLarge],
};

export default function SceneImage({ scene }: { scene: keyof typeof IMAGES }) {
  const images = IMAGES[scene];
  return (
    <picture>
      {scene === "hero" && <source media="(max-width: 639px) and (orientation: portrait)" srcSet={heroPortrait.src} />}
      <img
        src={images[1].src}
        srcSet={images.map((image) => `${image.src} ${image.width}w`).join(", ")}
        sizes="(max-aspect-ratio: 16/9) calc(177.8vh - 128px), 100vw"
        width={images[1].width}
        height={images[1].height}
        alt=""
        loading="eager"
        fetchPriority={scene === "hero" ? "high" : "low"}
        className="h-full w-full object-cover object-center"
      />
    </picture>
  );
}
