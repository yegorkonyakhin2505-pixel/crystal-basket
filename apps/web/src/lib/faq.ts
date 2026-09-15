import { site } from "./site";
import { contactChannel } from "./contact";
import { routes } from "./paths";

/**
 * FAQ copy. Each answer is a self-contained 40–80 word passage (quotable by search and AI answers),
 * lives in full on /faq/ only, and may carry one follow-up link. Product pages ask product-specific
 * questions instead of repeating these (see products/[slug]/page.tsx).
 */
export interface QA { q: string; a: string; link?: [href: string, label: string] }

export const productFaq: QA[] = [
  { q: "Which wrist do you wear a crystal bracelet on?", a: "By tradition the left wrist receives energy and the right wrist projects it. Wear calming, love and abundance stones such as amethyst, rose quartz and citrine on the left, and protective or confidence stones such as black tourmaline and tiger's eye on the right. There is no rule worth stressing over: wear it on the wrist that feels right, and keep it off the hand you write with if it rubs." },
  { q: "How do you cleanse a crystal bracelet?", a: "Cleanse a crystal bracelet when it arrives and about once a month afterwards. Three gentle methods: leave it on a windowsill overnight in moonlight, rest it on a selenite plate for a few hours, or pass it through palo santo, sage or oud smoke. Keep hematite, lapis lazuli and pyrite out of water, and keep amethyst, citrine, carnelian and rose quartz out of long direct sun, which fades their colour.", link: [routes.care, "Full cleanse and care guide"] },
  { q: "Can I shower or swim with a crystal bracelet?", a: "Please don't. Water, soap and chlorine wear out stretch cord, and porous stones such as lapis lazuli, hematite and pyrite can dull or tarnish. Roll the bracelet off before showers, swimming, the gym and the beach, and put it back on once your skin is dry. A brief rinse in plain water is fine for quartz stones when you cleanse them." },
  { q: "Can I sleep in my crystal bracelet?", a: "Yes, if it is comfortable. Stretch cord is soft on the wrist and 8 mm beads are smooth. Calm stones such as amethyst and moonstone are traditionally kept close at night, while energising stones like carnelian and citrine are often left on the nightstand. If the bracelet leaves a mark in the morning, try the next size up." },
  { q: "How do I know the stones are real?", a: "Real stone is cold to the touch, heavier than it looks, and no two beads match in colour or pattern. Glass is lighter, warms up quickly and often shows tiny round bubbles. Every Crystal Basket bracelet uses natural, undyed stone, the box card says so, and each strand is checked bead by bead before it is strung." },
  { q: "How many crystal bracelets can I stack?", a: `Two to four looks best on most wrists. Group bracelets by intention, such as three calm pieces on the left wrist, or pair a dark stone with a pale one for contrast. Every Crystal Basket bracelet uses 8 mm beads, so any three sit evenly together, and any three bracelets are ${site.stackDiscountPct}% off as a stack.`, link: [routes.stacks, "Build a stack"] },
  { q: "What if the cord breaks?", a: `Stretch cord is a wear part, and even well-made bracelets loosen over time. We restring any Crystal Basket bracelet on fresh 1 mm cord for free, for life; send us an ${contactChannel} with your order name and we will arrange it. Rolling the bracelet on and off over your hand, instead of stretching it wide, makes the cord last much longer.` },
];

export const orderingFaq: QA[] = [
  { q: "How do I pay?", a: `Pay by credit or debit card at the secure Shopify checkout, or choose cash on delivery anywhere in the UAE. Prices are in UAE dirhams and include the linen pouch and cards. The welcome code ${site.welcome.code} and the automatic ${site.stackDiscountPct}% stack discount are both applied at checkout.` },
  { q: "How fast is delivery in the UAE?", a: `Most orders arrive the next working day, and all within one to two working days, anywhere in the UAE. Delivery costs ${site.deliveryFeeAED} AED and is free on orders over ${site.freeDeliveryAED} AED. Cash on delivery is available, and Shopify emails your order confirmation as soon as the order is placed.`, link: [routes.delivery, "Delivery details"] },
  { q: "Can I exchange the size?", a: "Yes. If your bracelet does not fit, exchange it for another size within 14 days of delivery, as long as it is unworn and in its pouch, and we cover the courier once. Not sure of your size? Measure your wrist with a strip of paper and check the size guide first, or send us your measurement and we will string it to fit.", link: [routes.returns, "Exchanges and returns"] },
  { q: "Do you gift-wrap?", a: "Every bracelet ships ready to give, in a linen pouch with a meaning card explaining what its stones are traditionally worn for. If it is a gift, tell us in the order note or in a message and we will include a handwritten card with your words." },
];
