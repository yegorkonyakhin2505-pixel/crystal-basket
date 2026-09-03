import { ButtonLink } from "@/components/ui";
import { routes } from "@/lib/paths";
export default function NotFound() {
  return <section className="container-x py-32 text-center"><p className="label-caps mb-3">404</p><h1 className="text-4xl md:text-6xl">That page slipped off the wrist.</h1><ButtonLink href={routes.shop} className="mt-8">Back to the shop</ButtonLink></section>;
}
