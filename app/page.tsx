"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function normalizeUrl(value: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    if (
      !trimmed.startsWith("http://") &&
      !trimmed.startsWith("https://")
    ) {
      return `https://${trimmed}`;
    }

    return trimmed;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedUrl = normalizeUrl(url);

    if (!normalizedUrl) {
      setError("Enter a website URL first.");
      return;
    }

    try {
      new URL(normalizedUrl);

      setError("");

      router.push(
        `/analyzing?url=${encodeURIComponent(normalizedUrl)}`
      );
    } catch {
      setError("Enter a valid website URL.");
    }
  }

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <nav className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="text-xl font-bold tracking-tight">
            UXLens
          </div>

          <div className="flex items-center gap-8 text-sm">
            <a href="#product" className="text-zinc-600 hover:text-black">
              Product
            </a>

            <a
              href="#how-it-works"
              className="text-zinc-600 hover:text-black"
            >
              How it works
            </a>

            <button className="rounded-full border border-zinc-300 px-5 py-2 font-medium">
              Sign in
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
        <div className="mb-6 inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium">
          ✦ AI-powered UX analysis
        </div>

        <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
          Find UX problems
          <br />
          <span className="text-zinc-400">
            before your users do.
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-zinc-600">
          Enter any website and get an AI-powered UX audit with
          usability, accessibility, navigation, visual hierarchy,
          and conversion insights.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 max-w-2xl"
        >
          <div className="flex rounded-2xl border border-zinc-300 bg-white p-2 shadow-lg shadow-zinc-200/50">
            <input
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Enter a website, e.g. persianbasket.com"
              className="min-w-0 flex-1 px-4 py-3 text-base outline-none"
            />

            <button
              type="submit"
              className="rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-zinc-800"
            >
              Run UX Audit →
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
          <span>✓ No credit card</span>
          <span>✓ Results in minutes</span>
          <span>✓ Actionable insights</span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 sm:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                UX Audit
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                example.com
              </h2>
            </div>

            <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
              Good
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Score title="Overall UX" score={82} />
            <Score title="Usability" score={88} />
            <Score title="Accessibility" score={74} />
            <Score title="Conversion" score={79} />
          </div>
        </div>
      </section>
    </main>
  );
}

function Score({
  title,
  score,
}: {
  title: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <p className="text-sm text-zinc-500">
        {title}
      </p>

      <p className="mt-3 text-4xl font-semibold">
        {score}
      </p>

      <p className="mt-1 text-sm text-zinc-400">
        /100
      </p>
    </div>
  );
}