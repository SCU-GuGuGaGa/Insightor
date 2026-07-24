import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { InsightorService, ReviewResult, Finding } from '../services/insightorService';
import { ReviewTreeProvider, TreeItem } from '../views/reviewTreeProvider';

export class CommandHandler {
    constructor(
        private context: vscode.ExtensionContext,
        private insightorService: InsightorService,
        private reviewTreeProvider: ReviewTreeProvider
    ) {}

    async reviewPR(): Promise<void> {
        const prUrl = await this.promptForPRUrl();
        if (!prUrl) {
            return;
        }

        const depth = await this.promptForDepth();
        if (!depth) {
            return;
        }

        const incremental = await vscode.window.showQuickPick(
            ['No', 'Yes'],
            { placeHolder: 'Use incremental mode?' }
        );

        await this.executeWithProgress(
            'Reviewing PR...',
            async () => {
                const result = await this.insightorService.reviewPR(
                    prUrl,
                    depth,
                    incremental === 'Yes'
                );
                this.handleResult(result, 'Review');

                // 询问是否打开 Webview 预览
                if (result) {
                    const action = await vscode.window.showInformationMessage(
                        '代码审查完成！',
                        '打开 Webview 预览'
                    );

                    if (action === '打开 Webview 预览') {
                        this.showReviewWebview(result, prUrl);
                    }
                }
            }
        );
    }

    async describePR(): Promise<void> {
        const prUrl = await this.promptForPRUrl();
        if (!prUrl) {
            return;
        }

        const depth = await this.promptForDepth();
        if (!depth) {
            return;
        }

        await this.executeWithProgress(
            'Describing PR...',
            async () => {
                const result = await this.insightorService.describePR(prUrl, depth);
                this.handleResult(result, 'Description');

                // 询问是否打开 Webview 预览
                if (result) {
                    const action = await vscode.window.showInformationMessage(
                        'PR 描述生成完成！',
                        '打开 Webview 预览'
                    );

                    if (action === '打开 Webview 预览') {
                        this.showReviewWebview(result, prUrl);
                    }
                }
            }
        );
    }

    async risksPR(): Promise<void> {
        const prUrl = await this.promptForPRUrl();
        if (!prUrl) {
            return;
        }

        const depth = await this.promptForDepth();
        if (!depth) {
            return;
        }

        const focus = await vscode.window.showQuickPick(
            ['None', 'security', 'performance', 'concurrency'],
            { placeHolder: 'Focus on specific category?' }
        );

        await this.executeWithProgress(
            'Analyzing risks...',
            async () => {
                const result = await this.insightorService.risksPR(
                    prUrl,
                    depth,
                    focus === 'None' ? undefined : focus
                );
                this.handleResult(result, 'Risk Analysis');

                // 询问是否打开 Webview 预览
                if (result) {
                    const action = await vscode.window.showInformationMessage(
                        '风险分析完成！',
                        '打开 Webview 预览'
                    );

                    if (action === '打开 Webview 预览') {
                        this.showReviewWebview(result, prUrl);
                    }
                }
            }
        );
    }

    async fullReview(): Promise<void> {
        const prUrl = await this.promptForPRUrl();
        if (!prUrl) {
            return;
        }

        const depth = await this.promptForDepth();
        if (!depth) {
            return;
        }

        const skipOptions = await vscode.window.showQuickPick(
            ['describe', 'risks', 'review'],
            {
                placeHolder: 'Skip any tools? (optional)',
                canPickMany: true
            }
        );

        await this.executeWithProgress(
            'Running full review...',
            async () => {
                const result = await this.insightorService.fullReview(
                    prUrl,
                    depth,
                    skipOptions
                );
                this.handleResult(result, 'Full Review');

                // Open the generated markdown file
                const prNum = this.extractPRNumber(prUrl);
                const mdPath = path.join(
                    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
                    `insightor-full-review-${prNum}.md`
                );

                if (fs.existsSync(mdPath)) {
                    const doc = await vscode.workspace.openTextDocument(mdPath);
                    await vscode.window.showTextDocument(doc, { preview: false });

                    // 显示成功消息，询问是否打开 Webview 预览
                    const action = await vscode.window.showInformationMessage(
                        '审查完成！Markdown 报告已生成。',
                        '打开 Webview 预览',
                        '仅查看 Markdown'
                    );

                    if (action === '打开 Webview 预览' && result) {
                        this.showReviewWebview(result, prUrl);
                    }
                }
            }
        );
    }

    async publishReview(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        // Find markdown files
        const files = fs.readdirSync(workspaceFolder.uri.fsPath)
            .filter(f => f.startsWith('insightor-') && f.endsWith('.md'));

        if (files.length === 0) {
            vscode.window.showErrorMessage('No Insightor review files found');
            return;
        }

        const selectedFile = await vscode.window.showQuickPick(files, {
            placeHolder: 'Select review file to publish'
        });

        if (!selectedFile) {
            return;
        }

        const dryRun = await vscode.window.showQuickPick(
            ['No - Publish to GitHub', 'Yes - Dry run (preview only)'],
            { placeHolder: 'Dry run mode?' }
        );

        if (!dryRun) {
            return;
        }

        const mdPath = path.join(workspaceFolder.uri.fsPath, selectedFile);

        await this.executeWithProgress(
            dryRun.startsWith('Yes') ? 'Running dry run...' : 'Publishing review...',
            async () => {
                await this.insightorService.publishReview(
                    mdPath,
                    dryRun.startsWith('Yes')
                );

                const message = dryRun.startsWith('Yes')
                    ? 'Dry run completed. Check output for preview.'
                    : 'Review published to GitHub successfully!';

                vscode.window.showInformationMessage(message);
                this.insightorService.showOutput();
            }
        );
    }

    async openSettings(): Promise<void> {
        vscode.commands.executeCommand('workbench.action.openSettings', 'insightor');
    }

    async viewFinding(item: TreeItem): Promise<void> {
        if (!item.data || item.contextValue !== 'finding') {
            return;
        }

        const finding = item.data as Finding;
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

        if (!workspaceFolder) {
            return;
        }

        const filePath = path.join(workspaceFolder.uri.fsPath, finding.location.path);

        if (!fs.existsSync(filePath)) {
            vscode.window.showWarningMessage(`File not found: ${finding.location.path}`);
            return;
        }

        const doc = await vscode.workspace.openTextDocument(filePath);
        const editor = await vscode.window.showTextDocument(doc);

        // Highlight the line
        const line = finding.location.range.start.line - 1; // VSCode uses 0-based indexing
        const range = new vscode.Range(line, 0, line, 999);
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

        // Show finding details in a webview panel
        this.showFindingDetails(finding);
    }

    async applyFix(item: TreeItem): Promise<void> {
        if (!item.data || item.contextValue !== 'finding') {
            return;
        }

        const finding = item.data as Finding;

        if (!finding.suggestion?.suggested_code) {
            vscode.window.showInformationMessage('No fix suggestion available for this finding');
            return;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }

        const filePath = path.join(workspaceFolder.uri.fsPath, finding.location.path);

        if (!fs.existsSync(filePath)) {
            vscode.window.showWarningMessage(`File not found: ${finding.location.path}`);
            return;
        }

        const doc = await vscode.workspace.openTextDocument(filePath);
        const editor = await vscode.window.showTextDocument(doc);

        const startLine = finding.location.range.start.line - 1;
        const endLine = finding.location.range.end.line - 1;
        const range = new vscode.Range(startLine, 0, endLine, 999);

        await editor.edit(editBuilder => {
            editBuilder.replace(range, finding.suggestion!.suggested_code!);
        });

        vscode.window.showInformationMessage('Fix applied successfully!');
    }

    private showFindingDetails(finding: Finding): void {
        const panel = vscode.window.createWebviewPanel(
            'insightorFinding',
            `Finding: ${finding.title}`,
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        panel.webview.html = this.getFindingDetailsHtml(finding);
    }

    private getFindingDetailsHtml(finding: Finding): string {
        const severityColor = {
            'critical': '#ff0000',
            'high': '#ff9900',
            'medium': '#3399ff',
            'low': '#cccccc',
            'info': '#00cc00'
        }[finding.severity] || '#cccccc';

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finding Details</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            border-bottom: 2px solid ${severityColor};
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .severity {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            background-color: ${severityColor};
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.85em;
        }
        .section {
            margin: 20px 0;
        }
        .section-title {
            font-weight: bold;
            font-size: 1.1em;
            margin-bottom: 8px;
            color: var(--vscode-textLink-foreground);
        }
        .code-block {
            background-color: var(--vscode-textCodeBlock-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 12px;
            margin: 8px 0;
            overflow-x: auto;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .location {
            font-family: monospace;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 6px;
            border-radius: 3px;
        }
        .confidence {
            font-weight: bold;
            color: var(--vscode-textLink-activeForeground);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${finding.title}</h1>
        <span class="severity">${finding.severity}</span>
        <span style="margin-left: 10px;">Category: ${finding.category}</span>
    </div>

    <div class="section">
        <div class="section-title">📍 Location</div>
        <span class="location">${finding.location.path}:${finding.location.range.start.line}</span>
    </div>

    <div class="section">
        <div class="section-title">📝 Description</div>
        <p>${finding.description}</p>
    </div>

    ${finding.confidence ? `
    <div class="section">
        <div class="section-title">🎯 Confidence</div>
        <span class="confidence">${(finding.confidence * 100).toFixed(0)}%</span>
    </div>
    ` : ''}

    ${finding.suggestion?.current_code ? `
    <div class="section">
        <div class="section-title">❌ Current Code</div>
        <div class="code-block">
            <pre>${this.escapeHtml(finding.suggestion.current_code)}</pre>
        </div>
    </div>
    ` : ''}

    ${finding.suggestion?.suggested_code ? `
    <div class="section">
        <div class="section-title">✅ Suggested Code</div>
        <div class="code-block">
            <pre>${this.escapeHtml(finding.suggestion.suggested_code)}</pre>
        </div>
    </div>
    ` : ''}
</body>
</html>
        `;
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    private async promptForPRUrl(): Promise<string | undefined> {
        return await vscode.window.showInputBox({
            prompt: 'Enter GitHub PR URL',
            placeHolder: 'https://github.com/owner/repo/pull/123',
            validateInput: (value) => {
                if (!value) {
                    return 'PR URL is required';
                }
                if (!value.includes('github.com') || !value.includes('/pull/')) {
                    return 'Invalid GitHub PR URL';
                }
                return null;
            }
        });
    }

    private async promptForDepth(): Promise<string | undefined> {
        const config = vscode.workspace.getConfiguration('insightor');
        const defaultDepth = config.get<string>('defaultDepth', 'standard');

        return await vscode.window.showQuickPick(
            ['quick', 'standard', 'deep'],
            {
                placeHolder: 'Select analysis depth',
                canPickMany: false
            }
        ) || defaultDepth;
    }

    private async executeWithProgress(
        title: string,
        task: () => Promise<void>
    ): Promise<void> {
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title,
                cancellable: false
            },
            async () => {
                try {
                    await task();
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    vscode.window.showErrorMessage(`Insightor error: ${errorMessage}`);
                    this.insightorService.showOutput();
                }
            }
        );
    }

    private handleResult(result: ReviewResult | null, operationType: string): void {
        if (!result) {
            vscode.window.showWarningMessage(`${operationType} completed but no result found`);
            return;
        }

        this.reviewTreeProvider.setResult(result);

        const config = vscode.workspace.getConfiguration('insightor');
        const showNotifications = config.get<boolean>('showNotifications', true);

        if (showNotifications) {
            const findingsCount = result.findings?.length || 0;
            const score = result.merge_readiness?.score;
            const scoreText = score !== undefined ? ` | Score: ${score}/100` : '';

            vscode.window.showInformationMessage(
                `${operationType} complete: ${findingsCount} findings${scoreText}`
            );
        }
    }

    private extractPRNumber(prUrl: string): string {
        const parts = prUrl.split('/');
        return parts[parts.length - 1];
    }

    /**
     * 显示审查结果的 Webview
     */
    private showReviewWebview(result: ReviewResult, prUrl: string): void {
        const panel = vscode.window.createWebviewPanel(
            'insightorReview',
            '📊 Insightor Review Report',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        panel.webview.html = this.getReviewWebviewHtml(result, prUrl);
    }

    /**
     * 生成审查报告的 HTML
     */
    private getReviewWebviewHtml(result: ReviewResult, prUrl: string): string {
        const score = result.merge_readiness?.score || 0;
        const scoreColor = score >= 80 ? '#00cc00' : score >= 50 ? '#ff9900' : '#ff0000';
        const scoreEmoji = score >= 80 ? '✅' : score >= 50 ? '⚠️' : '🔴';

        const criticalCount = result.findings.filter(f => f.severity === 'critical').length;
        const highCount = result.findings.filter(f => f.severity === 'high').length;
        const mediumCount = result.findings.filter(f => f.severity === 'medium').length;
        const lowCount = result.findings.filter(f => f.severity === 'low').length;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insightor Review Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            padding: 30px 20px;
            border-bottom: 2px solid var(--vscode-panel-border);
            margin-bottom: 30px;
        }

        .header h1 {
            margin: 0 0 10px 0;
            font-size: 2em;
        }

        .header .pr-url {
            color: var(--vscode-textLink-foreground);
            text-decoration: none;
            font-size: 0.9em;
        }

        .score-section {
            text-align: center;
            padding: 40px;
            background: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .score-circle {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: ${scoreColor};
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 3em;
            font-weight: bold;
            color: white;
            margin-bottom: 20px;
        }

        .score-status {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .score-assessment {
            color: var(--vscode-descriptionForeground);
            max-width: 600px;
            margin: 0 auto;
        }

        .summary-section {
            background: var(--vscode-editor-inactiveSelectionBackground);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .summary-section h2 {
            margin-top: 0;
            color: var(--vscode-textLink-foreground);
        }

        .findings-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }

        .finding-card {
            background: var(--vscode-editor-inactiveSelectionBackground);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid;
        }

        .finding-card.critical {
            border-color: #ff0000;
        }

        .finding-card.high {
            border-color: #ff9900;
        }

        .finding-card.medium {
            border-color: #3399ff;
        }

        .finding-card.low {
            border-color: #cccccc;
        }

        .finding-card .count {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .finding-card .label {
            text-transform: uppercase;
            font-size: 0.85em;
            opacity: 0.8;
        }

        .findings-section {
            margin-top: 30px;
        }

        .finding-item {
            background: var(--vscode-editor-inactiveSelectionBackground);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid;
        }

        .finding-item.critical {
            border-color: #ff0000;
        }

        .finding-item.high {
            border-color: #ff9900;
        }

        .finding-item.medium {
            border-color: #3399ff;
        }

        .finding-item.low {
            border-color: #cccccc;
        }

        .finding-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }

        .finding-title {
            font-size: 1.1em;
            font-weight: bold;
            flex: 1;
        }

        .finding-severity {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: bold;
            text-transform: uppercase;
        }

        .finding-severity.critical {
            background: #ff0000;
            color: white;
        }

        .finding-severity.high {
            background: #ff9900;
            color: white;
        }

        .finding-severity.medium {
            background: #3399ff;
            color: white;
        }

        .finding-severity.low {
            background: #cccccc;
            color: black;
        }

        .finding-location {
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            color: var(--vscode-textLink-foreground);
            margin-bottom: 10px;
        }

        .finding-description {
            margin-bottom: 15px;
            line-height: 1.6;
        }

        .code-block {
            background: var(--vscode-textCodeBlock-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 15px;
            margin: 10px 0;
            overflow-x: auto;
        }

        .code-block pre {
            margin: 0;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }

        .code-label {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 0.9em;
        }

        .file-walkthrough {
            margin-bottom: 30px;
        }

        .file-item {
            background: var(--vscode-editor-inactiveSelectionBackground);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
        }

        .file-path {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .file-summary {
            font-size: 0.9em;
            opacity: 0.9;
        }

        h2 {
            color: var(--vscode-textLink-foreground);
            border-bottom: 2px solid var(--vscode-panel-border);
            padding-bottom: 10px;
            margin-top: 40px;
        }

        .no-findings {
            text-align: center;
            padding: 40px;
            font-size: 1.2em;
            opacity: 0.7;
        }

        .footer {
            text-align: center;
            padding: 30px 20px;
            margin-top: 50px;
            border-top: 2px solid var(--vscode-panel-border);
            font-size: 0.9em;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Insightor PR Review Report</h1>
        <a href="${prUrl}" class="pr-url">${prUrl}</a>
    </div>

    ${result.merge_readiness ? `
    <div class="score-section">
        <div class="score-circle">${scoreEmoji}</div>
        <div class="score-status">${score}/100</div>
        <div class="score-assessment">${result.merge_readiness.recommendation || result.merge_readiness.summary || ''}</div>
    </div>
    ` : ''}

    ${result.summary ? `
    <div class="summary-section">
        <h2>📝 Summary</h2>
        <p><strong>Type:</strong> ${result.summary.pr_type || 'N/A'}</p>
        <p>${result.summary.overview || ''}</p>
    </div>
    ` : ''}

    <h2>📊 Findings Summary</h2>
    <div class="findings-summary">
        ${criticalCount > 0 ? `
        <div class="finding-card critical">
            <div class="count">🔴 ${criticalCount}</div>
            <div class="label">Critical</div>
        </div>
        ` : ''}
        ${highCount > 0 ? `
        <div class="finding-card high">
            <div class="count">🟡 ${highCount}</div>
            <div class="label">High</div>
        </div>
        ` : ''}
        ${mediumCount > 0 ? `
        <div class="finding-card medium">
            <div class="count">🔵 ${mediumCount}</div>
            <div class="label">Medium</div>
        </div>
        ` : ''}
        ${lowCount > 0 ? `
        <div class="finding-card low">
            <div class="count">⚪ ${lowCount}</div>
            <div class="label">Low</div>
        </div>
        ` : ''}
    </div>

    ${result.file_walkthrough && result.file_walkthrough.length > 0 ? `
    <div class="file-walkthrough">
        <h2>📁 Files Changed (${result.file_walkthrough.length})</h2>
        ${result.file_walkthrough.map(fw => `
        <div class="file-item">
            <div class="file-path">${fw.edit_type ? `[${fw.edit_type.toUpperCase()}]` : ''} ${fw.path}</div>
            <div class="file-summary">${fw.summary}</div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="findings-section">
        <h2>🐛 Detailed Findings</h2>
        ${result.findings.length > 0 ? result.findings.map(f => `
        <div class="finding-item ${f.severity}">
            <div class="finding-header">
                <div class="finding-title">${f.title}</div>
                <span class="finding-severity ${f.severity}">${f.severity}</span>
            </div>
            <div class="finding-location">📍 ${f.location.path}:${f.location.range.start.line}</div>
            <div class="finding-description">${f.description}</div>
            ${f.suggestion?.current_code ? `
            <div>
                <div class="code-label">❌ Current Code:</div>
                <div class="code-block"><pre>${this.escapeHtml(f.suggestion.current_code)}</pre></div>
            </div>
            ` : ''}
            ${f.suggestion?.suggested_code ? `
            <div>
                <div class="code-label">✅ Suggested Fix:</div>
                <div class="code-block"><pre>${this.escapeHtml(f.suggestion.suggested_code)}</pre></div>
            </div>
            ` : ''}
        </div>
        `).join('') : '<div class="no-findings">🎉 No issues found!</div>'}
    </div>

    <div class="footer">
        🤖 Generated by <a href="https://github.com/SCU-GuGuGaGa/Insightor">Insightor</a> - AI-powered PR Review
    </div>
</body>
</html>
        `;
    }
}
