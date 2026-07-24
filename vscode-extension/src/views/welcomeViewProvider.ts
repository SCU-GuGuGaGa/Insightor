import * as vscode from 'vscode';

export class WelcomeViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'insightorWelcome';

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.command) {
                case 'fullReview':
                    vscode.commands.executeCommand('insightor.fullReview');
                    break;
                case 'reviewPR':
                    vscode.commands.executeCommand('insightor.reviewPR');
                    break;
                case 'describePR':
                    vscode.commands.executeCommand('insightor.describePR');
                    break;
                case 'risksPR':
                    vscode.commands.executeCommand('insightor.risksPR');
                    break;
                case 'publishReview':
                    vscode.commands.executeCommand('insightor.publishReview');
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('insightor.openSettings');
                    break;
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insightor Quick Actions</title>
    <style>
        body {
            padding: 0;
            margin: 0;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-sideBar-background);
        }

        .container {
            padding: 16px;
        }

        .header {
            margin-bottom: 20px;
        }

        .header h2 {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
        }

        .header p {
            margin: 0;
            font-size: 12px;
            opacity: 0.8;
            line-height: 1.4;
        }

        .section {
            margin-bottom: 24px;
        }

        .section-title {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            opacity: 0.6;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
        }

        .button {
            width: 100%;
            padding: 10px 14px;
            margin-bottom: 8px;
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 2px;
            cursor: pointer;
            font-size: 13px;
            font-weight: normal;
            text-align: left;
            display: flex;
            align-items: center;
            transition: all 0.15s;
        }

        .button:hover {
            background: var(--vscode-list-hoverBackground);
            border-color: var(--vscode-focusBorder);
        }

        .button:active {
            transform: translateY(1px);
        }

        .button-primary {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-color: transparent;
            padding: 12px 14px;
            font-weight: 500;
        }

        .button-primary:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .button-secondary {
            background: transparent;
            color: var(--vscode-foreground);
        }

        .button-secondary:hover {
            background: var(--vscode-list-hoverBackground);
        }

        .button-icon {
            margin-right: 10px;
            font-size: 16px;
            min-width: 18px;
        }

        .button-content {
            flex: 1;
            min-width: 0;
        }

        .button-title {
            font-weight: 500;
            margin-bottom: 2px;
        }

        .button-desc {
            font-size: 11px;
            opacity: 0.7;
            line-height: 1.3;
        }

        .divider {
            height: 1px;
            background: var(--vscode-panel-border);
            margin: 20px 0;
        }

        .quick-tip {
            padding: 12px;
            background: var(--vscode-textBlockQuote-background);
            border-left: 3px solid var(--vscode-textLink-foreground);
            border-radius: 4px;
            font-size: 12px;
            line-height: 1.5;
            margin-top: 20px;
        }

        .quick-tip strong {
            display: block;
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Insightor</h2>
            <p>AI-powered PR Review Tool</p>
        </div>

        <div class="section">
            <div class="section-title">主要功能</div>

            <button class="button button-primary" onclick="executeCommand('fullReview')">
                <span class="button-icon">▶</span>
                <div class="button-content">
                    <div class="button-title">Full Review</div>
                    <div class="button-desc">完整审查 - 描述、风险分析、代码审查</div>
                </div>
            </button>

            <button class="button button-secondary" onclick="executeCommand('reviewPR')">
                <span class="button-icon">✓</span>
                <div class="button-content">
                    <div class="button-title">Code Review</div>
                    <div class="button-desc">代码审查 - 检查代码质量问题</div>
                </div>
            </button>

            <button class="button button-secondary" onclick="executeCommand('describePR')">
                <span class="button-icon">≡</span>
                <div class="button-content">
                    <div class="button-title">Describe PR</div>
                    <div class="button-desc">生成 PR 描述和文件变更摘要</div>
                </div>
            </button>

            <button class="button button-secondary" onclick="executeCommand('risksPR')">
                <span class="button-icon">!</span>
                <div class="button-content">
                    <div class="button-title">Analyze Risks</div>
                    <div class="button-desc">分析安全、性能等潜在风险</div>
                </div>
            </button>
        </div>

        <div class="divider"></div>

        <div class="section">
            <div class="section-title">其他操作</div>

            <button class="button button-secondary" onclick="executeCommand('publishReview')">
                <span class="button-icon">↑</span>
                <div class="button-content">
                    <div class="button-title">Publish to GitHub</div>
                    <div class="button-desc">发布审查结果到 PR 评论</div>
                </div>
            </button>

            <button class="button button-secondary" onclick="executeCommand('openSettings')">
                <span class="button-icon">⚙</span>
                <div class="button-content">
                    <div class="button-title">Settings</div>
                    <div class="button-desc">配置 GitHub Token 和 API Key</div>
                </div>
            </button>
        </div>

        <div class="quick-tip">
            <strong>提示</strong>
            左下角状态栏的 "Insightor" 按钮可快速启动 Full Review
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function executeCommand(command) {
            vscode.postMessage({ command: command });
        }
    </script>
</body>
</html>`;
    }
}
