"use strict";
const multiLineState_1 = require("./multiLineState");
class LineState {
    constructor(settings, multiLineState) {
        this.isLineCommented = false;
        this.settings = settings;
        if (multiLineState !== undefined) {
            this.multiLineState = multiLineState;
        }
        else {
            this.multiLineState = new multiLineState_1.default(settings);
        }
    }
    getOpenBracketColor(bracketPair) {
        return this.multiLineState.getOpenBracketColor(bracketPair);
    }
    ;
    getCloseBracketColor(bracketPair) {
        return this.multiLineState.getCloseBracketColor(bracketPair);
    }
    CloneMultiLineState() {
        return this.multiLineState.clone();
    }
    isQuoted() {
        return this.multiLineState.isQuoted();
    }
    isMultiLineCommented() {
        return this.multiLineState.isCommented();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LineState;
//# sourceMappingURL=lineState.js.map