import { readFileSync } from "node:fs";

const tokenFile = new URL("../tokens.css", import.meta.url);
const requiredTokens = [
  "page", "surface", "surface-2", "ink", "ink-soft", "muted", "faint",
  "focus", "accent", "on-accent", "contact-bg", "contact-ink",
  "contact-muted", "stage", "stage-ink", "stage-muted",
];

function readThemes() {
  const css = readFileSync(tokenFile, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const root = {};
  const dark = {};
  let foundRoot = false;
  let foundDark = false;

  // Read leaf rules by exact selector, avoiding :root:not(...) system fallbacks.
  for (const [, selectorText, declarations] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const selector of selectorText.split(",").map((value) => value.trim())) {
      let target;
      if (selector === ":root") {
        target = root;
        foundRoot = true;
      } else if (/^:root\[data-theme\s*=\s*(?:"dark"|'dark'|dark)\s*\]$/.test(selector)) {
        target = dark;
        foundDark = true;
      } else continue;

      for (const [, name, value] of declarations.matchAll(/--([\w-]+)\s*:\s*([^;]+)\s*;/g)) {
        target[name] = value.trim();
      }
    }
  }

  if (!foundRoot || !foundDark) {
    throw new Error('tokens.css must define both :root and :root[data-theme="dark"] rules.');
  }

  const themes = { light: root, dark: { ...root, ...dark } };
  for (const [theme, tokens] of Object.entries(themes)) {
    for (const name of requiredTokens) {
      if (!tokens[name]) throw new Error(`Missing --${name} for ${theme} theme in tokens.css.`);
      if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(tokens[name])) {
        throw new Error(`Expected an opaque hex color for ${theme} --${name}; got ${tokens[name]}.`);
      }
    }
  }
  return themes;
}

function luminance(hex) {
  const digits = hex.slice(1);
  const fullHex = digits.length === 3 ? [...digits].map((digit) => digit + digit).join("") : digits;
  const value = Number.parseInt(fullHex, 16);
  const [red, green, blue] = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function ratio(foreground, background) {
  const values = [luminance(foreground), luminance(background)];
  return (Math.max(...values) + 0.05) / (Math.min(...values) + 0.05);
}

const pairs = [];
for (const background of ["page", "surface", "surface-2"]) {
  for (const foreground of ["ink", "ink-soft", "muted", "faint"]) {
    pairs.push([foreground, background, 4.5]);
  }
  pairs.push(["focus", background, 3]);
}
pairs.push(
  ["on-accent", "accent", 4.5],
  ["contact-ink", "contact-bg", 4.5],
  ["contact-muted", "contact-bg", 4.5],
  ["stage-ink", "stage", 4.5],
  ["stage-muted", "stage", 4.5],
);

try {
  let failed = false;
  for (const [theme, tokens] of Object.entries(readThemes())) {
    for (const [foreground, background, threshold] of pairs) {
      const result = ratio(tokens[foreground], tokens[background]);
      const passes = result >= threshold;
      failed ||= !passes;
      console.log(`${passes ? "PASS" : "FAIL"} ${result.toFixed(2)}:1  ${theme} --${foreground} / --${background} (needs ${threshold}:1)`);
    }
  }
  if (failed) process.exitCode = 1;
} catch (error) {
  console.error(`Contrast audit failed: ${error.message}`);
  process.exitCode = 1;
}
