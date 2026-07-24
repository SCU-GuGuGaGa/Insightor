import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LLMProvider } from './llmService';

export interface InsightorConfig {
    githubToken: string;
    llm: {
        provider: LLMProvider;
        apiKey: string;
        baseUrl?: string;
        model?: string;
    };
    defaultDepth: 'quick' | 'standard' | 'deep';
}

export class ConfigService {
    /**
     * 获取完整配置
     * 优先级：VSCode 设置 > 环境变量 > .env 文件
     */
    static getConfig(): InsightorConfig {
        const workspaceConfig = vscode.workspace.getConfiguration('insightor');

        // 读取 GitHub Token
        const githubToken = this.getGitHubToken(workspaceConfig);

        // 读取 LLM 配置
        const llmProvider = this.getLLMProvider(workspaceConfig);
        const apiKey = this.getAPIKey(workspaceConfig, llmProvider);
        const baseUrl = this.getBaseUrl(workspaceConfig, llmProvider);
        const model = workspaceConfig.get<string>('llm.model') || undefined;

        // 读取默认深度
        const defaultDepth = workspaceConfig.get<'quick' | 'standard' | 'deep'>('defaultDepth', 'standard');

        return {
            githubToken,
            llm: {
                provider: llmProvider,
                apiKey,
                baseUrl,
                model
            },
            defaultDepth
        };
    }

    /**
     * 获取 GitHub Token
     */
    private static getGitHubToken(config: vscode.WorkspaceConfiguration): string {
        // 1. 从 VSCode 设置读取
        let token = config.get<string>('githubToken');
        if (token) {
            return token;
        }

        // 2. 从环境变量读取
        token = process.env.GITHUB_TOKEN;
        if (token) {
            return token;
        }

        // 3. 从 .env 文件读取
        const envToken = this.readFromDotEnv('GITHUB_TOKEN');
        if (envToken) {
            return envToken;
        }

        throw new Error('GitHub Token not configured. Please set insightor.githubToken in settings.');
    }

    /**
     * 获取 LLM Provider
     */
    private static getLLMProvider(config: vscode.WorkspaceConfiguration): LLMProvider {
        const provider = config.get<string>('llm.provider');

        if (provider === 'openai' || provider === 'anthropic' || provider === 'deepseek') {
            return provider;
        }

        // 自动检测：根据哪个 API Key 可用
        if (process.env.DEEPSEEK_API_KEY || this.readFromDotEnv('DEEPSEEK_API_KEY')) {
            return 'deepseek';
        }
        if (process.env.OPENAI_API_KEY || this.readFromDotEnv('OPENAI_API_KEY')) {
            return 'openai';
        }
        if (process.env.ANTHROPIC_API_KEY || this.readFromDotEnv('ANTHROPIC_API_KEY')) {
            return 'anthropic';
        }

        // 默认 deepseek
        return 'deepseek';
    }

    /**
     * 获取 API Key
     */
    private static getAPIKey(config: vscode.WorkspaceConfiguration, provider: LLMProvider): string {
        // 1. 从 VSCode 设置读取
        let apiKey = config.get<string>('llm.apiKey');
        if (apiKey) {
            return apiKey;
        }

        // 2. 从环境变量读取（根据 provider）
        const envVarName = this.getProviderEnvVarName(provider);
        apiKey = process.env[envVarName];
        if (apiKey) {
            return apiKey;
        }

        // 3. 从 .env 文件读取
        apiKey = this.readFromDotEnv(envVarName);
        if (apiKey) {
            return apiKey;
        }

        throw new Error(`${provider.toUpperCase()} API Key not configured. Please set insightor.llm.apiKey in settings.`);
    }

    /**
     * 获取 Base URL
     */
    private static getBaseUrl(config: vscode.WorkspaceConfiguration, provider: LLMProvider): string | undefined {
        // 1. 从 VSCode 设置读取
        let baseUrl = config.get<string>('llm.baseUrl');
        if (baseUrl) {
            return baseUrl;
        }

        // 2. 从环境变量读取
        const envVarName = this.getProviderBaseUrlEnvVarName(provider);
        baseUrl = process.env[envVarName];
        if (baseUrl) {
            return baseUrl;
        }

        // 3. 从 .env 文件读取
        baseUrl = this.readFromDotEnv(envVarName);
        if (baseUrl) {
            return baseUrl;
        }

        return undefined;
    }

    /**
     * 获取 Provider 对应的环境变量名
     */
    private static getProviderEnvVarName(provider: LLMProvider): string {
        switch (provider) {
            case 'openai':
                return 'OPENAI_API_KEY';
            case 'anthropic':
                return 'ANTHROPIC_API_KEY';
            case 'deepseek':
                return 'DEEPSEEK_API_KEY';
        }
    }

    /**
     * 获取 Provider 对应的 Base URL 环境变量名
     */
    private static getProviderBaseUrlEnvVarName(provider: LLMProvider): string {
        switch (provider) {
            case 'openai':
                return 'OPENAI_API_BASE';
            case 'anthropic':
                return 'ANTHROPIC_BASE_URL';
            case 'deepseek':
                return 'DEEPSEEK_API_BASE';
        }
    }

    /**
     * 从 .env 文件读取配置
     */
    private static readFromDotEnv(key: string): string | undefined {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                return undefined;
            }

            const envPath = path.join(workspaceFolder.uri.fsPath, '.env');
            if (!fs.existsSync(envPath)) {
                return undefined;
            }

            const envContent = fs.readFileSync(envPath, 'utf-8');
            const lines = envContent.split('\n');

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || !trimmed.includes('=')) {
                    continue;
                }

                const [envKey, ...valueParts] = trimmed.split('=');
                if (envKey.trim() === key) {
                    const value = valueParts.join('=').trim();
                    // 移除引号
                    return value.replace(/^["']|["']$/g, '');
                }
            }

            return undefined;
        } catch (error) {
            return undefined;
        }
    }

    /**
     * 验证配置是否完整
     */
    static validateConfig(config: InsightorConfig): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!config.githubToken) {
            errors.push('GitHub Token is required');
        }

        if (!config.llm.apiKey) {
            errors.push(`${config.llm.provider.toUpperCase()} API Key is required`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 打开配置设置页面
     */
    static openSettings() {
        vscode.commands.executeCommand('workbench.action.openSettings', 'insightor');
    }

    /**
     * 显示配置向导
     */
    static async showConfigWizard(): Promise<boolean> {
        const result = await vscode.window.showInformationMessage(
            'Insightor 需要配置 GitHub Token 和 LLM API Key',
            '打开设置', '查看帮助文档', '取消'
        );

        if (result === '打开设置') {
            this.openSettings();
            return false;
        } else if (result === '查看帮助文档') {
            vscode.env.openExternal(vscode.Uri.parse(
                'https://github.com/SCU-GuGuGaGa/Insightor/blob/main/INSTALLATION.md'
            ));
            return false;
        }

        return false;
    }
}
