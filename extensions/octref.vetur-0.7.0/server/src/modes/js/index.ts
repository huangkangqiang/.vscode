import { LanguageModelCache, getLanguageModelCache } from '../languageModelCache';
import {
  SymbolInformation,
  SymbolKind,
  CompletionItem,
  Location,
  SignatureHelp,
  SignatureInformation,
  ParameterInformation,
  Definition,
  TextEdit,
  TextDocument,
  Diagnostic,
  DiagnosticSeverity,
  Range,
  CompletionItemKind,
  Hover,
  MarkedString,
  DocumentHighlight,
  DocumentHighlightKind,
  CompletionList,
  Position,
  FormattingOptions
} from 'vscode-languageserver-types';
import { LanguageMode } from '../languageModes';
import { VueDocumentRegions } from '../embeddedSupport';
import { createUpdater, parseVue, isVue } from '../ts';
import { getWordAtText } from '../utils/string';
import { getFilePath, getFileFsPath, getNormalizedFileFsPath } from '../utils/path';

import Uri from 'vscode-uri';
import * as path from 'path';
import * as ts from 'typescript';
import * as _ from 'lodash';
import { platform } from 'os';

const JS_WORD_REGEX = /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g;

export function getJSMode(
  documentRegions: LanguageModelCache<VueDocumentRegions>,
  workspacePath: string
): LanguageMode {
  if (!workspacePath) {
    return {
      getId() {
        return 'javascript';
      },
      onDocumentRemoved() {},
      dispose() {}
    };
  }

  const jsDocuments = getLanguageModelCache<TextDocument>(10, 60, document => {
    const vueDocument = documentRegions.get(document);
    if (vueDocument.getLanguagesInDocument().indexOf('typescript') > -1) {
      return vueDocument.getEmbeddedDocument('typescript');
    }
    return vueDocument.getEmbeddedDocument('javascript');
  });

  let compilerOptions: ts.CompilerOptions = {
    allowNonTsExtensions: true,
    allowJs: true,
    lib: ['lib.dom.d.ts', 'lib.es2017.d.ts'],
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    module: ts.ModuleKind.CommonJS,
    allowSyntheticDefaultImports: true
  };
  let currentTextDocument: TextDocument;
  let versions = new Map<string, number>();
  let docs = new Map<string, TextDocument>();

  // Patch typescript functions to insert `import Vue from 'vue'` and `new Vue` around export default.
  const { createLanguageServiceSourceFile, updateLanguageServiceSourceFile } = createUpdater();
  (ts as any).createLanguageServiceSourceFile = createLanguageServiceSourceFile;
  (ts as any).updateLanguageServiceSourceFile = updateLanguageServiceSourceFile;
  const configFilename =
    ts.findConfigFile(workspacePath, ts.sys.fileExists, 'tsconfig.json') ||
    ts.findConfigFile(workspacePath, ts.sys.fileExists, 'jsconfig.json');
  const configJson = (configFilename && ts.readConfigFile(configFilename, ts.sys.readFile).config) || {
    exclude: ['node_modules', '**/node_modules/*']
  };
  const parsedConfig = ts.parseJsonConfigFileContent(
    configJson,
    ts.sys,
    workspacePath,
    compilerOptions,
    configFilename,
    undefined,
    [{ extension: 'vue', isMixedContent: true }]
  );
  const files = parsedConfig.fileNames;
  compilerOptions = parsedConfig.options;
  compilerOptions.allowNonTsExtensions = true;

  function updateCurrentTextDocument(doc: TextDocument) {
    const fileFsPath = getFileFsPath(doc.uri);
    const filePath = getFilePath(doc.uri);
    // When file is not in language service, add it
    if (!docs.has(fileFsPath)) {
      if (_.endsWith(fileFsPath, '.vue')) {
        files.push(filePath);
      }
    }
    if (!currentTextDocument || doc.uri !== currentTextDocument.uri || doc.version !== currentTextDocument.version) {
      currentTextDocument = jsDocuments.get(doc);
      if (docs.has(fileFsPath) && currentTextDocument.languageId !== docs.get(fileFsPath).languageId) {
        // if languageId changed, restart the language service; it can't handle file type changes
        compilerOptions.allowJs = docs.get(fileFsPath).languageId !== 'typescript';
        jsLanguageService = ts.createLanguageService(host);
      }
      docs.set(fileFsPath, currentTextDocument);
      versions.set(fileFsPath, (versions.get(fileFsPath) || 0) + 1);
    }
  }

  const host: ts.LanguageServiceHost = {
    getCompilationSettings: () => compilerOptions,
    getScriptFileNames: () => files,
    getScriptVersion(fileName) {
      const normalizedFileFsPath = getNormalizedFileFsPath(fileName);
      return versions.has(normalizedFileFsPath) ? versions.get(normalizedFileFsPath).toString() : '0';
    },
    getScriptKind(fileName) {
      if (isVue(fileName)) {
        const uri = Uri.file(fileName);
        fileName = uri.fsPath;
        const doc =
          docs.get(fileName) ||
          jsDocuments.get(TextDocument.create(uri.toString(), 'vue', 0, ts.sys.readFile(fileName)));
        return doc.languageId === 'typescript' ? ts.ScriptKind.TS : ts.ScriptKind.JS;
      } else {
        // NOTE: Typescript 2.3 should export getScriptKindFromFileName. Then this cast should be removed.
        return (ts as any).getScriptKindFromFileName(fileName);
      }
    },
    resolveModuleNames(moduleNames: string[], containingFile: string): ts.ResolvedModule[] {
      // in the normal case, delegate to ts.resolveModuleName
      // in the relative-imported.vue case, manually build a resolved filename
      return moduleNames.map(name => {
        if (path.isAbsolute(name) || !isVue(name)) {
          return ts.resolveModuleName(name, containingFile, compilerOptions, ts.sys).resolvedModule;
        } else {
          const uri = Uri.file(path.join(path.dirname(containingFile), name));
          const resolvedFileName = uri.fsPath;
          if (ts.sys.fileExists(resolvedFileName)) {
            const doc =
              docs.get(resolvedFileName) ||
              jsDocuments.get(TextDocument.create(uri.toString(), 'vue', 0, ts.sys.readFile(resolvedFileName)));
            return {
              resolvedFileName,
              extension: doc.languageId === 'typescript' ? ts.Extension.Ts : ts.Extension.Js
            };
          }
        }
      });
    },
    getScriptSnapshot: (fileName: string) => {
      const normalizedFileFsPath = getNormalizedFileFsPath(fileName);
      let text = docs.has(normalizedFileFsPath)
        ? docs.get(normalizedFileFsPath).getText()
        : ts.sys.readFile(normalizedFileFsPath) || '';
      if (isVue(fileName)) {
        // Note: This is required in addition to the parsing in embeddedSupport because
        // this works for .vue files that aren't even loaded by VS Code yet.
        text = parseVue(text);
      }
      return {
        getText: (start, end) => text.substring(start, end),
        getLength: () => text.length,
        getChangeRange: () => void 0
      };
    },
    getCurrentDirectory: () => workspacePath,
    getDefaultLibFileName: ts.getDefaultLibFilePath
  };

  let jsLanguageService = ts.createLanguageService(host);
  let settings: any = {};

  return {
    getId() {
      return 'javascript';
    },
    configure(options: any) {
      if (options.vetur) {
        settings.format = options.vetur.format.js;
      }
    },
    doValidation(doc: TextDocument): Diagnostic[] {
      updateCurrentTextDocument(doc);
      if (!languageServiceIncludesFile(jsLanguageService, doc.uri)) {
        return [];
      }

      const fileFsPath = getFileFsPath(doc.uri);
      const diagnostics = [
        ...jsLanguageService.getSyntacticDiagnostics(fileFsPath),
        ...jsLanguageService.getSemanticDiagnostics(fileFsPath)
      ];

      return diagnostics.map(diag => {
        return {
          range: convertRange(currentTextDocument, diag),
          severity: DiagnosticSeverity.Error,
          message: ts.flattenDiagnosticMessageText(diag.messageText, '\n')
        };
      });
    },
    doComplete(doc: TextDocument, position: Position): CompletionList {
      updateCurrentTextDocument(doc);
      if (!languageServiceIncludesFile(jsLanguageService, doc.uri)) {
        return { isIncomplete: false, items: [] };
      }

      const fileFsPath = getFileFsPath(doc.uri);
      let offset = currentTextDocument.offsetAt(position);
      let completions = jsLanguageService.getCompletionsAtPosition(fileFsPath, offset);
      if (!completions) {
        return { isIncomplete: false, items: [] };
      }
      let replaceRange = convertRange(
        currentTextDocument,
        getWordAtText(currentTextDocument.getText(), offset, JS_WORD_REGEX)
      );
      return {
        isIncomplete: false,
        items: completions.entries.map(entry => {
          return {
            uri: doc.uri,
            position: position,
            label: entry.name,
            sortText: entry.sortText,
            kind: convertKind(entry.kind),
            textEdit: TextEdit.replace(replaceRange, entry.name),
            data: {
              // data used for resolving item details (see 'doResolve')
              languageId: 'javascript',
              uri: doc.uri,
              offset: offset
            }
          };
        })
      };
    },
    doResolve(doc: TextDocument, item: CompletionItem): CompletionItem {
      updateCurrentTextDocument(doc);
      if (!languageServiceIncludesFile(jsLanguageService, doc.uri)) {
        return null;
      }

      const fileFsPath = getFileFsPath(doc.uri);
      const details = jsLanguageService.getCompletionEntryDetails(fileFsPath, item.data.offset, item.label);
      if (details) {
        item.detail = ts.displayPartsToString(details.displayParts);
        item.documentation = ts.displayPartsToString(details.documentation);
        delete item.data;
      }
      return item;
    },
    doHover(doc: TextDocument, position: Position): Hover {
      updateCurrentTextDocument(doc);
      if (!languageServiceIncludesFile(jsLanguageService, doc.uri)) {
        return null;
      }

      const fileFsPath = getFileFsPath(doc.uri);
      try {
        const info = jsLanguageService.getQuickInfoAtPosition(fileFsPath, currentTextDocument.offsetAt(position));
        if (info) {
          const contents = ts.displayPartsToString(info.displayParts);
          return {
            range: convertRange(currentTextDocument, info.textSpan),
            contents: MarkedString.fromPlainText(contents)
          };
        }
      } catch (e) {

      }
      return null;
    },
    doSignatureHelp(doc: TextDocument, position: Position): SignatureHelp {
      updateCurrentTextDocument(doc);
      if (!languageServiceIncludesFile(jsLanguageService, doc.uri)) {
        return null;
      }

      const fileFsPath = getFileFsPath(doc.uri);
      const signHelp = jsLanguageService.getSignatureHelpItems(fileFsPath, currentTextDocument.offsetAt(position));
      if (signHelp) {
        const ret: SignatureHelp = {
          activeSignature: signHelp.selectedItemIndex,
          activeParameter: signHelp.argumentIndex,
          signatures: []
        };
        signHelp.items.forEach(item => {
          const signature: SignatureInformation = {
            label: '',
            documentation: null,
            parameters: []
          };

          signature.label += ts.displayPartsToString(item.prefixDisplayParts);
          item.parameters.forEach((p, i, a) => {
            const label = ts.displayPartsToString(p.displayParts);
            const parameter: ParameterInformation = {
              label: label,
              documentation: ts.displayPartsToString(p.documentation)
            };
            signature.label += label;
            signature.parameters.push(parameter);
            if (i < a.length - 1) {
              signature.label += ts.displayPartsToString(item.separatorDisplayParts);
            }
          });
          signature.label += ts.displayPartsToString(item.suffixDisplayParts);
          ret.signatures.push(signature);
        });
        return ret;
      }
      return null;
    },
    // Disabled per https://github.com/octref/vetur/issues/215
    // Will reenable once module resolution problem is resolved for vue files.
    /*
    findDocumentHighlight (doc: TextDocument, position: Position): DocumentHighlight[] {
      updateCurrentTextDocument(doc);
      if (!languageServiceIncludesFile(jsLanguageService, doc.uri)) {
        return [];
      }

      const fileFsPath = getFileFsPath(doc.uri);
      const occurrences = jsLanguageService.getOccurrencesAtPosition(fileFsPath, currentTextDocument.offsetAt(position));
      if (occurrences) {
        return occurrences.map(entry => {
          return {
            range: convertRange(currentTextDocument, entry.textSpan),
            kind: <DocumentHighlightKind>(entry.isWriteAccess ? DocumentHighlightKind.Write : DocumentHighlightKind.Text)
          };
        });
      };
      return [];
    },
    */
    findDocumentSymbols(doc: TextDocument): SymbolInformation[] {
      updateCurrentTextDocument(doc);
      if (!languageServiceIncludesFile(jsLanguageService, doc.uri)) {
        return [];
      }

      const fileFsPath = getFileFsPath(doc.uri);
      const items = jsLanguageService.getNavigationBarItems(fileFsPath);
      if (items) {
        const result: SymbolInformation[] = [];
        const existing = {};
        const collectSymbols = (item: ts.NavigationBarItem, containerLabel?: string) => {
          const sig = item.text + item.kind + item.spans[0].start;
          if (item.kind !== 'script' && !existing[sig]) {
            const symbol: SymbolInformation = {
              name: item.text,
              kind: convertSymbolKind(item.kind),
              location: {
                uri: doc.uri,
                range: convertRange(currentTextDocument, item.spans[0])
              },
              containerName: containerLabel
            };
            existing[sig] = true;
            result.push(symbol);
            containerLabel = item.text;
          }

          if (item.childItems && item.childItems.length > 0) {
            for (let child of item.childItems) {
              collectSymbols(child, containerLabel);
            }
          }
        };

        items.forEach(item => collectSymbols(item));
        return result;
      }
      return [];
    },
    findDefinition(doc: TextDocument, position: Position): Definition {
      updateCurrentTextDocument(doc);
      if (!languageServiceIncludesFile(jsLanguageService, doc.uri)) {
        return null;
      }

      const fileFsPath = getFileFsPath(doc.uri);
      const definition = jsLanguageService.getDefinitionAtPosition(fileFsPath, currentTextDocument.offsetAt(position));
      if (definition) {
        return definition.map(d => {
          return {
            uri: doc.uri,
            range: convertRange(currentTextDocument, d.textSpan)
          };
        });
      }
      return null;
    },
    findReferences(doc: TextDocument, position: Position): Location[] {
      updateCurrentTextDocument(doc);
      if (!languageServiceIncludesFile(jsLanguageService, doc.uri)) {
        return [];
      }

      const fileFsPath = getFileFsPath(doc.uri);
      const references = jsLanguageService.getReferencesAtPosition(fileFsPath, currentTextDocument.offsetAt(position));
      if (references) {
        return references.map(d => {
          return {
            uri: doc.uri,
            range: convertRange(currentTextDocument, d.textSpan)
          };
        });
      }
      return [];
    },
    format(doc: TextDocument, range: Range, formatParams: FormattingOptions): TextEdit[] {
      updateCurrentTextDocument(doc);

      const fileFsPath = getFileFsPath(doc.uri);
      const initialIndentLevel = formatParams.scriptInitialIndent ? 1 : 0;
      const formatSettings = convertOptions(formatParams, settings && settings.format, initialIndentLevel);
      const start = currentTextDocument.offsetAt(range.start);
      let end = currentTextDocument.offsetAt(range.end);
      const edits = jsLanguageService.getFormattingEditsForRange(fileFsPath, start, end, formatSettings);
      if (edits) {
        const result = [];
        for (let edit of edits) {
          if (edit.span.start >= start && edit.span.start + edit.span.length <= end) {
            result.push({
              range: convertRange(currentTextDocument, edit.span),
              newText: edit.newText
            });
          }
        }
        return result;
      }
      return [];
    },
    onDocumentRemoved(document: TextDocument) {
      jsDocuments.onDocumentRemoved(document);
    },
    dispose() {
      jsLanguageService.dispose();
      jsDocuments.dispose();
    }
  };
}

function languageServiceIncludesFile(ls: ts.LanguageService, documentUri: string): boolean {
  const filePaths = ls.getProgram().getRootFileNames();
  const filePath = getFilePath(documentUri);
  return filePaths.includes(filePath);
}

function convertRange(document: TextDocument, span: { start: number; length: number }): Range {
  const startPosition = document.positionAt(span.start);
  const endPosition = document.positionAt(span.start + span.length);
  return Range.create(startPosition, endPosition);
}

function convertKind(kind: string): CompletionItemKind {
  switch (kind) {
    case 'primitive type':
    case 'keyword':
      return CompletionItemKind.Keyword;
    case 'var':
    case 'local var':
      return CompletionItemKind.Variable;
    case 'property':
    case 'getter':
    case 'setter':
      return CompletionItemKind.Field;
    case 'function':
    case 'method':
    case 'construct':
    case 'call':
    case 'index':
      return CompletionItemKind.Function;
    case 'enum':
      return CompletionItemKind.Enum;
    case 'module':
      return CompletionItemKind.Module;
    case 'class':
      return CompletionItemKind.Class;
    case 'interface':
      return CompletionItemKind.Interface;
    case 'warning':
      return CompletionItemKind.File;
  }

  return CompletionItemKind.Property;
}

function convertSymbolKind(kind: string): SymbolKind {
  switch (kind) {
    case 'var':
    case 'local var':
    case 'const':
      return SymbolKind.Variable;
    case 'function':
    case 'local function':
      return SymbolKind.Function;
    case 'enum':
      return SymbolKind.Enum;
    case 'module':
      return SymbolKind.Module;
    case 'class':
      return SymbolKind.Class;
    case 'interface':
      return SymbolKind.Interface;
    case 'method':
      return SymbolKind.Method;
    case 'property':
    case 'getter':
    case 'setter':
      return SymbolKind.Property;
  }
  return SymbolKind.Variable;
}

function convertOptions(
  options: FormattingOptions,
  formatSettings: any,
  initialIndentLevel: number
): ts.FormatCodeOptions {
  const defaultJsFormattingOptions = {
    ConvertTabsToSpaces: options.insertSpaces,
    TabSize: options.tabSize,
    IndentSize: options.tabSize,
    IndentStyle: ts.IndentStyle.Smart,
    NewLineCharacter: '\n',
    BaseIndentSize: options.tabSize * initialIndentLevel,
    InsertSpaceAfterCommaDelimiter: true,
    InsertSpaceAfterSemicolonInForStatements: true,
    InsertSpaceAfterKeywordsInControlFlowStatements: true,
    InsertSpaceAfterFunctionKeywordForAnonymousFunctions: true,
    InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
    InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
    InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
    InsertSpaceBeforeFunctionParenthesis: true,
    InsertSpaceBeforeAndAfterBinaryOperators: true,
    PlaceOpenBraceOnNewLineForControlBlocks: false,
    PlaceOpenBraceOnNewLineForFunctions: false
  };

  return _.assign(defaultJsFormattingOptions, formatSettings);
}
