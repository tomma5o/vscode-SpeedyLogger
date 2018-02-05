import { window, commands, Range, Position, Disposable, ExtensionContext, TextDocument, WorkspaceEdit, workspace, TextEditor } from 'vscode';
import { isInsideBrackets, insertLog } from "../lib/utils"
import { parseScript } from 'esprima';


export default class TypeCheck {

    editor = window.activeTextEditor;

    public insertLogStatement(context) {
        commands.registerCommand('extension.insertLogStatement', async () => {
            if (!this.editor) { return; }
            const currentLine = this.editor.selection.active.line;

            let lineText = this.editor.document.lineAt(currentLine).text;
            const text = parseScript(isInsideBrackets(lineText) ? lineText + "}" : lineText);

            switch ( text.body.length && text.body[0].type ) {

                case "VariableDeclaration":

                    let varName = text.body[0].declarations[0].id.name;

                    if (text.body[0].declarations[0].init.type !== "ArrowFunctionExpression") {
                        await insertLog(varName);
                    } else {
                        let identifiers = text.body[0].declarations[0].init.params.map(e => e.name);
                        for (let arg of identifiers) {
                            await insertLog(arg)
                        }
                    }
                    break;

                case "FunctionDeclaration":
                    let identifiers = text.body[0].params.map(e => e.name);

                    for (let arg of identifiers) {
                        await insertLog(arg)
                    }
                    break;

                default:
                    window.showInformationMessage("sorry but this case wasn't managed");
            }
        });
    };
};