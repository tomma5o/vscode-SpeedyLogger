"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class SpeedyLogger {
    insertText(val) {
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            vscode_1.window.showErrorMessage('Can\'t insert log because no document is open');
            return;
        }
        const selection = editor.selection;
        const range = new vscode_1.Range(selection.start, selection.end);
        editor.edit((editBuilder) => {
            editBuilder.replace(range, val);
        });
    }
    ;
    insertLogStatement(context) {
        vscode_1.commands.registerCommand('extension.insertLogStatement', () => {
            const editor = vscode_1.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const currentLine = editor.selection.active;
            const line = editor.document.lineAt(currentLine).text;
            const text = line.replace(/(var|let|const).([\w]*)(.*)/g, "$2");
            text
                ? vscode_1.commands.executeCommand('editor.action.insertLineAfter')
                    .then((e) => {
                    const logToInsert = `console.log('${text}: ', ${text});`;
                    this.insertText(logToInsert);
                })
                : this.insertText('console.log();');
        });
    }
    ;
    getAllLogStatements(document, documentText) {
        let logStatements = [];
        const logRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
        let match;
        while (match = logRegex.exec(documentText)) {
            let matchRange = new vscode_1.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));
            if (!matchRange.isEmpty)
                logStatements.push(matchRange);
        }
        return logStatements;
    }
    deleteFoundLogStatements(workspaceEdit, docUri, logs) {
        logs.forEach((log) => {
            workspaceEdit.delete(docUri, log);
        });
        vscode_1.workspace.applyEdit(workspaceEdit).then(() => {
            logs.length > 1
                ? vscode_1.window.showInformationMessage(`${logs.length} console.logs deleted`)
                : vscode_1.window.showInformationMessage(`${logs.length} console.log deleted`);
        });
    }
    deleteAllLogStatements(context) {
        vscode_1.commands.registerCommand('extension.deleteAllLogStatements', () => {
            const editor = vscode_1.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const document = editor.document;
            const documentText = editor.document.getText();
            let workspaceEdit = new vscode_1.WorkspaceEdit();
            const logStatements = this.getAllLogStatements(document, documentText);
            this.deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);
        });
    }
    ;
}
;
function activate(context) {
    let speedyLogger = new SpeedyLogger();
    context.subscriptions.push(speedyLogger.insertLogStatement(context));
    context.subscriptions.push(speedyLogger.deleteAllLogStatements(context));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map