import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { GitHubService } from './core/githubService';
import { LLMService } from './core/llmService';
import { AnalysisService, AnalysisDepth } from './core/analysisService';
import { ConfigService } from './core/configService';
import { MarkdownGenerator } from './core/markdownGenerator';
import { ReviewResult } from './insightorService';

/**
 * InsightorServiceV2 - 纯 TypeScript 实现，无需 Python CLI
 */
export class InsightorServiceV2 {
    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;
    private github?: GitHubService;
    private llm?: LLMService;
    private analysis?: AnalysisService;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.outputChannel = vscode.window.createOutputChannel('Insightor V2');
    }

    /**
     * 初始化服务（延迟加载）
     */
    private async initialize(): Promise<void> {
        if (this.github && this.llm && this.analysis) {
            return; // 已初始化
        }

        try {
            // 获取配置
            const config = ConfigService.getConfig();

            // 验证配置
            const validation = ConfigService.validateConfig(config);
            if (!validation.valid) {
                throw new Error(`配置错误:\n${validation.errors.join('\n')}`);
            }

            // 初始化服务
            this.github = new GitHubService(config.githubToken);
            this.llm = new LLMService({
                provider: config.llm.provider,
                apiKey: config.llm.apiKey,
                baseUrl: config.llm.baseUrl,
                model: config.llm.model
            });
            this.analysis = new AnalysisService(this.github, this.llm);

            this.outputChannel.appendLine('✅ Insightor V2 初始化成功');
            this.outputChannel.appendLine(`Provider: ${config.llm.provider}`);
            this.outputChannel.appendLine(`Model: ${config.llm.model || 'default'}`);
        } catch (error) {
            this.outputChannel.appendLine(`❌ 初始化失败: ${error}`);
            throw error;
        }
    }

    /**
     * 完整审查
     */
    async fullReview(prUrl: string, depth?: AnalysisDepth): Promise<ReviewResult | null> {
        try {
            await this.initialize();

            const analysisDepth = depth || this.getDefaultDepth();
            this.outputChannel.appendLine(`\n🚀 开始完整审查: ${prUrl}`);
            this.outputChannel.appendLine(`深度: ${analysisDepth}`);

            const result = await this.analysis!.fullReview(prUrl, analysisDepth);

            this.outputChannel.appendLine(`✅ 审查完成`);
            this.outputChannel.appendLine(`评分: ${result.merge_readiness?.score}/100`);
            this.outputChannel.appendLine(`发现: ${result.findings.length} 个问题`);

            // 生成 markdown 文件
            const mdPath = await this.saveMarkdownReport(result, prUrl);
            if (mdPath) {
                this.outputChannel.appendLine(`📄 Markdown 报告已生成: ${mdPath}`);
            }

            return result;
        } catch (error) {
            this.outputChannel.appendLine(`❌ 审查失败: ${error}`);
            throw error;
        }
    }

    /**
     * 代码审查
     */
    async reviewPR(prUrl: string, depth?: AnalysisDepth): Promise<ReviewResult | null> {
        try {
            await this.initialize();

            const analysisDepth = depth || this.getDefaultDepth();
            this.outputChannel.appendLine(`\n🔍 开始代码审查: ${prUrl}`);

            const { pr, files } = await this.github!.getFullPRData(prUrl);
            const findings = await this.analysis!.reviewCode(pr, files, analysisDepth);

            const result: ReviewResult = {
                meta: {
                    pr_url: prUrl,
                    analysis_depth: analysisDepth,
                    model: 'typescript-v2',
                    duration_ms: 0,
                    tokens_used: 0
                },
                findings
            };

            this.outputChannel.appendLine(`✅ 审查完成: ${findings.length} 个发现`);
            return result;
        } catch (error) {
            this.outputChannel.appendLine(`❌ 审查失败: ${error}`);
            throw error;
        }
    }

    /**
     * 生成 PR 描述
     */
    async describePR(prUrl: string, depth?: AnalysisDepth): Promise<ReviewResult | null> {
        try {
            await this.initialize();

            const analysisDepth = depth || this.getDefaultDepth();
            this.outputChannel.appendLine(`\n📝 生成 PR 描述: ${prUrl}`);

            const { pr, files } = await this.github!.getFullPRData(prUrl);
            const description = await this.analysis!.describePR(pr, files, analysisDepth);

            const result: ReviewResult = {
                meta: {
                    pr_url: prUrl,
                    analysis_depth: analysisDepth,
                    model: 'typescript-v2',
                    duration_ms: 0,
                    tokens_used: 0
                },
                summary: description.summary,
                file_walkthrough: description.file_walkthrough,
                findings: []
            };

            this.outputChannel.appendLine(`✅ 描述生成完成`);
            return result;
        } catch (error) {
            this.outputChannel.appendLine(`❌ 生成失败: ${error}`);
            throw error;
        }
    }

    /**
     * 分析风险
     */
    async risksPR(prUrl: string, depth?: AnalysisDepth): Promise<ReviewResult | null> {
        try {
            await this.initialize();

            const analysisDepth = depth || this.getDefaultDepth();
            this.outputChannel.appendLine(`\n⚠️ 分析风险: ${prUrl}`);

            const { pr, files } = await this.github!.getFullPRData(prUrl);
            const risks = await this.analysis!.analyzeRisks(pr, files, analysisDepth);

            const result: ReviewResult = {
                meta: {
                    pr_url: prUrl,
                    analysis_depth: analysisDepth,
                    model: 'typescript-v2',
                    duration_ms: 0,
                    tokens_used: 0
                },
                findings: risks
            };

            this.outputChannel.appendLine(`✅ 风险分析完成: ${risks.length} 个风险`);
            return result;
        } catch (error) {
            this.outputChannel.appendLine(`❌ 分析失败: ${error}`);
            throw error;
        }
    }

    /**
     * 发布审查
     */
    async publishReview(mdPath: string, dryRun: boolean = false): Promise<void> {
        try {
            await this.initialize();

            this.outputChannel.appendLine(`\n📤 发布审查: ${mdPath}`);
            this.outputChannel.appendLine(`Dry run: ${dryRun}`);

            // 读取 markdown 文件
            if (!fs.existsSync(mdPath)) {
                throw new Error(`文件不存在: ${mdPath}`);
            }

            const markdown = fs.readFileSync(mdPath, 'utf-8');

            // 从 markdown 中提取 PR URL
            const prUrlMatch = markdown.match(/PR URL.*?(https:\/\/github\.com\/[^\s\)]+)/);
            if (!prUrlMatch) {
                throw new Error('无法从 Markdown 中提取 PR URL');
            }
            const prUrl = prUrlMatch[1];

            this.outputChannel.appendLine(`提取到 PR URL: ${prUrl}`);

            // 解析 PR URL
            const { owner, repo, prNumber } = this.github!.parsePRUrl(prUrl);

            if (dryRun) {
                this.outputChannel.appendLine('\n=== DRY RUN 模式 ===');
                this.outputChannel.appendLine(`将发布到: ${owner}/${repo}#${prNumber}`);
                this.outputChannel.appendLine(`\n评论内容预览:\n`);
                this.outputChannel.appendLine('--- 开始 ---');
                this.outputChannel.appendLine(markdown);
                this.outputChannel.appendLine('--- 结束 ---');
                this.outputChannel.appendLine('\n✅ Dry run 完成（未实际发布）');
            } else {
                // 实际发布评论到 GitHub
                this.outputChannel.appendLine(`正在发布评论到 ${owner}/${repo}#${prNumber}...`);

                await this.github!.createComment(owner, repo, prNumber, markdown);

                this.outputChannel.appendLine('✅ 评论发布成功！');
            }
        } catch (error) {
            this.outputChannel.appendLine(`❌ 发布失败: ${error}`);
            throw error;
        }
    }

    /**
     * 检查配置是否完整
     */
    async checkConfiguration(): Promise<boolean> {
        try {
            const config = ConfigService.getConfig();
            const validation = ConfigService.validateConfig(config);

            if (!validation.valid) {
                this.outputChannel.appendLine('❌ 配置不完整:');
                validation.errors.forEach(err => this.outputChannel.appendLine(`  - ${err}`));
                return false;
            }

            this.outputChannel.appendLine('✅ 配置验证通过');
            return true;
        } catch (error) {
            this.outputChannel.appendLine(`❌ 配置检查失败: ${error}`);
            return false;
        }
    }

    /**
     * 获取默认深度
     */
    private getDefaultDepth(): AnalysisDepth {
        const config = vscode.workspace.getConfiguration('insightor');
        return config.get<AnalysisDepth>('defaultDepth', 'standard');
    }

    /**
     * 显示输出面板
     */
    showOutput() {
        this.outputChannel.show();
    }

    /**
     * 保存 markdown 报告
     */
    private async saveMarkdownReport(result: ReviewResult, prUrl: string): Promise<string | null> {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                this.outputChannel.appendLine('⚠️ 没有打开的工作区，无法保存 markdown 文件');
                return null;
            }

            // 从 PR URL 提取 PR 编号
            const prNumber = this.extractPRNumber(prUrl);
            const fileName = `insightor-full-review-${prNumber}.md`;
            const filePath = path.join(workspaceFolder.uri.fsPath, fileName);

            // 生成 markdown 内容
            const markdown = MarkdownGenerator.generateFullReview(result);

            // 保存文件
            fs.writeFileSync(filePath, markdown, 'utf-8');

            return filePath;
        } catch (error) {
            this.outputChannel.appendLine(`❌ 保存 markdown 失败: ${error}`);
            return null;
        }
    }

    /**
     * 从 PR URL 提取 PR 编号
     */
    private extractPRNumber(prUrl: string): string {
        const match = prUrl.match(/\/pull\/(\d+)/);
        return match ? match[1] : Date.now().toString();
    }
}
