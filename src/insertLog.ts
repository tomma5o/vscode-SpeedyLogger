import { window, commands, Range, Position, Disposable, ExtensionContext, TextDocument, WorkspaceEdit, workspace, TextEditor } from 'vscode';
import { parseScript } from 'esprima';

export default class insertLog {
    
        editor = window.activeTextEditor;
        activeLine = this.editor.selection.active;
        
        private insertLog(nodeName:string) {
            commands.executeCommand('editor.action.insertLineAfter').then(()=> {

                const logText = `console.log(/*SL*/ ${nodeName});\n`;
                const selection = this.editor.selection;
                const range = new Position(selection.active.line, 0);

                this.editor.edit((editBuilder) => {
                    console.log(range.line, logText)
                    editBuilder.insert(range, logText);
                })
            })
        }

        private isInsideBrackets(lineText:string) {
            const removeWhitespace = lineText.trim();
            return lineText.match(/{$/g) ? true : false
        }
    
        public insertLogStatement(context) {
            commands.registerCommand('extension.insertLogStatement', () => {
                if (!this.editor) { return; }
                
                this.activeLine = this.editor.selection.active;
                let lineText = this.editor.document.lineAt(this.activeLine).text;
                const text = parseScript(this.isInsideBrackets(lineText) ? lineText + "}" : lineText);
    
                switch ( text.body.length && text.body[0].type ) {

                    case "VariableDeclaration":
                        let varName = text.body[0].declarations[0].id.name;

                        if (text.body[0].declarations[0].init.type !== "ArrowFunctionExpression") {
                            this.insertLog(`${varName}: ` + varName);
                        } else {
                            let identifiers = text.body[0].declarations[0].init.params.map(e => e.name);
                            identifiers.forEach(el => {
                                this.insertLog(`${el}: ` + el);
                            });
                        }
                        break;

                    case "FunctionDeclaration":
                        let identifiers = text.body[0].params.map(e => e.name);
                        const args = identifiers.map(el => {
                            return `'${el}: ', ` + el
                        });
                        this.insertLog(args.join(","))

                        break;

                    default:
                        break;
                }
            });
        };
    };