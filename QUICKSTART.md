# Insightor 快速开始指南（5 分钟上手）

本指南将帮助您在 5 分钟内完成 Insightor 的安装和首次使用。

---

## ⚡ 三步快速开始

### 第 1 步：安装（2 分钟）

```bash
# 克隆项目
git clone https://github.com/SCU-GuGuGaGa/Insightor.git
cd Insightor

# 创建虚拟环境（推荐）
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装依赖
pip install -e .
```

**验证安装：**

```bash
python -m insightor --version
# 应输出：insightor 0.1.0
```

✅ 如果看到版本号，说明安装成功！

---

### 第 2 步：配置 API 密钥（2 分钟）

#### 2.1 创建配置文件

```bash
cp .env.example .env
```

#### 2.2 获取 API 密钥

**需要两个密钥：**

1. **GitHub Token**（必需）
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 勾选 `repo` 权限
   - 生成并复制 token

2. **LLM API Key**（选择一个即可）

   **推荐新手：DeepSeek**（便宜、中文友好）
   - 访问：https://platform.deepseek.com/api_keys
   - 注册并创建 API Key
   - 复制密钥

   其他选项：
   - OpenAI: https://platform.openai.com/api-keys
   - Claude: https://console.anthropic.com/settings/keys

#### 2.3 编辑 `.env` 文件

打开 `.env` 文件，填入您的密钥：

```env
# GitHub Token
GITHUB_TOKEN=ghp_你刚才复制的GitHub_token

# DeepSeek API Key（推荐）
DEEPSEEK_API_KEY=sk-你刚才复制的DeepSeek密钥

# 模型配置（使用 DeepSeek）
INSIGHTOR_MODELS_PRIMARY=deepseek-v4-pro
INSIGHTOR_MODELS_WEAK=deepseek-v4-flash
INSIGHTOR_MODELS_REASONING=deepseek-v4-pro
```

💡 **提示**：如果使用 OpenAI 或 Claude，请查看 `.env.example` 中的其他配置示例。

---

### 第 3 步：审查第一个 PR（1 分钟）

```bash
# 使用快速模式测试（省钱）
python -m insightor review https://github.com/owner/repo/pull/123 --depth quick
```

**将 URL 替换为您想审查的实际 PR 地址。**

✅ 如果一切正常，您会看到：
- ✅ 正在获取 PR 数据...
- ✅ 正在分析代码...
- ✅ 生成审查报告...
- 📄 审查结果已保存到 `insightor-review-123.md`

🎉 **恭喜！您已完成首次审查！**

---

## 📖 下一步

### 使用不同的审查模式

```bash
# 完整审查（描述 + 风险 + 审查）
python -m insightor full https://github.com/owner/repo/pull/123

# 仅生成 PR 描述
python -m insightor describe https://github.com/owner/repo/pull/123

# 仅分析安全风险
python -m insightor risks https://github.com/owner/repo/pull/123
```

### 选择分析深度

| 深度 | 命令 | 耗时 | 适用场景 |
|------|------|------|----------|
| **Quick** | `--depth quick` | ~15s | 小型 PR，快速检查，省钱 |
| **Standard** | `--depth standard` | ~30s | 大多数 PR（默认） |
| **Deep** | `--depth deep` | ~60s | 关键变更，复杂逻辑 |

```bash
# 快速模式（最便宜）
python -m insightor review <PR_URL> --depth quick

# 深度模式（最详细）
python -m insightor review <PR_URL> --depth deep
```

### 发布审查结果到 GitHub

```bash
# 1. 先运行审查，生成 Markdown 报告
python -m insightor full https://github.com/owner/repo/pull/123

# 2. 编辑报告（可选）
# 打开 insightor-full-review-123.md，修改或删除不需要的内容

# 3. 发布到 GitHub
python -m insightor publish insightor-full-review-123.md
```

---

## 🌐 尝试 Web 界面

如果您喜欢可视化界面：

```bash
# 安装 Web 依赖
pip install -e ".[web]"
cd web/frontend && npm install && npm run build && cd ../..

# 启动服务
uvicorn web.backend.app:app --host 0.0.0.0 --port 8000

# 浏览器访问
# http://localhost:8000
# 默认账户：admin / admin123
```

---

## 🔌 安装 VSCode 扩展

如果您使用 VSCode：

1. 下载 `insightor-vscode-0.1.1.vsix`（从 Releases 或自行构建）
2. 在 VSCode 中：
   - 打开扩展面板（`Ctrl+Shift+X`）
   - 点击 `...` → `从 VSIX 安装...`
   - 选择下载的文件
3. 按 `Ctrl+Shift+P`，输入 `Insightor`，选择命令使用

**配置 Python 路径：**

如果使用虚拟环境，需要在 VSCode 设置中配置 `insightor.pythonPath`：

- Windows: `项目目录\venv\Scripts\python.exe`
- macOS/Linux: `项目目录/venv/bin/python`

---

## ❓ 常见问题

### Q: 命令失败，提示 "Module not found"

**解决方法：**

```bash
# 确认虚拟环境已激活
source venv/bin/activate  # macOS/Linux
# 或
venv\Scripts\activate     # Windows

# 重新安装依赖
pip install -e .
```

### Q: API 认证失败

**检查清单：**

1. ✅ `.env` 文件是否存在（`ls -la` 查看）
2. ✅ 密钥格式是否正确（无引号、无空格）
3. ✅ GitHub Token 是否有 `repo` 权限
4. ✅ LLM API Key 是否有效（未过期、有余额）

**测试密钥是否有效：**

```bash
# 测试 GitHub Token
curl -H "Authorization: token ghp_你的token" https://api.github.com/user

# 应该返回您的 GitHub 用户信息
```

### Q: 分析太慢或太贵

**省钱技巧：**

1. **使用快速模式**：`--depth quick`（Token 消耗约为标准模式的 1/3）
2. **选择便宜的模型**：DeepSeek 比 GPT-4 便宜约 10 倍
3. **配置轻量模型**：
   ```env
   INSIGHTOR_MODELS_WEAK=gpt-4o-mini
   # 或
   INSIGHTOR_MODELS_WEAK=deepseek-v4-flash
   ```

### Q: 我应该把 .env 文件放在哪里？

**答案：**

- **CLI 使用**：放在**您要审查的项目根目录**（不是 Insightor 项目目录）
- **开发/测试 Insightor**：也可以放在 Insightor 项目根目录

示例：

```
# 如果您要审查项目 my-app 的 PR
my-app/
├── .env          ← 把 .env 放这里
├── src/
└── package.json

# 运行命令时，在 my-app 目录下执行
cd my-app
python -m insightor review <PR_URL>
```

---

## 📚 更多资源

- **完整安装指南**：[INSTALLATION.md](INSTALLATION.md) - Python 环境配置、虚拟环境详解
- **详细使用文档**：[README.md](README.md) - 所有功能和命令
- **Web 控制台文档**：[web/README.md](web/README.md) - 多用户协作
- **问题反馈**：[GitHub Issues](https://github.com/SCU-GuGuGaGa/Insightor/issues)
- **讨论区**：[GitHub Discussions](https://github.com/SCU-GuGuGaGa/Insightor/discussions)

---

## 🎯 总结

您现在已经学会了：

✅ 安装 Insightor CLI  
✅ 配置 API 密钥  
✅ 审查第一个 PR  
✅ 选择不同的分析深度  
✅ 发布结果到 GitHub  

**开始使用 Insightor 提升您的代码审查效率吧！** 🚀

如有任何问题，欢迎在 [GitHub Issues](https://github.com/SCU-GuGuGaGa/Insightor/issues) 提问。
