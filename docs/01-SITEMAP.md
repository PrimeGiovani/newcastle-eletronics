# 1. Sitemap & URL Architecture

```
/                                          Home
├── /products                              All products (category hub)
│   ├── /products/air-conditioners
│   │   ├── /1hp-inverter-split-ac
│   │   ├── /1-5hp-inverter-split-ac
│   │   ├── /2hp-inverter-split-ac
│   │   └── /3hp-standing-unit-ac
│   ├── /products/audio-systems
│   │   └── /2-1-dolby-sound-bar
│   ├── /products/kitchen-appliances
│   │   ├── /4-burner-gas-cooker
│   │   └── /90cm-chimney-range-hood
│   └── /products/solar-solutions
│       ├── /550w-mono-perc-solar-panel      (Solar Panels)
│       ├── /5kw-hybrid-inverter             (Hybrid Inverters)
│       ├── /3-5kw-off-grid-inverter         (Off-grid Inverters)
│       ├── /10kwh-lithium-battery           (Lithium Batteries)
│       ├── /5kw-all-in-one-ess              (All-in-One ESS)
│       └── /100w-solar-street-light         (Street Lights)
├── /solar-solutions                       Solar landing page (FAQ, process, free consultation)
├── /about
├── /projects                              (phase 2: /projects/[slug] case studies)
├── /blog
│   └── /blog/[slug]
├── /contact                               (#quote anchor; ?product= pre-fills form)
├── /sitemap.xml                           auto-generated
└── /robots.txt                            auto-generated
```

**URL rules:** lowercase, hyphenated, keyword-first, max 3 levels, no IDs or query strings in indexable URLs, one canonical per page.

**Phase 2 SEO landing pages** (high local-intent keywords):
`/solar-installation-[city]`, `/ac-installation-[city]`, `/solar-solutions/commercial`, `/solar-solutions/hotels`, `/products/solar-solutions/hybrid-inverters` (sub-category pages once each has 3+ products).
