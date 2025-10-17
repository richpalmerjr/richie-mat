// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "richie-mat" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const disposableHelloWorld = vscode.commands.registerCommand(
    "richie-mat.helloWorld",
    function () {
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from richie-mat!");
    }
  );

  const disposableRefactorCallSubs = vscode.commands.registerCommand(
    "richie-mat.refactorCallSub",
    function () {
      const editor = vscode.window.activeTextEditor;
      if (editor) {

        // Get the currently selected text.
        const selection = editor.selection;
        let selectedText = editor.document.getText(selection);

        // --- Perform the Transformations ---

        // 1. Replace all instances of @CallSub
        const callSubRegex = /@CallSub\((.*?)\)/g;
        selectedText = selectedText.replace(callSubRegex, "@@$1()");

        // 2. Replace all instances of @CallExternalSub
        const callExtRegex = /@CallExternalSub\(([^,]*),([^,]*),([^,]*)\)/g;
        selectedText = selectedText.replace(callExtRegex, "@@$2:$3()");

		// 3. Apply the edits to the editor
        editor.edit(editBuilder => {
                editBuilder.replace(selection, selectedText);
            });

		vscode.window.showInformationMessage("Refactoring complete!");

      }
    }
  );
  context.subscriptions.push(disposableHelloWorld);
  context.subscriptions.push(disposableRefactorCallSubs);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
