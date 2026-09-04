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

    // -------------------------------
    // Validate URL
    // -------------------------------

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

    // -------------------------------
    // Launch browser
    // -------------------------------

    browser = await chromium.launch({
      headless: true,
    });

    context = await browser.newContext({
      viewport: {
        width: 1440,
        height: 1000,
      },

      bypassCSP: true,

      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/140.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // -------------------------------
    // Open website
    // -------------------------------

    const response = await page.goto(websiteUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    // -------------------------------
    // Basic website data
    // -------------------------------

    const title = await page.title();
    const finalUrl = page.url();

    const h1 = await page
      .locator("h1")
      .first()
      .textContent()
      .catch(() => null);

    const linkCount = await page.locator("a").count();
    const buttonCount = await page.locator("button").count();
    const imageCount = await page.locator("img").count();

    const bodyText = await page
      .locator("body")
      .innerText()
      .catch(() => "");

    const cleanBodyText = bodyText
      .replace(/\s+/g, " ")
      .trim();

    const textSample = cleanBodyText.slice(0, 1500);

    // -------------------------------
    // Page Verification
    // -------------------------------

    const lowerText = cleanBodyText.toLowerCase();
    const lowerTitle = title.toLowerCase();
    const lowerFinalUrl = finalUrl.toLowerCase();

    const challengeSignals = [
      "verify you are human",
      "verifying you are human",
      "checking your browser",
      "just a moment",
      "security check",
      "security verification",
      "attention required",
      "enable javascript and cookies",
      "performing security verification",
      "please wait while we verify",
      "access denied",
      "captcha",
    ];

    const detectedSignals = challengeSignals.filter(
      (signal) =>
        lowerText.includes(signal) ||
        lowerTitle.includes(signal)
    );

    const challengeUrlDetected =
      lowerFinalUrl.includes("/cdn-cgi/") ||
      lowerFinalUrl.includes("challenge");

    const suspiciouslySmallPage =
      cleanBodyText.length < 300 &&
      linkCount <= 3 &&
      buttonCount <= 1;

    const httpStatus = response?.status() || null;

    const suspiciousHttpStatus =
      httpStatus === 403 ||
      httpStatus === 429 ||
      httpStatus === 503;

    const possibleSecurityPage =
      detectedSignals.length > 0 ||
      challengeUrlDetected ||
      suspiciousHttpStatus ||
      suspiciouslySmallPage;

    const pageVerification = {
      status: possibleSecurityPage
        ? "warning"
        : "verified",

      isLikelyRealPage: !possibleSecurityPage,

      httpStatus,

      detectedSignals,

      suspiciouslySmallPage,

      message: possibleSecurityPage
        ? "UXLens may have received a security, challenge, or intermediary page instead of the intended website."
        : "The captured page appears to be the intended website.",
    };

    // -------------------------------
    // Screenshot
    // -------------------------------

    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: 70,
      fullPage: false,
    });

    const screenshot =
      `data:image/jpeg;base64,${screenshotBuffer.toString(
        "base64"
      )}`;

    // -------------------------------
    // Accessibility
    // -------------------------------

    let accessibility = {
      issueCount: 0,
      affectedElements: 0,
      issues: [] as {
        id: string;
        impact: string | null;
        description: string;
        help: string;
        helpUrl: string;
        affectedElements: number;
        elements: {
          html: string;
          target: string[];
          failureSummary: string | null;
        }[];
      }[],
    };

    /*
      Only treat the accessibility audit as valid
      when UXLens believes it captured the intended page.
    */

    if (pageVerification.isLikelyRealPage) {
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

      const issues =
        accessibilityResults.violations.map(
          (violation) => ({
            id: violation.id,

            impact: violation.impact,

            description: violation.description,

            help: violation.help,

            helpUrl: violation.helpUrl,

            affectedElements:
              violation.nodes.length,

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

      const affectedElements =
        accessibilityResults.violations.reduce(
          (total, violation) =>
            total + violation.nodes.length,
          0
        );

      accessibility = {
        issueCount:
          accessibilityResults.violations.length,

        affectedElements,

        issues,
      };
    }

    // -------------------------------
    // Return analysis
    // -------------------------------

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

        pageVerification,

        accessibility,
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