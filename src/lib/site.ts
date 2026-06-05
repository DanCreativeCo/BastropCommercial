/**
 * Single source of truth for site-wide content.
 * Update agent details, contact info, and navigation here.
 */
export const site = {
  name: "Bastrop Commercial",
  longName: "Bastrop Commercial Real Estate",
  tagline: "Where Texas builds next.",
  description:
    "Investment land, development sites, and commercial property in Bastrop County, Texas — represented with institutional rigor and local conviction.",
  url: "https://www.bastropcommercialrealestate.com",

  agent: {
    name: "Taylor Homuth",
    title: "Realtor®",
    brokerage: "Spyglass Realty",
    phone: "512-877-6292",
    phoneHref: "tel:+15128776292",
    email: "taylor@spyglassrealty.com",
    bio: "Taylor is a Bastrop County commercial specialist who pairs institutional-grade diligence with genuine local conviction. Having spent the majority of her life on a ranch, she brings a rare, grounded understanding of land to every transaction — guiding investors, developers, and business owners through deals built on trust, clarity, and follow-through.",
  },

  stats: [
    { value: "$25M+", label: "Active Inventory" },
    { value: "90+ ac", label: "Industrial Land" },
    { value: "Bastrop", label: "County Specialist" },
    { value: "20 min", label: "To Austin (ABIA)" },
  ],

  nav: [
    { label: "Listings", href: "/listings" },
    { label: "Buy", href: "/buyers" },
    { label: "Sell", href: "/sellers" },
    { label: "Insights", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
} as const;
