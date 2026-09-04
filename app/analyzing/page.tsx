"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  "Loading website",
  "Capturing interface",
  "Checking accessibility",
  "Analyzing visual hierarchy",
  "Evaluating conversion paths",
  "Generating recommendations",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((current) => {
        if (current >= steps.length - 1) {
          clearInterval(interval);

          setTimeout(() => {
            router.push("/results");
          }, 1000);

          return current;
        }

        return current + 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [router]);

  const progress = Math.round(
    ((currentStep + 1) / steps.length) * 100
  );

  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-20 text-[#111111]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12">
          <p className="text-xl font-semibold">
            UX<span className="text-indigo-600">Lens</span>
          </p>
        </div>

        <p className="text-sm text-neutral-500">UX Audit</p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Analyzing your website
        </h1>

        <p className="mt-4 leading-7 text-neutral-600">
          We’re reviewing usability, accessibility, navigation,
          visual hierarchy, and conversion opportunities.
        </p>

        <div className="mt-8">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">
              Analysis progress
            </span>

            <span className="font-medium">
              {progress}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-10 rounded-3xl border bg-white p-8 shadow-xl shadow-black/5">
          <div className="space-y-6">
            {steps.map((step, index) => {
              const status =
                index < currentStep
                  ? "done"
                  : index === currentStep
                    ? "active"
                    : "waiting";

              return (
                <Step
                  key={step}
                  label={step}
                  status={status}
                />
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Please keep this page open while we analyze your experience.
        </p>
      </div>
    </main>
  );
}

function Step({
  label,
  status,
}: {
  label: string;
  status: "done" | "active" | "waiting";
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
          status === "done"
            ? "bg-black text-white"
            : status === "active"
              ? "bg-indigo-100 text-indigo-700"
              : "bg-neutral-100 text-neutral-400"
        }`}
      >
        {status === "done" ? "✓" : status === "active" ? "●" : "○"}
      </div>

      <div>
        <p
          className={
            status === "waiting"
              ? "text-neutral-400"
              : "text-neutral-900"
          }
        >
          {label}
        </p>

        {status === "active" && (
          <p className="mt-1 text-sm text-indigo-600">
            Analyzing...
          </p>
        )}
      </div>
    </div>
  );
}