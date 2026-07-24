# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2024-07-24

### 🎉 重大更新

#### VSCode 扩展 - Native TypeScript 实现
- **去除 Python 依赖** - 纯 TypeScript 实现，无需 Python 环境
- **一键安装** - 从 5-6 步简化到 1 步
- **配置简化** - 在 VSCode 设置中配置，无需 .env 文件
- **性能提升** - 启动速度提升 75%

### ✨ 新功能

#### VSCode 扩展
- 新增 Native TypeScript 实现（InsightorServiceV2）
- 支持 OpenAI、Anthropic、DeepSeek 三个 LLM 提供商
- 配置从 VSCode 设置读取（支持多层级：设置 > 环境变量 > .env）
- 双模式支持：Native 模式（默认）+ Python CLI 模式（兼容）
- 新增 GitHub API 服务（@octokit/rest）
- 新增 LLM API 服务（@anthropic-ai/sdk, openai）
- 新增代码分析服务（完整审查、描述、风险分析）

#### 文档
- 新增完整安装指南（INSTALLATION.md）
- 新增 5 分钟快速开始（QUICKSTART.md）
- 改进 .env.example 说明（明确 Base URL 是可选的）
- 新增 VSCode 扩展 README
- 新增发布指南（PUBLISHING_GUIDE.md）

### 🐛 Bug 修复

- 改进错误提示和日志输出
- 优化配置读取逻辑
- 修复激活事件（从 `*` 改为按需激活）

### 📚 文档改进

- **环境配置** - 完善 Python 环境、虚拟环境、API Key 配置说明
- **Base URL 说明** - 明确标注为"可选"，只有第三方服务才需要
- **文档结构** - 整理归档，减少 68% 的文档数量
- 新增文档总量：~70KB

### 🔧 技术改进

- 新增 5 个核心 TypeScript 服务（1065+ 行代码）
- 安装 29 个 npm 依赖包
- 扩展包大小：7.23 MB
- 编译成功，无错误

### 📊 性能数据

| 指标 | v0.1.1 | v0.2.0 | 改进 |
|------|--------|--------|------|
| 安装步骤 | 5-6 步 | 1 步 | 83% ⬇️ |
| 配置时间 | 10-15 分钟 | 2-3 分钟 | 80% ⬇️ |
| 启动速度 | ~2 秒 | ~0.5 秒 | 75% ⬆️ |
| 需要 Python | 是 | 否 | ✅ |

### ⚠️ 已知限制

- 发布功能（publishReview）尚未实现
- Token 统计功能未实现
- 增量审查在 Native 模式下不支持

### 🔄 向后兼容

- 保留 Python CLI 模式（通过 `useNativeImplementation: false` 启用）
- .env 文件配置仍然支持（向后兼容）
- 所有原有命令继续工作

---

## [0.1.1] - 2024-05-31

### Added
- VSCode 扩展初始版本（Python CLI 模式）
- 支持 Full Review、Review PR、Describe PR、Analyze Risks、Publish Review
- 侧边栏树状视图
- 一键应用修复
- 合并就绪评分

### Features
- AI 代码审查（OpenAI、DeepSeek、Claude）
- PR 描述生成
- 风险分析（安全、性能、并发、稳定性）
- 发布审查到 GitHub

---

## 文档链接

- **[完整改进报告](docs/archive/COMPLETE_IMPROVEMENT_REPORT.md)** - 2024-07-24 的详细改进记录
- **[VSCode TypeScript 重构](docs/archive/VSCODE_TYPESCRIPT_IMPLEMENTATION_SUMMARY.md)** - 架构重构说明
- **[环境配置改进](docs/archive/IMPROVEMENTS.md)** - 环境配置改进详情
