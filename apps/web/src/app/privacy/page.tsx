import type { Metadata } from "next";
import { PageIntro } from "@/components/Store/PageIntro";
import { routes } from "@/lib/paths";
import { site } from "@/lib/site";
import { breadcrumbLd, ld } from "@/lib/schema";
import { formatReviewed, lastCommitDate, sources } from "@/lib/git-date";

const description = "What Crystal Basket collects when you browse and order: order details handled by Shopify, card payments processed by Stripe, and a wishlist and bag kept in your own browser.";
export const metadata: Metadata = { title: "Privacy", description, openGraph: { title: "Privacy", description } };

const sections: [string, string][] = [
  ["What happens when I order?", "Checkout runs on Shopify. The name, email, phone number and delivery address you enter there are used to deliver your order and contact you about it, and Shopify stores them for us under its own privacy policy. Card payments are processed by Stripe inside that checkout, so your card details never reach this website."],
  ["What does this website store?", "Your bag, wishlist and welcome-offer status are saved in your own browser's local storage, so they are still there when you come back. They are not sent to us. This site has no advertising trackers and no analytics cookies."],
  ["Do you send marketing emails?", "Not yet. The welcome-offer form currently keeps your email in your own browser only, to show the code. Before we start sending emails we will update this page and ask for your consent."],
  ["How do I ask about my data?", `Email ${site.email} and we will tell you what we hold about you, correct it, or delete it, apart from what we must keep for order and tax records.`],
];

export default function PrivacyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbLd([["Privacy", routes.privacy]])) }} />
      <PageIntro heading="Privacy" tagline="Only what an order needs." reviewed={formatReviewed(lastCommitDate(sources.page("privacy")))}>
        <p>{description}</p>
      </PageIntro>
      <section className="container-x pb-20 max-w-3xl space-y-8">
        {sections.map(([q, a]) => (
          <div key={q}>
            <h2 className="text-2xl md:text-[1.9rem]">{q}</h2>
            <p className="text-cb-muted mt-3 leading-relaxed">{a}</p>
          </div>
        ))}
      </section>
    </>
  );
}
