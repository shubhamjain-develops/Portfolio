"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { contact, site } from "@/data/content";
import { MagneticButton } from "./MagneticButton";
import { Reveal } from "./Reveal";
import { StatusBoard } from "./StatusBoard";
import {
  DownloadIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
} from "./Icons";

export function Contact() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context or denied permission) — the
      // mailto link beside this still works, so fail quietly.
    }
  }

  return (
    // Until the side gutter is wider than the fixed hamster (2xl), leave room
    // below the last row so the hamster never sits on top of it.
    <footer id="contact" className="scroll-mt-20 pb-44 pt-16 sm:pt-20 2xl:pb-14">
      <div className="shell">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-2xl border border-line card-surface px-6 py-12 text-center sm:px-12 sm:py-16">
            <div aria-hidden className="absolute inset-0 -z-10 grid-bg" />
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
            />

            <h2 className="mx-auto max-w-[20ch] text-[clamp(1.55rem,3.6vw,2.2rem)] leading-[1.15]">
              {contact.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-[46ch] text-[1rem] text-dim">
              {contact.body}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MagneticButton variant="primary" href={`mailto:${site.email}`}>
                <MailIcon /> {site.email}
              </MagneticButton>

              <div className="relative">
                <MagneticButton onClick={copyEmail} ariaLabel="Copy email address">
                  Copy
                </MagneticButton>
                <AnimatePresence>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18 }}
                      className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-accent px-2.5 py-1 font-mono text-[0.72rem] font-semibold text-accent-ink"
                    >
                      Copied
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <MagneticButton href={site.resumePath} download>
                <DownloadIcon /> Résumé
              </MagneticButton>
              <MagneticButton href={site.linkedin} external>
                <LinkedInIcon /> LinkedIn
              </MagneticButton>
              {site.github && (
                <MagneticButton href={site.github} external>
                  <GitHubIcon /> GitHub
                </MagneticButton>
              )}
              <MagneticButton href={site.phoneHref} variant="quiet">
                <PhoneIcon /> {site.phone}
              </MagneticButton>
            </div>
          </div>
        </Reveal>

        <StatusBoard />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 font-mono text-[0.75rem] text-faint">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <span className="flex items-center gap-4">
            {site.repo && (
              <a
                href={site.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent"
              >
                Source on GitHub
              </a>
            )}
            <span>{site.location}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
