import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import gsap from "gsap";

const PATH_COUNT = 2;
const POINT_COUNT = 8;
const DELAY_POINTS_MAX = 0.12;
const DELAY_PER_PATH = 0.08;
const DURATION = 0.48;

export type PageMorphHandle = {
  play: (onCovered: () => void) => Promise<void>;
  isPlaying: () => boolean;
};

function buildPath(points: number[], covering: boolean) {
  let d = covering ? `M 0 0 V ${points[0]} C` : `M 0 ${points[0]} C`;
  for (let i = 0; i < POINT_COUNT - 1; i += 1) {
    const p = ((i + 1) / (POINT_COUNT - 1)) * 100;
    const cp = p - (1 / (POINT_COUNT - 1) * 100) / 2;
    d += ` ${cp} ${points[i]} ${cp} ${points[i + 1]} ${p} ${points[i + 1]}`;
  }
  d += covering ? " V 100 H 0" : " V 0 H 0";
  return d;
}

export const PageMorph = forwardRef<PageMorphHandle>(function PageMorph(_, ref) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const pointsRef = useRef<number[][]>(
    Array.from({ length: PATH_COUNT }, () => Array.from({ length: POINT_COUNT }, () => 100)),
  );
  const coveringRef = useRef(true);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const playingRef = useRef(false);

  const paint = () => {
    const covering = coveringRef.current;
    pathRefs.current.forEach((path, index) => {
      if (!path) return;
      path.setAttribute("d", buildPath(pointsRef.current[index], covering));
    });
  };

  const runWave = (covering: boolean) =>
    new Promise<void>((resolve) => {
      coveringRef.current = covering;
      pointsRef.current.forEach((points) => {
        for (let i = 0; i < POINT_COUNT; i += 1) points[i] = 100;
      });
      paint();

      timelineRef.current?.kill();
      const delays = Array.from({ length: POINT_COUNT }, () => Math.random() * DELAY_POINTS_MAX);
      const timeline = gsap.timeline({
        onUpdate: paint,
        onComplete: resolve,
        defaults: { ease: "power3.inOut", duration: DURATION },
      });
      timelineRef.current = timeline;

      for (let pathIndex = 0; pathIndex < PATH_COUNT; pathIndex += 1) {
        const points = pointsRef.current[pathIndex];
        const pathDelay = DELAY_PER_PATH * (covering ? pathIndex : PATH_COUNT - pathIndex - 1);
        for (let pointIndex = 0; pointIndex < POINT_COUNT; pointIndex += 1) {
          timeline.to(points, { [pointIndex]: 0 }, delays[pointIndex] + pathDelay);
        }
      }
    });

  useImperativeHandle(ref, () => ({
    isPlaying: () => playingRef.current,
    play: async (onCovered: () => void) => {
      if (playingRef.current) return;
      playingRef.current = true;
      svgRef.current?.classList.add("is-active");
      await runWave(true);
      onCovered();
      await runWave(false);
      svgRef.current?.classList.remove("is-active");
      playingRef.current = false;
    },
  }));

  useEffect(() => {
    paint();
    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="page-morph"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="morph-fill-a" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFC7FF" />
          <stop offset="100%" stopColor="#E89AE8" />
        </linearGradient>
        <linearGradient id="morph-fill-b" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1A1A1A" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
      </defs>
      <path
        ref={(node) => {
          pathRefs.current[0] = node;
        }}
        fill="url(#morph-fill-a)"
      />
      <path
        ref={(node) => {
          pathRefs.current[1] = node;
        }}
        fill="url(#morph-fill-b)"
      />
    </svg>
  );
});
