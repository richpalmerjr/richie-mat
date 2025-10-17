// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

let stringMap = {};
let stringPlaceholderIndex = 0;

//=================================
// RENAME VARIABLE FUNCTIONS
//=================================

// Simple check to see if a string is a variable (single letter A-Z)
function isVariable(str) {
  const myRegex = /^[A-Z]$/;
  return myRegex.test(str.trim());
}

// Corrected function to strip special characters and normalize the string
function storeSpecialCharacters(line) {
  const specialChars = [];
  const nonAlphaNumericButNotSpace = /([^\w\s])/g;
  let match;

  // Find all special characters just to populate the array (optional, but matching your structure)
  while ((match = nonAlphaNumericButNotSpace.exec(line)) !== null) {
    specialChars.push(match[0]);
  }

  // Replace all non-alphanumeric, non-whitespace characters with a space.
  const strippedString = line.replace(nonAlphaNumericButNotSpace, " ");

  // Replace multiple spaces with a single space and trim leading/trailing spaces
  const normalizedStrippedString = strippedString.replace(/\s+/g, " ").trim();

  return normalizedStrippedString;
}

function maskStrings(code) {
  // Regex to reliably find text between single OR double quotes.
  const quoteRegex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;

  // Reset state for a fresh run
  stringMap = {};
  stringPlaceholderIndex = 0;

  const maskedCode = code.replace(quoteRegex, (match) => {
    const placeholder = `__STRING_PLACEHOLDER_${stringPlaceholderIndex++}__`;
    stringMap[placeholder] = match;
    return placeholder;
  });

  return maskedCode;
}

/**
 * Restores original quoted strings from the placeholders.
 */
function unmaskStrings(code) {
  let finalCode = code;
  // Iterate through the map and replace placeholders
  for (const placeholder in stringMap) {
    // Use a global regex to replace all instances
    const placeholderRegex = new RegExp(
      placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "g"
    );
    finalCode = finalCode.replace(placeholderRegex, stringMap[placeholder]);
  }
  return finalCode;
}

// Prompts the user for a new name for each unique variable
async function promptForVariables(singleInputVariables) {
  const updatedValues = {};

  for (const variable of singleInputVariables) {
    const newName = await vscode.window.showInputBox({
      prompt: `Enter the new name for variable '${variable}'`,
      value: variable,
    });

    if (newName === undefined) {
      return null;
    }

    updatedValues[variable] = newName.trim();
  }

  return updatedValues;
}

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
    refactorCallSub
  );

  const disposableRenameVars = vscode.commands.registerCommand(
    "richie-mat.renameCodeVariables",
    renameVariables
  );

  context.subscriptions.push(disposableRenameVars);
  context.subscriptions.push(disposableHelloWorld);
  context.subscriptions.push(disposableRefactorCallSubs);
}

// This method is called when your extension is deactivated
function deactivate() {}

function refactorCallSub() {
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
    const callExtRegex = /@CallExternalSub\(([^,]*),([^,]*),([^\)]*)\)/g;
    selectedText = selectedText.replace(callExtRegex, "@@$2:$3()");

    // 3. Apply the edits to the editor
    editor.edit((editBuilder) => {
      editBuilder.replace(selection, selectedText);
    });

    vscode.window.showInformationMessage("Refactoring complete!");
  }
}

async function renameVariables() {
    const vscode = require('vscode');
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    let codeInput = editor.document.getText(selection);
    let singleInputVariables = []; 

    if (!codeInput) {
        return vscode.window.showInformationMessage('Please select code to rename variables');
    }
    
    // 1. MASK STRINGS
    let maskedCodeInput = maskStrings(codeInput); 

    // --- 2. Variable Discovery ---
    const linesOfCode = maskedCodeInput.split('\n');
    const commentRegex = /^\s*\/\//;
    
    for (let line of linesOfCode) {
        if (commentRegex.test(line)) {
            continue; 
        }

        const  strippedString = storeSpecialCharacters(line); 
        const splitStrippedString = (strippedString).split(' ');

        for (let word of splitStrippedString) {
            if (isVariable(word) && !singleInputVariables.includes(word)) {
                singleInputVariables.push(word);
            }
        }
    }

    if (singleInputVariables.length === 0) {
        return vscode.window.showInformationMessage('No single letter variables found in selected code');
    }
    
    // --- 3. Get User Input (Prompts) ---
    const updatedValues = await promptForVariables(singleInputVariables);
    
    if (!updatedValues) {
        return vscode.window.showInformationMessage('Variable renaming cancelled');
    }
    
    // --- 4. Apply Renaming Transformation ---
    let finalCodeOutput = maskedCodeInput; 
    let newVariableNames = []; // Array to hold the NEW variable names

    for (const oldVar in updatedValues) {
        const newVar = updatedValues[oldVar];
        
        // Add the new variable name to our list
        newVariableNames.push(newVar);

        // Perform the renaming on the masked code
        const variableRegex = new RegExp(`\\b${oldVar}\\b`, 'g');
        finalCodeOutput = finalCodeOutput.replace(variableRegex, newVar);
    }

    // --- 5. Generate and Insert the 'var:' Line (NEW LOGIC) ---
    
    // Sort the new variable names alphabetically for clean output
    newVariableNames.sort();
    
    // Create the 'var: VAR1 VAR2 ...' line
    const varLine = "var: " + newVariableNames.join(" ");
    
    // Find the end of the leading comments/documentation block for insertion
    const lines = finalCodeOutput.split('\n');
    let insertionIndex = -1;

    // Find the first line that is NOT a comment and NOT empty.
    for (let i = 0; i < lines.length; i++) {
        if (!commentRegex.test(lines[i]) && lines[i].trim() !== '') {
            insertionIndex = i;
            break;
        }
    }

    // If the insertion point is found (i.e., not an empty selection), insert the line
    if (insertionIndex !== -1) {
        lines.splice(insertionIndex, 0, varLine); // Insert varLine and an empty line after it
        finalCodeOutput = lines.join('\n');
    }
    
    // --- 6. UNMASK STRINGS ---
    finalCodeOutput = unmaskStrings(finalCodeOutput); 

    // --- 7. Apply Edits to Editor ---
    editor.edit(editBuilder => {
        editBuilder.replace(selection, finalCodeOutput);
    });

    vscode.window.showInformationMessage(`Renamed ${newVariableNames.length} variables!`);
}

module.exports = {
  activate,
  deactivate,
};
