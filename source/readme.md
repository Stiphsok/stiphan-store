# STIPHAN STORE

STIPHAN STORE is a responsive React/Vite storefront for 19 browser games, game themes, favorites, and Android packages already included in the repository.

## Run locally

```bash
npm install
npm run install:games
npm run dev
```

Create a production build with `npm run build`. Run the existing archive validation suite with `npm run test:archive`. TypeScript is checked with `npx tsc --noEmit`.

## Current storefront behavior

- STIPHAN Brick Fire is the initial homepage feature. Play Now launches the supplied original HTML in a sandboxed iframe; its game storage is limited to four allow-listed local keys.
- Brick Fire paddle control is pointer/touch-based. The original game has no keyboard gameplay handler; Enter/Space can activate focused menu buttons.
- The original HTML is in `src/games/brick-fire-original.html`. `backups/` contains the untouched supplied HTML and the previous React implementation for rollback.
- Brick Fire advances elapsed time in steps no larger than 25 ms, with a 100 ms catch-up ceiling to avoid slowing the ball during ordinary delayed frames or jumping after long stalls.
- Game cards include category filters, details, and local favorites.
- Every built-in game has a locally rendered, game-specific promotional cover. The artwork uses each game's own visual theme and gameplay elements rather than menu screenshots or unrelated stock photos.
- Die Again: Troll Edition, STIPHAN Puzzle, and Millionaire Challenge launch in the store below STIPHAN Brick Fire. Each game is built from its own project into `public/games/`.
- Game control support varies; check each game's guide.
- Favorites, theme ownership/selection, and virtual STC points stay local to each visitor's browser. STC has no cash value.
- Admin-managed games, apps, and themes are read from Supabase; admin changes are shared with visitors. A localStorage copy is retained only as an offline fallback.
- Admin-uploaded APKs, ZIPs, and catalog images are stored in the public `arena-zips` Supabase Storage bucket; app metadata is stored in `store_apps`.
- The Apps page links to the Android packages present in `public/downloads/`; it does not pretend unavailable apps are installed.
- About, Contact, Privacy, and Terms are static pages. The project does not include verified owner contact details.

## Advertising and launch notes

Ad scripts are not loaded, advertising is off, and `ads.txt` contains no authorized publisher record. Before considering advertising, the owner must verify the site/domain, add a real monitored contact channel, confirm rights to all distributed files, review legal disclosures, and implement any required visitor consent flow. Google approval is not guaranteed.

The canonical URL and sitemap currently use the supplied Netlify URL. Update them if the site moves to a verified custom domain.

## Supabase store database

`supabase/store-database.sql` creates the shared catalog tables and admin-only write policies. `supabase/catalog-storage-visibility.sql` adds the public-readable hidden-item index required for hiding built-in entries and makes the `arena-zips` bucket public for visitor downloads; run this second script in the Supabase SQL Editor if the base schema has already been applied. Catalog reads are available to visitors, while create/update/delete operations require an approved admin session. On an approved admin's first online visit, any missing built-in catalog entries, theme seeds, and previously saved local admin catalog entries are copied to Supabase without overwriting existing cloud rows. Favorites and STC remain local. The storefront keeps its local catalog cache for offline fallback.
