const fs = require('fs');

// Valid poker hands generator
function generateValidHands() {
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    const validHands = new Set();
    
    // Generate all possible hands
    ranks.forEach((rank1, i) => {
        ranks.forEach((rank2, j) => {
            if (i === j) {
                // Pairs
                validHands.add(rank1 + rank2);
            } else if (i < j) {
                // Suited hands
                validHands.add(rank1 + rank2 + 's');
                // Offsuit hands
                validHands.add(rank1 + rank2 + 'o');
            }
        });
    });
    
    return validHands;
}

const validHands = generateValidHands();

// Expected structure for different strategy types
const expectedStructure = {
    '5pos': ['UTG', 'UTG+1', 'MP', 'CO', 'BTN'],
    '7pos': ['SB', 'BB', 'UTG', 'UTG+1', 'MP', 'CO', 'BTN']
};

const expectedActions = ['rfi', 'facing_raise', 'vs_3bet', 'vs_limp'];

function validateHands(hands, context) {
    if (!Array.isArray(hands)) {
        console.error(`Invalid hands format in ${context} - expected array, got:`, typeof hands);
        return false;
    }

    const invalidHands = hands.filter(hand => !validHands.has(hand));
    if (invalidHands.length > 0) {
        console.error(`Invalid hands found in ${context}:`, invalidHands);
        return false;
    }

    return true;
}

function validateRangeStructure(data, filename) {
    console.log(`\nValidating ${filename}...`);
    let isValid = true;

    // Check if it's a 5-pos or 7-pos strategy
    const is7Pos = filename.includes('7pos');
    const positions = is7Pos ? expectedStructure['7pos'] : expectedStructure['5pos'];

    // Basic structure checks
    if (!data.ranges) {
        console.error('Missing ranges object');
        return false;
    }

    // Validate each action type
    expectedActions.forEach(action => {
        if (!data.ranges[action]) {
            console.error(`Missing action type: ${action}`);
            isValid = false;
            return;
        }

        const actionData = data.ranges[action].vpip_40;
        if (!actionData) {
            console.error(`Missing vpip_40 data for action: ${action}`);
            isValid = false;
            return;
        }

        // Validate base ranges
        if (actionData.base) {
            if (action === 'rfi') {
                if (actionData.base.open) {
                    isValid = validateHands(actionData.base.open, `${action} base open`) && isValid;
                }
            } else {
                ['call', 'threeBet', 'fourBet', 'raise'].forEach(rangeType => {
                    if (actionData.base[rangeType]) {
                        isValid = validateHands(actionData.base[rangeType], `${action} base ${rangeType}`) && isValid;
                    }
                });
            }
        }

        // Validate position-specific ranges
        positions.forEach(pos => {
            const posKey = pos.toLowerCase().replace('+', '1') + '_add';
            if (actionData[posKey]) {
                if (Array.isArray(actionData[posKey])) {
                    isValid = validateHands(actionData[posKey], `${action} ${posKey}`) && isValid;
                } else {
                    if (action === 'rfi') {
                        if (actionData[posKey].open) {
                            isValid = validateHands(actionData[posKey].open, `${action} ${posKey} open`) && isValid;
                        }
                    } else {
                        ['call', 'threeBet', 'fourBet', 'raise'].forEach(rangeType => {
                            if (actionData[posKey][rangeType]) {
                                isValid = validateHands(actionData[posKey][rangeType], `${action} ${posKey} ${rangeType}`) && isValid;
                            }
                        });
                    }
                }
            }
        });
    });

    if (isValid) {
        console.log(`✓ ${filename} is valid`);
    } else {
        console.error(`✗ ${filename} has validation errors`);
    }
    return isValid;
}

// Main validation function
function validateAllRangeFiles() {
    const files = [
        '40pct_gto.json',
        '40pct_exploitative.json',
        '55pct_gto.json',
        '55pct_exploitative.json',
        '40p_gto_7pos.json',
        '40p_exp_7pos.json'
    ];

    let allValid = true;
    files.forEach(file => {
        try {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            allValid = validateRangeStructure(data, file) && allValid;
        } catch (error) {
            console.error(`Error reading/parsing ${file}:`, error.message);
            allValid = false;
        }
    });

    console.log('\nValidation Summary:');
    console.log(allValid ? '✓ All files are valid' : '✗ Some files have validation errors');
    return allValid;
}

// Run validation
validateAllRangeFiles(); 