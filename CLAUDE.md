# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (Next.js)
```bash
npm run dev        # Start dev server with Turbopack (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
npm test           # Run Vitest tests (single run)
npm run test:watch # Run Vitest in watch mode
```

### Run a single test file
```bash
npx vitest run src/tests/ClothingController.test.ts
```

### Python Flask API
```bash
cd server
pip install -r requirements.txt
pip install -r requirements-dev.txt   # pytest (only needed to run tests)
python flaskAPI.py              # Start on http://localhost:5000
python -m pytest tests/ -v             # Run all Python tests
python -m pytest tests/test_travel_planner.py -v   # Run a single test file
```

## Architecture

This is a **two-service application**:

1. **Next.js frontend** (`src/`) — UI, auth, and data persistence via Appwrite
2. **Flask backend** (`server/`) — AI/ML image analysis and outfit generation

### Data flow

**Clothing upload:**  
User uploads image → frontend compresses to WebP → sends to Flask `/analyze` (FashionCLIP model classifies type, color, material, print, style, occasion) → results stored in Appwrite database alongside the image file stored in Appwrite Storage.

**Outfit generation:**  
User sets filters → `ClothingController.generateOutfits()` fetches user's clothes from Appwrite → sends to Flask `/generate-outfits` or `/generate-outfit-with-base` → Flask applies color/material/print compatibility rules → returns outfit combinations as `{ superior, inferior, calzado }` or `{ completo, calzado }`.

**Profile refinement:**  
User interactions (saved/regenerated/liked/discarded) are recorded in Appwrite `userInteractions`. Every 5 interactions, `ProfileController.triggerRefinement()` sends the last 20 interactions to Flask `/refine-profile` → Bayesian update on 6 profile coordinates → stored back in Appwrite `userProfiles`.

### Frontend structure

```
src/
  app/
    models/         # TypeScript interfaces (Clothing, UserProfile, UserInteraction)
    repositories/   # Direct Appwrite SDK calls (ClothingRepository, OutfitRepository, etc.)
    controllers/    # Business logic composing repositories + Flask API calls
    components/ui/  # shadcn/ui primitives + custom app components
    auth/           # Login and register pages
    onboarding/     # One-time quiz after registration
    generator/      # Main outfit generation page
    virtual_wardrobe/ # User's wardrobe management
    feed/           # Public outfit feed
    profile/        # User profile page
  lib/
    appwrite.js     # Appwrite client (account, databases, storage)
    config.ts       # FLASK_API_URL env var
    OutfitFeatures.ts  # Extracts numeric features from an outfit for profile refinement
    ClothingCategoryMapper.ts
```

### Backend structure

```
server/
  flaskAPI.py        # Main Flask app: /analyze, /generate-outfits, /generate-outfit-with-base
  profile_refiner.py # /refine-profile endpoint + Bayesian update logic
  yolov8n.pt         # YOLOv8 model weights (unused in current routing, present for future use)
```

### Key design decisions

- **Appwrite** is the sole persistence layer (auth, database, file storage). All collection IDs and bucket IDs are env vars prefixed `NEXT_PUBLIC_APPWRITE_*`.
- **Category system** uses Spanish slot names in outfit objects: `superior` (shirts/jackets), `inferior` (pants/skirts), `calzado` (shoes), `completo` (dresses). The Flask API and frontend share this vocabulary.
- **Color compatibility** is rule-based via `COLOR_RULES` in `flaskAPI.py` — the same RGB-to-name mapping exists in both `flaskAPI.py` and `ClothingController.ts` and must stay in sync if changed.
- **Profile coordinates** are 6 floats in [0,1]: `coord_identity`, `coord_risk`, `coord_formality`, `coord_colorIntensity`, `coord_trendOrientation`, `coord_occasionDiversity`. Quiz answers deterministically map to these; interactions refine them via `profile_refiner.py`.
- **`ProtectedRoute`** component wraps all authenticated pages and redirects to `/auth/login` if no active Appwrite session.
- CSS follows a BEM-like pattern with page-scoped prefixes (e.g., `gen-` for generator, `home-` for landing page). Styles live in `globals.css`.

### Environment variables

All required variables are in `.env`. The Flask URL is controlled by `NEXT_PUBLIC_FLASK_URL` (ProfileController) and `NEXT_PUBLIC_FLASK_API_URL` (ClothingController / `src/lib/config.ts`) — both default to `http://localhost:5000`.

### Testing

- Frontend: Vitest + jsdom + `@testing-library/react`. Test files live in `src/tests/` (`*.test.ts`); they import the module under test via the `@/` alias. Appwrite SDK and `fetch` are mocked with `vi.mock`.
- Python: pytest in `server/tests/` (`test_flaskAPI.py`, `test_profile_refiner.py`, `test_travel_planner.py`, `test_wardrobe_analyzer.py`, `test_wardrobe_chatbot.py`). `server/tests/conftest.py` adds `server/` to `sys.path` so the modules import regardless of the working directory. Network calls (OpenWeatherMap, Gemini, DummyJSON) and heavy ML deps are mocked.
