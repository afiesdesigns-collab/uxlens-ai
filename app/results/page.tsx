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

  accessibility: {
    issueCount: number;
    affectedElements: number;
    issues: AccessibilityIssue[];
  };
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

  return (
    <main className="min-h-screen bg-[#f7f7f7] text-[#111111]">
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
            className="rounded-lg border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            New Audit
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm text-neutral-500">
            Live UX Audit
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {websiteName}
          </h1>

          <p className="mt-2 break-all text-neutral-500">
            {analysis?.finalUrl || websiteUrl}
          </p>
        </div>

        {!analysis ? (
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
            <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
            </section>

            <section className="mt-10">
              <div>
                <p className="text-sm text-neutral-500">
                  Captured Interface
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Website Screenshot
                </h2>

                <p className="mt-2 text-neutral-500">
                  Live viewport captured during the audit.
                </p>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border bg-white p-3 shadow-sm">
                <img
                  src={analysis.screenshot}
                  alt={`Screenshot of ${websiteName}`}
                  className="w-full rounded-xl"
                />
              </div>
            </section>

            <section className="mt-10">
              <div>
                <p className="text-sm text-neutral-500">
                  Automated Accessibility Audit
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Accessibility Issues
                </h2>

                <p className="mt-2 text-neutral-500">
                  Issues detected directly from the live
                  website using axe-core.
                </p>
              </div>

              {analysis.accessibility.issues.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
                  <p className="font-medium text-green-800">
                    No automated accessibility
                    violations detected.
                  </p>

                  <p className="mt-2 text-sm text-green-700">
                    Automated testing does not replace
                    manual accessibility evaluation.
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

            <section className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-neutral-500">
                  Page Title
                </p>

                <h3 className="mt-3 text-xl font-semibold">
                  {analysis.title ||
                    "No title found"}
                </h3>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-neutral-500">
                  Primary H1
                </p>

                <h3 className="mt-3 text-xl font-semibold">
                  {analysis.h1 ||
                    "No H1 found"}
                </h3>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-neutral-500">
                Extracted Page Content
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Text Sample
              </h2>

              <p className="mt-5 leading-7 text-neutral-600">
                {analysis.textSample ||
                  "No readable page text found."}
              </p>
            </section>
          </>
        )}
      </div>
    </main>
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

      <p className="mt-3 text-4xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function AccessibilityCard({
  issue,
}: {
  issue: AccessibilityIssue;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
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

          <pre className="mt-3 overflow-x-auto rounded-xl bg-neutral-950 p-4 text-xs leading-6 text-neutral-200">
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
    classes = "bg-red-100 text-red-700";
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