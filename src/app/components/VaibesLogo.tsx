import svgPaths from "../../imports/LogoFinalVaibes/svg-9wl9abcvf6";

const INK = "#F5F5F7";
const DARK = "#000000";

export function VaibesLogo({ height = 28, invert = false }: { height?: number; invert?: boolean }) {
  const w = Math.round(height * 2.42);
  const fill = invert ? "#0A0A0A" : INK;
  const cut = invert ? "#FFC7FF" : DARK;

  return (
    <svg width={w} height={height} viewBox="130 450 1295 550" fill="none" aria-label="Vaibes">
      <path d={svgPaths.p242c5100} fill={fill} />
      <path d={svgPaths.p37679100} fill={fill} />
      <path d={svgPaths.p7d51d00} fill={cut} />
      <path d={svgPaths.p3ff27800} fill={cut} />
      <path d={svgPaths.p2321f880} fill={cut} />
    </svg>
  );
}
