export function mediaSrc(id: string, width = 1200, height = 1200) {
  if (id.startsWith("/") || id.startsWith("http")) return id;
  return `https://images.unsplash.com/${id}?w=${width}&h=${height}&fit=crop&auto=format`;
}

export function mediaObjectClass(id: string) {
  if (/\.(jpe?g|webp)$/i.test(id) || /mockup|thumb/i.test(id)) return "object-center";
  return id.startsWith("/") ? "object-top" : "object-center";
}

export function mediaThumbStyle(scale?: number) {
  if (!scale || scale === 1) return undefined;
  return { ["--thumb-scale" as string]: String(scale) };
}
