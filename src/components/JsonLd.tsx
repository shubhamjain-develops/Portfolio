import { education, experience, site, skills } from "@/data/content";

/**
 * schema.org Person markup. Helps Google show the right thing when someone
 * searches the name, and costs nothing at runtime.
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    email: `mailto:${site.email}`,
    url: site.url,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressCountry: "IN",
    },
    sameAs: [site.linkedin, site.github].filter(Boolean),
    worksFor: {
      "@type": "Organization",
      name: experience[0].company,
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "International Institute of Information Technology, Bangalore",
    },
    knowsAbout: skills.flatMap((g) => g.items),
    hasCredential: education.map((e) => e.title),
    description: site.intro,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
