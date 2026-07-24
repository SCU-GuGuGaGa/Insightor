import { GitHubService, PRData, PRFile } from './githubService';
import { LLMService } from './llmService';
import { ReviewResult, Finding, FileWalkthrough } from '../insightorService';

export type AnalysisDepth = 'quick' | 'standard' | 'deep';

export class AnalysisService {
    constructor(
        private github: GitHubService,
        private llm: LLMService
    ) {}

    /**
     * 完整审查（描述 + 风险 + 审查）
     */
    async fullReview(prUrl: string, depth: AnalysisDepth = 'standard'): Promise<ReviewResult> {
        const startTime = Date.now();

        // 获取 PR 数据
        const { pr, files, commits } = await this.github.getFullPRData(prUrl);

        // 并行执行分析
        const [description, risks, codeReview] = await Promise.all([
            this.describePR(pr, files, depth),
            this.analyzeRisks(pr, files, depth),
            this.reviewCode(pr, files, depth)
        ]);

        // 合并结果
        const findings = [...risks, ...codeReview];
        const score = this.calculateMergeReadiness(findings);

        return {
            meta: {
                pr_url: prUrl,
                analysis_depth: depth,
                model: 'typescript-native',
                duration_ms: Date.now() - startTime,
                tokens_used: 0 // TODO: 累加实际使用的 tokens
            },
            summary: description.summary,
            findings,
            merge_readiness: {
                score,
                recommendation: score >= 80 ? 'LGTM' : score >= 50 ? 'NEEDS_WORK' : 'DO_NOT_MERGE',
                summary: this.generateScoreSummary(score, findings)
            },
            file_walkthrough: description.file_walkthrough
        };
    }

    /**
     * 生成 PR 描述
     */
    async describePR(pr: PRData, files: PRFile[], depth: AnalysisDepth): Promise<{
        summary: { pr_type: string; overview: string };
        file_walkthrough: FileWalkthrough[];
    }> {
        const prompt = this.buildDescribePrompt(pr, files, depth);
        const response = await this.llm.analyze(prompt, this.getSystemPrompt('describe'));

        // 解析 LLM 响应
        return this.parseDescribeResponse(response.content, files);
    }

    /**
     * 分析风险
     */
    async analyzeRisks(pr: PRData, files: PRFile[], depth: AnalysisDepth): Promise<Finding[]> {
        const prompt = this.buildRisksPrompt(pr, files, depth);
        const response = await this.llm.analyze(prompt, this.getSystemPrompt('risks'));

        // 解析 LLM 响应
        return this.parseFindings(response.content, 'risk');
    }

    /**
     * 代码审查
     */
    async reviewCode(pr: PRData, files: PRFile[], depth: AnalysisDepth): Promise<Finding[]> {
        const prompt = this.buildReviewPrompt(pr, files, depth);
        const response = await this.llm.analyze(prompt, this.getSystemPrompt('review'));

        // 解析 LLM 响应
        return this.parseFindings(response.content, 'review');
    }

    /**
     * 构建描述提示词
     */
    private buildDescribePrompt(pr: PRData, files: PRFile[], depth: AnalysisDepth): string {
        const filesSummary = files.map(f =>
            `- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`
        ).join('\n');

        return `分析以下 GitHub Pull Request，生成描述：

## PR 信息
- 标题: ${pr.title}
- 作者: ${pr.user.login}
- 分支: ${pr.head.ref} → ${pr.base.ref}
- 描述: ${pr.body || '（无描述）'}

## 文件变更 (${files.length} 个文件)
${filesSummary}

${depth === 'deep' ? '\n## 详细 Diff\n' + this.buildDiffContext(files) : ''}

请以 JSON 格式返回：
{
  "pr_type": "feature | bugfix | refactor | docs | ...",
  "overview": "简短概述（2-3 句话）",
  "file_walkthrough": [
    { "path": "文件路径", "edit_type": "added | modified | removed", "summary": "变更说明" }
  ]
}`;
    }

    /**
     * 构建风险分析提示词
     */
    private buildRisksPrompt(pr: PRData, files: PRFile[], depth: AnalysisDepth): string {
        const filesSummary = files.map(f =>
            `- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`
        ).join('\n');

        return `分析以下 PR 的潜在风险：

## PR 信息
- 标题: ${pr.title}
- 文件变更: ${files.length} 个文件

## 文件列表
${filesSummary}

${depth !== 'quick' ? '\n## 代码变更\n' + this.buildDiffContext(files) : ''}

请关注以下风险类别：
1. **安全风险**: SQL 注入、XSS、认证问题、敏感数据泄露
2. **性能风险**: N+1 查询、死循环、内存泄漏、阻塞操作
3. **并发风险**: 竞态条件、死锁、线程安全
4. **稳定性风险**: 错误处理缺失、空指针、边界条件

以 JSON 格式返回发现的风险：
[
  {
    "title": "风险标题",
    "description": "详细描述",
    "severity": "critical | high | medium | low",
    "category": "security | performance | concurrency | stability",
    "location": {
      "path": "文件路径",
      "line": 行号
    },
    "suggestion": "修复建议"
  }
]`;
    }

    /**
     * 构建代码审查提示词
     */
    private buildReviewPrompt(pr: PRData, files: PRFile[], depth: AnalysisDepth): string {
        const diffContext = this.buildDiffContext(files);

        return `审查以下 PR 的代码质量：

## PR 信息
- 标题: ${pr.title}
- 文件变更: ${files.length} 个文件

## 代码变更
${diffContext}

请审查以下方面：
1. **代码质量**: 可读性、命名、注释、复杂度
2. **最佳实践**: 设计模式、架构、错误处理
3. **测试**: 单元测试、边界测试、覆盖率
4. **文档**: README、API 文档、注释

以 JSON 格式返回审查发现：
[
  {
    "title": "发现标题",
    "description": "详细说明",
    "severity": "high | medium | low | info",
    "category": "code-quality | best-practice | testing | documentation",
    "location": {
      "path": "文件路径",
      "line": 行号
    },
    "suggestion": {
      "current_code": "当前代码",
      "suggested_code": "建议代码"
    }
  }
]`;
    }

    /**
     * 构建 Diff 上下文（根据深度限制）
     */
    private buildDiffContext(files: PRFile[]): string {
        const maxFiles = 20; // 最多处理 20 个文件
        const limitedFiles = files.slice(0, maxFiles);

        return limitedFiles.map(file => {
            if (!file.patch) {
                return `### ${file.filename} (${file.status})\n无可用的 diff 数据`;
            }

            // 限制 patch 大小
            const lines = file.patch.split('\n');
            const maxLines = 100;
            const limitedPatch = lines.length > maxLines
                ? lines.slice(0, maxLines).join('\n') + '\n... (省略剩余 ' + (lines.length - maxLines) + ' 行)'
                : file.patch;

            return `### ${file.filename} (${file.status}, +${file.additions}/-${file.deletions})
\`\`\`diff
${limitedPatch}
\`\`\``;
        }).join('\n\n');
    }

    /**
     * 获取系统提示词
     */
    private getSystemPrompt(type: 'describe' | 'risks' | 'review'): string {
        const basePrompt = `你是一个专业的代码审查助手，负责分析 GitHub Pull Request。请以专业、建设性的方式提供反馈。`;

        switch (type) {
            case 'describe':
                return `${basePrompt}\n\n你的任务是生成 PR 描述，包括 PR 类型、概述和文件走览。`;
            case 'risks':
                return `${basePrompt}\n\n你的任务是识别潜在风险，包括安全、性能、并发和稳定性问题。`;
            case 'review':
                return `${basePrompt}\n\n你的任务是审查代码质量，包括可读性、最佳实践、测试和文档。`;
        }
    }

    /**
     * 解析描述响应
     */
    private parseDescribeResponse(content: string, files: PRFile[]): {
        summary: { pr_type: string; overview: string };
        file_walkthrough: FileWalkthrough[];
    } {
        try {
            // 尝试提取 JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    summary: {
                        pr_type: parsed.pr_type || 'unknown',
                        overview: parsed.overview || '无法生成概述'
                    },
                    file_walkthrough: parsed.file_walkthrough || []
                };
            }
        } catch (error) {
            // JSON 解析失败，使用默认值
        }

        // 回退：基于文件生成简单描述
        return {
            summary: {
                pr_type: 'unknown',
                overview: `此 PR 修改了 ${files.length} 个文件`
            },
            file_walkthrough: files.map(f => ({
                path: f.filename,
                edit_type: f.status,
                summary: `${f.status} (+${f.additions}/-${f.deletions})`
            }))
        };
    }

    /**
     * 解析发现
     */
    private parseFindings(content: string, category: string): Finding[] {
        try {
            // 尝试提取 JSON 数组
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.map((item: any, index: number) => ({
                    id: `${category}-${index + 1}`,
                    title: item.title || '未命名发现',
                    description: item.description || '',
                    severity: item.severity || 'info',
                    category: item.category || category,
                    location: {
                        path: item.location?.path || 'unknown',
                        range: {
                            start: { line: item.location?.line || 0, column: 0 },
                            end: { line: item.location?.line || 0, column: 0 }
                        }
                    },
                    suggestion: item.suggestion
                }));
            }
        } catch (error) {
            // JSON 解析失败
        }

        return [];
    }

    /**
     * 计算合并就绪评分
     */
    private calculateMergeReadiness(findings: Finding[]): number {
        let score = 100;

        for (const finding of findings) {
            switch (finding.severity) {
                case 'critical':
                    score -= 20;
                    break;
                case 'high':
                    score -= 10;
                    break;
                case 'medium':
                    score -= 5;
                    break;
                case 'low':
                    score -= 2;
                    break;
            }
        }

        return Math.max(0, score);
    }

    /**
     * 生成评分总结
     */
    private generateScoreSummary(score: number, findings: Finding[]): string {
        const critical = findings.filter(f => f.severity === 'critical').length;
        const high = findings.filter(f => f.severity === 'high').length;
        const medium = findings.filter(f => f.severity === 'medium').length;

        if (score >= 80) {
            return `代码质量良好，建议合并。发现 ${findings.length} 个问题需要关注。`;
        } else if (score >= 50) {
            return `发现 ${critical} 个严重问题和 ${high} 个高优先级问题，建议修复后再合并。`;
        } else {
            return `发现重大问题（${critical} 个严重，${high} 个高优先级），不建议合并。`;
        }
    }
}
