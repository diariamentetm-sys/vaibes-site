import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { mediaObjectClass, mediaSrc, mediaThumbStyle } from "../utils/media";

gsap.registerPlugin(ScrollTrigger);

export type GalleryProject = {
  id: string;
  name: string;
  tagline: string;
  category: string;
  year: number;
  imageId: string;
  thumbScale?: number;
};

type HorizontalWorkGalleryProps = {
  projects: GalleryProject[];
  label: string;
  title: string[];
  viewAllLabel: string;
  viewAllCta: string;
  viewCaseLabel: string;
  onOpenProject: (id: string) => void;
  onViewAll: () => void;
};

function headerOffset() {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--header-height");
  return parseFloat(value) || 66;
}

export function HorizontalWorkGallery({
  projects,
  label,
  title,
  viewAllLabel,
  viewAllCta,
  viewCaseLabel,
  onOpenProject,
  onViewAll,
}: HorizontalWorkGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [staticScroll, setStaticScroll] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;

    const sizeThumbs = () => {
      const meta = track.querySelector(".work-gallery-meta");
      const metaHeight = meta instanceof HTMLElement ? meta.offsetHeight : 60;
      const styles = getComputedStyle(track);
      const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      const size = Math.max(180, Math.floor(viewport.clientHeight - padY - metaHeight));
      track.style.setProperty("--work-thumb", `${size}px`);
    };

    sizeThumbs();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setStaticScroll(true);
      window.addEventListener("resize", sizeThumbs);
      return () => window.removeEventListener("resize", sizeThumbs);
    }

    const getDistance = () => Math.max(0, track.scrollWidth - section.clientWidth);

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: () => `top ${headerOffset()}px`,
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    const refresh = () => {
      sizeThumbs();
      ScrollTrigger.refresh();
    };
    const images = Array.from(track.querySelectorAll("img"));
    images.forEach((img) => {
      if (!img.complete) img.addEventListener("load", refresh, { once: true });
    });
    window.addEventListener("resize", refresh);

    refresh();

    return () => {
      window.removeEventListener("resize", refresh);
      ctx.revert();
    };
  }, [projects]);

  return (
    <section
      ref={sectionRef}
      className={`work-gallery ed-band ed-band--dark border-t ${staticScroll ? "is-static" : ""}`}
    >
      <div className="work-gallery-header">
        <div>
          <p className="ed-meta uppercase tracking-[0.18em] text-[11px] mb-3">{label}</p>
          <h2 className="ed-heading text-[clamp(1.8rem,4vw,3.2rem)] text-[#F5F5F7]">
            {title[0]} <span className="text-[#6B7280]">{title[1]}</span>
          </h2>
        </div>
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-2 text-sm font-normal text-[#6B7280] hover:text-[#F5F5F7] transition-colors shrink-0"
        >
          {viewAllLabel} <ArrowRight size={14} />
        </button>
      </div>

      <div ref={viewportRef} className="work-gallery-viewport">
        <div ref={trackRef} className="work-gallery-track">
          {projects.map((project) => (
            <article key={project.id} className="work-gallery-card">
              <button
                type="button"
                onClick={() => onOpenProject(project.id)}
                className="work-gallery-media group"
                aria-label={`${viewCaseLabel}: ${project.name}`}
              >
                <img
                  src={mediaSrc(project.imageId, 1200, 1200)}
                  alt={project.name}
                  className={mediaObjectClass(project.imageId)}
                  style={mediaThumbStyle(project.thumbScale)}
                />
                <span className="work-gallery-badge">{project.category}</span>
                <span className="work-gallery-case">
                  {viewCaseLabel} <ArrowUpRight size={14} />
                </span>
              </button>
              <div className="work-gallery-meta">
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.tagline}</p>
                </div>
                <span>{project.year}</span>
              </div>
            </article>
          ))}

          <article className="work-gallery-card work-gallery-card--cta">
            <button type="button" onClick={onViewAll} className="work-gallery-cta">
              <span>{viewAllCta}</span>
              <ArrowRight size={18} />
            </button>
            <div className="work-gallery-meta work-gallery-meta--spacer" aria-hidden="true" />
          </article>
        </div>
      </div>
    </section>
  );
}
