import { window, commands } from 'vscode';

export default function insertLog(nodeName:string) {
    const editor = window.activeTextEditor;

    return new Promise(res => {
        commands.executeCommand('editor.action.insertLineAfter').then(()=> {
            const logText = `console.log(/*SL*/'${nodeName}:',${nodeName});`;
            const selection = editor.selection;

            editor.edit((editBuilder) => {
                editBuilder.replace(selection, logText);
            })
            res()
        })
    })
}
