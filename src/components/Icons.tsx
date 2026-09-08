type IconProps = { className?: string; size?: number };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function MailIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function DownloadIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  );
}

export function ArrowIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function LinkedInIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.65h.05a4.16 4.16 0 0 1 3.75-2.06c4 0 4.75 2.64 4.75 6.07V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21h-4V9Z" />
    </svg>
  );
}

export function GitHubIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.84 9.72.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.34 1.12 2.91.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export function PhoneIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6.5 3h3l1.5 4.5-2 1.4a12.5 12.5 0 0 0 6.1 6.1l1.4-2L21 14.5v3a2.5 2.5 0 0 1-2.7 2.5A16.8 16.8 0 0 1 3.5 5.7 2.5 2.5 0 0 1 6 3Z" />
    </svg>
  );
}

export function CloseIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base} strokeWidth={2}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function LockIcon({ className, size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </svg>
  );
}

export function ExternalIcon({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14v4.5A2.5 2.5 0 0 1 15.5 21h-9A2.5 2.5 0 0 1 4 18.5v-9A2.5 2.5 0 0 1 6.5 7H11" />
    </svg>
  );
}

/**
 * Skill-pill icons below. Deliberately abstract, hand-drawn glyphs in the
 * same thin-stroke style as the icons above — not traced brand logos —
 * so they read consistently with the rest of the set at 14-16px.
 */

export function DotNetIcon({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <ellipse cx="8" cy="12" rx="4.2" ry="3.4" />
      <ellipse cx="16" cy="12" rx="4.2" ry="3.4" />
    </svg>
  );
}

export function CSharpIcon({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono, monospace)" fill="currentColor" stroke="none">
        C#
      </text>
    </svg>
  );
}

export function TypeScriptIcon({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="8" fontFamily="var(--font-mono, monospace)" fill="currentColor" stroke="none">
        TS
      </text>
    </svg>
  );
}

export function PostgresIcon({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <ellipse cx="12" cy="6.5" rx="7" ry="3" />
      <path d="M5 6.5v11a7 3 0 0 0 14 0v-11" />
      <path d="M5 12a7 3 0 0 0 14 0" />
    </svg>
  );
}

export function RedisIcon({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M13 6 7.5 13.2h4L10.5 20l7-9.2h-4L14.5 6Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AzureIcon({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M9.5 4h4l6.2 16h-5.1l-3.1-8.3-4.3 8.3H2.3Z" />
    </svg>
  );
}

export function DockerIcon({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3.5" y="10" width="3.6" height="3.6" />
      <rect x="8.2" y="10" width="3.6" height="3.6" />
      <rect x="8.2" y="5.4" width="3.6" height="3.6" />
      <rect x="12.9" y="10" width="3.6" height="3.6" />
      <path d="M2 14.2c1.6 3.6 5 5.6 9.5 5.6 4.7 0 8.3-2.3 10.5-6.7-2 .5-4 .4-5-.2" />
    </svg>
  );
}

export function GitIcon({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="12" r="2" />
      <path d="M6 8v8" />
      <path d="M6 11.5c0-2.8 2.6-3.9 5.6-3.9H16" />
    </svg>
  );
}

export function AngularIcon({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 2.5 20.5 5.8 19 17 12 21.5 5 17 3.5 5.8Z" />
      <path d="M8.3 15.5 12 6.5l3.7 9" />
      <path d="M9.9 12.2h4.2" />
    </svg>
  );
}
