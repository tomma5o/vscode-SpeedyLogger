import { window, commands, Range, Position, Disposable, ExtensionContext, TextDocument, WorkspaceEdit, workspace, TextEditor } from 'vscode';

import DeleteLog from "./deleteLog";
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
            const logToInsert = `console.log(/*SL*/'${nodeName}: ', ${nodeName});`;
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

                    if (getAst.body)
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
};

export function activate(context) {
    if ( window.activeTextEditor.document) {
        let speedyLogger = new SpeedyLogger();
        let deleteLog = new DeleteLog();

        console.log(deleteLog)
        context.subscriptions.push(speedyLogger.insertLogStatement(context));
        context.subscriptions.push(deleteLog.deleteAllLogStatements());
    }
}
