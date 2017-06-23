/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const vscodeWrapper_1 = require("../controllers/vscodeWrapper");
const telemetry_1 = require("../models/telemetry");
const Utils = require("../models/utils");
const contracts_1 = require("../models/contracts");
const logger_1 = require("../models/logger");
const Constants = require("../constants/constants");
const server_1 = require("./server");
const serviceDownloadProvider_1 = require("./serviceDownloadProvider");
const decompressProvider_1 = require("./decompressProvider");
const httpClient_1 = require("./httpClient");
const extConfig_1 = require("../configurations/extConfig");
const platform_1 = require("../models/platform");
const serverStatus_1 = require("./serverStatus");
const statusView_1 = require("../views/statusView");
const LanguageServiceContracts = require("../models/contracts/languageService");
let vscode = require('vscode');
let opener = require('opener');
let _channel = undefined;
/**
 * Handle Language Service client errors
 * @class LanguageClientErrorHandler
 */
class LanguageClientErrorHandler {
    /**
     * Creates an instance of LanguageClientErrorHandler.
     * @memberOf LanguageClientErrorHandler
     */
    constructor() {
        if (!this.vscodeWrapper) {
            this.vscodeWrapper = new vscodeWrapper_1.default();
        }
    }
    /**
     * Show an error message prompt with a link to known issues wiki page
     * @memberOf LanguageClientErrorHandler
     */
    showOnErrorPrompt() {
        telemetry_1.default.sendTelemetryEvent('SqlToolsServiceCrash');
        this.vscodeWrapper.showErrorMessage(Constants.sqlToolsServiceCrashMessage, Constants.sqlToolsServiceCrashButton).then(action => {
            if (action && action === Constants.sqlToolsServiceCrashButton) {
                opener(Constants.sqlToolsServiceCrashLink);
            }
        });
    }
    /**
     * Callback for language service client error
     *
     * @param {Error} error
     * @param {Message} message
     * @param {number} count
     * @returns {ErrorAction}
     *
     * @memberOf LanguageClientErrorHandler
     */
    error(error, message, count) {
        this.showOnErrorPrompt();
        // we don't retry running the service since crashes leave the extension
        // in a bad, unrecovered state
        return vscode_languageclient_1.ErrorAction.Shutdown;
    }
    /**
     * Callback for language service client closed
     *
     * @returns {CloseAction}
     *
     * @memberOf LanguageClientErrorHandler
     */
    closed() {
        this.showOnErrorPrompt();
        // we don't retry running the service since crashes leave the extension
        // in a bad, unrecovered state
        return vscode_languageclient_1.CloseAction.DoNotRestart;
    }
}
// The Service Client class handles communication with the VS Code LanguageClient
class SqlToolsServiceClient {
    constructor(_server, _logger, _statusView) {
        this._server = _server;
        this._logger = _logger;
        this._statusView = _statusView;
        // VS Code Language Client
        this._client = undefined;
    }
    // getter method for the Language Client
    get client() {
        return this._client;
    }
    set client(client) {
        this._client = client;
    }
    // gets or creates the singleton SQL Tools service client instance
    static get instance() {
        if (this._instance === undefined) {
            let config = new extConfig_1.default();
            _channel = vscode_1.window.createOutputChannel(Constants.serviceInitializingOutputChannelName);
            let logger = new logger_1.Logger(text => _channel.append(text));
            let serverStatusView = new serverStatus_1.ServerStatusView();
            let httpClient = new httpClient_1.default();
            let decompressProvider = new decompressProvider_1.default();
            let downloadProvider = new serviceDownloadProvider_1.default(config, logger, serverStatusView, httpClient, decompressProvider);
            let serviceProvider = new server_1.default(downloadProvider, config, serverStatusView);
            let statusView = new statusView_1.default();
            this._instance = new SqlToolsServiceClient(serviceProvider, logger, statusView);
        }
        return this._instance;
    }
    // initialize the SQL Tools Service Client instance by launching
    // out-of-proc server through the LanguageClient
    initialize(context) {
        this._logger.appendLine(Constants.serviceInitializing);
        return platform_1.PlatformInformation.GetCurrent().then(platformInfo => {
            return this.initializeForPlatform(platformInfo, context);
        });
    }
    initializeForPlatform(platformInfo, context) {
        return new Promise((resolve, reject) => {
            this._logger.appendLine(Constants.commandsNotAvailableWhileInstallingTheService);
            this._logger.appendLine();
            this._logger.append(`Platform: ${platformInfo.toString()}`);
            if (!platformInfo.isValidRuntime()) {
                Utils.showErrorMsg(Constants.unsupportedPlatformErrorMessage);
                telemetry_1.default.sendTelemetryEvent('UnsupportedPlatform', { platform: platformInfo.toString() });
                reject('Invalid Platform');
            }
            else {
                if (platformInfo.runtimeId) {
                    this._logger.appendLine(` (${platformInfo.getRuntimeDisplayName()})`);
                }
                else {
                    this._logger.appendLine();
                }
                this._logger.appendLine();
                this._server.getServerPath(platformInfo.runtimeId).then(serverPath => {
                    if (serverPath === undefined) {
                        // Check if the service already installed and if not open the output channel to show the logs
                        if (_channel !== undefined) {
                            _channel.show();
                        }
                        this._server.downloadServerFiles(platformInfo.runtimeId).then(installedServerPath => {
                            this.initializeLanguageClient(installedServerPath, context);
                            resolve(new serverStatus_1.ServerInitializationResult(true, true, installedServerPath));
                        }).catch(downloadErr => {
                            reject(downloadErr);
                        });
                    }
                    else {
                        this.initializeLanguageClient(serverPath, context);
                        resolve(new serverStatus_1.ServerInitializationResult(false, true, serverPath));
                    }
                }).catch(err => {
                    Utils.logDebug(Constants.serviceLoadingFailed + ' ' + err);
                    Utils.showErrorMsg(Constants.serviceLoadingFailed);
                    telemetry_1.default.sendTelemetryEvent('ServiceInitializingFailed');
                    reject(err);
                });
            }
        });
    }
    /**
     * Initializes the SQL language configuration
     *
     * @memberOf SqlToolsServiceClient
     */
    initializeLanguageConfiguration() {
        vscode_1.languages.setLanguageConfiguration('sql', {
            comments: {
                lineComment: '--',
                blockComment: ['/*', '*/']
            },
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ],
            __characterPairSupport: {
                autoClosingPairs: [
                    { open: '{', close: '}' },
                    { open: '[', close: ']' },
                    { open: '(', close: ')' },
                    { open: '"', close: '"', notIn: ['string'] },
                    { open: '\'', close: '\'', notIn: ['string', 'comment'] }
                ]
            }
        });
    }
    initializeLanguageClient(serverPath, context) {
        if (serverPath === undefined) {
            Utils.logDebug(Constants.invalidServiceFilePath);
            throw new Error(Constants.invalidServiceFilePath);
        }
        else {
            let self = this;
            self.initializeLanguageConfiguration();
            let serverOptions = this.createServerOptions(serverPath);
            this.client = this.createLanguageClient(serverOptions);
            if (context !== undefined) {
                // Create the language client and start the client.
                let disposable = this.client.start();
                // Push the disposable to the context's subscriptions so that the
                // client can be deactivated on extension deactivation
                context.subscriptions.push(disposable);
            }
        }
    }
    createLanguageClient(serverOptions) {
        // Options to control the language client
        let clientOptions = {
            documentSelector: ['sql'],
            synchronize: {
                configurationSection: 'mssql'
            },
            errorHandler: new LanguageClientErrorHandler()
        };
        // cache the client instance for later use
        let client = new vscode_languageclient_1.LanguageClient(Constants.sqlToolsServiceName, serverOptions, clientOptions);
        client.onReady().then(() => {
            this.checkServiceCompatibility();
        });
        client.onNotification(LanguageServiceContracts.TelemetryNotification.type, this.handleLanguageServiceTelemetryNotification());
        client.onNotification(LanguageServiceContracts.StatusChangedNotification.type, this.handleLanguageServiceStatusNotification());
        return client;
    }
    handleLanguageServiceTelemetryNotification() {
        return (event) => {
            telemetry_1.default.sendTelemetryEvent(event.params.eventName, event.params.properties, event.params.measures);
        };
    }
    /**
     * Public for testing purposes only.
     */
    handleLanguageServiceStatusNotification() {
        return (event) => {
            this._statusView.languageServiceStatusChanged(event.ownerUri, event.status);
        };
    }
    createServerOptions(servicePath) {
        let serverArgs = [];
        let serverCommand = servicePath;
        if (servicePath.endsWith('.dll')) {
            serverArgs = [servicePath];
            serverCommand = 'dotnet';
        }
        // Get the extenion's configuration
        let config = vscode_1.workspace.getConfiguration(Constants.extensionConfigSectionName);
        if (config) {
            // Enable diagnostic logging in the service if it is configured
            let logDebugInfo = config[Constants.configLogDebugInfo];
            if (logDebugInfo) {
                serverArgs.push('--enable-logging');
            }
            // Send Locale for sqltoolsservice localization
            let applyLocalization = config[Constants.configApplyLocalization];
            if (applyLocalization) {
                let locale = vscode.env.language;
                serverArgs.push('--locale ' + locale);
            }
        }
        // run the service host using dotnet.exe from the path
        let serverOptions = { command: serverCommand, args: serverArgs, transport: vscode_languageclient_1.TransportKind.stdio };
        return serverOptions;
    }
    /**
     * Send a request to the service client
     * @param type The of the request to make
     * @param params The params to pass with the request
     * @returns A thenable object for when the request receives a response
     */
    sendRequest(type, params) {
        if (this.client !== undefined) {
            return this.client.sendRequest(type, params);
        }
    }
    /**
     * Send a notification to the service client
     * @param params The params to pass with the notification
     */
    sendNotification(type, params) {
        if (this.client !== undefined) {
            this.client.sendNotification(type, params);
        }
    }
    /**
     * Register a handler for a notification type
     * @param type The notification type to register the handler for
     * @param handler The handler to register
     */
    onNotification(type, handler) {
        if (this._client !== undefined) {
            return this.client.onNotification(type, handler);
        }
    }
    checkServiceCompatibility() {
        return new Promise((resolve, reject) => {
            this._client.sendRequest(contracts_1.VersionRequest.type, undefined).then((result) => {
                Utils.logDebug('sqlserverclient version: ' + result);
                if (result === undefined || !result.startsWith(Constants.serviceCompatibleVersion)) {
                    Utils.showErrorMsg(Constants.serviceNotCompatibleError);
                    Utils.logDebug(Constants.serviceNotCompatibleError);
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
}
// singleton instance
SqlToolsServiceClient._instance = undefined;
exports.default = SqlToolsServiceClient;

//# sourceMappingURL=serviceclient.js.map