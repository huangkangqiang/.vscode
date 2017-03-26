"use strict";
class SingularIndex {
    constructor(previousState) {
        this.currentOpenBracketColorIndexes = [];
        this.previousOpenBracketColorIndex = -1;
        if (previousState !== undefined) {
            this.currentOpenBracketColorIndexes = previousState.currentOpenBracketColorIndexes;
            this.previousOpenBracketColorIndex = previousState.previousOpenBracketColorIndex;
        }
    }
    clone() {
        return new SingularIndex({
            currentOpenBracketColorIndexes: this.currentOpenBracketColorIndexes.slice(),
            previousOpenBracketColorIndex: this.previousOpenBracketColorIndex,
        });
    }
    getPrevious(bracketPair) {
        return this.previousOpenBracketColorIndex;
    }
    setCurrent(bracketPair, colorIndex) {
        this.currentOpenBracketColorIndexes.push(colorIndex);
        this.previousOpenBracketColorIndex = colorIndex;
    }
    getCurrentLength(bracketPair) {
        return this.currentOpenBracketColorIndexes.length;
    }
    popCurrent(bracketPair) {
        return this.currentOpenBracketColorIndexes.pop();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SingularIndex;
//# sourceMappingURL=singularIndex.js.map