import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-[#111111]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-xl font-semibold tracking-tight">
          UX<span className="text-indigo-600">Lens</span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <a className="text-neutral-600 hover:text-black" href="#product">
            Product
          </a>

          <a className="text-neutral-600 hover:text-black" href="#how">
            How it works
          </a>

          <button className="rounded-lg bg-black px-4 py-2 text-white">
            Sign in
          </button>
        </div>
      </nav>

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-28 text-center">
        <div className="mb-6 rounded-full border bg-white px-4 py-2 text-sm shadow-sm">
          ✦ AI-powered UX analysis
        </div>

        <h1 className="max-w-4xl text-6xl font-semibold leading-[1.05] tracking-tight">
          Find UX problems
          <br />
          before your users do.
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-600">
          Analyze usability, accessibility, visual hierarchy, and conversion
          issues across your website in minutes.
        </p>

        <div className="mt-10 w-full max-w-2xl rounded-2xl border bg-white p-3 shadow-xl shadow-black/5">
          <div className="flex gap-3">
            <input
              type="url"
              placeholder="https://yourwebsite.com"
              className="flex-1 rounded-xl px-4 py-4 outline-none"
            />

            <Link
              href="/analyzing"
              className="rounded-xl bg-black px-6 py-4 font-medium text-white transition hover:bg-neutral-800"
            >
              Run UX Audit →
            </Link>
          </div>
        </div>

        <div className="mt-5 flex gap-6 text-sm text-neutral-500">
          <span>✓ No credit card</span>
          <span>✓ Results in minutes</span>
          <span>✓ Actionable insights</span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-28">
        <div className="rounded-3xl border bg-white p-8 shadow-2xl shadow-black/5">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">UX Audit</p>
              <h2 className="mt-1 text-xl font-semibold">example.com</h2>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-700">
              Completed
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Score title="Overall UX" score="82" />
            <Score title="Usability" score="88" />
            <Score title="Accessibility" score="74" />
            <Score title="Conversion" score="79" />
          </div>
        </div>
      </section>
    </main>
  );
}

function Score({ title, score }: { title: string; score: string }) {
  return (
    <div className="rounded-2xl border bg-[#fafafa] p-6">
      <p className="text-sm text-neutral-500">{title}</p>

      <div className="mt-4 flex items-end gap-1">
        <span className="text-4xl font-semibold">{score}</span>
        <span className="mb-1 text-neutral-400">/100</span>
      </div>
    </div>
  );
}