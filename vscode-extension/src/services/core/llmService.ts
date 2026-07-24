import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import axios from 'axios';

export type LLMProvider = 'openai' | 'anthropic' | 'deepseek';

export interface LLMConfig {
    provider: LLMProvider;
    apiKey: string;
    model?: string;
    baseUrl?: string;
}

export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export class LLMService {
    private config: LLMConfig;
    private anthropic?: Anthropic;
    private openai?: OpenAI;

    constructor(config: LLMConfig) {
        this.config = config;
        this.initializeClient();
    }

    private initializeClient() {
        switch (this.config.provider) {
            case 'anthropic':
                this.anthropic = new Anthropic({
                    apiKey: this.config.apiKey,
                    baseURL: this.config.baseUrl
                });
                break;
            case 'openai':
                this.openai = new OpenAI({
                    apiKey: this.config.apiKey,
                    baseURL: this.config.baseUrl || 'https://api.openai.com/v1'
                });
                break;
            case 'deepseek':
                // DeepSeek 使用 OpenAI 兼容接口
                this.openai = new OpenAI({
                    apiKey: this.config.apiKey,
                    baseURL: this.config.baseUrl || 'https://api.deepseek.com'
                });
                break;
        }
    }

    /**
     * 获取默认模型
     */
    private getDefaultModel(): string {
        if (this.config.model) {
            return this.config.model;
        }

        switch (this.config.provider) {
            case 'anthropic':
                return 'claude-sonnet-4-20250514';
            case 'openai':
                return 'gpt-4o';
            case 'deepseek':
                return 'deepseek-chat';
            default:
                return 'gpt-4o';
        }
    }

    /**
     * 调用 LLM 分析
     */
    async analyze(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
        const model = this.getDefaultModel();

        switch (this.config.provider) {
            case 'anthropic':
                return await this.analyzeWithAnthropic(prompt, systemPrompt, model);
            case 'openai':
            case 'deepseek':
                return await this.analyzeWithOpenAI(prompt, systemPrompt, model);
            default:
                throw new Error(`Unsupported provider: ${this.config.provider}`);
        }
    }

    /**
     * 使用 Anthropic API
     */
    private async analyzeWithAnthropic(
        prompt: string,
        systemPrompt?: string,
        model?: string
    ): Promise<LLMResponse> {
        if (!this.anthropic) {
            throw new Error('Anthropic client not initialized');
        }

        const response = await this.anthropic.messages.create({
            model: model || this.getDefaultModel(),
            max_tokens: 4096,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        const content = response.content
            .filter(block => block.type === 'text')
            .map(block => (block as { type: 'text'; text: string }).text)
            .join('\n');

        return {
            content,
            usage: {
                promptTokens: response.usage.input_tokens,
                completionTokens: response.usage.output_tokens,
                totalTokens: response.usage.input_tokens + response.usage.output_tokens
            }
        };
    }

    /**
     * 使用 OpenAI 兼容 API（OpenAI, DeepSeek）
     */
    private async analyzeWithOpenAI(
        prompt: string,
        systemPrompt?: string,
        model?: string
    ): Promise<LLMResponse> {
        if (!this.openai) {
            throw new Error('OpenAI client not initialized');
        }

        const messages: Array<{ role: 'system' | 'user'; content: string }> = [];

        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }

        messages.push({ role: 'user', content: prompt });

        const response = await this.openai.chat.completions.create({
            model: model || this.getDefaultModel(),
            messages,
            temperature: 0.7,
            max_tokens: 4096
        });

        const content = response.choices[0]?.message?.content || '';

        return {
            content,
            usage: response.usage ? {
                promptTokens: response.usage.prompt_tokens,
                completionTokens: response.usage.completion_tokens,
                totalTokens: response.usage.total_tokens
            } : undefined
        };
    }

    /**
     * 估算 Token 数量（简单实现）
     */
    estimateTokens(text: string): number {
        // 简单估算：英文约 4 字符 = 1 token，中文约 2 字符 = 1 token
        const englishChars = (text.match(/[a-zA-Z0-9\s]/g) || []).length;
        const otherChars = text.length - englishChars;
        return Math.ceil(englishChars / 4 + otherChars / 2);
    }
}
