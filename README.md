# Poker Range Assistant

## Overview

The Poker Range Assistant is a web-based tool for No-Limit Hold’em (NLHE) preflop range calculation and visualization, designed to assist players in understanding and applying Game Theory Optimal (GTO) and exploitative strategies. Built with vanilla JavaScript, HTML, and CSS, the app provides an interactive 13x13 grid to display poker hand ranges, color-coded by action types (e.g., Raise/RFI, Call, 3-Bet, 4-Bet) and hand types (e.g., suited, offsuit, pairs). It supports multiple strategies, including GTO and exploitative approaches for 40% and 55% VPIP opponents, in both 5-position and 7-position (8-max) formats.


## Features

- **Multiple Strategy Types**: Supports GTO and exploitative strategies for 40% and 55% VPIP opponents.
- **Position Support**: Handles 5-position (UTG, UTG+1, MP, CO, BTN) and 7-position (SB, BB, UTG, UTG+1, MP, CO, BTN) formats.
- **Interactive Visualization**: Color-coded 13x13 grid for poker hands, with toggles for patterns and position-specific ranges.
- **Action Types**: Supports RFI (Raise First In), vs Raise, vs 3-Bet, and vs Limp actions.
- **Responsive Design**: Mobile-friendly interface with a dark theme for readability.
- **Post-Flop Tips**: Includes optional tips for post-flop play based on preflop configurations (loaded from JSON files).


## Structure

- `index.html` - Main application file (includes HTML, CSS, JS)
- ranges/`40p_gto_7pos.json` - GTO ranges for 40% VPIP opponent (7-pos)


## Implementation Details


### Key Functions
- `loadRangeData()` - Loads JSON range files
- `getCumulativeRange()` - Computes final range based on position
- `updateDisplay()` - Handles UI updates
- `initializeRangeChart()` - Creates the grid visualization

### Action Types
- RFI (Raise First In)
- vs Raise (call/3-bet)
- vs 3-bet (call/4-bet)
- vs Limp (call/raise)

### Hand Types
- Pairs (e.g., AA, KK)
- Suited hands (e.g., AKs, KQs)
- Offsuit hands (e.g., AKo, KQo)

### Action Colors
- Purple: Raise/RFI
- Green: Call
- Blue: 3-Bet
- Orange: 4-Bet

### Position Logic
- 5-position format: UTG, UTG+1, MP, CO, BTN
- 7-position format: SB, BB, UTG, UTG+1, MP, CO, BTN
- Each position includes base range plus position-specific additions

## Development

1. Serve files using a local web server (required for JSON loading):
   ```bash
   python -m http.server 8000
   ```
2. Open `http://localhost:8000` in your browser
3. Check browser console for any errors

## Notes

- Grid uses CSS Grid with 13x13 layout
- Responsive design with mobile-friendly breakpoints
- Pattern notation toggle for simplified range display
- Color-coded hand types for better visibility
- Automatic strategy switching between 5-pos and 7-pos formats 


Below is a revised version of your app’s `README.md` file, including a dedicated section for AI tools like Cursor or Claude to gain context about the app, its range files, and design tenets to maintain functionality and consistency. I’ve structured it to be clear, concise, and informative for both human users and AI systems, while maintaining a professional and readable format.

---


## Context for AI Tools (Cursor/Claude)

This section is specifically for AI tools like Cursor or Claude to gain context about the Poker Range Assistant app, its range files, and design tenets to ensure modifications maintain functionality and consistency.

### App Overview for AI
- The Poker Range Assistant is a web-based NLHE preflop range calculator written in vanilla JavaScript, HTML, and CSS. It visualizes poker hand ranges in a 13x13 grid, color-coded by action types (Raise/RFI, Call, 3-Bet, 4-Bet) and hand types (suited, offsuit, pairs). The app supports GTO and exploitative strategies for 40% and 55% VPIP opponents in 5-position and 7-position (8-max) formats.
- Key files are `index.html` (main app) and `ranges/*.json` (range data and tips). Validation scripts (`validate_all_range_files.py`, `range_validator.js`) ensure data integrity.
- The app uses a dark theme, responsive design, and interactive controls for position, action type, and strategy selection.

### Range Files Context
- **Location**: All range data is stored in the `ranges/` directory as JSON files (e.g., `40p_gto_7pos.json`, `40p_gto_7pos_tips.json`).
- **Structure**:
  - Each JSON file contains a `ranges` object with action types (`rfi`, `facing_raise`, `vs_3bet`, `vs_limp`), VPIP strategies (`vpip_40`, `vpip_55`), and position-specific ranges (`base`, `utg_add`, `utg1_add`, `mp_add`, `co_add`, `btn_add`, `sb_add`, `bb_add`).
  - Hands are formatted as strings (e.g., `AKs` for Ace-King suited, `AKo` for Ace-King offsuit, `AA` for pocket Aces).
  - Patterns (e.g., `88+`, `AQs+`) simplify range notation and are toggled via the UI.
  - `40p_gto_7pos_tips.json` provides post-flop advice for each position/action/strategy combination.
- **Behavior**: Ranges should widen progressively from early (UTG) to late positions (BTN, SB, BB), inheriting and accumulating hands from `base` and earlier `position_add` sections. Use the `getCumulativeRange()` function in `index.html` to implement this (see recent updates for cumulative logic).
- **Validation**: Ensure hands follow poker notation (2 chars for pairs, 3 chars for suited/offsuit with `s` or `o`), no duplicates, and no overlaps between call/raise or call/3-bet/4-bet ranges. Use validation scripts to check data integrity.

### Design Tenets for AI
- **Maintain UI Integrity**: Preserve the dark theme (`--bg-primary: #1a1a1a`, `--text-primary: #ffffff`) and color coding (Raise/RFI: purple `#9C27B0`, Call: green `#4CAF50`, 3-Bet: blue `#2196F3`, 4-Bet: orange `#FF9800`).
- **Responsive Design**: Ensure the 13x13 grid and controls remain mobile-friendly with CSS media queries (e.g., `@media (min-width: 768px)`).
- **Range Consistency**: Keep GTO ranges balanced for 40%/55% VPIP opponents, avoiding exploitative deviations unless specified. Ensure later positions include earlier positions’ ranges plus additions (cumulative inheritance).
- **Modularity**: Avoid hardcoding ranges in JavaScript; use JSON files for all range data and tips. Any changes to range logic should update `getCumulativeRange()` and respect the JSON structure.
- **Error Handling**: Maintain robust error handling for JSON loading (`fetch` errors) and range processing (invalid hands, missing data).
- **Testing**: Verify changes with specific configurations (e.g., BTN vs 3-Bet, GTO 40% VPIP) to ensure correct range display and UI behavior. Use validation scripts to confirm data integrity.

### Implementation Guidelines
- When modifying `index.html` (JavaScript), focus on `getCumulativeRange()` for range logic, `updateDisplay()` for UI updates, and `loadRangeData()` for JSON loading. Avoid altering CSS or HTML unless necessary for new features.
- For range file updates, edit `ranges/*.json` to maintain the structure and validate with `validate_all_range_files.py` or `range_validator.js`.
- If adding features (e.g., tooltips, dynamic VPIP), ensure they align with the dark theme, color coding, and responsive design tenets.

This context ensures AI tools like Cursor or Claude can understand the app’s purpose, data structure, and design constraints, minimizing the risk of breaking functionality while making updates.

--- 
