# Custom Ranges for Poker Range Assistant

This document provides guidance on creating and importing custom range data into the Poker Range Assistant, allowing you to personalize preflop ranges for No-Limit Hold’em (NLHE) study. The Poker Range Assistant is designed as an educational tool for analyzing preflop strategies, and custom ranges enable you to tailor it to specific opponents, strategies, or learning goals.

## Overview

The Poker Range Assistant supports importing custom range data via JSON files, which can replace or supplement the default GTO and exploitative ranges (e.g., `40p_gto_7pos.json`, `40p_exp_7pos.json`). Custom ranges must follow the same structure and format as the existing range files to ensure compatibility with the app’s functionality, including its 13x13 grid visualization, color-coded actions, and position-based logic.

## Why Use Custom Ranges?

- **Personalized Study**: Tailor ranges to specific opponent profiles (e.g., tight 20% VPIP, loose 60% VPIP) or game formats (e.g., 6-max, cash games, tournaments).
- **Learning Specific Strategies**: Experiment with custom GTO, exploitative, or hybrid strategies for deeper understanding.
- **Testing Hypotheses**: Validate your range-building skills or test theoretical concepts in a controlled study environment.

## Creating Custom Range Files

### 1. **Structure of a Custom Range File**
   Custom range files must be JSON-formatted and follow the structure of the existing range files in the `ranges/` directory. Here’s an example structure based on `40p_gto_7pos.json`:

   ```json
   {
       "version": "1.0",
       "author": "Your Name",
       "description": "Custom ranges for a 30% VPIP tight-aggressive opponent in 8-max poker",
       "metadata": {
           "positions": ["SB", "BB", "UTG", "UTG+1", "MP", "CO", "BTN"],
           "supported_positions": ["SB", "BB", "UTG", "UTG+1", "MP", "CO", "BTN"]
       },
       "ranges": {
           "rfi": {
               "vpip_30": {
                   "base": {
                       "open": ["AA", "KK", "QQ", "JJ", "TT", "99", "AKs", "AQs", "AKo", "AQo"],
                       "patterns": ["99+", "AQs+", "AQo+"]
                   },
                   "utg_add": {
                       "open": ["88", "AJs", "ATs", "KQs"]
                   },
                   "utg1_add": {
                       "open": ["77", "A9s", "KTs"]
                   },
                   "mp_add": {
                       "open": ["66", "A8s", "KJs"]
                   },
                   "co_add": {
                       "open": ["55", "A7s", "QJs"]
                   },
                   "btn_add": {
                       "open": ["44", "A6s", "T9s"]
                   },
                   "sb_add": {
                       "open": ["33", "A5s", "98s"]
                   },
                   "bb_add": {
                       "open": ["22", "A4s", "87s"]
                   }
               }
           },
           "facing_raise": {
               "vpip_30": {
                   "base": {
                       "call": ["TT", "99", "88", "AQs", "AJs", "KQs"],
                       "call_patterns": ["88-99", "AQs+", "KQs"],
                       "threeBet": ["AA", "KK", "QQ", "JJ", "AKs", "AKo"]
                   },
                   "utg_add": {
                       "call": ["77"],
                       "threeBet": []
                   },
                   // ... (similar structure for other positions)
               }
           },
           // ... (include vs_3bet, vs_limp with similar structure)
       }
   }
   ```

   #### Key Components:
   - **`version`**: A version number for your custom file (e.g., `1.0`).
   - **`author`**: Your name or identifier for tracking authorship.
   - **`description`**: A brief description of the custom ranges (e.g., opponent type, VPIP, game format).
   - **`metadata.positions` and `supported_positions`**: List the positions your ranges support (e.g., 7-position for 8-max: SB, BB, UTG, UTG+1, MP, CO, BTN).
   - **`ranges`**: Contains objects for each action type (`rfi`, `facing_raise`, `vs_3bet`, `vs_limp`), each with a VPIP strategy key (e.g., `vpip_30` for a 30% VPIP opponent).
   - **`base` and `position_add`**: Define the base range for all positions and position-specific additions (e.g., `utg_add`, `btn_add`), using arrays of hand notations (e.g., `AKs`, `AA`) or patterns (e.g., `99+`, `AQs+`).
   - **Action Types**: Use `open` for RFI, and `call`, `threeBet`, `fourBet`, `raise` for other actions, matching the app’s logic.

### 2. **Hand Notation**
   - Use standard poker hand notation:
     - Pairs: `AA`, `KK`, `22` (e.g., pocket Aces, Kings, Twos).
     - Suited hands: `AKs`, `KQs` (e.g., Ace-King suited, King-Queen suited).
     - Offsuit hands: `AKo`, `KQo` (e.g., Ace-King offsuit, King-Queen offsuit).
   - Ensure no duplicates or invalid hands (e.g., `A1s` is invalid; use `A2s`–`AKs`).
   - Patterns (e.g., `99+` for pairs 9 or higher, `AQs+` for suited aces Queen or higher) are optional but must match the hands listed.

### 3. **Position Logic**
   - Ranges should widen progressively from early (UTG) to late positions (BTN, SB, BB). Use `base` for the starting range, and `position_add` (e.g., `utg_add`, `btn_add`) for position-specific additions.
   - The app’s `getCumulativeRange()` function implements cumulative inheritance, so later positions include earlier positions’ ranges plus their own additions. Ensure your custom ranges reflect this logic (e.g., BTN includes UTG, UTG+1, MP, CO, and BTN ranges).

### 4. **Validation**
   - Before importing, validate your custom range file using the provided validation scripts:
     - Python: Run `python validate_all_range_files.py` in the repository root.
     - JavaScript/Node.js: Run `node validate_all_range_files.js` (if available).
   - Ensure your ranges pass checks for:
     - Valid hand notation (2 chars for pairs, 3 chars for suited/offsuit with `s` or `o`).
     - No duplicate hands within or across positions.
     - No overlaps between conflicting actions (e.g., a hand appearing in both `call` and `threeBet` ranges).
     - Progressive widening of ranges from early to late positions.

## Importing Custom Ranges

### 1. **Save the File**
   - Save your custom range JSON file (e.g., `custom_30_vpip_7pos.json`) in the `ranges/` directory of the Poker Range Assistant repository.

### 2. **Update the App**
   - Open `index.html` and locate the `loadRangeData()` function in the `<script>` section.
   - Add your custom range file to the `fetch` calls in `loadRangeData()`. For example:

     ```javascript
     async function loadRangeData() {
         try {
             const [
                 gto40_5posResponse,
                 exp40_5posResponse,
                 gto55_5posResponse,
                 exp55_5posResponse,
                 gto40_7posResponse,
                 exp40_7posResponse,
                 custom30_7posResponse // Add your custom file
             ] = await Promise.all([
                 fetch('ranges/40pct_gto.json'),
                 fetch('ranges/40pct_exploitative.json'),
                 fetch('ranges/55pct_gto.json'),
                 fetch('ranges/55pct_exploitative.json'),
                 fetch('ranges/40p_gto_7pos.json'),
                 fetch('ranges/40p_exp_7pos.json'),
                 fetch('ranges/custom_30_vpip_7pos.json') // Fetch your custom file
             ]);

             const gto40_5posData = await gto40_5posResponse.json();
             const exp40_5posData = await exp40_5posResponse.json();
             const gto55_5posData = await gto55_5posResponse.json();
             const exp55_5posData = await exp55_5posResponse.json();
             const gto40_7posData = await gto40_7posResponse.json();
             const exp40_7posData = await exp40_7posResponse.json();
             const custom30_7posData = await custom30_7posResponse.json(); // Load your custom data

             rangeData = {
                 gto40_5pos: gto40_5posData,
                 exp40_5pos: exp40_5posData,
                 gto55_5pos: gto55_5posData,
                 exp55_5pos: exp55_5posData,
                 gto40_7pos: gto40_7posData,
                 exp40_7pos: exp40_7posData,
                 custom30_7pos: custom30_7posData // Map your custom data to a strategy key
             };

             initializeUI();
         } catch (error) {
             console.error('Error loading range data:', error);
         }
     }
     ```

   - Add a new button for your custom strategy in the strategy section of `index.html`. Locate the `.strategy-buttons` div for the `40% VPIP` row and add:

     ```html
     <button value="custom30_7pos">Custom (30% VPIP, 7-pos)</button>
     ```

   - Update `handleStrategyClick()` to recognize and handle `custom30_7pos`, ensuring it updates the UI (position buttons, grid) correctly:

     ```javascript
     function handleStrategyClick(event) {
         const strategyButton = event.target.closest('button');
         if (!strategyButton) return;

         document.querySelectorAll('.strategy-buttons button').forEach(btn => 
             btn.classList.remove('active'));
         strategyButton.classList.add('active');

         const previousPosition = currentPosition;
         currentStrategy = strategyButton.value;

         const is7PosStrategy = currentStrategy.includes('7pos');
         const supportedPositions = is7PosStrategy ? 
             ['SB', 'BB', 'UTG', 'UTG+1', 'MP', 'CO', 'BTN'] :
             ['UTG', 'UTG+1', 'MP', 'CO', 'BTN'];

         const positionGroup = document.getElementById('positionGroup');
         positionGroup.innerHTML = supportedPositions.map(pos => 
             `<button value="${pos.toLowerCase()}"${pos.toLowerCase() === previousPosition ? ' class="active"' : ''}">${pos}</button>`
         ).join('');

         if (!supportedPositions.map(p => p.toLowerCase()).includes(previousPosition)) {
             if (is7PosStrategy) {
                 if (previousPosition && ['utg', 'utg1', 'mp', 'co', 'btn'].includes(previousPosition)) {
                     currentPosition = previousPosition;
                 } else {
                     currentPosition = 'utg';
                     positionGroup.querySelector('button[value="utg"]').classList.add('active');
                 }
             } else {
                 if (previousPosition && ['sb', 'bb'].includes(previousPosition)) {
                     currentPosition = 'utg';
                     positionGroup.querySelector('button[value="utg"]').classList.add('active');
                 } else {
                     currentPosition = previousPosition;
                 }
             }
         } else {
             currentPosition = previousPosition;
         }

         updateDisplay();
     }
     ```

   - Ensure `getCumulativeRange()` and `updateDisplay()` can process `custom30_7pos` without modification, as they already handle arbitrary strategy keys from `rangeData`.

### 3. **Best Practices**
   - **Naming Conventions**: Use descriptive file names (e.g., `custom_30_vpip_7pos.json`) and strategy keys (e.g., `custom30_7pos`) to avoid conflicts with default strategies.
   - **Modularity**: Keep custom ranges modular, following the same `base` and `position_add` structure to leverage cumulative inheritance in `getCumulativeRange()`.
   - **Testing**: Test your custom ranges in the app to ensure they display correctly (e.g., proper colors, position logic, patterns). Use the validation scripts to verify format and consistency.
   - **Documentation**: Document your custom ranges in the file (e.g., in the `description` field) to explain their purpose (e.g., opponent type, VPIP, game format).

### 4. **Example Use Case**
   Imagine you’re studying a tight-aggressive opponent with a 30% VPIP in an 8-max cash game. You create `custom_30_vpip_7pos.json` with tighter ranges for early positions and specific adjustments for late positions. After importing it, you select “Custom (30% VPIP, 7-pos)” in the app to analyze and practice against this profile.

### 5. **Troubleshooting**
   - **JSON Loading Errors**: If the app fails to load your custom file, check the browser console for `fetch` errors. Ensure the file is in the `ranges/` directory and named correctly.
   - **Display Issues**: If ranges don’t display as expected, verify your JSON structure matches the example, and run validation scripts to catch formatting errors.
   - **Performance**: For very large custom ranges, consider optimizing by removing unnecessary patterns or hands, or splitting into multiple files if needed.

## Contributing Custom Ranges

If you’d like to share your custom ranges with the community, consider submitting a pull request to this repository. Include your JSON file in the `ranges/` directory, update `loadRangeData()` in `index.html`, and document the strategy in this `CUSTOM_RANGES.md` or the `README.md`. Follow the validation and best practices outlined above to ensure compatibility.