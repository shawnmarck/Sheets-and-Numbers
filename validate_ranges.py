import json
import sys
from typing import Set, List, Dict, Any
from pathlib import Path

def generate_valid_hands() -> Set[str]:
    """Generate all valid poker hand combinations."""
    ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
    valid_hands = set()
    
    for i, rank1 in enumerate(ranks):
        for j, rank2 in enumerate(ranks):
            if i == j:  # Pairs
                valid_hands.add(f"{rank1}{rank2}")
            elif i < j:  # Suited and offsuit hands
                valid_hands.add(f"{rank1}{rank2}s")
                valid_hands.add(f"{rank1}{rank2}o")
    
    return valid_hands

# Constants
VALID_HANDS = generate_valid_hands()
EXPECTED_STRUCTURE = {
    '5pos': ['UTG', 'UTG+1', 'MP', 'CO', 'BTN'],
    '7pos': ['SB', 'BB', 'UTG', 'UTG+1', 'MP', 'CO', 'BTN']
}
EXPECTED_ACTIONS = ['rfi', 'facing_raise', 'vs_3bet', 'vs_limp']

def validate_hands(hands: List[str], context: str) -> bool:
    """Validate a list of poker hands."""
    if not isinstance(hands, list):
        print(f"Error: Invalid hands format in {context} - expected list, got: {type(hands)}")
        return False

    invalid_hands = [hand for hand in hands if hand not in VALID_HANDS]
    if invalid_hands:
        print(f"Error: Invalid hands found in {context}: {invalid_hands}")
        return False

    return True

def validate_range_structure(data: Dict[str, Any], filename: str) -> bool:
    """Validate the structure of a range file."""
    print(f"\nValidating {filename}...")
    is_valid = True

    # Check if it's a 5-pos or 7-pos strategy
    is_7pos = '7pos' in filename
    positions = EXPECTED_STRUCTURE['7pos' if is_7pos else '5pos']

    # Basic structure checks
    if 'ranges' not in data:
        print('Error: Missing ranges object')
        return False

    # Determine VPIP key based on filename
    vpip_key = 'vpip_55' if '55pct' in filename else 'vpip_40'
    print(f"Using VPIP key: {vpip_key}")

    # Validate each action type
    for action in EXPECTED_ACTIONS:
        if action not in data['ranges']:
            print(f"Error: Missing action type: {action}")
            is_valid = False
            continue

        action_data = data['ranges'][action].get(vpip_key)
        if not action_data:
            print(f"Error: Missing {vpip_key} data for action: {action}")
            is_valid = False
            continue

        # Validate base ranges
        if 'base' in action_data:
            if action == 'rfi':
                if 'open' in action_data['base']:
                    is_valid = validate_hands(action_data['base']['open'], f"{action} base open") and is_valid
            else:
                for range_type in ['call', 'threeBet', 'fourBet', 'raise']:
                    if range_type in action_data['base']:
                        is_valid = validate_hands(action_data['base'][range_type], f"{action} base {range_type}") and is_valid

        # Validate position-specific ranges
        for pos in positions:
            pos_key = f"{pos.lower().replace('+', '1')}_add"
            if pos_key in action_data:
                if isinstance(action_data[pos_key], list):
                    is_valid = validate_hands(action_data[pos_key], f"{action} {pos_key}") and is_valid
                else:
                    if action == 'rfi':
                        if 'open' in action_data[pos_key]:
                            is_valid = validate_hands(action_data[pos_key]['open'], f"{action} {pos_key} open") and is_valid
                    else:
                        for range_type in ['call', 'threeBet', 'fourBet', 'raise']:
                            if range_type in action_data[pos_key]:
                                is_valid = validate_hands(action_data[pos_key][range_type], f"{action} {pos_key} {range_type}") and is_valid

    if is_valid:
        print(f"✓ {filename} is valid")
    else:
        print(f"✗ {filename} has validation errors")
    return is_valid

def validate_all_range_files() -> bool:
    """Validate all range files in the current directory."""
    files = [
        '40pct_gto.json',
        '40pct_exploitative.json',
        '55pct_gto.json',
        '55pct_exploitative.json',
        '40p_gto_7pos.json',
        '40p_exp_7pos.json'
    ]

    all_valid = True
    for file in files:
        try:
            with open(file, 'r') as f:
                data = json.load(f)
            all_valid = validate_range_structure(data, file) and all_valid
        except FileNotFoundError:
            print(f"Error: File not found: {file}")
            all_valid = False
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in {file}: {e}")
            all_valid = False
        except Exception as e:
            print(f"Error processing {file}: {e}")
            all_valid = False

    print('\nValidation Summary:')
    print('✓ All files are valid' if all_valid else '✗ Some files have validation errors')
    return all_valid

if __name__ == '__main__':
    success = validate_all_range_files()
    sys.exit(0 if success else 1) 