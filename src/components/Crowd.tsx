import { crowd } from "@/data/content";
import { CrowdCanvas } from "./ui/skiper39";

/** A crowd walking past before the contact block; one peep stands still in teal. */
export function Crowd() {
  return (
    <section aria-label={crowd.label} className="relative pt-16">
      <p className="eyebrow relative mx-auto max-w-[22ch] text-center after:absolute after:left-1/2 after:top-[calc(100%+10px)] after:h-12 after:w-px after:bg-gradient-to-b after:from-transparent after:to-accent after:content-['']">
        {crowd.label}
      </p>
      <div className="relative mt-16 h-[clamp(260px,32vw+140px,460px)] overflow-hidden">
        <CrowdCanvas
          src={crowd.sheet}
          rows={15}
          cols={7}
          standout={crowd.standout}
          className="absolute inset-0 h-full w-full"
        />
        {/* sinks the sprites' cut-off waists into the page */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-b from-transparent to-bg" />
      </div>
    </section>
  );
}
