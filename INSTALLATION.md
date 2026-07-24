# Insightor 安装与配置指南

本指南将帮助您从零开始配置 Insightor 项目环境，包括 Python 环境、依赖安装和 API 密钥配置。

---

## 📋 前置要求

在开始之前，请确保您的系统已安装：

- **Python 3.11 或更高版本**（推荐 3.11 或 3.12）
- **Git**（用于克隆项目）
- **Node.js 16+**（如果需要使用 VSCode 扩展或 Web 前端）

### 检查 Python 版本

```bash
python --version
# 或
python3 --version
```

如果版本低于 3.11，请先升级 Python：
- Windows: 从 [python.org](https://www.python.org/downloads/) 下载安装
- macOS: `brew install python@3.11`
- Linux: `sudo apt install python3.11` 或使用 pyenv

---

## 🚀 快速安装（三步搞定）

### 步骤 1: 克隆项目

```bash
git clone https://github.com/SCU-GuGuGaGa/Insightor.git
cd Insightor
```

### 步骤 2: 安装 Python 依赖

**推荐方式：使用虚拟环境**

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装基础依赖
pip install -e .

# 如果需要使用 Web 控制台，安装 web 依赖
pip install -e ".[web]"
```

**验证安装：**

```bash
python -m insightor --version
# 应该输出：insightor 0.1.0
```

### 步骤 3: 配置 API 密钥

```bash
# 复制配置文件模板
cp .env.example .env

# 编辑 .env 文件，填入您的 API 密钥（下一节详细说明）
```

---

## 🔑 API 密钥配置详解

### 需要配置的密钥

Insightor 需要两类 API 密钥：

1. **GitHub Token**（必需）- 用于访问 GitHub PR 数据
2. **LLM API Key**（至少一个）- 用于 AI 代码审查

### 1. 获取 GitHub Personal Access Token

**步骤：**

1. 登录 GitHub，访问：https://github.com/settings/tokens
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 设置权限（Scopes）：
   - ✅ `repo`（完整仓库权限，用于读取 PR）
   - ✅ `read:org`（如果需要访问组织私有仓库）
4. 点击 **"Generate token"**，复制生成的 token（格式：`ghp_xxxxx`）

**填入 .env：**

```env
GITHUB_TOKEN=ghp_你复制的token
```

⚠️ **注意**：GitHub Token 只会显示一次，请妥善保存！

### 2. 获取 LLM API Key（选择一个）

Insightor 支持三种 LLM 提供商，**至少需要配置一个**：

#### 选项 A: OpenAI（推荐新手）

**获取方式：**
1. 访问：https://platform.openai.com/api-keys
2. 登录并创建新的 API Key
3. 复制 key（格式：`sk-proj-xxxxx`）

**填入 .env：**

```env
OPENAI_API_KEY=sk-proj-你的OpenAI密钥
```

**推荐模型配置：**

```env
INSIGHTOR_MODELS_PRIMARY=gpt-4o        # 标准模式
INSIGHTOR_MODELS_WEAK=gpt-4o-mini      # 快速模式（省钱）
INSIGHTOR_MODELS_REASONING=gpt-4o      # 深度模式
```

#### 选项 B: DeepSeek（更便宜，中文友好）

**获取方式：**
1. 访问：https://platform.deepseek.com/api_keys
2. 注册并创建 API Key

**填入 .env：**

```env
DEEPSEEK_API_KEY=sk-你的DeepSeek密钥
```

**推荐模型配置：**

```env
INSIGHTOR_MODELS_PRIMARY=deepseek-v4-pro
INSIGHTOR_MODELS_WEAK=deepseek-v4-flash
INSIGHTOR_MODELS_REASONING=deepseek-v4-pro
```

#### 选项 C: Anthropic Claude（最强推理）

**获取方式：**
1. 访问：https://console.anthropic.com/settings/keys
2. 创建 API Key

**填入 .env：**

```env
ANTHROPIC_API_KEY=sk-ant-你的Claude密钥
```

**推荐模型配置：**

```env
INSIGHTOR_MODELS_PRIMARY=claude-sonnet-4-6
INSIGHTOR_MODELS_WEAK=claude-sonnet-4-6
INSIGHTOR_MODELS_REASONING=claude-opus-4-8
```

### 3. 第三方 API 网关（可选 - 仅在使用第三方服务时需要）

⚠️ **重要说明**：如果您使用**官方 API**（OpenAI、Anthropic、DeepSeek），**不需要**配置 Base URL，系统会自动使用官方地址。

**什么时候需要配置 Base URL？**
- ✅ 使用第三方 API 网关（如 cc-vibe、api.laozhang.ai、openrouter.ai）
- ❌ 使用官方 API - 可以完全跳过本节

**官方默认地址（自动使用，无需配置）：**
- OpenAI: `https://api.openai.com`
- Anthropic: `https://api.anthropic.com`
- DeepSeek: `https://api.deepseek.com`

**第三方网关配置示例：**

```env
# 使用第三方 Claude 网关
ANTHROPIC_API_KEY=sk-你的第三方密钥
ANTHROPIC_BASE_URL=https://your-gateway.com  # 只有使用第三方时才需要

# 模型配置
INSIGHTOR_MODELS_PRIMARY=claude-sonnet-4-6
INSIGHTOR_MODELS_WEAK=claude-sonnet-4-6
INSIGHTOR_MODELS_REASONING=claude-sonnet-4-6
```

⚠️ **第三方服务常见问题**：
- **问题**：部分供应商的 "CC"（Claude Code）类型密钥仅允许官方 CLI 使用，SDK/curl 请求会被 403 拒绝
- **解决**：在供应商后台生成 "API" 类型的密钥（非 CC 类型）
- **已验证可用**：cc-vibe、api.laozhang.ai、openrouter.ai

---

## 📝 完整的 .env 配置示例

### 示例 1: 使用官方 OpenAI（推荐新手）

```env
# GitHub Token
GITHUB_TOKEN=ghp_你的GitHub_token

# OpenAI API
OPENAI_API_KEY=sk-proj-你的OpenAI密钥

# 模型配置（可选，有默认值）
INSIGHTOR_MODELS_PRIMARY=gpt-4o
INSIGHTOR_MODELS_WEAK=gpt-4o-mini
INSIGHTOR_MODELS_REASONING=gpt-4o
```

### 示例 2: 使用 DeepSeek（省钱方案）

```env
# GitHub Token
GITHUB_TOKEN=ghp_你的GitHub_token

# DeepSeek API
DEEPSEEK_API_KEY=sk-你的DeepSeek密钥

# 模型配置
INSIGHTOR_MODELS_PRIMARY=deepseek-v4-pro
INSIGHTOR_MODELS_WEAK=deepseek-v4-flash
INSIGHTOR_MODELS_REASONING=deepseek-v4-pro
```

### 示例 3: 使用第三方 Claude 网关

```env
# GitHub Token
GITHUB_TOKEN=ghp_你的GitHub_token

# 第三方 Claude API
ANTHROPIC_API_KEY=sk-你的第三方密钥
ANTHROPIC_BASE_URL=https://api.your-gateway.com

# 模型配置
INSIGHTOR_MODELS_PRIMARY=claude-sonnet-4-6
INSIGHTOR_MODELS_WEAK=claude-sonnet-4-6
INSIGHTOR_MODELS_REASONING=claude-sonnet-4-6
```

---

## ✅ 验证配置

### 1. 测试 CLI 是否正常

```bash
# 激活虚拟环境（如果使用）
source venv/bin/activate  # macOS/Linux
# 或
venv\Scripts\activate     # Windows

# 运行帮助命令
python -m insightor --help
```

**预期输出：**
```
Usage: insightor [OPTIONS] COMMAND [ARGS]...

  Insightor - AI-powered PR review assistant

Commands:
  full     Full review (describe + risks + review)
  review   Review PR code changes
  describe Generate PR description
  ...
```

### 2. 测试审查一个 PR

```bash
# 使用快速模式测试（省钱）
python -m insightor review https://github.com/owner/repo/pull/123 --depth quick
```

如果配置正确，应该能看到：
- ✅ GitHub PR 数据获取成功
- ✅ AI 开始分析代码
- ✅ 生成审查报告

### 3. 常见错误排查

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `GITHUB_TOKEN not found` | 未配置 GitHub Token | 检查 `.env` 文件中的 `GITHUB_TOKEN` |
| `API key not found` | 未配置 LLM API Key | 至少配置一个 `*_API_KEY` |
| `401 Unauthorized` | API Key 无效或过期 | 重新生成 API Key |
| `403 Forbidden` | 第三方 API 限制 | 检查是否使用了 "CC" 类型密钥，换成 "API" 类型 |
| `Module not found` | 依赖未安装 | 重新运行 `pip install -e .` |

---

## 🔧 高级配置

### 使用项目级配置文件

除了 `.env`，您还可以创建 `.insightor.yml` 进行更详细的配置：

```bash
cp .insightor.example.yml .insightor.yml
```

编辑 `.insightor.yml`：

```yaml
review:
  # 自定义审查规则
  custom_rules: |
    1. 所有 API 路由必须有身份验证
    2. 使用参数化查询，禁止字符串拼接 SQL
    3. 必须包含单元测试
  
  # 代码规范
  conventions: |
    - 使用 async/await 而非回调
    - 变量命名使用驼峰命名法
    - 函数注释使用中文
  
  # 关注的审查维度
  focus_categories: ["security", "performance", "testing"]
  
  # 最低严重程度（忽略更低级别的问题）
  min_severity: medium
  
  # 最多返回的建议数量
  max_suggestions: 20
```

### 虚拟环境最佳实践

**为什么要使用虚拟环境？**
- ✅ 隔离项目依赖，避免版本冲突
- ✅ 不污染系统 Python 环境
- ✅ 方便团队协作和部署

**推荐的目录结构：**

```
Insightor/
├── venv/                 # 虚拟环境（已在 .gitignore）
├── .env                  # API 密钥配置（不要提交到 Git！）
├── .insightor.yml        # 项目级配置（可选）
├── insightor/            # 源代码
└── ...
```

**VSCode 用户：自动激活虚拟环境**

在 VSCode 中打开项目后：
1. 按 `Ctrl+Shift+P`
2. 输入 `Python: Select Interpreter`
3. 选择 `./venv/bin/python`（或 `.\venv\Scripts\python.exe`）

VSCode 将自动在终端中激活虚拟环境。

---

## 🌐 安装 Web 控制台（可选）

如果需要使用 Web 界面进行团队协作：

### 1. 安装 Web 依赖

```bash
# Python 后端依赖
pip install -e ".[web]"

# 前端依赖
cd web/frontend
npm install
npm run build
cd ../..
```

### 2. 启动 Web 服务

```bash
uvicorn web.backend.app:app --host 0.0.0.0 --port 8000
```

### 3. 访问 Web 界面

打开浏览器访问：http://localhost:8000

**默认账户：**
- 用户名：`admin`
- 密码：`admin123`

⚠️ **安全提示**：生产环境请立即修改默认密码！

---

## 🔌 安装 VSCode 扩展（可选）

### 方式 1: 从 VSIX 安装

```bash
cd vscode-extension
npm install
npm run compile

# 打包
npm run package
# 生成 insightor-vscode-0.1.1.vsix
```

在 VSCode 中：
1. 扩展面板（`Ctrl+Shift+X`）
2. 点击 `...` → `从 VSIX 安装...`
3. 选择生成的 `.vsix` 文件

### 方式 2: 开发模式（调试）

```bash
cd vscode-extension
npm install
npm run watch  # 自动编译
```

在 VSCode 中按 `F5` 启动扩展开发主机。

---

## 📚 下一步

配置完成后，您可以：

1. **阅读快速开始指南**：[README.md](README.md#-快速开始)
2. **尝试审查第一个 PR**：
   ```bash
   insightor full https://github.com/your-org/your-repo/pull/123
   ```
3. **查看详细文档**：
   - [使用方法](README.md#-使用方法)
   - [Web 控制台文档](web/README.md)
   - [VSCode 扩展指南](README.md#vscode-扩展使用)

---

## ❓ 常见问题

### Q1: 我应该选择哪个 LLM 提供商？

| 提供商 | 优点 | 缺点 | 适合人群 |
|--------|------|------|----------|
| **OpenAI** | 稳定、文档全、生态好 | 需要信用卡、国内访问困难 | 海外用户、企业 |
| **DeepSeek** | 便宜、中文友好、国内快 | 社区较小 | 国内个人开发者 |
| **Claude** | 推理能力最强、代码理解好 | 价格较高、需要海外信用卡 | 需要高质量审查 |

**推荐新手**：DeepSeek（性价比高，中文友好）

### Q2: .env 文件要放在哪里？

- **CLI 使用**：放在**您要审查的项目根目录**（不是 Insightor 项目目录）
- **Web 控制台**：在 Web 界面中配置，每个用户独立配置
- **VSCode 扩展**：放在**您要审查的项目根目录**

### Q3: 虚拟环境的 Python 路径在哪里？

- Windows: `项目目录\venv\Scripts\python.exe`
- macOS/Linux: `项目目录/venv/bin/python`

在 VSCode 设置中配置 `insightor.pythonPath` 为这个路径。

### Q4: 能同时使用多个 LLM 提供商吗？

可以！您可以配置多个 API Key：

```env
OPENAI_API_KEY=sk-proj-xxx
DEEPSEEK_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx

# 混合使用不同模型
INSIGHTOR_MODELS_WEAK=deepseek-v4-flash      # 快速模式用便宜的
INSIGHTOR_MODELS_PRIMARY=claude-sonnet-4-6   # 标准模式用好的
INSIGHTOR_MODELS_REASONING=claude-opus-4-8   # 深度模式用最强的
```

### Q5: 如何避免 API 费用过高？

1. **使用快速模式**：`--depth quick`（Token 消耗约为标准模式的 1/3）
2. **选择便宜的模型**：DeepSeek 比 GPT-4 便宜约 10 倍
3. **配置轻量模型**：
   ```env
   INSIGHTOR_MODELS_WEAK=gpt-4o-mini  # 或 deepseek-v4-flash
   ```
4. **限制审查范围**：只审查关键的 PR

---

## 🆘 获取帮助

如果遇到问题：

1. **查看详细日志**：
   ```bash
   python -m insightor review <pr_url> --verbose
   ```

2. **检查配置**：
   ```bash
   # 查看当前配置
   python -m insightor config show
   ```

3. **提交 Issue**：
   - [GitHub Issues](https://github.com/SCU-GuGuGaGa/Insightor/issues)
   - 请附上：错误信息、Python 版本、操作系统、脱敏后的配置

4. **加入讨论**：
   - [GitHub Discussions](https://github.com/SCU-GuGuGaGa/Insightor/discussions)

---

**祝您使用愉快！🎉**
