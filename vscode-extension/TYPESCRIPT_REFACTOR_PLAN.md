# Insightor VSCode 扩展 - TypeScript 重构实施计划

## 📋 实施步骤

### 阶段 1：安装依赖包（立即完成）

```bash
cd vscode-extension
npm install @octokit/rest @anthropic-ai/sdk openai dotenv
```

### 阶段 2：创建核心服务类

#### 2.1 GitHub 服务 (`src/services/githubService.ts`)
- 获取 PR 数据
- 获取文件变更
- 获取 commits
- 发布评论

#### 2.2 LLM 服务 (`src/services/llmService.ts`)
- 支持多个提供商（OpenAI, Anthropic, DeepSeek）
- 统一的调用接口
- Token 计数

#### 2.3 分析服务 (`src/services/analysisService.ts`)
- 代码审查逻辑
- PR 描述生成
- 风险分析
- 结果解析

### 阶段 3：配置管理

#### 3.1 配置项 (`package.json` contributions)
```json
{
  "insightor.githubToken": "GitHub Personal Access Token",
  "insightor.llm.provider": "openai | anthropic | deepseek",
  "insightor.llm.apiKey": "LLM API Key",
  "insightor.llm.baseUrl": "可选：自定义 API 地址",
  "insightor.llm.model": "可选：覆盖默认模型",
  "insightor.defaultDepth": "quick | standard | deep"
}
```

#### 3.2 配置读取优先级
1. VSCode 设置
2. 环境变量（兼容）
3. .env 文件（兼容）

### 阶段 4：UI 改进

- 首次使用配置向导
- 进度显示
- 错误提示改进

### 阶段 5：测试和发布

- 单元测试
- 集成测试
- 文档更新
- 发布新版本

---

## 🚀 开始实施

### 第一步：安装依赖

运行以下命令：

```bash
cd vscode-extension
npm install @octokit/rest @anthropic-ai/sdk openai axios
npm install --save-dev @types/node
```

### 第二步：创建服务类

我将创建以下文件：

1. `src/services/core/githubService.ts` - GitHub API 封装
2. `src/services/core/llmService.ts` - LLM API 封装
3. `src/services/core/analysisService.ts` - 分析逻辑
4. `src/services/core/configService.ts` - 配置管理
5. `src/services/insightorServiceV2.ts` - 新版服务（替代旧的）

### 第三步：更新命令处理

修改 `src/commands/commandHandler.ts`，使用新服务替代旧的 Python CLI 调用。

### 第四步：更新配置

修改 `package.json`，添加新的配置项。

---

## 📊 迁移对比

### 旧架构
```
VSCode 扩展
    ↓ spawn('python -m insightor')
Python CLI
    ↓
LLM API
```

### 新架构
```
VSCode 扩展
    ├── GitHubService (@octokit/rest)
    ├── LLMService (@anthropic-ai/sdk, openai)
    └── AnalysisService (TypeScript)
```

---

## ⚠️ 向后兼容

为了平滑过渡，我们将：

1. **保留旧服务** - `insightorService.ts` 继续存在
2. **创建新服务** - `insightorServiceV2.ts` 为新实现
3. **配置切换** - 用户可以选择使用哪个版本
4. **逐步迁移** - 先实现核心功能，再完善细节

---

## 🎯 预期效果

### 用户体验

**安装前**：
- 需要 Python 3.11+
- 需要 pip install
- 需要配置虚拟环境
- 需要配置 .env
- 需要配置 Python 路径

**安装后**：
- VSCode 扩展市场点击安装 ✨
- 在设置中配置 API Key
- 立即可用！

### 性能

- **启动速度**：更快（无需启动 Python 进程）
- **分析速度**：相近（主要时间在 LLM API 调用）
- **资源占用**：更小（无需 Python Runtime）

---

## 📝 下一步

我将开始创建核心服务类。准备好了吗？

**确认后，我将：**
1. 创建 GitHub 服务（封装 @octokit/rest）
2. 创建 LLM 服务（支持 OpenAI/Anthropic/DeepSeek）
3. 创建分析服务（代码审查逻辑）
4. 更新配置和命令处理
5. 测试新实现

这将是一个大的重构，但会彻底解决依赖问题！🚀
