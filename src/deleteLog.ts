import { window, commands, Range, Position, Disposable, ExtensionContext, TextDocument, WorkspaceEdit, workspace, TextEditor } from 'vscode';

export default class DeleteLog {
    
    editor = window.activeTextEditor;

    private getAllLogStatements(document, documentText) {
        let logStatements = [];
    
        const logRegex = /console.(log|warn|error|)\(?\/\*SL\*\/(.*)\);?/g;
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
            window.showInformationMessage(`${logs.length} console.log deleted`);
        });
    }

    public deleteAllLogStatements() {
        commands.registerCommand('extension.deleteAllLogStatements', () => {
            if (!this.editor) { return; }

            const document = this.editor.document;
            const documentText = this.editor.document.getText();

            let workspaceEdit = new WorkspaceEdit();

            const logStatements = this.getAllLogStatements(document, documentText);

            this.deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);
        });
    };
};