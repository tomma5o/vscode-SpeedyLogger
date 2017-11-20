"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const esprima_1 = require("esprima");
class SpeedyLogger {
    constructor() {
        this.editor = vscode_1.window.activeTextEditor;
        this.activeLine = this.editor.selection.active;
    }
    insertText(val) {
        if (!this.editor) {
            vscode_1.window.showErrorMessage('Can\'t insert log because no document is open');
            return;
        }
        const selection = this.editor.selection;
        const range = new vscode_1.Range(selection.start, selection.end);
        this.editor.edit((editBuilder) => {
            editBuilder.replace(range, val);
        });
    }
    ;
    insertLog(nodeName) {
        vscode_1.commands.executeCommand('editor.action.insertLineAfter').then((e) => {
            const logToInsert = `console.log('${nodeName}: ', ${nodeName});`;
            this.insertText(logToInsert);
        });
    }
    /**
     * @todo
     * function for check if in the upper?under line
     * there are a variable
     */
    getNearVariable(script) {
        if (script.body.length === 0 || script.body[0].type !== "VariableDeclaration") {
            for (var i = -1; i < 2; i++) {
                let lineTest = new vscode_1.Position(this.activeLine.line + i, this.activeLine.character);
                let checkNearLine = this.editor.document.lineAt(lineTest);
                if (checkNearLine && checkNearLine.text !== "") {
                    let getAst = esprima_1.parseScript(checkNearLine.text);
                    if (getAst.body[0].type === "VariableDeclaration")
                        return getAst.body[0].declarations[0].id.name;
                }
            }
        }
    }
    getVariableName() {
        this.getNearVariable;
    }
    insertLogStatement(context) {
        vscode_1.commands.registerCommand('extension.insertLogStatement', () => {
            if (!this.editor) {
                return;
            }
            this.activeLine = this.editor.selection.active;
            const lineText = this.editor.document.lineAt(this.activeLine).text;
            const text = esprima_1.parseScript(lineText);
            console.log("text: ", text);
            console.log("line length: ", lineText.length);
            console.log("current line: ", this.activeLine.line);
            if (text.body.length) {
                switch (text.body[0].type) {
                    case "VariableDeclaration":
                        let varName = text.body[0].declarations[0].id.name;
                        this.insertLog(varName);
                        break;
                    case "FunctionDeclaration":
                        break;
                    default:
                        this.insertText('console.log();');
                        break;
                }
            }
        });
    }
    ;
    /**
     * @todo
     * Update this function for remeber the last console log|warn|error created
     * with the shortcut and remove only that
     */
    // private getAllLogStatements(document, documentText) {
    //     let logStatements = [];
    //     const logRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
    //     let match;
    //     while (match = logRegex.exec(documentText)) {
    //         let matchRange =
    //             new Range(
    //                 document.positionAt(match.index),
    //                 document.positionAt(match.index + match[0].length)
    //             );
    //         if (!matchRange.isEmpty)
    //             logStatements.push(matchRange);
    //     }
    //     return logStatements;
    // }
    // private deleteFoundLogStatements(workspaceEdit, docUri, logs) {
    //     logs.forEach((log) => {
    //         workspaceEdit.delete(docUri, log);
    //     });
    //     workspace.applyEdit(workspaceEdit).then(() => {
    //         logs.length > 1
    //             ? window.showInformationMessage(`${logs.length} console.logs deleted`)
    //             : window.showInformationMessage(`${logs.length} console.log deleted`);
    //     });
    // }
    deleteAllLogStatements(context) {
        vscode_1.commands.registerCommand('extension.deleteAllLogStatements', () => {
            // 
            // if (!editor) { return; }
            // const document = editor.document;
            // const documentText = editor.document.getText();
            // let workspaceEdit = new WorkspaceEdit();
            // const logStatements = this.getAllLogStatements(document, documentText);
            // this.deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);
            const source = "let ciccio  = 2";
            var ast = esprima_1.parseScript(source);
            console.log(ast);
        });
    }
    ;
}
;
function activate(context) {
    if (vscode_1.window.activeTextEditor.document) {
        let speedyLogger = new SpeedyLogger();
        context.subscriptions.push(speedyLogger.insertLogStatement(context));
        context.subscriptions.push(speedyLogger.deleteAllLogStatements(context));
    }
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map