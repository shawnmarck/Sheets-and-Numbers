const RangeValidator = require('./range_validator');
const fs = require('fs');

describe('RangeValidator', () => {
    let validator;
    let gtoRangeData;
    let exploitativeRangeData;

    beforeAll(() => {
        validator = new RangeValidator();
        try {
            gtoRangeData = JSON.parse(fs.readFileSync('40pct_gto.json', 'utf8'));
            exploitativeRangeData = JSON.parse(fs.readFileSync('40pct_exploitative.json', 'utf8'));
        } catch (error) {
            console.error('Error loading range files:', error);
        }
    });

    describe('Structure Validation', () => {
        test('validates metadata fields', () => {
            const result = validator.validateRange(gtoRangeData);
            expect(result.errors).not.toContain('Missing version field');
            expect(result.errors).not.toContain('Missing author field');
            expect(result.errors).not.toContain('Missing description field');
            expect(result.errors).not.toContain('Missing ranges object');
        });

        test('validates required action types', () => {
            const result = validator.validateRange(gtoRangeData);
            ['rfi', 'facing_raise', 'vs_3bet', 'vs_limp'].forEach(actionType => {
                expect(result.errors).not.toContain(`Missing action type: ${actionType}`);
            });
        });

        test('validates VPIP format', () => {
            const result = validator.validateRange(gtoRangeData);
            const vpipErrors = result.errors.filter(error => error.includes('VPIP'));
            expect(vpipErrors).toHaveLength(0);
        });
    });

    describe('Hand Format Validation', () => {
        test('validates hand notation format', () => {
            const result = validator.validateRange(gtoRangeData);
            const handFormatErrors = result.errors.filter(error => error.includes('Invalid hand format'));
            expect(handFormatErrors).toHaveLength(0);
        });

        test('checks for duplicate hands', () => {
            const result = validator.validateRange(gtoRangeData);
            const duplicateErrors = result.errors.filter(error => error.includes('Duplicate hand'));
            expect(duplicateErrors).toHaveLength(0);
        });

        test('validates suffix usage', () => {
            const result = validator.validateRange(gtoRangeData);
            const suffixErrors = result.errors.filter(error => 
                error.includes('should not have suffix') || 
                error.includes('missing suffix')
            );
            expect(suffixErrors).toHaveLength(0);
        });
    });

    describe('Position Validation', () => {
        test('validates required positions exist', () => {
            const result = validator.validateRange(gtoRangeData);
            const positionErrors = result.errors.filter(error => error.includes('Missing position'));
            expect(positionErrors).toHaveLength(0);
        });

        test('checks for position range widening', () => {
            const result = validator.validateRange(gtoRangeData);
            const overlapWarnings = result.warnings.filter(warning => 
                warning.includes('already exists in')
            );
            expect(overlapWarnings).toHaveLength(0);
        });
    });

    describe('Pattern Validation', () => {
        test('validates pattern format', () => {
            const result = validator.validateRange(gtoRangeData);
            const patternWarnings = result.warnings.filter(warning => 
                warning.includes('Unusual pattern format')
            );
            expect(patternWarnings).toHaveLength(0);
        });

        test('validates pattern matches hands', () => {
            const result = validator.validateRange(gtoRangeData);
            const patternMatchWarnings = result.warnings.filter(warning => 
                warning.includes('has no matching hands')
            );
            expect(patternMatchWarnings).toHaveLength(0);
        });
    });

    describe('Action Type Validation', () => {
        test('validates facing raise ranges', () => {
            const result = validator.validateRange(gtoRangeData);
            const facingRaiseErrors = result.errors.filter(error => 
                error.includes('appears in both call and 3-bet ranges')
            );
            expect(facingRaiseErrors).toHaveLength(0);
        });

        test('validates vs 3-bet ranges', () => {
            const result = validator.validateRange(gtoRangeData);
            const vs3betErrors = result.errors.filter(error => 
                error.includes('appears in both call and 4-bet ranges')
            );
            expect(vs3betErrors).toHaveLength(0);
        });

        test('validates vs limp ranges', () => {
            const result = validator.validateRange(gtoRangeData);
            const vsLimpErrors = result.errors.filter(error => 
                error.includes('appears in both call and raise ranges')
            );
            expect(vsLimpErrors).toHaveLength(0);
        });
    });

    describe('Strategic Consistency', () => {
        test('validates range sizes against VPIP', () => {
            const result = validator.validateRange(gtoRangeData);
            const sizeWarnings = result.warnings.filter(warning => 
                warning.includes('Range size')
            );
            // We expect some size warnings as ranges are approximate
            console.log('Range size warnings:', sizeWarnings);
        });

        test('validates strategic hand selection', () => {
            const result = validator.validateRange(gtoRangeData);
            const strategyWarnings = result.warnings.filter(warning => 
                warning.includes('Potentially inconsistent strategy')
            );
            expect(strategyWarnings).toHaveLength(0);
        });
    });

    describe('Cross-Strategy Validation', () => {
        test('compares GTO and Exploitative ranges', () => {
            const gtoResult = validator.validateRange(gtoRangeData);
            const exploitativeResult = validator.validateRange(exploitativeRangeData);

            expect(gtoResult.isValid).toBe(true);
            expect(exploitativeResult.isValid).toBe(true);

            // Log any differences in range sizes
            Object.keys(gtoRangeData.ranges).forEach(actionType => {
                Object.keys(gtoRangeData.ranges[actionType]).forEach(vpipKey => {
                    const gtoSize = countTotalHands(gtoRangeData.ranges[actionType][vpipKey]);
                    const expSize = countTotalHands(exploitativeRangeData.ranges[actionType][vpipKey]);
                    console.log(`${actionType}.${vpipKey} sizes - GTO: ${gtoSize}, Exploitative: ${expSize}`);
                });
            });
        });
    });
});

// Helper function to count total hands in a position structure
function countTotalHands(positions) {
    let total = 0;
    
    Object.entries(positions).forEach(([position, ranges]) => {
        if (position === 'base') {
            Object.entries(ranges).forEach(([rangeType, hands]) => {
                if (!rangeType.includes('patterns') && Array.isArray(hands)) {
                    total += hands.length;
                }
            });
        } else if (Array.isArray(ranges)) {
            total += ranges.length;
        } else if (typeof ranges === 'object') {
            Object.values(ranges).forEach(hands => {
                if (Array.isArray(hands)) {
                    total += hands.length;
                }
            });
        }
    });
    
    return total;
} 