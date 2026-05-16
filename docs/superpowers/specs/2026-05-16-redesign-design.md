# Redesign: standard-card with Green Brand System + shadcn/ui

**Date:** 2026-05-16  
**Scope:** Full UI redesign — all screens

---

## Overview

Replace the ad-hoc `bg-lime-*`/`dark:bg-gray-*` Tailwind classes throughout the app with a consistent green brand design system (from `day_dark mode css.md`) wired to shadcn/ui's CSS variable layer. Add env-var configuration for app name and PIN. Use Lucide icons in the bottom nav.

---

## 1. Design Tokens

### Source tokens (globals.css — added above existing shadcn variables)

```css
:root {
  --clr-primary:        #378e2f;
  --clr-primary-hover:  #158106;
  --clr-primary-muted:  #7db477;
  --clr-primary-fg:     #ffffff;

  --clr-bg:             #f5f7f5;
  --clr-surface:        #ffffff;
  --clr-surface-raised: #eef2ee;
  --clr-border:         #d4dbd4;
  --clr-overlay:        rgba(0,0,0,0.08);

  --clr-text:           #1a261a;
  --clr-text-muted:     #52635f;
  --clr-text-faint:     #8a9a8a;

  --clr-success:        #22946e;
  --clr-success-bg:     #eaf5f1;
  --clr-warning:        #a87a2a;
  --clr-warning-bg:     #fdf4e7;
  --clr-danger:         #9c2121;
  --clr-danger-bg:      #fdecea;
  --clr-info:           #21498a;
  --clr-info-bg:        #eaf0fa;
}

.dark {
  --clr-primary:        #67a760;
  --clr-primary-hover:  #7db477;
  --clr-primary-muted:  #378e2f;
  --clr-primary-fg:     #0d1a0d;

  --clr-bg:             #1a1f1a;
  --clr-surface:        #242b24;
  --clr-surface-raised: #2f382f;
  --clr-border:         #3c453c;
  --clr-overlay:        rgba(0,0,0,0.3);

  --clr-text:           #e8ede8;
  --clr-text-muted:     #9aaa9a;
  --clr-text-faint:     #687268;

  --clr-success:        #5ba989;
  --clr-success-bg:     #1a2e27;
  --clr-warning:        #ba945a;
  --clr-warning-bg:     #2e2010;
  --clr-danger:         #b4544c;
  --clr-danger-bg:      #2e1212;
  --clr-info:           #4b6ca2;
  --clr-info-bg:        #101828;
}
```

### shadcn variable mapping (override existing shadcn defaults)

```css
:root, .dark {
  --background:         var(--clr-bg);
  --foreground:         var(--clr-text);
  --card:               var(--clr-surface);
  --card-foreground:    var(--clr-text);
  --muted:              var(--clr-surface-raised);
  --muted-foreground:   var(--clr-text-muted);
  --border:             var(--clr-border);
  --primary:            var(--clr-primary);
  --primary-foreground: var(--clr-primary-fg);
  --destructive:        var(--clr-danger);
}
```

The mapping applies to both `:root` and `.dark` — each picks up its own `--clr-*` values automatically since those are already split.

---

## 2. Env Vars

| Variable | Usage | Fallback |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | App title in PinLock, Home header, `<title>` metadata | `"SupaClaw Cafe"` |
| `NEXT_PUBLIC_PIN` | 4-digit unlock PIN in PinLock | `"7777"` |

- Consumed client-side via `process.env.NEXT_PUBLIC_APP_NAME` and `process.env.NEXT_PUBLIC_PIN`
- Added to `.env.local.example` with placeholder values
- Configured in Vercel project env settings

---

## 3. New shadcn Components to Add

```bash
npx shadcn@latest add input textarea badge card label skeleton separator
```

`lucide-react` is already installed as a shadcn peer dependency.

---

## 4. Component Changes

### globals.css
- Add brand tokens (`--clr-*`) for `:root` and `.dark`
- Override shadcn's default variable values using the mapping above
- Remove the old per-component `body { @apply bg-white }` rules (replaced by `bg-background`)

### layout.tsx
- Read `NEXT_PUBLIC_APP_NAME` for the `<title>` metadata field

### BottomNav.tsx
- Replace emoji with Lucide icons: `Home`, `Users`, `CreditCard`, `Search`, `Bell`
- Active tab: `text-[var(--clr-primary)] border-t-2 border-[var(--clr-primary)]`
- Inactive tab: `text-[var(--clr-text-muted)]`
- Nav background: `bg-[var(--clr-surface)] border-[var(--clr-border)]`

### ThemeToggle.tsx
- shadcn `Button` ghost variant
- Lucide `Sun` / `Moon` icons instead of text labels

### PinLock.tsx
- PIN from `process.env.NEXT_PUBLIC_PIN ?? "7777"`
- App name from `process.env.NEXT_PUBLIC_APP_NAME ?? "SupaClaw Cafe"`
- Background: `bg-[var(--clr-bg)]`
- PIN input boxes: shadcn `Input`, focus ring in `--clr-primary`
- Error state: `border-[var(--clr-danger)]`

### home/page.tsx
- shadcn `Input` for card number, stamp count, comment fields
- shadcn `Button` (default) for Add Stamps, (outline) for Subtract
- shadcn `Card` for stat tiles (Total Customers, Cards Issued)
- Stat values: `text-[var(--clr-primary)]` for primary metric
- Telegram button: shadcn `Button` (outline) with `ExternalLink` icon
- App name from env var in `<h1>`

### customers/page.tsx
- shadcn `Button` for Refresh and pagination (← Prev / Next →)
- Customer rows: shadcn `Card` (hover effect via `active:scale-95`)
- Card serial number in `font-mono text-[var(--clr-primary)]`
- Loading state: shadcn `Skeleton` (3–4 rows)

### cards/page.tsx
- shadcn `Button` for Export CSV and Refresh
- Filter section: shadcn `Card` + `Label` + `Input` + native `select` styled with border tokens
- Card status badge: shadcn `Badge` — `bg-[var(--clr-success-bg)] text-[var(--clr-success)]` for installed, muted for not_installed
- Card rows: shadcn `Card`
- Loading: shadcn `Skeleton`

### find/page.tsx
- shadcn `Input` with `Search` Lucide icon prefix
- Result rows: shadcn `Card`
- Empty/prompt states: muted-foreground text

### push/page.tsx
- shadcn `Textarea` for message input
- shadcn `Button` (default) for Send, (outline) for Refresh
- History items: shadcn `Card` with `Separator` between message and metadata

### CustomerModal.tsx
- Bottom sheet background: `bg-[var(--clr-surface-raised)]`
- Stats grid: shadcn `Card`
- Customer info grid: shadcn `Card`
- Edit form: shadcn `Input` + `Label`
- Save/Cancel: shadcn `Button` (default) / (outline)
- Card status: shadcn `Badge`
- Subtract Reward: shadcn `Button` (outline) with `Minus` icon
- Delete confirmation: uses `--clr-danger-bg` / `--clr-danger` tokens
- Close button: shadcn `Button` ghost with `X` icon

### StampPanel.tsx
- shadcn `Input` for stamp count and comment
- shadcn `Button` (default) for Add, (outline) for Subtract

### ActivityLog.tsx
- shadcn `Badge` for action: green for add-stamp, destructive for subtract
- Entry rows: `bg-[var(--clr-surface-raised)]` rounded cards

---

## 5. Styling Rules

- No raw `bg-lime-*`, `bg-gray-*`, `dark:bg-gray-*` remaining after redesign
- Foundational surfaces: `bg-background`, `bg-card`, `bg-muted`
- Text hierarchy: `text-foreground`, `text-muted-foreground`, `text-[var(--clr-text-faint)]`
- Brand accent: `text-[var(--clr-primary)]`, `bg-[var(--clr-primary)]`
- Semantic: `text-[var(--clr-success)]`, `bg-[var(--clr-success-bg)]`, etc.
- Borders: `border-border` (shadcn token) or `border-[var(--clr-border)]`
- All interactive cards: `transition-transform active:scale-95`

---

## 6. Files Changed

```
src/app/globals.css
src/app/layout.tsx
src/components/BottomNav.tsx
src/components/ThemeToggle.tsx
src/components/PinLock.tsx
src/components/ActivityLog.tsx
src/components/CustomerModal.tsx
src/components/StampPanel.tsx
src/app/home/page.tsx
src/app/customers/page.tsx
src/app/cards/page.tsx
src/app/find/page.tsx
src/app/push/page.tsx
.env.local.example          ← new file
```

No API routes, types, or lib files are touched.
