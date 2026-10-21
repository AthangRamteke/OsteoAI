import { useId } from "react";

const FONT = "Inter, system-ui, 'Segoe UI', sans-serif";

const graphemes = (text) =>
  typeof Intl.Segmenter === "function"
    ? Array.from(
        new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text),
        (part) => part.segment
      )
    : Array.from(text);

/*
 * "Athang Ramteke" -> "AR". The first and last word give the initials; a
 * single name gives its first two letters; no name falls back to "OA".
 */
function getInitials(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "OA";
  }

  const letters =
    words.length === 1
      ? graphemes(words[0]).slice(0, 2)
      : [graphemes(words[0])[0], graphemes(words[words.length - 1])[0]];

  return letters.join("").toLocaleUpperCase();
}

/*
 * OsteoAI avatar mark: a glass-style disc with a soft cyan-blue-violet
 * gradient, a light sheen across the top and a thin glass edge, with
 * the user's initials ("OA" when there is no name). It fills the sidebar profile avatar, which keeps
 * supplying its own border and status dot.
 */
function OsteoMonogram({ name }) {
  const id = useId().replace(/:/g, "");
  const initials = getInitials(name);

  return (
    <svg
      viewBox="0 0 48 48"
      width="100%"
      height="100%"
      role="img"
      aria-label="OsteoAI"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-b`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#7CC4F2" />
          <stop offset="0.5" stopColor="#3F5FDB" />
          <stop offset="1" stopColor="#7B4CDB" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#9FE8FF" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      <circle cx="24" cy="24" r="24.5" fill={`url(#${id}-b)`} />
      <path d="M5 22C5 11 13 4 24 4s19 7 19 18C34 18 14 18 5 22z" fill={`url(#${id}-s)`} />
      <circle cx="24" cy="24" r="22.6" fill="none" stroke={`url(#${id}-r)`} strokeWidth="1.2" />
      <text
        x="24"
        y="30.4"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="19"
        fontWeight="800"
        letterSpacing="-0.6"
        fill="#fff"
      >
        {initials}
      </text>
    </svg>
  );
}

export default OsteoMonogram;
