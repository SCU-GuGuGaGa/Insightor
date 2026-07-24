import { ReviewResult, Finding, FileWalkthrough } from '../insightorService';

/**
 * Markdown 生成器 - 将审查结果转换为 markdown 格式
 */
export class MarkdownGenerator {
    /**
     * 生成完整的审查报告 markdown
     */
    static generateFullReview(result: ReviewResult): string {
        const sections: string[] = [];

        // 标题
        sections.push('# 🔍 Insightor PR Review Report\n');

        // 元信息
        if (result.meta) {
            sections.push(this.generateMeta(result.meta));
        }

        // Merge Readiness
        if (result.merge_readiness) {
            sections.push(this.generateMergeReadiness(result.merge_readiness));
        }

        // Summary
        if (result.summary) {
            sections.push(this.generateSummary(result.summary));
        }

        // File Walkthrough
        if (result.file_walkthrough && result.file_walkthrough.length > 0) {
            sections.push(this.generateFileWalkthrough(result.file_walkthrough));
        }

        // Findings
        if (result.findings && result.findings.length > 0) {
            sections.push(this.generateFindings(result.findings));
        }

        // Footer
        sections.push(this.generateFooter());

        return sections.join('\n\n---\n\n');
    }

    private static generateMeta(meta: any): string {
        const lines = [
            '## 📊 Review Metadata',
            '',
            `- **PR URL**: ${meta.pr_url}`,
            `- **Analysis Depth**: \`${meta.analysis_depth}\``,
            `- **Model**: ${meta.model}`,
        ];

        if (meta.duration_ms) {
            lines.push(`- **Duration**: ${(meta.duration_ms / 1000).toFixed(2)}s`);
        }

        if (meta.tokens_used) {
            lines.push(`- **Tokens Used**: ${meta.tokens_used.toLocaleString()}`);
        }

        return lines.join('\n');
    }

    private static generateMergeReadiness(mr: any): string {
        const emoji = mr.score >= 80 ? '✅' : mr.score >= 50 ? '⚠️' : '🔴';
        const status = mr.score >= 80 ? 'READY' : mr.score >= 50 ? 'NEEDS ATTENTION' : 'NOT READY';

        const lines = [
            `## ${emoji} Merge Readiness: ${mr.score}/100 - ${status}`,
            '',
            `**Overall Assessment**: ${mr.recommendation || mr.summary || 'No assessment'}`,
            '',
        ];

        if (mr.summary) {
            lines.push('### Summary', '', mr.summary, '');
        }

        return lines.join('\n');
    }

    private static generateSummary(summary: any): string {
        const lines = [
            '## 📝 PR Summary',
            '',
            `**Type**: ${summary.pr_type || 'N/A'}`,
            '',
            '### Overview',
            '',
            summary.overview || 'No overview available',
            ''
        ];

        return lines.join('\n');
    }

    private static generateFileWalkthrough(files: FileWalkthrough[]): string {
        const lines = [
            `## 📁 Files Changed (${files.length})`,
            ''
        ];

        // 按修改类型分组
        const grouped = this.groupFilesByEditType(files);

        for (const [editType, fileList] of Object.entries(grouped)) {
            const icon = this.getEditTypeIcon(editType);
            lines.push(`### ${icon} ${editType.toUpperCase()} (${fileList.length})`, '');

            fileList.forEach((fw: FileWalkthrough) => {
                lines.push(`#### \`${fw.path}\``, '');
                lines.push(fw.summary, '');
            });
        }

        return lines.join('\n');
    }

    private static generateFindings(findings: Finding[]): string {
        const lines = [
            `## 🐛 Findings (${findings.length})`,
            ''
        ];

        // 按严重程度分组
        const grouped = this.groupFindingsBySeverity(findings);
        const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];

        for (const severity of severityOrder) {
            const findingList = grouped[severity];
            if (!findingList || findingList.length === 0) continue;

            const icon = this.getSeverityIcon(severity);
            lines.push(`### ${icon} ${severity.toUpperCase()} (${findingList.length})`, '');

            findingList.forEach((finding: Finding, index: number) => {
                lines.push(`#### ${index + 1}. ${finding.title}`, '');
                lines.push(`- **Location**: \`${finding.location.path}:${finding.location.range.start.line}\``);
                lines.push(`- **Category**: ${finding.category}`);

                if (finding.confidence) {
                    lines.push(`- **Confidence**: ${(finding.confidence * 100).toFixed(0)}%`);
                }

                lines.push('', '**Description**:', '', finding.description, '');

                if (finding.suggestion) {
                    if (finding.suggestion.current_code) {
                        lines.push('**Current Code:**', '', '```', finding.suggestion.current_code, '```', '');
                    }

                    if (finding.suggestion.suggested_code) {
                        lines.push('**Suggested Fix:**', '', '```', finding.suggestion.suggested_code, '```', '');
                    }
                }

                lines.push('');
            });
        }

        return lines.join('\n');
    }

    private static generateFooter(): string {
        return [
            '---',
            '',
            '🤖 *Generated by [Insightor](https://github.com/SCU-GuGuGaGa/Insightor) - AI-powered PR Review*',
            '',
            `*Generated at: ${new Date().toISOString()}*`
        ].join('\n');
    }

    private static groupFilesByEditType(files: FileWalkthrough[]): { [key: string]: FileWalkthrough[] } {
        const grouped: { [key: string]: FileWalkthrough[] } = {};

        files.forEach(file => {
            const type = file.edit_type || 'modified';
            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push(file);
        });

        return grouped;
    }

    private static groupFindingsBySeverity(findings: Finding[]): { [key: string]: Finding[] } {
        const grouped: { [key: string]: Finding[] } = {};

        findings.forEach(finding => {
            const severity = finding.severity || 'info';
            if (!grouped[severity]) {
                grouped[severity] = [];
            }
            grouped[severity].push(finding);
        });

        return grouped;
    }

    private static getEditTypeIcon(editType: string): string {
        const icons: { [key: string]: string } = {
            'added': '➕',
            'modified': '📝',
            'deleted': '🗑️',
            'renamed': '🔄'
        };
        return icons[editType] || '📄';
    }

    private static getSeverityIcon(severity: string): string {
        const icons: { [key: string]: string } = {
            'critical': '🔴',
            'high': '🟡',
            'medium': '🔵',
            'low': '⚪',
            'info': 'ℹ️'
        };
        return icons[severity] || '•';
    }
}
