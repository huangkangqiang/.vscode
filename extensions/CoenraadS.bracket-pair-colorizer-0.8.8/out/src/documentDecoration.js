"use strict";
const vscode = require("vscode");
const textLine_1 = require("./textLine");
class DocumentDecoration {
    constructor(uri, settings) {
        // This program caches lines, and will only analyze linenumbers including or above a modified line
        this.lineToUpdateWhenTimeoutEnds = 0;
        this.lines = [];
        this.settings = settings;
        this.uri = uri;
    }
    dispose() {
        this.settings.dispose();
    }
    onDidChangeTextDocument(contentChanges) {
        this.updateLowestLineNumber(contentChanges);
        this.triggerUpdateDecorations();
    }
    // Lines are stored in an array, if line is requested outside of array bounds
    // add emptys lines until array is correctly sized
    getLine(index, document) {
        if (index < this.lines.length) {
            return this.lines[index];
        }
        else {
            if (this.lines.length === 0) {
                this.lines.push(new textLine_1.default(this.settings, 0, document));
            }
            for (let i = this.lines.length; i <= index; i++) {
                const previousLine = this.lines[this.lines.length - 1];
                const newLine = new textLine_1.default(this.settings, i, document, previousLine.cloneState());
                this.lines.push(newLine);
            }
            const lineToReturn = this.lines[this.lines.length - 1];
            return lineToReturn;
        }
    }
    triggerUpdateDecorations() {
        if (this.settings.isDisposed) {
            return;
        }
        if (this.settings.timeOutLength > 0) {
            if (this.updateDecorationTimeout) {
                clearTimeout(this.updateDecorationTimeout);
            }
            this.updateDecorationTimeout = setTimeout(() => {
                this.updateDecorations();
            }, this.settings.timeOutLength);
        }
        else {
            this.updateDecorations();
        }
    }
    updateLowestLineNumber(contentChanges) {
        for (const contentChange of contentChanges) {
            this.lineToUpdateWhenTimeoutEnds =
                Math.min(this.lineToUpdateWhenTimeoutEnds, contentChange.range.start.line);
        }
    }
    updateDecorations() {
        const editors = [];
        // One document may be shared by multiple editors (side by side view)
        vscode.window.visibleTextEditors.forEach((editor) => {
            if (editor.document && editor.document.lineCount !== 0 && this.uri === editor.document.uri.toString()) {
                editors.push(editor);
            }
        });
        if (editors.length === 0) {
            return;
        }
        // Only have to analyze the first document, since it is shared between the editors
        const document = editors[0].document;
        const lineNumber = this.lineToUpdateWhenTimeoutEnds;
        const amountToRemove = this.lines.length - lineNumber;
        // Remove cached lines that need to be updated
        this.lines.splice(lineNumber, amountToRemove);
        const text = document.getText();
        const regex = new RegExp(this.settings.regexPattern, "g");
        regex.lastIndex = document.offsetAt(new vscode.Position(lineNumber, 0));
        let match;
        // tslint:disable-next-line:no-conditional-assignment
        while ((match = regex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = startPos.translate(0, match[0].length);
            const range = new vscode.Range(startPos, endPos);
            const currentLine = this.getLine(startPos.line, document);
            currentLine.addBracket(match[0], range);
        }
        this.colorDecorations(editors);
    }
    colorDecorations(editors) {
        const colorMap = new Map();
        // Reduce all the colors/ranges of the lines into a singular map
        for (const line of this.lines) {
            {
                for (const [color, ranges] of line.colorRanges) {
                    const existingRanges = colorMap.get(color);
                    if (existingRanges !== undefined) {
                        existingRanges.push(...ranges);
                    }
                    else {
                        // Slice because we will be adding values to this array in the future,
                        // but don't want to modify the original array which is stored per line
                        colorMap.set(color, ranges.slice());
                    }
                }
            }
        }
        for (const [color, decoration] of this.settings.decorations) {
            const ranges = colorMap.get(color);
            editors.forEach((editor) => {
                if (ranges !== undefined) {
                    editor.setDecorations(decoration, ranges);
                }
                else {
                    // We must set non-used colors to an empty array
                    // or previous decorations will not be invalidated
                    editor.setDecorations(decoration, []);
                }
            });
        }
        this.lineToUpdateWhenTimeoutEnds = Infinity;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DocumentDecoration;
//# sourceMappingURL=documentDecoration.js.map