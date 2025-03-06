class RangeValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.validPositions = ['base', 'mp_add', 'co_add', 'btn_add'];
        this.validActionTypes = ['rfi', 'facing_raise', 'vs_3bet', 'vs_limp'];
        this.validHandRegex = /^([AKQJT98765432]{2}[so]?|[AKQJT98765432]{1}[AKQJT98765432]{1}[so])$/;
    }

    validateRange(rangeData) {
        this.errors = [];
        this.warnings = [];

        try {
            this.validateStructure(rangeData);
            this.validateHandFormats(rangeData);
            this.validatePositions(rangeData);
            this.validatePatterns(rangeData);
            this.validateActionTypes(rangeData);
            this.validateStrategicConsistency(rangeData);
        } catch (error) {
            this.errors.push(`Fatal error during validation: ${error.message}`);
        }

        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings
        };
    }

    validateStructure(data) {
        // Check required metadata
        if (!data.version) this.errors.push("Missing version field");
        if (!data.author) this.errors.push("Missing author field");
        if (!data.description) this.errors.push("Missing description field");
        if (!data.ranges) this.errors.push("Missing ranges object");

        // Check ranges structure
        if (data.ranges) {
            this.validActionTypes.forEach(actionType => {
                if (!data.ranges[actionType]) {
                    this.errors.push(`Missing action type: ${actionType}`);
                }
            });

            // Check VPIP structure
            Object.keys(data.ranges).forEach(actionType => {
                const vpipKeys = Object.keys(data.ranges[actionType]);
                vpipKeys.forEach(vpipKey => {
                    if (!vpipKey.startsWith('vpip_')) {
                        this.errors.push(`Invalid VPIP key format: ${vpipKey}`);
                    }
                    const vpipValue = parseInt(vpipKey.split('_')[1]);
                    if (isNaN(vpipValue) || vpipValue < 0 || vpipValue > 100) {
                        this.errors.push(`Invalid VPIP value in key: ${vpipKey}`);
                    }
                });
            });
        }
    }

    validateHandFormats(data) {
        const validateHands = (hands, context) => {
            if (!Array.isArray(hands)) return;
            
            const seenHands = new Set();
            hands.forEach(hand => {
                if (!this.validHandRegex.test(hand)) {
                    this.errors.push(`Invalid hand format: ${hand} in ${context}`);
                }
                if (seenHands.has(hand)) {
                    this.errors.push(`Duplicate hand: ${hand} in ${context}`);
                }
                seenHands.add(hand);

                // Validate suffix usage
                if (hand[0] === hand[1] && hand.length > 2) {
                    this.errors.push(`Pair ${hand} should not have suffix in ${context}`);
                }
                if (hand[0] !== hand[1] && hand.length === 2) {
                    this.errors.push(`Non-pair ${hand} missing suffix (s/o) in ${context}`);
                }
            });
        };

        Object.entries(data.ranges).forEach(([actionType, vpipRanges]) => {
            Object.entries(vpipRanges).forEach(([vpipKey, positions]) => {
                Object.entries(positions).forEach(([position, ranges]) => {
                    if (position === 'base') {
                        Object.entries(ranges).forEach(([rangeType, hands]) => {
                            if (!rangeType.includes('patterns')) {
                                validateHands(hands, `${actionType}.${vpipKey}.${position}.${rangeType}`);
                            }
                        });
                    } else {
                        if (typeof ranges === 'object' && !Array.isArray(ranges)) {
                            Object.entries(ranges).forEach(([rangeType, hands]) => {
                                validateHands(hands, `${actionType}.${vpipKey}.${position}.${rangeType}`);
                            });
                        } else {
                            validateHands(ranges, `${actionType}.${vpipKey}.${position}`);
                        }
                    }
                });
            });
        });
    }

    validatePositions(data) {
        Object.entries(data.ranges).forEach(([actionType, vpipRanges]) => {
            Object.entries(vpipRanges).forEach(([vpipKey, positions]) => {
                // Check all required positions exist
                this.validPositions.forEach(pos => {
                    if (!positions[pos]) {
                        this.errors.push(`Missing position ${pos} in ${actionType}.${vpipKey}`);
                    }
                });

                // Check for position range widening
                if (actionType === 'rfi') {
                    const baseHands = new Set(positions.base.open || []);
                    const mpHands = new Set(positions.mp_add || []);
                    const coHands = new Set(positions.co_add || []);
                    const btnHands = new Set(positions.btn_add || []);

                    // Check for overlapping hands
                    mpHands.forEach(hand => {
                        if (baseHands.has(hand)) {
                            this.warnings.push(`Hand ${hand} in MP already exists in base range`);
                        }
                    });

                    coHands.forEach(hand => {
                        if (baseHands.has(hand) || mpHands.has(hand)) {
                            this.warnings.push(`Hand ${hand} in CO already exists in earlier position`);
                        }
                    });

                    btnHands.forEach(hand => {
                        if (baseHands.has(hand) || mpHands.has(hand) || coHands.has(hand)) {
                            this.warnings.push(`Hand ${hand} in BTN already exists in earlier position`);
                        }
                    });
                }
            });
        });
    }

    validatePatterns(data) {
        const validatePattern = (pattern, hands, context) => {
            // Common patterns like "TT+", "ATs+", "KJs+"
            const patternRegex = /^([AKQJT98765432]{2}\+|[AKQJT98765432][AKQJT98765432][so]\+)$/;
            
            if (!patternRegex.test(pattern)) {
                this.warnings.push(`Unusual pattern format: ${pattern} in ${context}`);
            }

            // Validate pattern matches hands
            if (pattern.endsWith('+')) {
                const baseHand = pattern.slice(0, -1);
                const found = hands.some(hand => hand.startsWith(baseHand));
                if (!found) {
                    this.warnings.push(`Pattern ${pattern} has no matching hands in ${context}`);
                }
            }
        };

        Object.entries(data.ranges).forEach(([actionType, vpipRanges]) => {
            Object.entries(vpipRanges).forEach(([vpipKey, positions]) => {
                if (positions.base) {
                    Object.entries(positions.base).forEach(([rangeType, value]) => {
                        if (rangeType.includes('patterns') && Array.isArray(value)) {
                            value.forEach(pattern => {
                                const handsKey = rangeType.replace('_patterns', '');
                                validatePattern(pattern, positions.base[handsKey] || [], 
                                    `${actionType}.${vpipKey}.base.${rangeType}`);
                            });
                        }
                    });
                }
            });
        });
    }

    validateActionTypes(data) {
        Object.entries(data.ranges).forEach(([actionType, vpipRanges]) => {
            Object.entries(vpipRanges).forEach(([vpipKey, positions]) => {
                switch (actionType) {
                    case 'facing_raise':
                        this.validateFacingRaise(positions, `${actionType}.${vpipKey}`);
                        break;
                    case 'vs_3bet':
                        this.validateVs3Bet(positions, `${actionType}.${vpipKey}`);
                        break;
                    case 'vs_limp':
                        this.validateVsLimp(positions, `${actionType}.${vpipKey}`);
                        break;
                }
            });
        });
    }

    validateFacingRaise(positions, context) {
        Object.entries(positions).forEach(([position, ranges]) => {
            if (position === 'base' || ranges.call) {
                const callHands = new Set(ranges.call || []);
                const threeBetHands = new Set(ranges.threeBet || []);

                // Check for overlapping hands
                callHands.forEach(hand => {
                    if (threeBetHands.has(hand)) {
                        this.errors.push(`Hand ${hand} appears in both call and 3-bet ranges in ${context}.${position}`);
                    }
                });
            }
        });
    }

    validateVs3Bet(positions, context) {
        Object.entries(positions).forEach(([position, ranges]) => {
            if (position === 'base' || ranges.call) {
                const callHands = new Set(ranges.call || []);
                const fourBetHands = new Set(ranges.fourBet || []);

                // Check for overlapping hands
                callHands.forEach(hand => {
                    if (fourBetHands.has(hand)) {
                        this.errors.push(`Hand ${hand} appears in both call and 4-bet ranges in ${context}.${position}`);
                    }
                });
            }
        });
    }

    validateVsLimp(positions, context) {
        Object.entries(positions).forEach(([position, ranges]) => {
            if (position === 'base' || ranges.call) {
                const callHands = new Set(ranges.call || []);
                const raiseHands = new Set(ranges.raise || []);

                // Check for overlapping hands
                callHands.forEach(hand => {
                    if (raiseHands.has(hand)) {
                        this.errors.push(`Hand ${hand} appears in both call and raise ranges in ${context}.${position}`);
                    }
                });
            }
        });
    }

    validateStrategicConsistency(data) {
        Object.entries(data.ranges).forEach(([actionType, vpipRanges]) => {
            Object.entries(vpipRanges).forEach(([vpipKey, positions]) => {
                const vpipValue = parseInt(vpipKey.split('_')[1]);
                
                // Check range sizes are consistent with VPIP
                this.validateRangeSizeForVPIP(positions, vpipValue, `${actionType}.${vpipKey}`);
                
                // Check strategic hand selection
                this.validateStrategicHandSelection(positions, actionType, `${actionType}.${vpipKey}`);
            });
        });
    }

    validateRangeSizeForVPIP(positions, vpipValue, context) {
        const countHands = (hands) => Array.isArray(hands) ? hands.length : 0;
        
        let totalHands = 0;
        if (positions.base) {
            Object.entries(positions.base).forEach(([rangeType, hands]) => {
                if (!rangeType.includes('patterns')) {
                    totalHands += countHands(hands);
                }
            });
        }

        // Add position-specific hands
        ['mp_add', 'co_add', 'btn_add'].forEach(pos => {
            if (positions[pos]) {
                if (Array.isArray(positions[pos])) {
                    totalHands += countHands(positions[pos]);
                } else {
                    Object.values(positions[pos]).forEach(hands => {
                        totalHands += countHands(hands);
                    });
                }
            }
        });

        // Rough check if range size makes sense for VPIP
        const expectedHandCount = (vpipValue / 100) * 169; // 169 is total possible hands
        const tolerance = 20; // Allow some variance

        if (Math.abs(totalHands - expectedHandCount) > tolerance) {
            this.warnings.push(
                `Range size (${totalHands} hands) may be inconsistent with ${vpipValue}% VPIP in ${context}. ` +
                `Expected around ${Math.round(expectedHandCount)} hands.`
            );
        }
    }

    validateStrategicHandSelection(positions, actionType, context) {
        // Helper to get hand strength (very basic)
        const getHandStrength = (hand) => {
            if (hand.length < 2) return 0;
            const ranks = 'AKQJT98765432';
            const rank1 = ranks.indexOf(hand[0]);
            const rank2 = ranks.indexOf(hand[1]);
            return (13 - rank1) * 13 + (13 - rank2);
        };

        if (actionType === 'facing_raise' || actionType === 'vs_3bet') {
            const validateRaiseVsCall = (position) => {
                if (!positions[position]) return;
                
                const calls = positions[position].call || [];
                const raises = positions[position].threeBet || positions[position].fourBet || [];

                calls.forEach(callHand => {
                    raises.forEach(raiseHand => {
                        if (getHandStrength(callHand) > getHandStrength(raiseHand)) {
                            this.warnings.push(
                                `Potentially inconsistent strategy: Stronger hand ${callHand} is calling while ` +
                                `weaker hand ${raiseHand} is raising in ${context}.${position}`
                            );
                        }
                    });
                });
            };

            this.validPositions.forEach(validateRaiseVsCall);
        }
    }

    generateReport() {
        return {
            summary: {
                isValid: this.errors.length === 0,
                errorCount: this.errors.length,
                warningCount: this.warnings.length
            },
            errors: this.errors,
            warnings: this.warnings
        };
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RangeValidator;
} 