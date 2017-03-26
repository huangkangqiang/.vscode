"use strict";
class ModifierPair {
    constructor(openingCharacter, closingCharacter, counter) {
        this.counter = 0;
        this.openingCharacter = openingCharacter;
        this.closingCharacter = closingCharacter;
        if (counter !== undefined) {
            this.counter = counter;
        }
    }
    Clone() {
        return new ModifierPair(this.openingCharacter, this.closingCharacter, this.counter);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ModifierPair;
//# sourceMappingURL=modifierPair.js.map