import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";

type CapabilityItem = {
  num: string;
  title: string;
  desc: string;
};

const CAP_IMAGES = [
  "photo-1542744173-8e7e53415bb0",
  "photo-1561070791-2526d30994b5",
  "photo-1498050108023-c5249f4df085",
  "photo-1512941937669-90a1b58e7e9c",
  "photo-1460925895917-afdab827c52f",
];

type CapabilitiesPreviewProps = {
  items: CapabilityItem[];
  onSelect: () => void;
};

export function CapabilitiesPreview({ items, onSelect }: CapabilitiesPreviewProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    const slider = sliderRef.current;
    if (!list || !preview || !slider) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });

    const xTo = gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3" });
    const yTo = gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3" });

    let primed = false;
    let active = false;

    const onMove = (event: MouseEvent) => {
      if (!primed) {
        gsap.set(preview, { x: event.clientX, y: event.clientY });
        primed = true;
      }
      xTo(event.clientX);
      yTo(event.clientY);
    };

    const show = () => {
      if (active) return;
      active = true;
      gsap.to(preview, { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out", overwrite: "auto" });
    };

    const hide = () => {
      active = false;
      gsap.to(preview, { scale: 0, opacity: 0, duration: 0.3, ease: "power3.in", overwrite: "auto" });
    };

    const rows = Array.from(list.querySelectorAll<HTMLElement>("[data-cap-index]"));
    const enterHandlers = rows.map((row) => {
      const onEnter = () => {
        const index = Number(row.dataset.capIndex);
        gsap.to(slider, {
          y: -index * preview.offsetHeight,
          duration: 0.45,
          ease: "power3.out",
          overwrite: "auto",
        });
        show();
      };
      row.addEventListener("mouseenter", onEnter);
      return { row, onEnter };
    });

    list.addEventListener("mousemove", onMove);
    list.addEventListener("mouseleave", hide);

    return () => {
      list.removeEventListener("mousemove", onMove);
      list.removeEventListener("mouseleave", hide);
      enterHandlers.forEach(({ row, onEnter }) => row.removeEventListener("mouseenter", onEnter));
      gsap.killTweensOf([preview, slider]);
    };
  }, [items]);

  return (
    <div ref={listRef} className="caps-list">
      {items.map((cap, index) => (
        <button
          key={cap.num}
          type="button"
          data-cap-index={index}
          className="caps-row"
          onClick={onSelect}
        >
          <span className="caps-row-num">{cap.num}</span>
          <span className="caps-row-copy">
            <span className="caps-row-title">{cap.title}</span>
            <span className="caps-row-desc">{cap.desc}</span>
          </span>
          <ArrowUpRight size={16} className="caps-row-icon" />
        </button>
      ))}

      <div ref={previewRef} className="caps-preview" aria-hidden="true">
        <div ref={sliderRef} className="caps-preview-slider">
          {items.map((cap, index) => (
            <div key={cap.num} className="caps-preview-slide">
              <img
                src={`https://images.unsplash.com/${CAP_IMAGES[index]}?w=720&h=900&fit=crop&auto=format`}
                alt=""
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
