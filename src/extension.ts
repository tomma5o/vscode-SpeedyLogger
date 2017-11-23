import { window } from 'vscode';

import DeleteLog from "./deleteLog";
import InsertLog from "./insertLog";

export function activate(context) {
    if ( window.activeTextEditor.document) {
        let insertLog = new InsertLog();
        let deleteLog = new DeleteLog();

        context.subscriptions.push(insertLog.insertLogStatement(context));
        context.subscriptions.push(deleteLog.deleteAllLogStatements());
    }
}
