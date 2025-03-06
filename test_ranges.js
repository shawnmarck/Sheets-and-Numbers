// Test script for validating poker ranges
const fs = require('fs');

// Load the GTO 7-position strategy file
const gto7posData = JSON.parse(fs.readFileSync('40p_gto_7pos.json', 'utf8'));

// Helper function to get all hands from a range section
function getAllHandsFromSection(section) {
    const hands = new Set();
    
    // Handle arrays
    if (Array.isArray(section)) {
        section.forEach(hand => hands.add(hand));
        return hands;
    }
    
    // Handle objects with action types
    ['open', 'call', 'threeBet', 'fourBet', 'raise'].forEach(actionType => {
        if (section[actionType] && Array.isArray(section[actionType])) {
            section[actionType].forEach(hand => hands.add(hand));
        }
    });
    
    return hands;
}

// Function to get all hands for a specific action and position
function getAllHandsForActionPosition(data, action, position) {
    const vpipKey = 'vpip_40';
    const actionData = data.ranges[action][vpipKey];
    const hands = new Set();
    
    // Add hands from base range
    if (actionData.base) {
        getAllHandsFromSection(actionData.base).forEach(hand => hands.add(hand));
    }
    
    // Get position index
    const positions = ['sb', 'bb', 'utg', 'utg1', 'mp', 'co', 'btn'];
    const posIndex = positions.indexOf(position.toLowerCase());
    
    // Add hands from all positions up to and including current position
    for (let i = 0; i <= posIndex; i++) {
        const posKey = positions[i] + '_add';
        if (actionData[posKey]) {
            getAllHandsFromSection(actionData[posKey]).forEach(hand => hands.add(hand));
        }
    }
    
    return hands;
}

// Test specific scenarios
const testCases = [
    { action: 'vs_limp', position: 'btn', expectedHands: ['AKo', 'AKs'] },
    { action: 'rfi', position: 'btn', expectedHands: ['AKs', 'AKo'] },
    { action: 'facing_raise', position: 'btn', expectedHands: ['AKs', 'AKo'] },
    { action: 'vs_3bet', position: 'btn', expectedHands: ['AKs', 'AKo'] }
];

// Run tests
testCases.forEach(({ action, position, expectedHands }) => {
    console.log(`\nTesting ${position.toUpperCase()} ${action}:`);
    const actualHands = getAllHandsForActionPosition(gto7posData, action, position);
    
    // Check if expected hands are present
    expectedHands.forEach(hand => {
        if (actualHands.has(hand)) {
            console.log(`✓ ${hand} is present`);
        } else {
            console.log(`✗ ${hand} is missing`);
        }
    });
    
    // Log all hands for this action/position
    console.log(`\nAll hands for ${position.toUpperCase()} ${action}:`);
    console.log(Array.from(actualHands).sort().join(', '));
}); 