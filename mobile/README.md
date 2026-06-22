# Daily OK Mobile

This folder is the starting point for the native mobile app.

## Planned direction

- Expo + React Native app
- Same tab structure as the web app
- Supabase-backed shared data
- iOS widget after app data is shared through a server DB and App Groups

## First run

1. `cd mobile`
2. `npm install`
3. `npm run dev`
4. Press `i` in the Expo terminal to open iOS Simulator

## What is in here now

- A tab-based mobile shell
- Placeholder screens for Home, Food, Exercise, Rules, and My Progress
- A UI direction that matches the current Daily OK visual tone

## Next build steps

1. Add Supabase auth and tables
2. Move food/exercise/rule/weight data off localStorage
3. Build the real Today Summary API for widget use
4. Add an iOS WidgetKit extension

## Supabase env

Create `mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```
