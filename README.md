# Wynter Pearce — official acting portfolio

Static site. No framework, no build step, nothing to install.

## Files

```
index.html                 the whole page
assets/css/styles.css      design system + layout
assets/js/main.js          sticky nav, mobile menu, scroll reveals, active section
assets/img/                logo, favicon, share card, web-sized photographs, clip posters
assets/video/              the 90-second reel (web-encoded, 9:16)
CNAME-free, no server code, no database
```

## Deploying on Cloudflare Pages

Connect this repository to Cloudflare Pages with the following settings:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | (leave empty) |
| Build output directory | `/` |
| Root directory | `/` |

Every push to the production branch republishes the site automatically.

## Custom domain

1. Cloudflare dashboard → Workers & Pages → this project → Custom domains → Set up a domain
2. Add `wynterpearce.com` (and `www` redirecting to it)
3. If the domain's DNS is already in the same Cloudflare account, the records are added for the project automatically; otherwise add the CNAME record Cloudflare shows you
4. SSL is issued automatically

## Content policy enforced in this build

- No school, address, phone number, schedule or personal social account anywhere in the markup
- No cookies, no analytics, no third-party tracking
- Photographs and footage only where publication permission is confirmed
- Credits and skills published only once confirmed with the parent

## Editing

All content lives in `index.html`. Section anchors are `#reel`, `#headshots`,
`#performances`, `#resume`, `#skills`, `#about`, `#contact` — the sticky nav links
to these, so adding or reordering a section means updating both.

Items marked "awaiting" are placeholders for material not yet supplied. They are
never filled with estimates.
