import * as vscode from 'vscode';
import ToDoListProvider from './module/toDoListProvider';

export function activate(context: vscode.ExtensionContext) {
	 const toDoListProvider = new ToDoListProvider(context);
	 vscode.window.registerWebviewViewProvider('to-do-list',toDoListProvider);
	 
}
