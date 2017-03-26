"use strict";
const vscode = require("vscode");
const bracketPair_1 = require("./bracketPair");
const colorMode_1 = require("./colorMode");
const modifierPair_1 = require("./modifierPair");
class Settings {
    constructor(settings) {
        this.bracketPairs = [];
        this.singleCommentModifiers = [];
        this.blockCommentModifiers = [];
        this.quoteModifiers = [];
        this.isDisposed = false;
        const hashTag = "#";
        const doubleQuote = "\"";
        const singleQuote = "'";
        const backtick = "`";
        const doubleSlash = "//";
        const slashBlockOpen = "/*";
        const slashBlockClose = "*/";
        const htmlBlockOpen = "<!--";
        const htmlBlockClose = "-->";
        const rubyBegin = "=begin";
        const rubyEnd = "=end";
        let supportedLanguageID = true;
        if (settings.languageID === "python") {
            this.singleCommentModifiers.push(hashTag);
            this.quoteModifiers.push(new modifierPair_1.default(doubleQuote, doubleQuote));
            this.quoteModifiers.push(new modifierPair_1.default(singleQuote, singleQuote));
        }
        else if (settings.languageID === "typescript" ||
            settings.languageID === "javascript") {
            this.singleCommentModifiers.push(doubleSlash);
            this.blockCommentModifiers.push(new modifierPair_1.default(slashBlockOpen, slashBlockClose));
            this.quoteModifiers.push(new modifierPair_1.default(backtick, backtick));
            this.quoteModifiers.push(new modifierPair_1.default(doubleQuote, doubleQuote));
            this.quoteModifiers.push(new modifierPair_1.default(singleQuote, singleQuote));
        }
        else if (settings.languageID === "c" ||
            settings.languageID === "cpp" ||
            settings.languageID === "csharp" ||
            settings.languageID === "java") {
            this.singleCommentModifiers.push(doubleSlash);
            this.blockCommentModifiers.push(new modifierPair_1.default(slashBlockOpen, slashBlockClose));
            this.quoteModifiers.push(new modifierPair_1.default(doubleQuote, doubleQuote));
            this.quoteModifiers.push(new modifierPair_1.default(singleQuote, singleQuote));
        }
        else if (settings.languageID === "swift" ||
            settings.languageID === "json") {
            this.singleCommentModifiers.push(doubleSlash);
            this.blockCommentModifiers.push(new modifierPair_1.default(slashBlockOpen, slashBlockClose));
            this.quoteModifiers.push(new modifierPair_1.default(doubleQuote, doubleQuote));
        }
        else if (settings.languageID === "php") {
            this.singleCommentModifiers.push(doubleSlash);
            this.singleCommentModifiers.push(hashTag);
            this.blockCommentModifiers.push(new modifierPair_1.default(slashBlockOpen, slashBlockClose));
            this.quoteModifiers.push(new modifierPair_1.default(doubleQuote, doubleQuote));
            this.quoteModifiers.push(new modifierPair_1.default(singleQuote, singleQuote));
        }
        else if (settings.languageID === "ruby") {
            this.singleCommentModifiers.push(hashTag);
            this.blockCommentModifiers.push(new modifierPair_1.default(rubyBegin, rubyEnd));
            this.quoteModifiers.push(new modifierPair_1.default(doubleQuote, doubleQuote));
            this.quoteModifiers.push(new modifierPair_1.default(singleQuote, singleQuote));
        }
        else if (settings.languageID === "r") {
            this.singleCommentModifiers.push(hashTag);
            this.quoteModifiers.push(new modifierPair_1.default(doubleQuote, doubleQuote));
            this.quoteModifiers.push(new modifierPair_1.default(singleQuote, singleQuote));
        }
        else if (settings.languageID === "html") {
            this.blockCommentModifiers.push(new modifierPair_1.default(htmlBlockOpen, htmlBlockClose));
            this.quoteModifiers.push(new modifierPair_1.default(doubleQuote, doubleQuote));
            this.quoteModifiers.push(new modifierPair_1.default(singleQuote, singleQuote));
        }
        else if (settings.languageID === "css") {
            this.blockCommentModifiers.push(new modifierPair_1.default(slashBlockOpen, slashBlockClose));
            this.quoteModifiers.push(new modifierPair_1.default(doubleQuote, doubleQuote));
            this.quoteModifiers.push(new modifierPair_1.default(singleQuote, singleQuote));
        }
        else {
            supportedLanguageID = false;
        }
        const configuration = vscode.workspace.getConfiguration();
        this.forceUniqueOpeningColor = settings.forceUniqueOpeningColor !== undefined ?
            settings.forceUniqueOpeningColor :
            configuration.get("bracketPairColorizer.forceUniqueOpeningColor");
        if (typeof this.forceUniqueOpeningColor !== "boolean") {
            throw new Error("forceUniqueOpeningColor is not a boolean");
        }
        this.forceIterationColorCycle = settings.forceIterationColorCycle !== undefined ?
            settings.forceIterationColorCycle :
            configuration.get("bracketPairColorizer.forceIterationColorCycle");
        if (typeof this.forceIterationColorCycle !== "boolean") {
            throw new Error("forceIterationColorCycle is not a boolean");
        }
        if (supportedLanguageID) {
            this.contextualParsing = settings.contextualParsing !== undefined ?
                settings.contextualParsing : configuration.get("bracketPairColorizer.contextualParsing");
        }
        else {
            this.contextualParsing = false;
        }
        if (typeof this.contextualParsing !== "boolean") {
            throw new Error("contextualParsing is not a boolean");
        }
        this.colorMode = settings.colorMode !== undefined ?
            settings.colorMode :
            colorMode_1.default[configuration.get("bracketPairColorizer.colorMode")];
        if (typeof this.colorMode !== "number") {
            throw new Error("colorMode enum could not be parsed");
        }
        this.timeOutLength = settings.timeOutLength !== undefined ?
            settings.timeOutLength :
            configuration.get("bracketPairColorizer.timeOut");
        if (typeof this.timeOutLength !== "number") {
            throw new Error("timeOutLength was is a number");
        }
        if (this.colorMode === colorMode_1.default.Consecutive) {
            const consecutiveSettings = (settings.consecutiveSettings !== undefined ?
                settings.consecutiveSettings :
                configuration.get("bracketPairColorizer.consecutivePairColors"));
            if (!Array.isArray(consecutiveSettings)) {
                throw new Error("consecutivePairColors is not an array");
            }
            if (consecutiveSettings.length < 3) {
                throw new Error("consecutivePairColors expected at least 3 parameters, actual: "
                    + consecutiveSettings.length);
            }
            const orphanColor = consecutiveSettings[consecutiveSettings.length - 1];
            if (typeof orphanColor !== "string") {
                throw new Error("consecutivePairColors[" + (consecutiveSettings.length - 1) + "] is not a string");
            }
            const colors = consecutiveSettings[consecutiveSettings.length - 2];
            if (!Array.isArray(colors)) {
                throw new Error("consecutivePairColors[" + (consecutiveSettings.length - 2) + "] is not a string[]");
            }
            consecutiveSettings.slice(0, consecutiveSettings.length - 2).forEach((value, index) => {
                if (typeof value !== "string") {
                    throw new Error("consecutivePairColors[ " + index + "] is not a string");
                }
                const brackets = value;
                if (brackets.length < 2) {
                    throw new Error("consecutivePairColors[" + index + "] needs at least 2 characters");
                }
                this.bracketPairs.push(new bracketPair_1.default(brackets[0], brackets[1], colors, orphanColor));
            });
        }
        else {
            const independentSettings = settings.independentSettings !== undefined ?
                settings.independentSettings :
                configuration.get("bracketPairColorizer.independentPairColors");
            if (!Array.isArray(independentSettings)) {
                throw new Error("independentPairColors is not an array");
            }
            independentSettings.forEach((innerArray, index) => {
                if (!Array.isArray(innerArray)) {
                    throw new Error("independentPairColors[" + index + "] is not an array");
                }
                const brackets = innerArray[0];
                if (typeof brackets !== "string") {
                    throw new Error("independentSettings[" + index + "][0] is not a string");
                }
                if (brackets.length < 2) {
                    throw new Error("independentSettings[" + index + "][0] needs at least 2 characters");
                }
                const colors = innerArray[1];
                if (!Array.isArray(colors)) {
                    throw new Error("independentSettings[" + index + "][1] is not string[]");
                }
                const orphanColor = innerArray[2];
                if (typeof orphanColor !== "string") {
                    throw new Error("independentSettings[" + index + "][2] is not a string");
                }
                this.bracketPairs.push(new bracketPair_1.default(brackets[0], brackets[1], colors, orphanColor));
            });
        }
        this.regexPattern = this.createRegex(this.bracketPairs);
        this.decorations = this.createDecorations(this.bracketPairs);
    }
    dispose() {
        this.decorations.forEach((decoration, key) => {
            decoration.dispose();
        });
        this.decorations.clear();
        this.isDisposed = true;
    }
    // Create a regex to match open and close brackets
    // TODO Test what happens if user specifies other characters then []{}()
    createRegex(bracketPairs) {
        let regex = "[";
        for (const bracketPair of bracketPairs) {
            regex += `\\${bracketPair.openCharacter}\\${bracketPair.closeCharacter}`;
        }
        regex += "]";
        return regex;
    }
    createDecorations(bracketPairs) {
        const decorations = new Map();
        for (const bracketPair of bracketPairs) {
            for (const color of bracketPair.colors) {
                const decoration = vscode.window.createTextEditorDecorationType({ color });
                decorations.set(color, decoration);
            }
            const errorDecoration = vscode.window.createTextEditorDecorationType({ color: bracketPair.orphanColor });
            decorations.set(bracketPair.orphanColor, errorDecoration);
        }
        return decorations;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Settings;
//# sourceMappingURL=settings.js.map