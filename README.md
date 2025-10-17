# Richie-Mat Tools

My own personal Visual Studio Code extension for refactoring and utility functions related to my MAT (Medical Abstracting Tool) development environment.

## Features

This extension provides custom commands designed to streamline common refactoring tasks in MAT files.

### Refactor Call Subroutines

Quickly refactor legacy MAT subroutine calls to the modern format. This command performs the following transformations on selected text:

* **`@CallSub(SubName)`** is refactored to **`@@SubName()`**
* **`@CallExternalSub(File, SubName, Arguments)`** is refactored to **`@@SubName:Arguments()`**

## Requirements

This extension assumes a workspace setup for MAT development. It is primarily intended for use on files with the `.focus` extension, as configured in the context menus.

## Usage

This extension is designed to be used via the **Context Menu (right-click)** inside a file editor.

1.  Open any `.focus` file.
2.  Select the text you want to refactor (e.g., a block of code containing `@CallSub` or `@CallExternalSub`).
3.  Right-click on the selection.
4.  Navigate to the **Richie Tools** submenu (or whatever you named your custom menu).
5.  Click on the **Refactor Call Sub** command.

The selected text will be updated instantly with the refactored syntax.

## Installation

Since this is a personal tool, you install it manually using the VSIX file.

1.  Download the latest `richie-mat-x.x.x.vsix` file.
2.  Open VS Code.
3.  Go to the Extensions View (Ctrl+Shift+X).
4.  Click the **`...`** (More Actions) menu.
5.  Select **`Install from VSIX...`** and choose the downloaded file.

## Release Notes

### 0.0.1

Initial release of Richie-Mat Tools.
* Added `richie-mat.refactorCallSub` command for modernizing subroutine calls.

---

**Developed by:** Richie Palmer Jr.