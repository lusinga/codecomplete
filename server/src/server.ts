import {
	createConnection,
	TextDocuments,
	TextDocument,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	SymbolInformation,
	WorkspaceSymbolParams,
	WorkspaceEdit,
	WorkspaceFolder,
	DidChangeTextDocumentParams,
	DidChangeTextDocumentNotification,
	TextDocumentChangeEvent,
	WorkspaceFoldersChangeEvent,
	TextDocumentSyncKind
} from 'vscode-languageserver';
import { HandlerResult } from 'vscode-jsonrpc';
import { configure, getLogger } from "log4js";
configure({
	appenders: {
		lsp_demo: {
			type: "dateFile",
			filename: "c:\\temp\\lsp",
			pattern: "yyyy-MM-dd-hh.log",
			alwaysIncludePattern: true,
		},
	},
	categories: { default: { appenders: ["lsp_demo"], level: "debug" } }
});
const logger = getLogger("lsp_demo");

let connection = createConnection(ProposedFeatures.all);

let documents: TextDocuments = new TextDocuments();

connection.onInitialize((params: InitializeParams) => {
	let capabilities = params.capabilities;
	logger.debug('Root path:' + params.rootPath);
	logger.debug('Process id:' + params.processId);
	logger.debug('Root Uri:' + params.rootUri);
	/*
	let workspaceFolders = params.workspaceFolders;
	for(let workspaceFolder of workspaceFolders){
		logger.debug(`workspace folder name: ${workspaceFolder.name}, uri: ${workspaceFolder.uri}`);
	}*/
	logger.debug(`Trace setting:${params.trace}`);
	logger.debug(capabilities);

	return {
		capabilities: {
			textDocumentSync: {
				openClose: true,
				//change: TextDocumentSyncKind.Incremental
				change: TextDocumentSyncKind.Full
				//change: TextDocumentSyncKind.None
			},
			completionProvider: {
				resolveProvider: true
			}
		}
	};
});

connection.onInitialized(() => {
	logger.debug('onInitialized!');
	connection.window.showInformationMessage('Hello World! form server side');
});

connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		logger.debug('onCompletion');
		return [
			{
				label: 'TextView' + _textDocumentPosition.position.character,
				kind: CompletionItemKind.Text,
				data: 1
			},
			{
				label: 'Button' + _textDocumentPosition.position.line,
				kind: CompletionItemKind.Text,
				data: 2
			},
			{
				label: 'ListView',
				kind: CompletionItemKind.Text,
				data: 3
			}
		];
	}
);

connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		if (item.data === 1) {
			item.detail = 'TextView';
			item.documentation = 'TextView documentation';
		} else if (item.data === 2) {
			item.detail = 'Button';
			item.documentation = 'JavaScript documentation';
		} else if (item.data === 3) {
			item.detail = 'ListView';
			item.documentation = 'ListView documentation';
		}
		return item;
	}
);

connection.onDidChangeTextDocument(
	(params: DidChangeTextDocumentParams) => {
		let ver = params.textDocument;
		logger.debug(`did change text document version:${ver.uri},${ver.version}`)
	}
);

connection.onShutdown(() => {
	logger.debug('VSCode is shutting down');
});

connection.onExit(() => {
	logger.debug('VSCode client exited!');
	//mdn Object.prototype;
});

documents.onDidOpen(
	(event: TextDocumentChangeEvent) => {
		logger.debug(`on open:${event.document.uri}`);
		logger.debug(`file version:${event.document.version}`);
		logger.debug(`file content:${event.document.getText()}`);
		logger.debug(`language id:${event.document.languageId}`);
		logger.debug(`line count:${event.document.lineCount}`);
	}
);

documents.onDidChangeContent(
	(e: TextDocumentChangeEvent) => {
		logger.debug('document change received.');
		logger.debug(`document version:${e.document.version}`);
		logger.debug(`text:${e.document.getText()}`);
		logger.debug(`language id:${e.document.languageId}`);
		logger.debug(`line count:${e.document.lineCount}`);
	}
);

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event'+_change);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
