"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const steps = [
  "Loading website",
  "Reading page structure",
  "Inspecting content",
  "Counting interface elements",
  "Preparing audit data",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const websiteUrl = searchParams.get("url") || "";

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  let websiteName = "your website";

  try {
    websiteName = new URL(websiteUrl).hostname.replace("www.", "");
  } catch {
    websiteName = "your website";
  }

  useEffect(() => {
    if (!websiteUrl) {
      router.replace("/");
      return;
    }

    async function analyzeWebsite() {
      try {
        setCurrentStep(0);

        const stepTimer = setInterval(() => {
          setCurrentStep((step) => {
            if (step >= steps.length - 1) {
              return step;
            }

            return step + 1;
          });
        }, 800);

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: websiteUrl,
          }),
        });

        const result = await response.json();

        clearInterval(stepTimer);

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Website analysis failed."
          );
        }

        setCurrentStep(steps.length);

        sessionStorage.setItem(
          "uxlens-analysis",
          JSON.stringify(result.data)
        );

        setTimeout(() => {
          router.push(
            `/results?url=${encodeURIComponent(websiteUrl)}`
          );
        }, 700);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      }
    }

    analyzeWebsite();
  }, [router, websiteUrl]);

  const progress =
    currentStep >= steps.length
      ? 100
      : Math.round(
          ((currentStep + 1) / steps.length) * 100
        );

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <nav className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="text-xl font-bold tracking-tight">
            UXLens
          </div>

          <div className="text-sm text-zinc-500">
            Live website analysis
          </div>
        </div>
      </nav>

      <section className="mx-auto flex min-h-[80vh] max-w-3xl flex-col justify-center px-6 py-20">
        <div className="mb-4 text-sm font-medium text-zinc-500">
          Analyzing
        </div>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Looking closely at
          <br />

          <span className="text-zinc-400">
            {websiteName}
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">
          UXLens is opening the real website and inspecting its
          interface and page structure.
        </p>

        {!error && (
          <>
            <div className="mt-12">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium">
                  Website analysis
                </span>

                <span className="text-zinc-500">
                  {progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-black transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-10 space-y-3">
              {steps.map((step, index) => {
                const isComplete =
                  currentStep > index ||
                  currentStep >= steps.length;

                const isCurrent =
                  index === currentStep &&
                  currentStep < steps.length;

                return (
                  <div
                    key={step}
                    className={`flex items-center gap-4 rounded-2xl border p-4 ${
                      isCurrent
                        ? "border-zinc-300 bg-zinc-50"
                        : "border-zinc-100"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                        isComplete
                          ? "bg-black text-white"
                          : isCurrent
                          ? "bg-zinc-200 text-black"
                          : "bg-zinc-100 text-zinc-400"
                      }`}
                    >
                      {isComplete ? "✓" : index + 1}
                    </div>

                    <p
                      className={
                        index > currentStep
                          ? "text-zinc-400"
                          : "font-medium text-zinc-900"
                      }
                    >
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {error && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-medium text-red-800">
              Analysis failed
            </p>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              onClick={() => router.push("/")}
              className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Try another website
            </button>
          </div>
        )}
      </section>
    </main>
  );
}