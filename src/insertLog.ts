import { window, commands, Range, Position, Disposable, ExtensionContext, TextDocument, WorkspaceEdit, workspace, TextEditor } from 'vscode';
import { parseScript } from 'esprima';

export default class insertLog {
    
        editor = window.activeTextEditor;
        activeLine = this.editor.selection.active;
        
        private insertLog(nodeName:string) {
            return new Promise(res => {
                commands.executeCommand('editor.action.insertLineAfter').then(()=> {
                    const logText = `console.log(/*SL*/'${nodeName}:',${nodeName});`;
                    const selection = this.editor.selection;
                    console.log(selection);
                    const range = new Position(selection.active.line, 0);
    
                    this.editor.edit((editBuilder) => {
                        editBuilder.insert(range, logText);
                    })

                    res()
                })
            })
        }

        private isInsideBrackets(lineText:string) {
            const removeWhitespace = lineText.trim();
            return lineText.match(/{$/g) ? true : false
        }
    
        public insertLogStatement(context) {
            commands.registerCommand('extension.insertLogStatement', async () => {
                if (!this.editor) { return; }
                
                this.activeLine = this.editor.selection.active;
                let lineText = this.editor.document.lineAt(this.activeLine).text;
                const text = parseScript(this.isInsideBrackets(lineText) ? lineText + "}" : lineText);
    
                switch ( text.body.length && text.body[0].type ) {

                    case "VariableDeclaration":
                        let varName = text.body[0].declarations[0].id.name;

                        if (text.body[0].declarations[0].init.type !== "ArrowFunctionExpression") {
                            this.insertLog(varName);
                        } else {
                            let identifiers = text.body[0].declarations[0].init.params.map(e => e.name);
                            identifiers.forEach(el => {
                                this.insertLog(el);
                            });
                        }
                        break;

                    case "FunctionDeclaration":
                        let identifiers = text.body[0].params.map(e => e.name);

                        for (let arg of identifiers) {
                            await this.insertLog(arg)
                        }
                        break;

                    default:
                        break;
                }
            });
        };
    };