# Khaffif — Mobile App (React Native / Expo)

The native client for Khaffif. It shares the same zone ids, coordinates and Supabase backend as the web app in `../web`, so both clients see the same live counts.

## Run it

Requirements: Node.js 18+ and the **Expo Go** app on your phone.

```bash
cd mobile
npm install
npm run setup     # installs native modules at versions matching your Expo SDK
npx expo start    # scan the QR code with Expo Go
```

If your phone and laptop are on different networks, use `npx expo start --tunnel`.

## Connect live data

1. Run `../database/schema.sql` in your Supabase project (SQL Editor).
2. Put the Project URL and anon key in `src/services/api.js`.
3. `DEMO_CAPACITY` sets how many devices count as 100% full (small, so a few phones can demo it).

Without these values the app runs in simulation mode.

## Demo mode

The app opens in **demo mode**: tap the map to move your position. Entering a zone increments its count and shows a one-tap "How crowded is it?" prompt. Turn demo mode off in **Profile** to use real GPS on campus.

## Structure

```
App.js                    State, geofencing, enter/exit logic, notifications, live polling
src/data/places.js        Campuses, zones, capacities and hourly forecast profiles
src/services/api.js       Supabase REST client (presence, reports, counts, boundaries)
src/utils/geo.js          Haversine distance and map region helpers
src/screens/              Onboarding, Map, Places, Forecast, Profile
src/components/           Tab bar, place card, level pill, check-in banner
```

## Notes

- Background tracking (counting while the app is closed) requires a development build (`eas build`); Expo Go supports foreground tracking only.
- Role-based features (study finder, room changes, admin insights) and speed-based parking detection currently live in the web app.
