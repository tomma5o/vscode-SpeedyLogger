import { window } from 'vscode';

import DeleteLog from "./deleteLog";
import TypeCheck from "./insertLog";

export function activate(context) {
    if ( window.activeTextEditor.document) {
        let typeCheck = new TypeCheck();
        let deleteLog = new DeleteLog();
        
        context.subscriptions.push(typeCheck.insertLogStatement(context));
        context.subscriptions.push(deleteLog.deleteAllLogStatements());
    }
}
