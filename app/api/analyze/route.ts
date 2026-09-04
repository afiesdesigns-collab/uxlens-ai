import { NextRequest, NextResponse } from "next/server";
import { chromium, Browser, BrowserContext } from "playwright";
import path from "path";

export const runtime = "nodejs";

type AxeNode = {
  html: string;
  target: string[];
  failureSummary?: string;
};

type AxeViolation = {
  id: string;
  impact: string | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
};

type AxeResults = {
  violations: AxeViolation[];
};

export async function POST(request: NextRequest) {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    const body = await request.json();
    const websiteUrl = body.url;

    if (!websiteUrl || typeof websiteUrl !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Website URL is required.",
        },
        { status: 400 }
      );
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(websiteUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid website URL.",
        },
        { status: 400 }
      );
    }

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Only HTTP and HTTPS websites are supported.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // Launch browser
    // --------------------------------

    browser = await chromium.launch({
      headless: true,
    });

    // bypassCSP allows UXLens to inject axe-core
    // into websites with strict Content Security Policy.
    context = await browser.newContext({
      viewport: {
        width: 1440,
        height: 1000,
      },
      bypassCSP: true,
    });

    const page = await context.newPage();

    // --------------------------------
    // Open website
    // --------------------------------

    await page.goto(websiteUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    // --------------------------------
    // Basic website analysis
    // --------------------------------

    const title = await page.title();
    const finalUrl = page.url();

    const h1 = await page
      .locator("h1")
      .first()
      .textContent()
      .catch(() => null);

    const linkCount = await page.locator("a").count();

    const buttonCount = await page
      .locator("button")
      .count();

    const imageCount = await page.locator("img").count();

    const bodyText = await page
      .locator("body")
      .innerText()
      .catch(() => "");

    const textSample = bodyText
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1500);

    // --------------------------------
    // Screenshot
    // --------------------------------

    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: 70,
      fullPage: false,
    });

    const screenshot =
      `data:image/jpeg;base64,${screenshotBuffer.toString(
        "base64"
      )}`;

    // --------------------------------
    // Accessibility analysis
    // --------------------------------

    const axePath = path.join(
      process.cwd(),
      "node_modules",
      "axe-core",
      "axe.min.js"
    );

    await page.addScriptTag({
      path: axePath,
    });

    const axeLoaded = await page.evaluate(() => {
      return typeof (window as any).axe !== "undefined";
    });

    if (!axeLoaded) {
      throw new Error(
        "axe-core could not be loaded into the page."
      );
    }

    const accessibilityResults =
      await page.evaluate<AxeResults>(async () => {
        return await (window as any).axe.run(document);
      });

    const accessibilityIssues =
      accessibilityResults.violations.map(
        (violation) => ({
          id: violation.id,

          impact: violation.impact,

          description: violation.description,

          help: violation.help,

          helpUrl: violation.helpUrl,

          affectedElements: violation.nodes.length,

          elements: violation.nodes
            .slice(0, 5)
            .map((node) => ({
              html: node.html,

              target: node.target,

              failureSummary:
                node.failureSummary || null,
            })),
        })
      );

    const accessibilityIssueCount =
      accessibilityResults.violations.length;

    const accessibilityAffectedElements =
      accessibilityResults.violations.reduce(
        (total, violation) =>
          total + violation.nodes.length,
        0
      );

    // --------------------------------
    // Return results
    // --------------------------------

    return NextResponse.json({
      success: true,

      data: {
        requestedUrl: websiteUrl,

        finalUrl,

        title,

        h1: h1?.trim() || null,

        linkCount,

        buttonCount,

        imageCount,

        textSample,

        screenshot,

        accessibility: {
          issueCount: accessibilityIssueCount,

          affectedElements:
            accessibilityAffectedElements,

          issues: accessibilityIssues,
        },
      },
    });
  } catch (error) {
    console.error("UXLens analyze error:", error);

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "UXLens could not analyze this website.",
      },
      {
        status: 500,
      }
    );
  } finally {
    if (context) {
      await context.close();
    }

    if (browser) {
      await browser.close();
    }
  }
}