import { window, commands, Range, Position, Disposable, ExtensionContext, TextDocument, WorkspaceEdit, workspace } from 'vscode';

class SpeedyLogger {

    private insertText(val) {
        const editor = window.activeTextEditor;
    
        if (!editor) {
            window.showErrorMessage('Can\'t insert log because no document is open');
            return;
        }
    
        const selection = editor.selection;
    
        const range = new Range(selection.start, selection.end);
    
        editor.edit((editBuilder) => {
            editBuilder.replace(range, val);
        });
    };

    public insertLogStatement(context) {
        commands.registerCommand('extension.insertLogStatement', () => {
            const editor = window.activeTextEditor;
            if (!editor) { return; }
            
            const currentLine = editor.selection.active;
            const line = editor.document.lineAt(currentLine).text;

            const text = line.replace(/(var|let|const).([\w]*)(.*)/g, "$2");
            
            text
            ? commands.executeCommand('editor.action.insertLineAfter')
                .then((e) => {
                    const logToInsert = `console.log('${text}: ', ${text});`;
                    this.insertText(logToInsert);
                })
            : this.insertText('console.log();');
        });
    };

    private getAllLogStatements(document, documentText) {
        let logStatements = [];
    
        const logRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
        let match;
        while (match = logRegex.exec(documentText)) {
            let matchRange =
                new Range(
                    document.positionAt(match.index),
                    document.positionAt(match.index + match[0].length)
                );
            if (!matchRange.isEmpty)
                logStatements.push(matchRange);
        }
        return logStatements;
    }
    
    private deleteFoundLogStatements(workspaceEdit, docUri, logs) {
        logs.forEach((log) => {
            workspaceEdit.delete(docUri, log);
        });
    
        workspace.applyEdit(workspaceEdit).then(() => {
            logs.length > 1
                ? window.showInformationMessage(`${logs.length} console.logs deleted`)
                : window.showInformationMessage(`${logs.length} console.log deleted`);
        });
    }

    public deleteAllLogStatements(context) {
        commands.registerCommand('extension.deleteAllLogStatements', () => {
            const editor = window.activeTextEditor;
            if (!editor) { return; }

            const document = editor.document;
            const documentText = editor.document.getText();

            let workspaceEdit = new WorkspaceEdit();

            const logStatements = this.getAllLogStatements(document, documentText);

            this.deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);
        });
    };
};

export function activate(context) {
    let speedyLogger = new SpeedyLogger();

    context.subscriptions.push(speedyLogger.insertLogStatement(context));
    context.subscriptions.push(speedyLogger.deleteAllLogStatements(context));
}