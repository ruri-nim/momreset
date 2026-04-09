# MomReset Project Instructions

## Product Overview
MomReset is a Korean postpartum recovery and body reset web application.

It helps postpartum mothers:
- Recover physically during the first 6 weeks after childbirth
- Transition into weight loss and body reset afterward

This is not a generic fitness app.
This is a postpartum-aware recovery system.

## Core Concepts

### Body Score
- Daily health score based on yesterday's condition
- Range: 0-100
- Short-term metric

### Recovery Progress
- Long-term postpartum recovery progression
- Range: 0-100%
- Based on postpartum timeline from day 0 to day 42
- Long-term metric

### Critical Rule
- Never directly compare Body Score and Recovery Progress mathematically
- Never derive Recovery Progress from Body Score
- Always treat them as separate dimensions

## App Structure
- Home
- Exercise
- Food
- Report

## Domain Rules
- Recovery-first during postpartum day 0-42
- Reset and weight management become primary after day 43
- Exercise should reward stage-appropriate ranges, not maximum effort
- Feeding type is a recovery load modifier, not a bonus
- Nutrition score must be derived automatically from meal records
- AI food analysis must remain editable

## Technical Requirements
- Framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS
- UI: shadcn/ui style component structure
- Charts: recharts
- Animations: framer-motion
- Persistence: localStorage initially

## Coding Guidelines
- Prefer clarity over cleverness
- Keep domain logic in lib/
- Keep types in types/
- Keep UI and domain logic separate
- Use mock data where APIs are not ready
- Explain what changed after implementation

## UX Tone
- Calm
- Supportive
- Non-judgmental
- Never overwhelming

## Product Goal
MomReset should feel like:

> A smart postpartum recovery coach, not a tracking tool.
