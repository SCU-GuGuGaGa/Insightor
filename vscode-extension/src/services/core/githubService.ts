import { Octokit } from '@octokit/rest';
import * as vscode from 'vscode';

export interface PRData {
    number: number;
    title: string;
    body: string;
    state: string;
    user: {
        login: string;
    };
    base: {
        ref: string;
        repo: {
            owner: { login: string };
            name: string;
        };
    };
    head: {
        ref: string;
        sha: string;
    };
}

export interface PRFile {
    filename: string;
    status: 'added' | 'removed' | 'modified' | 'renamed';
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
}

export interface PRCommit {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            email: string;
            date: string;
        };
    };
}

export class GitHubService {
    private octokit: Octokit;

    constructor(token: string) {
        const config = vscode.workspace.getConfiguration('insightor');
        const proxyEnabled = config.get<boolean>('proxy.enabled', false);

        const options: any = {
            auth: token
        };

        // 默认情况下不使用代理，避免系统代理干扰
        if (!proxyEnabled) {
            // 明确禁用代理
            options.request = {
                agent: false
            };
        }
        // 如果用户明确启用了代理，则使用配置的代理或系统代理
        else {
            const proxyUrl = config.get<string>('proxy.url', '');
            if (proxyUrl) {
                // 使用自定义代理
                const { HttpsProxyAgent } = require('https-proxy-agent');
                options.request = {
                    agent: new HttpsProxyAgent(proxyUrl)
                };
            }
            // 否则让 octokit 自动检测系统代理
        }

        this.octokit = new Octokit(options);
    }

    /**
     * 解析 PR URL
     * @param prUrl GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)
     */
    parsePRUrl(prUrl: string): { owner: string; repo: string; prNumber: number } {
        const match = prUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
        if (!match) {
            throw new Error('Invalid GitHub PR URL format');
        }
        return {
            owner: match[1],
            repo: match[2],
            prNumber: parseInt(match[3], 10)
        };
    }

    /**
     * 获取 PR 数据
     */
    async getPR(owner: string, repo: string, prNumber: number): Promise<PRData> {
        const { data } = await this.octokit.pulls.get({
            owner,
            repo,
            pull_number: prNumber
        });
        return data as PRData;
    }

    /**
     * 获取 PR 文件变更
     */
    async getPRFiles(owner: string, repo: string, prNumber: number): Promise<PRFile[]> {
        const { data } = await this.octokit.pulls.listFiles({
            owner,
            repo,
            pull_number: prNumber,
            per_page: 100
        });
        return data as PRFile[];
    }

    /**
     * 获取 PR commits
     */
    async getPRCommits(owner: string, repo: string, prNumber: number): Promise<PRCommit[]> {
        const { data } = await this.octokit.pulls.listCommits({
            owner,
            repo,
            pull_number: prNumber,
            per_page: 100
        });
        return data as PRCommit[];
    }

    /**
     * 发布 PR 评论
     */
    async createReviewComment(
        owner: string,
        repo: string,
        prNumber: number,
        body: string,
        event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT' = 'COMMENT'
    ): Promise<void> {
        await this.octokit.pulls.createReview({
            owner,
            repo,
            pull_number: prNumber,
            body,
            event
        });
    }

    /**
     * 发布普通评论
     */
    async createComment(owner: string, repo: string, prNumber: number, body: string): Promise<void> {
        await this.octokit.issues.createComment({
            owner,
            repo,
            issue_number: prNumber,
            body
        });
    }

    /**
     * 获取完整的 PR 数据（包含文件和 commits）
     */
    async getFullPRData(prUrl: string): Promise<{
        pr: PRData;
        files: PRFile[];
        commits: PRCommit[];
    }> {
        const { owner, repo, prNumber } = this.parsePRUrl(prUrl);

        const [pr, files, commits] = await Promise.all([
            this.getPR(owner, repo, prNumber),
            this.getPRFiles(owner, repo, prNumber),
            this.getPRCommits(owner, repo, prNumber)
        ]);

        return { pr, files, commits };
    }
}
