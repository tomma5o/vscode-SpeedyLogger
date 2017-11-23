import { window, commands, Range, Position, Disposable, ExtensionContext, TextDocument, WorkspaceEdit, workspace, TextEditor } from 'vscode';
import { parseScript } from 'esprima';

export default class insertLog {
    
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
        private searchDeclarator(script) {
            if (script.body.length === 0 || script.body[0].type !== "VariableDeclaration") {
                    let lineTest = new Position(this.activeLine.line - 1, this.activeLine.character);
                    let checkNearLine = this.editor.document.lineAt(lineTest);
    
                    if (checkNearLine && checkNearLine.text !== "") {
                        let getAst = parseScript(checkNearLine.text);
    
                        if (getAst.body)
                            return getAst.body[0].declarations[0].id.name;
                }
            }
        }
    
        public insertLogStatement(context) {
            commands.registerCommand('extension.insertLogStatement', () => {
                if (!this.editor) { return; }
                
                this.activeLine = this.editor.selection.active;
                let lineText = this.editor.document.lineAt(this.activeLine).text;

                if (lineText[lineText.length -1] === "{") {
                    lineText =lineText + "}"
                }
                const text = parseScript(lineText);
    
                console.log("text: ", text)
                console.log("line length: ", lineText.length)
                console.log("current line: ", this.activeLine.line + 1)
    
                if (text.body.length) {
                    switch ( text.body[0].type ) {
    
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
                            identifiers.forEach(el => {
                                this.insertLog(el);
                            });
                            console.log(identifiers)
                            break;
    
                        default:
                            this.insertText('console.log();');
                            break;
                    }
                }
            });
        };
    };