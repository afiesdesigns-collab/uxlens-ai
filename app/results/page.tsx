"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type AccessibilityElement = {
  html: string;
  target: string[];
  failureSummary: string | null;
};

type AccessibilityIssue = {
  id: string;
  impact: string | null;
  description: string;
  help: string;
  helpUrl: string;
  affectedElements: number;
  elements: AccessibilityElement[];
};

type PageVerification = {
  status: "verified" | "warning";
  isLikelyRealPage: boolean;
  httpStatus: number | null;
  detectedSignals: string[];
  suspiciouslySmallPage: boolean;
  message: string;
};

type AnalysisData = {
  requestedUrl: string;
  finalUrl: string;
  title: string;
  h1: string | null;
  linkCount: number;
  buttonCount: number;
  imageCount: number;
  textSample: string;
  screenshot: string;

  pageVerification: PageVerification;

  accessibility: {
    issueCount: number;
    affectedElements: number;
    issues: AccessibilityIssue[];
  };
};

type UXFinding = {
  title: string;
  category: string;
  severity: "High" | "Medium" | "Low";
  description: string;
  recommendation: string;
};

export default function ResultsPage() {
  const searchParams = useSearchParams();

  const websiteUrl = searchParams.get("url") || "";

  const [analysis, setAnalysis] =
    useState<AnalysisData | null>(null);

  const websiteName = useMemo(() => {
    try {
      return new URL(websiteUrl).hostname.replace("www.", "");
    } catch {
      return "Unknown website";
    }
  }, [websiteUrl]);

  useEffect(() => {
    const storedAnalysis =
      sessionStorage.getItem("uxlens-analysis");

    if (!storedAnalysis) {
      return;
    }

    try {
      const parsedAnalysis =
        JSON.parse(storedAnalysis);

      setAnalysis(parsedAnalysis);
    } catch (error) {
      console.error(
        "Could not read analysis data:",
        error
      );
    }
  }, []);

  const uxReport = useMemo(() => {
    if (!analysis) {
      return null;
    }

    return createHeuristicReport(analysis);
  }, [analysis]);

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#111111]">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight"
          >
            UX
            <span className="text-indigo-600">
              Lens
            </span>
          </Link>

          <Link
            href="/"
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            New Audit
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              UX Audit Report
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {websiteName}
            </h1>

            <p className="mt-2 break-all text-neutral-500">
              {analysis?.finalUrl || websiteUrl}
            </p>
          </div>

          {analysis && (
            <div className="rounded-xl border bg-white px-4 py-3 text-sm text-neutral-500">
              Live website data + heuristic analysis
            </div>
          )}
        </div>

        {!analysis || !uxReport ? (
          <div className="mt-10 rounded-2xl border bg-white p-8">
            <h2 className="text-xl font-semibold">
              Analysis data not found
            </h2>

            <p className="mt-2 text-neutral-500">
              Please run a new audit.
            </p>

            <Link
              href="/"
              className="mt-5 inline-block rounded-lg bg-black px-5 py-3 text-sm font-medium text-white"
            >
              Run New Audit
            </Link>
          </div>
        ) : (
          <>
            {/* PAGE VERIFICATION */}

            <section className="mt-8">
              {analysis.pageVerification.isLikelyRealPage ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                      ✓
                    </div>

                    <div>
                      <p className="font-semibold text-green-900">
                        Page Verified
                      </p>

                      <p className="mt-1 text-sm text-green-800">
                        UXLens successfully captured what
                        appears to be the intended website.
                      </p>

                      {analysis.pageVerification.httpStatus && (
                        <p className="mt-2 text-xs text-green-700">
                          HTTP Status:{" "}
                          {analysis.pageVerification.httpStatus}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-semibold text-amber-900">
                    Page Verification Warning
                  </p>

                  <p className="mt-1 text-sm text-amber-800">
                    {analysis.pageVerification.message}
                  </p>
                </div>
              )}
            </section>

            {/* OVERALL SCORE */}

            <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_2.1fr]">
              <div className="rounded-3xl bg-neutral-950 p-8 text-white">
                <p className="text-sm text-neutral-400">
                  Overall UX Score
                </p>

                <div className="mt-5 flex items-end gap-2">
                  <span className="text-7xl font-semibold tracking-tight">
                    {uxReport.overallScore}
                  </span>

                  <span className="mb-2 text-xl text-neutral-500">
                    /100
                  </span>
                </div>

                <p className="mt-6 leading-7 text-neutral-300">
                  {uxReport.summary}
                </p>

                <p className="mt-6 text-xs leading-5 text-neutral-500">
                  This score is generated from heuristic
                  rules and automated website signals. It
                  is not a substitute for user research or
                  moderated usability testing.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ScoreCard
                  title="Accessibility"
                  score={uxReport.accessibilityScore}
                  description="Automated accessibility signals"
                />

                <ScoreCard
                  title="Content Structure"
                  score={uxReport.contentScore}
                  description="Page title, headings and readable content"
                />

                <ScoreCard
                  title="Interaction"
                  score={uxReport.interactionScore}
                  description="Links, buttons and interaction density"
                />

                <ScoreCard
                  title="Page Confidence"
                  score={uxReport.confidenceScore}
                  description="Confidence in the captured page"
                />
              </div>
            </section>

            {/* TOP OPPORTUNITY */}

            <section className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
              <p className="text-sm font-medium text-indigo-600">
                Top Opportunity
              </p>

              <h2 className="mt-3 text-2xl font-semibold">
                {uxReport.topOpportunity.title}
              </h2>

              <p className="mt-3 max-w-3xl leading-7 text-neutral-600">
                {uxReport.topOpportunity.description}
              </p>

              <div className="mt-6 rounded-2xl bg-indigo-50 p-5">
                <p className="text-sm font-medium text-indigo-900">
                  Recommendation
                </p>

                <p className="mt-2 leading-7 text-indigo-900">
                  {uxReport.topOpportunity.recommendation}
                </p>
              </div>
            </section>

            {/* LIVE METRICS */}

            <section className="mt-10">
              <p className="text-sm font-medium text-neutral-500">
                Live Interface Data
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                What UXLens detected
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <DataCard
                  title="Accessibility Issues"
                  value={analysis.accessibility.issueCount.toString()}
                />

                <DataCard
                  title="Affected Elements"
                  value={analysis.accessibility.affectedElements.toString()}
                />

                <DataCard
                  title="Links"
                  value={analysis.linkCount.toString()}
                />

                <DataCard
                  title="Buttons"
                  value={analysis.buttonCount.toString()}
                />

                <DataCard
                  title="Images"
                  value={analysis.imageCount.toString()}
                />
              </div>
            </section>

            {/* FINDINGS */}

            <section className="mt-12">
              <p className="text-sm font-medium text-neutral-500">
                Heuristic UX Review
              </p>

              <div className="mt-2 flex items-end justify-between gap-4">
                <h2 className="text-2xl font-semibold">
                  Prioritized Findings
                </h2>

                <p className="text-sm text-neutral-500">
                  {uxReport.findings.length} findings
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {uxReport.findings.map(
                  (finding, index) => (
                    <FindingCard
                      key={`${finding.title}-${index}`}
                      finding={finding}
                      index={index + 1}
                    />
                  )
                )}
              </div>
            </section>

            {/* SCREENSHOT */}

            <section className="mt-12">
              <p className="text-sm font-medium text-neutral-500">
                Captured Interface
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Website Screenshot
              </h2>

              <p className="mt-2 text-neutral-500">
                Live viewport captured during the audit.
              </p>

              <div className="mt-6 overflow-hidden rounded-3xl border bg-white p-3 shadow-sm">
                <img
                  src={analysis.screenshot}
                  alt={`Screenshot of ${websiteName}`}
                  className="w-full rounded-2xl"
                />
              </div>
            </section>

            {/* ACCESSIBILITY */}

            <section className="mt-12">
              <p className="text-sm font-medium text-neutral-500">
                Automated Accessibility Audit
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Accessibility Findings
              </h2>

              <p className="mt-2 max-w-2xl text-neutral-500">
                These findings come directly from
                axe-core running against the live page.
              </p>

              {analysis.accessibility.issues.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
                  <p className="font-medium text-green-800">
                    No automated accessibility
                    violations detected.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {analysis.accessibility.issues.map(
                    (issue) => (
                      <AccessibilityCard
                        key={issue.id}
                        issue={issue}
                      />
                    )
                  )}
                </div>
              )}
            </section>

            {/* PAGE INFORMATION */}

            <section className="mt-12">
              <p className="text-sm font-medium text-neutral-500">
                Content Inspection
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Page Structure
              </h2>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <InfoCard
                  label="Page Title"
                  value={
                    analysis.title ||
                    "No page title detected"
                  }
                />

                <InfoCard
                  label="Primary H1"
                  value={
                    analysis.h1 ||
                    "No primary H1 detected"
                  }
                />
              </div>

              <div className="mt-6 rounded-3xl border bg-white p-7 shadow-sm">
                <p className="text-sm text-neutral-500">
                  Extracted Page Content
                </p>

                <p className="mt-5 max-w-4xl leading-7 text-neutral-600">
                  {analysis.textSample ||
                    "No readable page text found."}
                </p>
              </div>
            </section>

            <section className="mt-12 rounded-3xl border border-dashed bg-white p-7">
              <p className="text-sm font-medium">
                About this report
              </p>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
                Live structural and accessibility data
                comes directly from the audited website.
                UX scores and recommendations are
                heuristic demo insights designed to show
                how an AI-assisted audit experience could
                work. Future versions can connect this
                layer to a live AI model.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function createHeuristicReport(
  analysis: AnalysisData
) {
  const accessibilityPenalty = Math.min(
    50,
    analysis.accessibility.issueCount * 3 +
      Math.min(
        20,
        Math.round(
          analysis.accessibility.affectedElements / 10
        )
      )
  );

  const accessibilityScore = clamp(
    100 - accessibilityPenalty,
    35,
    100
  );

  let contentScore = 100;

  if (!analysis.title) {
    contentScore -= 25;
  }

  if (!analysis.h1) {
    contentScore -= 25;
  }

  if (analysis.textSample.length < 200) {
    contentScore -= 15;
  }

  contentScore = clamp(contentScore, 40, 100);

  let interactionScore = 85;

  if (analysis.buttonCount === 0) {
    interactionScore -= 15;
  }

  if (analysis.linkCount > 250) {
    interactionScore -= 10;
  }

  if (analysis.buttonCount > 80) {
    interactionScore -= 7;
  }

  interactionScore = clamp(
    interactionScore,
    40,
    100
  );

  const confidenceScore =
    analysis.pageVerification.isLikelyRealPage
      ? 96
      : 45;

  const overallScore = Math.round(
    accessibilityScore * 0.35 +
      contentScore * 0.25 +
      interactionScore * 0.25 +
      confidenceScore * 0.15
  );

  const findings: UXFinding[] = [];

  const criticalOrSerious =
    analysis.accessibility.issues.filter(
      (issue) =>
        issue.impact === "critical" ||
        issue.impact === "serious"
    );

  if (criticalOrSerious.length > 0) {
    findings.push({
      title:
        "Address high-impact accessibility barriers",
      category: "Accessibility",
      severity: "High",
      description: `${criticalOrSerious.length} critical or serious automated accessibility findings were detected on the page.`,
      recommendation:
        "Prioritize high-impact violations first, validate the affected components manually, and retest them with keyboard and assistive technology workflows.",
    });
  }

  if (analysis.linkCount > 250) {
    findings.push({
      title:
        "Review navigation and link density",
      category: "Navigation",
      severity: "Medium",
      description: `UXLens detected ${analysis.linkCount} links on this page. High link density can increase scanning effort and make hierarchy harder to understand.`,
      recommendation:
        "Review whether secondary destinations can be grouped, progressively disclosed, or moved deeper into the information architecture.",
    });
  }

  if (analysis.buttonCount > 70) {
    findings.push({
      title:
        "Clarify interaction hierarchy",
      category: "Interaction",
      severity: "Medium",
      description: `${analysis.buttonCount} buttons were detected. A large number of competing actions can reduce clarity around the primary user journey.`,
      recommendation:
        "Differentiate primary, secondary, and tertiary actions visually and reduce repeated controls where possible.",
    });
  }

  if (!analysis.h1) {
    findings.push({
      title:
        "Establish a clear primary heading",
      category: "Content",
      severity: "Medium",
      description:
        "No primary H1 was detected on the page.",
      recommendation:
        "Use one clear primary heading that communicates the page purpose and supports both scanning and semantic structure.",
    });
  }

  if (
    analysis.accessibility.affectedElements > 50
  ) {
    findings.push({
      title:
        "Reduce repeated accessibility failures",
      category: "Design System",
      severity: "High",
      description: `${analysis.accessibility.affectedElements} interface elements are affected by automated accessibility findings.`,
      recommendation:
        "Look for repeated component-level causes such as buttons, links, form controls, color patterns, or shared templates. Fixing the source component can resolve many instances at once.",
    });
  }

  if (findings.length < 3) {
    findings.push({
      title:
        "Validate visual hierarchy with real users",
      category: "Usability",
      severity: "Low",
      description:
        "Automated analysis can detect structural signals, but it cannot determine whether users immediately understand what to do next.",
      recommendation:
        "Run a short task-based usability test with representative users and observe whether they can identify the primary action without guidance.",
    });
  }

  const topOpportunity =
    findings.find(
      (finding) => finding.severity === "High"
    ) ||
    findings.find(
      (finding) => finding.severity === "Medium"
    ) ||
    findings[0];

  let summary =
    "The page shows a generally solid structural foundation with opportunities to improve clarity and accessibility.";

  if (overallScore < 65) {
    summary =
      "The audit identified several high-impact opportunities that may affect accessibility, navigation clarity, or task completion.";
  } else if (overallScore >= 85) {
    summary =
      "The page demonstrates a strong baseline across the automated signals reviewed, with focused opportunities for refinement.";
  }

  return {
    overallScore,
    accessibilityScore,
    contentScore,
    interactionScore,
    confidenceScore,
    findings,
    topOpportunity,
    summary,
  };
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(Math.max(value, min), max);
}

function ScoreCard({
  title,
  score,
  description,
}: {
  title: string;
  score: number;
  description: string;
}) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">
            {title}
          </p>

          <p className="mt-1 text-sm leading-5 text-neutral-500">
            {description}
          </p>
        </div>

        <span className="text-3xl font-semibold">
          {score}
        </span>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-indigo-600"
          style={{
            width: `${score}%`,
          }}
        />
      </div>
    </div>
  );
}

function DataCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-neutral-500">
        {title}
      </p>

      <p className="mt-3 text-4xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function FindingCard({
  finding,
  index,
}: {
  finding: UXFinding;
  index: number;
}) {
  return (
    <div className="rounded-3xl border bg-white p-7 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold">
          {index}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
              {finding.category}
            </span>

            <SeverityBadge
              severity={finding.severity}
            />
          </div>

          <h3 className="mt-4 text-xl font-semibold">
            {finding.title}
          </h3>

          <p className="mt-3 max-w-3xl leading-7 text-neutral-600">
            {finding.description}
          </p>

          <div className="mt-5 rounded-2xl bg-neutral-50 p-5">
            <p className="text-sm font-medium">
              Recommendation
            </p>

            <p className="mt-2 leading-7 text-neutral-600">
              {finding.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: UXFinding["severity"];
}) {
  let classes =
    "bg-blue-100 text-blue-700";

  if (severity === "High") {
    classes =
      "bg-red-100 text-red-700";
  }

  if (severity === "Medium") {
    classes =
      "bg-amber-100 text-amber-800";
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${classes}`}
    >
      {severity}
    </span>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border bg-white p-7 shadow-sm">
      <p className="text-sm text-neutral-500">
        {label}
      </p>

      <h3 className="mt-3 text-xl font-semibold">
        {value}
      </h3>
    </div>
  );
}

function AccessibilityCard({
  issue,
}: {
  issue: AccessibilityIssue;
}) {
  return (
    <div className="rounded-3xl border bg-white p-7 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <ImpactBadge impact={issue.impact} />

        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
          {issue.id}
        </span>
      </div>

      <h3 className="mt-4 text-xl font-semibold">
        {issue.help}
      </h3>

      <p className="mt-3 leading-7 text-neutral-600">
        {issue.description}
      </p>

      <div className="mt-5 flex gap-8">
        <div>
          <p className="text-sm text-neutral-400">
            Impact
          </p>

          <p className="mt-1 font-medium capitalize">
            {issue.impact || "Unknown"}
          </p>
        </div>

        <div>
          <p className="text-sm text-neutral-400">
            Affected elements
          </p>

          <p className="mt-1 font-medium">
            {issue.affectedElements}
          </p>
        </div>
      </div>

      {issue.elements.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium">
            Example Element
          </p>

          <pre className="mt-3 overflow-x-auto rounded-2xl bg-neutral-950 p-4 text-xs leading-6 text-neutral-200">
            {issue.elements[0].html}
          </pre>

          {issue.elements[0].failureSummary && (
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              {issue.elements[0].failureSummary}
            </p>
          )}
        </div>
      )}

      <a
        href={issue.helpUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-block text-sm font-medium text-indigo-600 hover:underline"
      >
        Learn about this accessibility rule →
      </a>
    </div>
  );
}

function ImpactBadge({
  impact,
}: {
  impact: string | null;
}) {
  let classes =
    "bg-neutral-100 text-neutral-700";

  if (impact === "critical") {
    classes =
      "bg-red-100 text-red-700";
  }

  if (impact === "serious") {
    classes =
      "bg-orange-100 text-orange-700";
  }

  if (impact === "moderate") {
    classes =
      "bg-yellow-100 text-yellow-800";
  }

  if (impact === "minor") {
    classes =
      "bg-blue-100 text-blue-700";
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${classes}`}
    >
      {impact || "Unknown"}
    </span>
  );
}