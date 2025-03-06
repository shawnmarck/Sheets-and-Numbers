# Poker Range Assistant

## Overview

The Poker Range Assistant is a web-based study tool designed to help No-Limit Hold’em (NLHE) players learn and analyze preflop range strategies. Built with vanilla JavaScript, HTML, and CSS, this tool provides an interactive 13x13 grid to visualize poker hand ranges, color-coded by action types (e.g., Raise First In, Call, 3-Bet, 4-Bet) and hand types (e.g., suited, offsuit, pairs). It supports multiple strategies, including Game Theory Optimal (GTO) and exploitative approaches, tailored for 40% and 55% VPIP opponents, in both 5-position and 7-position (8-max) formats. This is a study and practice tool for improving preflop decision-making, not intended for real-time use during live or online play.

## Features

- **Educational Focus**: A study tool for understanding preflop NLHE strategies, ideal for players looking to improve their game through practice and analysis.
- **Multiple Strategy Types**: Supports GTO and exploitative strategies for 40% and 55% VPIP opponents, helping users explore optimal and situational play.
- **Position Support**: Handles 5-position (UTG, UTG+1, MP, CO, BTN) and 7-position (SB, BB, UTG, UTG+1, MP, CO, BTN) formats for comprehensive preflop study.
- **Interactive Visualization**: Color-coded 13x13 grid for poker hands, with toggles for patterns and position-specific ranges to aid learning.
- **Action Types**: Supports Raise First In (RFI), vs Raise (call/3-bet), vs 3-Bet (call/4-bet), and vs Limp (call/raise) actions for detailed strategy analysis.
- **Responsive Design**: Mobile-friendly interface with a dark theme for readability, perfect for studying on any device.
- **Post-Flop Tips**: Includes optional post-flop advice based on preflop configurations, loaded from JSON files, to enhance learning.
- **Customizable**: Users can import their own custom range data via JSON files, allowing personalization for specific study needs or opponent profiles.

## Structure

- **`index.html`**: Main application file containing HTML, CSS, and JavaScript for the study tool.
- **`ranges/` Directory**: Contains JSON files with preflop range data for study:
  - `40p_gto_7pos.json`: GTO ranges for 40% VPIP opponent (7-pos, 8-max).
  - `40p_exp_7pos.json`: Exploitative ranges for 40% VPIP opponent (7-pos, 8-max).
  - `40p_gto_7pos_tips.json`: Post-flop advice for GTO ranges (40% VPIP, 7-pos).
  - `40p_exp_7pos_tips.json`: Post-flop advice for exploitative ranges (40% VPIP, 7-pos).
- **Validation Scripts**: Includes Python (`validate_all_range_files.py`) and JavaScript (`range_validator.js`) scripts for validating range data, ensuring accuracy for study purposes.

## Installation and Usage

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd poker-range-assistant
   ```

2. **Serve the Files**:
   Use a local web server to serve the files (required for JSON loading):
   ```bash
   python -m http.server 8000
   ```

3. **Access the App**:
   Open `http://localhost:8000` in your browser to study preflop ranges. Check the browser console for any errors.

4. **Customize Ranges**:
   - To import custom ranges, create a JSON file following the structure of existing range files (e.g., `ranges/40p_gto_7pos.json`) and place it in the `ranges/` directory.
   - Update `loadRangeData()` in `index.html` to include your custom JSON file, mapping it to a new strategy key (e.g., `custom_40_7pos`).
   - Use the validation scripts to ensure your custom ranges are correctly formatted.

5. **Range Data Validation**:
   Run validation scripts in the respective environments to ensure range files are correct for study:
   - Python: `python validate_all_range_files.py`
   - Node.js: `node validate_all_range_files.js`

## Development

- **Dependencies**: No external dependencies required; uses vanilla JS, HTML, and CSS.
- **Design Tenets**:
  - Maintain a dark theme for readability (`--bg-primary`, `--text-primary` in CSS).
  - Use color coding for actions (Raise/RFI: purple, Call: green, 3-Bet: blue, 4-Bet: orange) and hand types (suited: accent green, offsuit: secondary text, pairs: primary text).
  - Ensure responsive design with mobile-friendly breakpoints.
  - Preserve GTO and exploitative strategy integrity in range data for educational purposes.
  - Keep range data modular and extensible in JSON files to support customization.

## Contributing

Contributions are welcome! Please fork the repository, make changes (e.g., new strategies, UI enhancements, or custom range support), and submit pull requests with detailed descriptions of your changes. Focus on maintaining the tool’s educational purpose and compatibility with custom range imports.

## License

MIT License – See `LICENSE` for details.