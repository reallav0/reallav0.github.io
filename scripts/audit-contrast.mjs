const colors = {
  lightPage: "#f5f5f7",
  lightSurface: "#ffffff",
  lightInk: "#0f0f11",
  lightInkSoft: "#343438",
  lightMuted: "#6e6e73",
  lightFaint: "#707076",
  lightFocus: "#1678d3",
  darkPage: "#000000",
  darkSurface: "#120609",
  darkInk: "#e7d2e5",
  darkInkSoft: "#e7d2e5",
  darkMuted: "#b79fb7",
  darkFaint: "#b79fb7",
  darkFocus: "#e64670",
  contact: "#000000",
  contactMuted: "#b79fb7",
  stageSurface: "#000000",
  stageInk: "#e7d2e5",
  stageMuted: "#b79fb7",
};

function toRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => channel / 255);
}

function luminance(hex) {
  const [red, green, blue] = toRgb(hex).map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function ratio(foreground, background) {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

const pairs = [
  ["light ink / page", colors.lightInk, colors.lightPage, 4.5],
  ["light ink-soft / page", colors.lightInkSoft, colors.lightPage, 4.5],
  ["light muted / page", colors.lightMuted, colors.lightPage, 4.5],
  ["light faint / page", colors.lightFaint, colors.lightPage, 4.5],
  ["light focus / page", colors.lightFocus, colors.lightPage, 3],
  ["light ink / surface", colors.lightInk, colors.lightSurface, 4.5],
  ["dark ink / page", colors.darkInk, colors.darkPage, 4.5],
  ["dark ink-soft / page", colors.darkInkSoft, colors.darkPage, 4.5],
  ["dark muted / page", colors.darkMuted, colors.darkPage, 4.5],
  ["dark faint / page", colors.darkFaint, colors.darkPage, 4.5],
  ["dark focus / page", colors.darkFocus, colors.darkPage, 3],
  ["dark ink / surface", colors.darkInk, colors.darkSurface, 4.5],
  ["contact ink / contact", colors.darkInk, colors.contact, 4.5],
  ["contact muted / contact", colors.contactMuted, colors.contact, 4.5],
  ["stage ink / stage", colors.stageInk, colors.stageSurface, 4.5],
  ["stage muted / stage", colors.stageMuted, colors.stageSurface, 4.5],
];

let failed = false;
for (const [name, foreground, background, threshold] of pairs) {
  const result = ratio(foreground, background);
  const passes = result >= threshold;
  failed ||= !passes;
  console.log(`${passes ? "PASS" : "FAIL"} ${result.toFixed(2)}:1  ${name} (needs ${threshold}:1)`);
}

if (failed) process.exitCode = 1;
