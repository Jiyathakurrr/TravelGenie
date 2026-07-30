# UI/UX Guidelines

This document outlines the design principles to ensure TravelGenie looks professional, modern, and trustworthy.

## Design Philosophy
- **Clean & Minimal:** Avoid clutter. Let the itinerary data and beautiful destination imagery be the focal point.
- **Conversational:** The AI chatbot should feel like messaging a friend. Use soft bubbles, clear avatars, and smooth scrolling.
- **Trustworthy:** In the Booking module, pricing must be explicit. Use standard success/error colors for transactions.

## Color Palette
- **Primary:** Deep Indigo (`#4F46E5`) - Used for primary actions (Generate Trip, Book Now).
- **Secondary:** Teal (`#14B8A6`) - Used for highlights and AI chatbot accents.
- **Background:** Off-White (`#F9FAFB`) for main pages; pure white (`#FFFFFF`) for cards.
- **Text:** Dark Gray (`#1F2937`) for headings; Lighter Gray (`#4B5563`) for body text.
- **Error/Alert:** Rose (`#E11D48`) - Used for booking errors (inline messages).
- **Success:** Emerald (`#10B981`).

## Typography
- **Font Family:** Inter (Google Fonts) for clean readability.
- **Headings:** Bold, high contrast.
- **Body:** Regular weight, 16px base size.

## Component Guidelines

### Cards
- Used for displaying daily itineraries and hotel/flight options.
- Must have a subtle shadow (`shadow-md` in Tailwind) and rounded corners (`rounded-xl`).
- Hover effects: slightly lift the card (`-translate-y-1`) to indicate interactivity.

### Buttons
- Primary buttons should be solid with the Primary color.
- Secondary actions should be outlined.
- Always include a loading state (spinner or pulsing skeleton) when awaiting AI or backend responses.

### Error Handling (Booking Module)
- **NEVER redirect** a user to a blank error page if a booking fails.
- Display a clearly visible, Rose-colored inline alert banner above the booking form.
- Example: "Prices have recently updated. The flight cost increased by $50. Please review before proceeding."
