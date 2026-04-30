import { Link } from "react-router-dom";

/**
 * StartHere
 *
 * Top-of-homepage developer entry path. Four steps, plain language,
 * no SDK function names. Server-rendered so crawlers and LLMs see the
 * recommended onboarding sequence on first paint.
 */
const steps = [
  {
    n: 1,
    title: "Run the minimal example",
    body: "Copy one script, set two environment variables, and produce your first certified record.",
    href: "/docs/quickstart",
    cta: "Open the Quickstart",
  },
  {
    n: 2,
    title: "Understand what was created",
    body: "Read the canonical reference: how the record is built, what is hashed, and how it is verified.",
    href: "/docs/architecture",
    cta: "Read the Architecture",
  },
  {
    n: 3,
    title: "Integrate into your system",
    body: "Wire NexArt into your application using the official SDK reference.",
    href: "/docs/sdk",
    cta: "Open the SDK reference",
  },
  {
    n: 4,
    title: "Verify your first record",
    body: "Confirm the record is intact and independently verifiable.",
    href: "/docs/verification",
    cta: "Open the Verification guide",
  },
];

const StartHere = () => (
  <section
    aria-labelledby="start-here-heading"
    className="not-prose my-6 rounded-lg border border-primary/30 bg-primary/5 p-5"
  >
    <h2
      id="start-here-heading"
      className="text-xs font-semibold uppercase tracking-wide text-primary mb-1"
    >
      Start here
    </h2>
    <p className="text-sm text-muted-foreground mb-4">
      The recommended path. Follow these four steps in order.
    </p>

    <ol className="space-y-3">
      {steps.map((s) => (
        <li
          key={s.n}
          className="rounded-md border border-border bg-card p-4 flex gap-4 items-start"
        >
          <div className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
            {s.n}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground">{s.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.body}</div>
            <Link
              to={s.href}
              className="inline-block text-sm text-primary hover:underline mt-2"
            >
              {s.cta} →
            </Link>
          </div>
        </li>
      ))}
    </ol>
  </section>
);

export default StartHere;
