# VSCode 扩展架构改进计划

## 🎯 目标

**将 Insightor VSCode 扩展改造为真正的"一键安装"扩展，无需手动安装 Python CLI。**

---

## 📊 当前架构问题

### 现状

```
VSCode 扩展
    ↓ (调用 child_process.spawn)
Python CLI (需要手动安装)
    ↓
LLM API
```

**用户需要做的事情**：
1. ❌ 安装 Python 3.11+
2. ❌ 创建虚拟环境
3. ❌ pip install insightor
4. ❌ 配置 .env 文件
5. ❌ 配置 VSCode 中的 Python 路径
6. ✅ 才能使用

**问题**：
- 安装步骤多达 5-6 步
- 技术门槛高（需要懂 Python）
- 不符合 VSCode 扩展的使用习惯
- 用户体验差

---

## 💡 改进方案

### 方案 1：纯 TypeScript 实现（长期方案，最佳体验）

#### 架构

```
VSCode 扩展（包含所有功能）
    ├── GitHub API 客户端 (@octokit/rest)
    ├── LLM API 客户端 (@anthropic-ai/sdk, openai, ...)
    └── 代码分析逻辑 (TypeScript)
```

#### 用户体验

```
1. VSCode 扩展市场点击"安装" ✅
2. 在设置中配置 API Key ✅
3. 立即可用 ✨
```

#### 实现步骤

**阶段 1：核心功能迁移 (2-3 周)**

1. **GitHub API 集成**
   ```typescript
   import { Octokit } from '@octokit/rest';
   
   class GitHubService {
     private octokit: Octokit;
     
     async getPRData(owner: string, repo: string, prNumber: number) {
       const pr = await this.octokit.pulls.get({ owner, repo, pull_number: prNumber });
       const files = await this.octokit.pulls.listFiles({ owner, repo, pull_number: prNumber });
       const commits = await this.octokit.pulls.listCommits({ owner, repo, pull_number: prNumber });
       
       return { pr: pr.data, files: files.data, commits: commits.data };
     }
   }
   ```

2. **LLM API 集成**
   ```typescript
   import Anthropic from '@anthropic-ai/sdk';
   import OpenAI from 'openai';
   
   class LLMService {
     private providers: Map<string, any>;
     
     async analyze(code: string, prompt: string, provider: string) {
       switch (provider) {
         case 'anthropic':
           return await this.anthropic.messages.create({ ... });
         case 'openai':
           return await this.openai.chat.completions.create({ ... });
         case 'deepseek':
           return await this.deepseek.chat.completions.create({ ... });
       }
     }
   }
   ```

3. **代码分析逻辑**
   ```typescript
   class CodeAnalyzer {
     async reviewPR(prUrl: string, depth: string) {
       // 1. 获取 PR 数据
       const prData = await this.github.getPRData(...);
       
       // 2. 构建分析提示词
       const prompt = this.buildPrompt(prData, depth);
       
       // 3. 调用 LLM 分析
       const analysis = await this.llm.analyze(prompt);
       
       // 4. 解析结果
       return this.parseAnalysis(analysis);
     }
   }
   ```

**阶段 2：配置管理 (1 周)**

```typescript
// 配置接口
interface InsightorConfig {
  githubToken: string;
  llmProvider: 'openai' | 'anthropic' | 'deepseek';
  apiKey: string;
  model?: string;
  defaultDepth: 'quick' | 'standard' | 'deep';
}

// 配置在 VSCode settings.json 中
{
  "insightor.githubToken": "ghp_xxx",
  "insightor.llmProvider": "deepseek",
  "insightor.apiKey": "sk-xxx",
  "insightor.model": "deepseek-v4-pro",
  "insightor.defaultDepth": "standard"
}
```

**阶段 3：UI 改进 (1 周)**

- 首次使用引导（Walkthrough）
- 配置向导（引导用户获取 API Key）
- 进度提示（实时显示分析进度）

#### 依赖包

```json
{
  "dependencies": {
    "@octokit/rest": "^20.0.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "openai": "^4.0.0",
    "axios": "^1.6.0"
  }
}
```

#### 优点

- ✅ 用户体验最佳（一键安装）
- ✅ 无需 Python 环境
- ✅ 配置简单（只需 API Key）
- ✅ 扩展包体积小（< 5MB）
- ✅ 跨平台无差异

#### 缺点

- ❌ 开发工作量大（需要重写核心逻辑）
- ❌ 需要维护两套代码（CLI + 扩展）

---

### 方案 2：打包 Python Runtime（中期方案）

#### 架构

使用 `pyinstaller` 将 Python CLI 编译为独立可执行文件，打包到扩展中。

```
insightor-vscode.vsix
├── bin/
│   ├── insightor-win.exe   (Windows)
│   ├── insightor-darwin    (macOS)
│   └── insightor-linux     (Linux)
└── extension.js (调用对应平台的可执行文件)
```

#### 实现步骤

1. **编译 Python CLI**
   ```bash
   # 安装 pyinstaller
   pip install pyinstaller
   
   # 为每个平台编译
   pyinstaller --onefile --name insightor-win insightor/cli.py  # Windows
   pyinstaller --onefile --name insightor-darwin insightor/cli.py  # macOS
   pyinstaller --onefile --name insightor-linux insightor/cli.py  # Linux
   ```

2. **扩展中调用打包的可执行文件**
   ```typescript
   private getBinaryPath(): string {
     const platform = process.platform;
     const ext = platform === 'win32' ? '.exe' : '';
     return path.join(
       this.context.extensionPath,
       'bin',
       `insightor-${platform}${ext}`
     );
   }
   
   private async executeCommand(args: string[]) {
     const binaryPath = this.getBinaryPath();
     const process = cp.spawn(binaryPath, args, { ... });
     // ...
   }
   ```

3. **配置管理**
   - 仍需 .env 文件或环境变量
   - 可以改为从 VSCode 设置读取

#### 优点

- ✅ 无需用户安装 Python
- ✅ 复用现有 Python 代码
- ✅ 开发工作量较小

#### 缺点

- ❌ 扩展包体积大（50-100MB）
- ❌ 需要为 3 个平台分别编译
- ❌ 仍需配置 API Key（虽然可以改进）
- ❌ 打包后难以调试

---

### 方案 3：自动安装 CLI（短期方案，快速改进）

#### 改进当前架构，添加自动化安装流程

```typescript
// extension.ts
export async function activate(context: vscode.ExtensionContext) {
  const service = new InsightorService(context);
  
  // 检查是否已安装
  const isInstalled = await service.checkInstallation();
  
  if (!isInstalled) {
    const choice = await vscode.window.showWarningMessage(
      'Insightor CLI 未安装。需要 Python 3.11+ 和 pip。',
      '自动安装', '手动安装指南', '取消'
    );
    
    if (choice === '自动安装') {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "正在安装 Insightor CLI...",
        cancellable: false
      }, async (progress) => {
        try {
          // 检查 Python
          const hasPython = await checkPython();
          if (!hasPython) {
            throw new Error('未找到 Python 3.11+');
          }
          
          // 自动安装
          progress.report({ message: "下载中..." });
          await exec('pip install git+https://github.com/SCU-GuGuGaGa/Insightor.git');
          
          progress.report({ message: "安装完成！" });
          vscode.window.showInformationMessage('Insightor CLI 安装成功！');
        } catch (error) {
          vscode.window.showErrorMessage(`安装失败: ${error.message}`);
        }
      });
    } else if (choice === '手动安装指南') {
      vscode.env.openExternal(vscode.Uri.parse(
        'https://github.com/SCU-GuGuGaGa/Insightor/blob/main/INSTALLATION.md'
      ));
    }
  }
  
  // 检查 API Key 配置
  await checkAPIKeyConfiguration(context);
  
  // 注册命令...
}

async function checkAPIKeyConfiguration(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('insightor');
  const apiKey = config.get<string>('apiKey');
  const githubToken = config.get<string>('githubToken');
  
  if (!apiKey || !githubToken) {
    const choice = await vscode.window.showInformationMessage(
      '请配置 API Key 才能使用 Insightor',
      '打开设置', '查看帮助'
    );
    
    if (choice === '打开设置') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'insightor');
    } else if (choice === '查看帮助') {
      vscode.env.openExternal(vscode.Uri.parse(
        'https://github.com/SCU-GuGuGaGa/Insightor/blob/main/INSTALLATION.md#api-密钥配置详解'
      ));
    }
  }
}
```

#### 配置改进

**从 .env 迁移到 VSCode 设置**

```typescript
// 读取配置优先级：VSCode 设置 > 环境变量 > .env 文件
private getAPIKey(): string {
  // 1. 从 VSCode 设置读取
  const config = vscode.workspace.getConfiguration('insightor');
  let apiKey = config.get<string>('apiKey');
  
  // 2. 从环境变量读取
  if (!apiKey) {
    apiKey = process.env.DEEPSEEK_API_KEY || 
             process.env.OPENAI_API_KEY || 
             process.env.ANTHROPIC_API_KEY;
  }
  
  // 3. 从 .env 文件读取（兼容旧版）
  if (!apiKey) {
    apiKey = this.readFromDotEnv();
  }
  
  return apiKey;
}
```

#### 优点

- ✅ 开发工作量最小
- ✅ 用户体验有改善
- ✅ 保持向后兼容

#### 缺点

- ❌ 仍需 Python 环境
- ❌ 依赖网络安装
- ❌ 不是最佳解决方案

---

## 🎯 推荐实施路线

### 第一步：立即实施方案 3（1-2 天）

**目标**：快速改善用户体验

- ✅ 添加自动安装检查
- ✅ 引导用户一键安装 CLI
- ✅ 支持从 VSCode 设置读取 API Key
- ✅ 改进错误提示和帮助链接

### 第二步：规划方案 1（1-2 个月）

**目标**：彻底解决依赖问题

- ✅ 设计 TypeScript 版本架构
- ✅ 逐步迁移核心功能
- ✅ 保持 CLI 和扩展功能一致
- ✅ 充分测试后发布

### 第三步：维护两个版本

- **CLI 版本**：命令行用户、CI/CD 集成
- **VSCode 扩展**：IDE 用户（纯 TS，无依赖）

---

## 📦 参考项目

### 优秀的 VSCode 扩展架构

1. **GitHub Pull Requests**
   - 仓库：https://github.com/microsoft/vscode-pull-request-github
   - 特点：纯 TS 实现，使用 @octokit/rest

2. **GitLens**
   - 仓库：https://github.com/gitkraken/vscode-gitlens
   - 特点：无外部依赖，性能优秀

3. **ESLint**
   - 仓库：https://github.com/microsoft/vscode-eslint
   - 特点：Node.js 实现，无需用户安装

---

## ✅ 总结

**当前问题**：VSCode 扩展只是 Python CLI 的壳，用户体验差

**解决方案**：
- **短期**：自动化安装流程（方案 3）
- **长期**：纯 TypeScript 实现（方案 1）

**预期效果**：
- 用户安装时间：从 10-15 分钟 → 1-2 分钟
- 配置步骤：从 5-6 步 → 2 步（安装 + 配置 API Key）
- 用户满意度：显著提升

---

**开始改进？** 建议先实施方案 3，快速改善用户体验！
