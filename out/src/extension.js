"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const deleteLog_1 = require("./deleteLog");
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
            const logToInsert = `console.log(/*SL*/'${nodeName}: ', ${nodeName});`;
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
                    if (getAst.body)
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
}
;
function activate(context) {
    if (vscode_1.window.activeTextEditor.document) {
        let speedyLogger = new SpeedyLogger();
        let deleteLog = new deleteLog_1.default();
        console.log(deleteLog);
        context.subscriptions.push(speedyLogger.insertLogStatement(context));
        context.subscriptions.push(deleteLog.deleteAllLogStatements());
    }
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map