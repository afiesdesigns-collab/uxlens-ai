import Link from "next/link";

export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f7] text-[#111111]">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            UX<span className="text-indigo-600">Lens</span>
          </Link>

          <Link
            href="/"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            New Audit
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-neutral-500">UX Audit Report</p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              persianbasket.com
            </h1>

            <p className="mt-2 text-neutral-500">
              Website experience analysis
            </p>
          </div>

          <div className="rounded-2xl border bg-white px-7 py-5 shadow-sm">
            <p className="text-sm text-neutral-500">Overall UX Score</p>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-5xl font-semibold">78</span>
              <span className="mb-1 text-neutral-400">/100</span>
            </div>

            <p className="mt-2 text-sm font-medium text-green-700">Good</p>
          </div>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <ScoreCard title="Usability" score="84" />
          <ScoreCard title="Accessibility" score="68" />
          <ScoreCard title="Visual Design" score="81" />
          <ScoreCard title="Navigation" score="88" />
          <ScoreCard title="Conversion" score="69" />
          <ScoreCard title="Content" score="76" />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Issues Found</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Prioritized UX problems and recommendations
                </p>
              </div>

              <span className="rounded-full bg-white px-4 py-2 text-sm shadow-sm">
                12 issues
              </span>
            </div>

            <div className="space-y-4">
              <IssueCard
                severity="Critical"
                category="Conversion"
                title="Primary CTA lacks visual prominence"
                description="The main shopping action competes visually with secondary elements in the hero section."
                impact="High"
                effort="Low"
                recommendation="Increase CTA contrast, spacing, and visual priority while reducing competing actions."
              />

              <IssueCard
                severity="Important"
                category="Navigation"
                title="Product navigation feels too dense"
                description="Users are presented with many categories without enough visual grouping or prioritization."
                impact="High"
                effort="Medium"
                recommendation="Group related categories and surface the most important shopping paths first."
              />

              <IssueCard
                severity="Important"
                category="Accessibility"
                title="Several interface elements have weak contrast"
                description="Some secondary text and interface controls may be difficult to read for users with low vision."
                impact="Medium"
                effort="Low"
                recommendation="Increase text and control contrast to meet accessibility guidelines."
              />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Issue Summary</h3>

              <div className="mt-5 space-y-4">
                <SummaryRow label="Critical" value="2" />
                <SummaryRow label="Important" value="6" />
                <SummaryRow label="Minor" value="4" />
              </div>
            </div>

            <div className="rounded-2xl bg-black p-6 text-white">
              <p className="text-sm text-neutral-400">Top Opportunity</p>

              <h3 className="mt-3 text-xl font-semibold">
                Improve primary conversion paths
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Addressing CTA hierarchy and navigation clarity could make key
                shopping actions easier to discover.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function ScoreCard({
  title,
  score,
}: {
  title: string;
  score: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{title}</p>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-3xl font-semibold">{score}</span>
        <span className="mb-1 text-sm text-neutral-400">/100</span>
      </div>
    </div>
  );
}

function IssueCard({
  severity,
  category,
  title,
  description,
  impact,
  effort,
  recommendation,
}: {
  severity: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  effort: string;
  recommendation: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
          {severity}
        </span>

        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
          {category}
        </span>
      </div>

      <h3 className="mt-4 text-xl font-semibold">{title}</h3>

      <p className="mt-3 leading-7 text-neutral-600">{description}</p>

      <div className="mt-5 flex gap-6 text-sm">
        <div>
          <p className="text-neutral-400">Impact</p>
          <p className="mt-1 font-medium">{impact}</p>
        </div>

        <div>
          <p className="text-neutral-400">Effort</p>
          <p className="mt-1 font-medium">{effort}</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-neutral-50 p-4">
        <p className="text-sm font-medium">Recommendation</p>

        <p className="mt-2 text-sm leading-6 text-neutral-600">
          {recommendation}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}