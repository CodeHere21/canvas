# Frontend Implementation Plan — Step 12: Tabs, Auth, Admin

This document describes the design of the React frontend for the outfit-randomizer app

("What Lenka is wearing today"). It sits on top of the finished backend (Steps 1–11).

## 1. Context & Goals

The backend is complete and tested: JWT auth, clothing-item CRUD, outfit management,

season/archetype filtering, a random-picker, weekly "blackout" (exclude outfits worn in the

last 7 days), and a public "Claudia" pool browsable without logging in.

Before this step the frontend was a thin scaffold: fully login-gated, no tabs, no register

flow, no admin, and its components pointed at the wrong endpoint. Step 12 delivers the real UI.

**Decisions (locked):**

| Decision | Choice |

|---|---|

| Archetype filter buttons | 3 — `EVERYMAN, HERO, CAREGIVER` |

| Guest access | Enabled — guests browse the public pool; login unlocks Wardrobe + Admin |

| Admin panel | Included in this step |

## 2. Stack & Conventions

- Create React App + TypeScript + Tailwind + `react-router-dom` v7.

- Dev server on :3000, proxies `/api` + `/auth` to :8080 (`package.json` `"proxy"`). Relative

  URLs → same-origin → CORS is a non-issue in dev.

- JWT stored in `localStorage`; `authFetch` attaches `Authorization: Bearer <token>` when present.

- Lenka vs. Claudia is derived from **auth state + the wear-response `message`**, never the

  outfit `public` flag.

## 3. API Contract (consumed as-is)

| Method & Path | Body / Params | Auth | Returns |

|---|---|---|---|

| `POST /auth/register` | `{email,name,password}` | public | `{token,email,name}` |

| `POST /auth/login` | `{email,password}` | public | `{token,email,name}` |

| `GET /api/outfits-management` | `?season=` or `?archetype=` | public | `Outfit[]` |

| `GET /api/outfits-management/random` | `?season=`\|`?archetype=`\|`?clothingItemId=` | public | `Outfit` (204 if none) |

| `POST /api/outfits-management/{id}/wear` | — | auth | `{message,outfitId,outfitName,imageUrl,wornDate}` |

| `GET /api/clothing-items` | `?page=&size=12` | auth | `Page<ClothingItem>` |

| `GET /api/clothing-items/{id}/outfits` | — | auth | `Outfit[]` (blackout) |

| `POST /api/clothing-items` | multipart `file,name,category` | auth | `ClothingItem` |

| `PUT /api/clothing-items/{id}` | `{name,category}` | auth | `ClothingItem` |

| `DELETE /api/clothing-items/{id}` | — | auth | 204 |

| `POST /api/outfits-management` | multipart `file,name,clothingItemIds[],seasons[],archetypes[]` | auth | `Outfit` |

| `PUT /api/outfits-management/{id}` | `{name,clothingItemIds,seasons,archetypes}` | auth | `Outfit` |

| `DELETE /api/outfits-management/{id}` | — | auth | 204 |

Enums: `Category = TOPS,BOTTOMS,DRESSES,SHOES,OUTERWEAR,ACCESSORIES` ·

`Season = SPRING,SUMMER,FALL,WINTER` · `Archetype = EVERYMAN,HERO,CAREGIVER`.

Shapes: `ClothingItem = {id,name,category,imageUrl,createdAt}` (owner `@JsonIgnore`d).

`Outfit = {id,name,imageUrl,clothingItems[],seasons[],archetypes[],createdAt}`.

> Legacy `/api/outfits` (`OutfitController`) actually returns clothing items and is NOT used.

## 4. Routing

`Header` renders on every page. `RequireAuth` redirects guests to `/login`.

| Path | Page | Access |

|---|---|---|

| `/` | redirect → `/season` | all |

| `/season` | Season tab | all (guest = public pool) |

| `/archetypes` | Archetypes tab | all |

| `/wardrobe` | Wardrobe grid | auth |

| `/wardrobe/:id` | Outfit ideas for a piece | auth |

| `/admin` | Admin panel | auth |

| `/login` | Login / Register | all |

## 5. Component Architecture

```

src/

├─ App.tsx                        # routes + RequireAuth

├─ components/header/index.js     # top bar + tab nav (NavLink active styling)

├─ features/

│  ├─ auth/  AuthContext.tsx (+register), authFetch.ts, RequireAuth.tsx

│  ├─ outfits/

│  │  ├─ types.ts                 # ClothingItem, Outfit, WearResult, enums, Page<T>

│  │  ├─ OutfitGrid.tsx           # read-only thumbnail grid (onSelect)

│  │  ├─ WinnerModal.tsx          # "winner" popup + wear flow

│  │  ├─ Randomizer.tsx           # random pick (filter-aware) → onWinner

│  │  ├─ useOutfitBrowse.ts       # GET /outfits-management?filter

│  │  ├─ OutfitBrowser.tsx        # shared engine for Season & Archetypes

│  │  └─ index.ts

│  ├─ wardrobe/ useWardrobe.ts, index.ts     # paginated GET /clothing-items

│  └─ admin/ UploadClothingForm.tsx, CreateOutfitForm.tsx, index.ts

└─ pages/ season, archetypes, wardrobe, outfitIdeas, admin, login

```

**`OutfitBrowser`** — powers both Season & Archetypes. Props `{ filterKey: 'season'|'archetype',

options: string[] }`. Renders "All" + one button per option → `OutfitGrid` → `Randomizer` (active

filter) → hosts `WinnerModal`.

**`WinnerModal`** — shows the chosen outfit. Authed: "Wear this today" → `POST …/{id}/wear` → shows

returned message. Guest: "Log in to track what you wore" (no wear call).

**`Randomizer`** — `{filter?, onWinner}`; calls `/random` with the filter; 204 → "Nothing available

— everything's been worn this week."

**Admin forms — multipart, not JSON.** Append array params by repeating the key on `FormData`;

never set `Content-Type` (browser adds the boundary):

```ts

const fd = new FormData();

fd.append('file', file); fd.append('name', name);

seasons.forEach(s => fd.append('seasons', s));

archetypes.forEach(a => fd.append('archetypes', a));

clothingItemIds.forEach(id => fd.append('clothingItemIds', String(id)));

authFetch('/api/outfits-management', { method: 'POST', body: fd });

```

## 6. Guest vs. Authed Behavior

| Capability | Guest | Authed (Lenka) |

|---|---|---|

| Season / Archetypes + randomizer | ✅ public pool | ✅ own pool, blackout |

| "Wear this today" | ❌ (login prompt) | ✅ records + message |

| Wardrobe & outfit-ideas | ❌ → `/login` | ✅ |

| Admin | ❌ → `/login` | ✅ |

| Tab visibility | Season, Archetypes | + Wardrobe, Admin |

## 7. Removed (dead after this step)

`pages/home.tsx`, `pages/cart.tsx`, `features/outfits/useOutfits.ts`,

`features/outfits/OutfitModal.tsx`.

## 8. Verification Checklist

1. Backend on :8080; `npm start` → :3000.

2. Guest: `/` → `/season`; filters work on public grid; Randomizer popup shows "Log in to track…";

   Wardrobe/Admin hidden; `/wardrobe` → `/login`.

3. Register → lands logged in; Wardrobe + Admin appear.

4. Admin: upload clothing (with category) → shows in Wardrobe; create outfit tagging

   items+seasons+archetypes → shows under matching filters.

5. Authed browse: tabs show Lenka's pool; Randomizer → "Wear this today" → "Lenka is wearing …

   today!"; re-randomizing excludes it. Wardrobe → click piece → outfit-ideas grid + scoped randomizer.

6. No console/network errors; confirm an outfits-management response carries clothingItems/seasons/archetypes.


