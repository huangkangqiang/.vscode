"use strict";
class MultipleIndexes {
    constructor(settings, previousState) {
        this.currentOpenBracketColorIndexes = {};
        this.previousOpenBracketColorIndexes = {};
        this.settings = settings;
        if (previousState !== undefined) {
            this.currentOpenBracketColorIndexes = previousState.currentOpenBracketColorIndexes;
            this.previousOpenBracketColorIndexes = previousState.previousOpenBracketColorIndexes;
        }
        else {
            settings.bracketPairs.forEach((bracketPair) => {
                this.currentOpenBracketColorIndexes[bracketPair.openCharacter] = [];
                this.previousOpenBracketColorIndexes[bracketPair.openCharacter] = -1;
            });
        }
    }
    getPrevious(bracketPair) {
        return this.previousOpenBracketColorIndexes[bracketPair.openCharacter];
    }
    setCurrent(bracketPair, colorIndex) {
        this.currentOpenBracketColorIndexes[bracketPair.openCharacter].push(colorIndex);
        this.previousOpenBracketColorIndexes[bracketPair.openCharacter] = colorIndex;
    }
    getCurrentLength(bracketPair) {
        return this.currentOpenBracketColorIndexes[bracketPair.openCharacter].length;
    }
    popCurrent(bracketPair) {
        return this.currentOpenBracketColorIndexes[bracketPair.openCharacter].pop();
    }
    clone() {
        const bracketColorIndexesCopy = {};
        Object.keys(this.currentOpenBracketColorIndexes).forEach((key) => {
            bracketColorIndexesCopy[key] = this.currentOpenBracketColorIndexes[key].slice();
        });
        const previousOpenBracketIndexesCopy = {};
        Object.keys(this.previousOpenBracketColorIndexes).forEach((key) => {
            previousOpenBracketIndexesCopy[key] = this.previousOpenBracketColorIndexes[key];
        });
        return new MultipleIndexes(this.settings, {
            currentOpenBracketColorIndexes: bracketColorIndexesCopy,
            previousOpenBracketColorIndexes: previousOpenBracketIndexesCopy,
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MultipleIndexes;
//# sourceMappingURL=multipleIndexes.js.map