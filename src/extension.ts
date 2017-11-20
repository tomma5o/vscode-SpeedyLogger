import { window, commands, Range, Position, Disposable, ExtensionContext, TextDocument, WorkspaceEdit, workspace, TextEditor } from 'vscode';
import { parseScript } from 'esprima';


class SpeedyLogger {

    editor = window.activeTextEditor;
    activeLine = this.editor.selection.active;

    private insertText(val) {
        if (!this.editor) {
            window.showErrorMessage('Can\'t insert log because no document is open');
            return;
        }
    
        const selection = this.editor.selection;
        const range = new Range(selection.start, selection.end);
    
        this.editor.edit((editBuilder) => {
            editBuilder.replace(range, val);
        });
    };

    private insertLog(nodeName:string) {
        commands.executeCommand('editor.action.insertLineAfter').then((e) => {
            const logToInsert = `console.log('${nodeName}: ', ${nodeName});`;
            this.insertText(logToInsert);
        })
    }

    /**
     * @todo
     * function for check if in the upper?under line 
     * there are a variable
     */
    private getNearVariable(script) {
        if (script.body.length === 0 || script.body[0].type !== "VariableDeclaration") {
            for (var i = -1; i < 2; i++) {
                let lineTest = new Position(this.activeLine.line + i, this.activeLine.character);
                let checkNearLine = this.editor.document.lineAt(lineTest);

                if (checkNearLine && checkNearLine.text !== "") {
                    let getAst = parseScript(checkNearLine.text);

                    if (getAst.body[0].type === "VariableDeclaration")
                        return getAst.body[0].declarations[0].id.name;
                }
            }
        }
    }

    private getVariableName() {
        this.getNearVariable
    }

    public insertLogStatement(context) {
        commands.registerCommand('extension.insertLogStatement', () => {
            if (!this.editor) { return; }
            
            this.activeLine = this.editor.selection.active;
            const lineText = this.editor.document.lineAt(this.activeLine).text;
            const text = parseScript(lineText);

            console.log("text: ", text)
            console.log("line length: ", lineText.length)
            console.log("current line: ", this.activeLine.line)

            if (text.body.length ) {
                switch ( text.body[0].type ) {

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
    };

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

    public deleteAllLogStatements(context) {
        commands.registerCommand('extension.deleteAllLogStatements', () => {
            // 
            // if (!editor) { return; }

            // const document = editor.document;
            // const documentText = editor.document.getText();

            // let workspaceEdit = new WorkspaceEdit();

            // const logStatements = this.getAllLogStatements(document, documentText);

            // this.deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);

            const source = "let ciccio  = 2";

            var ast = parseScript(source);
            console.log(ast);
        });
    };
};

export function activate(context) {
    if ( window.activeTextEditor.document) {
        let speedyLogger = new SpeedyLogger();

        context.subscriptions.push(speedyLogger.insertLogStatement(context));
        context.subscriptions.push(speedyLogger.deleteAllLogStatements(context));
    }
}
