"use strict";
const lineState_1 = require("./lineState");
class TextLine {
    constructor(settings, index, document, multiLineState) {
        this.colorRanges = new Map();
        this.lastModifierCheckPos = 0;
        this.settings = settings;
        this.contents = document.lineAt(index).text;
        if (multiLineState !== undefined) {
            this.lineState = new lineState_1.default(settings, multiLineState);
            ;
        }
        else {
            this.lineState = new lineState_1.default(settings);
        }
    }
    // Return a copy of the line while mantaining bracket state. colorRanges is not mantained.
    cloneState() {
        // Update state for whole line before returning
        this.checkForStringModifiers();
        return this.lineState.CloneMultiLineState();
    }
    addBracket(bracket, range) {
        if (this.settings.contextualParsing) {
            this.checkForStringModifiers(range);
            if (this.lineState.isLineCommented || this.lineState.isMultiLineCommented() || this.lineState.isQuoted()) {
                return;
            }
        }
        for (const bracketPair of this.settings.bracketPairs) {
            if (bracketPair.openCharacter === bracket) {
                const color = this.lineState.getOpenBracketColor(bracketPair);
                const colorRanges = this.colorRanges.get(color);
                if (colorRanges !== undefined) {
                    colorRanges.push(range);
                }
                else {
                    this.colorRanges.set(color, [range]);
                }
                return;
            }
            else if (bracketPair.closeCharacter === bracket) {
                const color = this.lineState.getCloseBracketColor(bracketPair);
                const colorRanges = this.colorRanges.get(color);
                if (colorRanges !== undefined) {
                    colorRanges.push(range);
                }
                else {
                    this.colorRanges.set(color, [range]);
                }
                return;
            }
        }
    }
    checkForStringModifiers(range) {
        const bracketStartIndex = range !== undefined ? range.start.character : this.contents.length;
        const bracketEndIndex = range !== undefined ? range.end.character : this.contents.length;
        for (let i = this.lastModifierCheckPos; i < bracketStartIndex; i++) {
            // Single line comments consume everything else
            if (this.lineState.isLineCommented) {
                break;
            }
            // We are in a scope, search for closing modifiers
            // These checks should not fallthrough
            if (this.lineState.isMultiLineCommented()) {
                const result = this.checkClosingPairModifier(i, this.lineState.multiLineState.blockCommentModifiers);
                if (result !== undefined) {
                    i += result;
                }
                continue;
            }
            if (this.lineState.isQuoted()) {
                const result = this.checkClosingPairModifier(i, this.lineState.multiLineState.quoteModifiers);
                if (result !== undefined) {
                    i += result;
                }
                continue;
            }
            // Else we are not in a scope, search for opening modifiers
            // These checks fallthrough if unsuccessful
            {
                const result = this.checkOpeningPairModifier(i, this.lineState.multiLineState.quoteModifiers);
                if (result !== undefined) {
                    i += result;
                    continue;
                }
            }
            {
                const result = this.checkOpeningPairModifier(i, this.lineState.multiLineState.blockCommentModifiers);
                if (result !== undefined) {
                    i += result;
                    continue;
                }
            }
            {
                const result = this.checkOpeningSingleModifier(i, this.settings.singleCommentModifiers);
                if (result !== undefined) {
                    i += result;
                    continue;
                }
            }
        }
        this.lastModifierCheckPos = bracketEndIndex;
    }
    checkOpeningSingleModifier(index, modifiers) {
        for (const modifier of modifiers) {
            const searchResult = this.contents.substr(index, modifier.length);
            if (searchResult === modifier &&
                (modifier.length !== 1 || !this.isEscaped(index))) {
                this.lineState.isLineCommented = true;
                return modifier.length - 1;
            }
        }
    }
    checkOpeningPairModifier(index, modifierPairs) {
        for (const modifier of modifierPairs) {
            const searchResult = this.contents.substr(index, modifier.openingCharacter.length);
            if (searchResult === modifier.openingCharacter &&
                (modifier.openingCharacter.length !== 1 || !this.isEscaped(index))) {
                modifier.counter++;
                return modifier.openingCharacter.length - 1;
            }
        }
    }
    checkClosingPairModifier(index, modifierPairs) {
        for (const modifier of modifierPairs) {
            const searchResult = this.contents.substr(index, modifier.closingCharacter.length);
            if (searchResult === modifier.closingCharacter &&
                (modifier.closingCharacter.length !== 1 || !this.isEscaped(index))) {
                modifier.counter--;
                return modifier.closingCharacter.length - 1;
            }
        }
    }
    isEscaped(index) {
        let counter = 0;
        while (index > 0 && this.contents[--index] === "\\") {
            counter++;
        }
        return counter % 2 === 1;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TextLine;
//# sourceMappingURL=textLine.js.map