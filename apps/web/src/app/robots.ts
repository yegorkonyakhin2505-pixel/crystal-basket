import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Everything public is crawlable. AI search and answer crawlers are named explicitly so a future
 * blanket rule can't shut them out by accident: being cited in AI Overviews, ChatGPT, Perplexity and
 * Copilot is how a small brand gets found. Training crawlers are allowed too (owner's choice, easy to flip).
 * The RSC payload files Next writes beside each page (index.txt) are not pages, so they stay out of the index.
 */
const SEARCH_AND_ANSWER = ["Googlebot", "Bingbot", "Applebot", "DuckDuckBot", "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "DuckAssistBot"];
const TRAINING = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "meta-externalagent", "Amazonbot"];
const NOT_PAGES = ["/*index.txt$"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: SEARCH_AND_ANSWER, allow: "/", disallow: NOT_PAGES },
      { userAgent: TRAINING, allow: "/", disallow: NOT_PAGES },
      { userAgent: "*", allow: "/", disallow: NOT_PAGES },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
