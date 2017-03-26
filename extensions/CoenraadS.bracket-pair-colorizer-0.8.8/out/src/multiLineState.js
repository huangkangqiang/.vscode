"use strict";
const colorMode_1 = require("./colorMode");
const multipleIndexes_1 = require("./multipleIndexes");
const singularIndex_1 = require("./singularIndex");
class MultiLineState {
    constructor(settings, previousState) {
        this.settings = settings;
        if (previousState !== undefined) {
            this.colorIndexes = previousState.colorIndexes;
            this.previousBracketColor = previousState.previousBracketColor;
            this.blockCommentModifiers = previousState.blockCommentModifiers;
            this.quoteModifiers = previousState.quoteModifiers;
        }
        else {
            switch (settings.colorMode) {
                case colorMode_1.default.Consecutive:
                    this.colorIndexes = new singularIndex_1.default();
                    break;
                case colorMode_1.default.Independent:
                    this.colorIndexes = new multipleIndexes_1.default(settings);
                    break;
                default: throw new RangeError("Not implemented enum value");
            }
            this.blockCommentModifiers = this.settings.blockCommentModifiers.slice();
            this.quoteModifiers = this.settings.quoteModifiers.slice();
        }
    }
    getOpenBracketColor(bracketPair) {
        let colorIndex;
        if (this.settings.forceIterationColorCycle) {
            colorIndex = (this.colorIndexes.getPrevious(bracketPair) + 1) % bracketPair.colors.length;
        }
        else {
            colorIndex = this.colorIndexes.getCurrentLength(bracketPair) % bracketPair.colors.length;
        }
        let color = bracketPair.colors[colorIndex];
        if (this.settings.forceUniqueOpeningColor && color === this.previousBracketColor) {
            colorIndex = (colorIndex + 1) % bracketPair.colors.length;
            color = bracketPair.colors[colorIndex];
        }
        this.previousBracketColor = color;
        this.colorIndexes.setCurrent(bracketPair, colorIndex);
        return color;
    }
    ;
    getCloseBracketColor(bracketPair) {
        const colorIndex = this.colorIndexes.popCurrent(bracketPair);
        let color;
        if (colorIndex !== undefined) {
            color = bracketPair.colors[colorIndex];
        }
        else {
            color = bracketPair.orphanColor;
        }
        this.previousBracketColor = color;
        return color;
    }
    isQuoted() {
        for (const modifier of this.quoteModifiers) {
            if (modifier.counter > 0) {
                return true;
            }
        }
        return false;
    }
    isCommented() {
        for (const modifier of this.blockCommentModifiers) {
            if (modifier.counter > 0) {
                return true;
            }
        }
        return false;
    }
    clone() {
        const clone = {
            blockCommentModifiers: this.blockCommentModifiers.map((modifier) => modifier.Clone()),
            colorIndexes: this.colorIndexes.clone(),
            previousBracketColor: this.previousBracketColor,
            quoteModifiers: this.quoteModifiers.map((modifier) => modifier.Clone()),
        };
        return new MultiLineState(this.settings, clone);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MultiLineState;
//# sourceMappingURL=multiLineState.js.map