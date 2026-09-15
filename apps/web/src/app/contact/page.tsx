import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/Store/PageIntro";
import { routes } from "@/lib/paths";
import { flags, site } from "@/lib/site";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { breadcrumbLd, ld } from "@/lib/schema";

const description = `Contact Crystal Basket, a crystal bracelet studio in ${site.city}: email ${site.email} or message @${site.instagram} on Instagram about orders, sizing and custom lengths.`;
export const metadata: Metadata = { title: "Contact Crystal Basket", description, openGraph: { title: "Contact Crystal Basket", description } };

export default function ContactPage() {
  const channels: [string, string, string][] = [
    ["Email", site.email, `mailto:${site.email}`],
    ["Instagram", `@${site.instagram}`, `https://www.instagram.com/${site.instagram}/`],
    ...(flags.whatsapp ? [["WhatsApp", `+${site.whatsapp}`, whatsappChatUrl("Hi Crystal Basket!")] as [string, string, string]] : []),
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbLd([["Contact", routes.contact]])) }} />
      <PageIntro heading="Contact Crystal Basket" tagline="Write to us.">
        <p>Questions about an order, a size, a custom length or which stones to choose all come to the same small studio in {site.city}, United Arab Emirates.</p>
      </PageIntro>
      <section className="container-x pb-12 max-w-3xl">
        <ul className="border-t border-cb-line">
          {channels.map(([label, value, href]) => (
            <li key={label} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-cb-line py-5">
              <span className="label-caps">{label}</span>
              <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})} className="font-display text-2xl hover:text-cb-rose break-all">{value}</a>
            </li>
          ))}
        </ul>
      </section>
      <section className="container-x pb-20 max-w-3xl">
        <h2 className="text-3xl md:text-[2.25rem]">What should I include?</h2>
        <p className="text-cb-muted mt-3 leading-relaxed">For an existing order, include the order name from your confirmation email. For a custom length, include your wrist measurement in centimetres. Answers to the most common questions are in the <Link href={routes.faq} className="text-cb-ink underline underline-offset-4">FAQ</Link>, and delivery and exchange details are on the <Link href={routes.delivery} className="text-cb-ink underline underline-offset-4">delivery</Link> and <Link href={routes.returns} className="text-cb-ink underline underline-offset-4">exchanges</Link> pages.</p>
      </section>
    </>
  );
}
