This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Issues and Fixes Journal

### 1. CommonJS 
equire() Migrations
**Issue**: Using 
equire() for importing modules was causing ESLint errors and blocking modernization (specifically panchangam-js).
**Fix**: Migrated 
equire calls to wait import() in src/services/astrology/kundli.service.ts and src/services/astrology/panchang.service.ts inside asynchronous functions.

### 2. TypeScript ny Type Replacements
**Issue**: Extensive use of ny across the codebase triggered strict linting errors.
**Fix**: Replaced raw ny types with Record<string, unknown>, Record<string, string | number | boolean | null>, or specific interfaces (like PanchangPositionData in geocoding.service.ts). In deeply nested legacy UI components (like kundli/page.tsx) that ingest untyped dynamic structures from panchangam-js, selectively disabled 
o-explicit-any on an exact-need basis to maintain functionality and type inference balance without triggering 	sc compilation failures.

### 3. TypeScript Compilation (tsc) Errors
**Issue**: Index signature mismatch errors heavily plagued complex data interfaces like MappedHouse, PlanetInfo, and DashaData.
**Fix**: Resolved all 
px tsc --noEmit cascading errors by aligning data structures, safely casting complex object lookups (s string, s any) in 
eport-generator.ts and strology.ts, and restructuring React states in dashboard components to safely accept Next.js nodes.

### 4. Code Quality & Linting
**Issue**: 
o-unused-vars, prefer-const, and 
o-img-element warnings throughout several pages.
**Fix**: Cleaned up unused variables and prefixed ignored variables with _. Added  lt attributes and disabled the 
o-img-element rule selectively where using Next.js <Image> was unsafe for external URLs without full domain configuration in 
ext.config.js.

**Build Result**: `npm run lint` and `npx tsc --noEmit` are now passing with zero errors.

### 5. Feature: Vastu Consultation Service
**Issue**: Added a brand new Vastu Consultation service booking system.
**Fix**:
- **Database**: Created `supabase_vastu_schema.sql` which adds `offers_vastu` to `astrologer_profiles`, and creates `vastu_bookings` and `vastu_availability` tables with row level security.
- **Astrologer Signup**: Updated `register/page.tsx` to include an "I also offer Vastu Consultation" checkbox which persists the `offers_vastu` flag to Supabase upon registration.
- **Astrologer Dashboard**: Updated `astrologer/dashboard/page.tsx` to conditionally render a "Vastu Bookings" tab if `offers_vastu` is true. Included real-time live queries to fetch, accept, and deny incoming Vastu bookings.
- **User Booking Flow**: Added a new public route `vastu/page.tsx` which queries consultants dynamically from Supabase where `offers_vastu` is true. Included a robust booking form that inserts data safely into `vastu_bookings` with an optional "Notes" field.
- **Navigation**: Inserted links into `Navbar.tsx` and `Footer.tsx`.
- **Quality**: Enforced zero TypeScript/ESLint warnings throughout the additions.
