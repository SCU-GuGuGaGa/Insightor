import * as vscode from 'vscode';
import { InsightorService } from './services/insightorService';
import { InsightorServiceV2 } from './services/insightorServiceV2';
import { ReviewTreeProvider } from './views/reviewTreeProvider';
import { CommandHandler } from './commands/commandHandler';
import { ConfigService } from './services/core/configService';

let insightorService: InsightorService;
let insightorServiceV2: InsightorServiceV2;
let reviewTreeProvider: ReviewTreeProvider;
let commandHandler: CommandHandler;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    console.log('=== Insightor extension activation started ===');
    console.log('Extension context:', context.extensionPath);

    // 检查使用哪个实现
    const config = vscode.workspace.getConfiguration('insightor');
    const useNative = config.get<boolean>('useNativeImplementation', true);

    // Initialize services
    if (useNative) {
        console.log('Using native TypeScript implementation (V2)');
        insightorServiceV2 = new InsightorServiceV2(context);
        // V2 使用相同的接口，可以复用 CommandHandler
        insightorService = insightorServiceV2 as any;
    } else {
        console.log('Using Python CLI implementation (V1)');
        insightorService = new InsightorService(context);
    }

    reviewTreeProvider = new ReviewTreeProvider(context);
    commandHandler = new CommandHandler(context, insightorService, reviewTreeProvider);

    // Register tree view
    const treeView = vscode.window.createTreeView('insightorView', {
        treeDataProvider: reviewTreeProvider,
        showCollapseAll: true
    });
    context.subscriptions.push(treeView);

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(checklist) Insightor';
    statusBarItem.tooltip = '点击运行 Insightor Full Review';
    statusBarItem.command = 'insightor.fullReview';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register commands
    console.log('Registering commands...');
    context.subscriptions.push(
        vscode.commands.registerCommand('insightor.reviewPR', () => commandHandler.reviewPR()),
        vscode.commands.registerCommand('insightor.describePR', () => commandHandler.describePR()),
        vscode.commands.registerCommand('insightor.risksPR', () => commandHandler.risksPR()),
        vscode.commands.registerCommand('insightor.fullReview', () => commandHandler.fullReview()),
        vscode.commands.registerCommand('insightor.publishReview', () => commandHandler.publishReview()),
        vscode.commands.registerCommand('insightor.openSettings', () => commandHandler.openSettings()),
        vscode.commands.registerCommand('insightor.refreshView', () => reviewTreeProvider.refresh()),
        vscode.commands.registerCommand('insightor.viewFinding', (item) => commandHandler.viewFinding(item)),
        vscode.commands.registerCommand('insightor.applyFix', (item) => commandHandler.applyFix(item))
    );
    console.log('Commands registered successfully');

    // Check configuration
    if (useNative) {
        checkNativeConfiguration();
    } else {
        checkInsightorInstallation();
    }

    console.log('=== Insightor extension activation completed ===');
    const implType = useNative ? 'Native TypeScript' : 'Python CLI';
    vscode.window.showInformationMessage(`Insightor activated (${implType} mode)`);
}

async function checkNativeConfiguration() {
    try {
        const config = ConfigService.getConfig();
        const validation = ConfigService.validateConfig(config);

        if (!validation.valid) {
            const action = await vscode.window.showWarningMessage(
                'Insightor 配置不完整。请配置 GitHub Token 和 LLM API Key。',
                '打开设置', '查看帮助', '取消'
            );

            if (action === '打开设置') {
                ConfigService.openSettings();
            } else if (action === '查看帮助') {
                vscode.env.openExternal(vscode.Uri.parse(
                    'https://github.com/SCU-GuGuGaGa/Insightor/blob/main/INSTALLATION.md'
                ));
            }
        }
    } catch (error) {
        vscode.window.showErrorMessage(`配置检查失败: ${error}`);
    }
}

async function checkInsightorInstallation() {
    const isInstalled = await insightorService.checkInstallation();
    if (!isInstalled) {
        const action = await vscode.window.showWarningMessage(
            'Insightor CLI not found. 建议切换到 Native 模式（无需 Python）。',
            '切换到 Native 模式',
            '安装 Python CLI',
            '取消'
        );

        if (action === '切换到 Native 模式') {
            const config = vscode.workspace.getConfiguration('insightor');
            await config.update('useNativeImplementation', true, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('已切换到 Native 模式，请重新加载窗口', '重新加载')
                .then(choice => {
                    if (choice === '重新加载') {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
        } else if (action === '安装 Python CLI') {
            vscode.env.openExternal(vscode.Uri.parse(
                'https://github.com/SCU-GuGuGaGa/Insightor/blob/main/INSTALLATION.md'
            ));
        }
    }
}

export function deactivate() {
    console.log('Insightor extension is now deactivated');
}

