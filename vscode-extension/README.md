# Insightor VSCode 扩展

<div align="center">

![Insightor](resources/icon.png)

**AI 驱动的 GitHub PR 审查工具，直接在 VSCode 中使用**

[![VSCode](https://img.shields.io/badge/VSCode-1.85+-blue.svg)](https://code.visualstudio.com/)
[![Version](https://img.shields.io/badge/version-0.1.1-green.svg)](https://github.com/SCU-GuGuGaGa/Insightor)

[快速开始](#-快速开始) • [功能特性](#-功能特性) • [安装指南](#-安装) • [使用方法](#-使用方法) • [故障排查](#-常见问题)

</div>

---

## 🎯 什么是 Insightor VSCode 扩展？

Insightor VSCode 扩展将 AI 代码审查能力集成到您的编辑器中：

✅ **在编辑器内审查 PR** - 无需切换到浏览器  
✅ **可视化树状视图** - 按严重程度组织发现  
✅ **一键应用修复** - AI 建议直接应用到代码  
✅ **侧边栏集成** - 点击跳转到问题位置  
✅ **发布到 GitHub** - 人工审核后一键发布  

---

## ⚡ 快速开始（5 分钟）

### 前置要求

- ✅ Python 3.11+
- ✅ VSCode 1.85+
- ✅ LLM API Key（OpenAI/DeepSeek/Claude 任选其一）

### 步骤 1: 安装 Insightor CLI

```bash
# 克隆项目
git clone https://github.com/SCU-GuGuGaGa/Insightor.git
cd Insightor

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装
pip install -e .

# 验证
python -m insightor --version
```

**详细安装指南** → [../INSTALLATION.md](../INSTALLATION.md)

### 步骤 2: 配置 API Key

在项目根目录创建 `.env` 文件：

```env
# GitHub Token
GITHUB_TOKEN=ghp_你的token

# LLM API Key（选择一个）
DEEPSEEK_API_KEY=sk-你的密钥     # 推荐：便宜、中文友好
# 或
OPENAI_API_KEY=sk-proj-你的密钥
# 或
ANTHROPIC_API_KEY=sk-ant-你的密钥
```

**API Key 获取指南** → [../INSTALLATION.md#api-密钥配置详解](../INSTALLATION.md#-api-密钥配置详解)

### 步骤 3: 安装扩展

**方式 A：从 VSIX 安装**

1. 下载 [insightor-vscode-0.1.1.vsix](insightor-vscode-0.1.1.vsix)
2. VSCode → 扩展 (`Ctrl+Shift+X`) → `...` 菜单 → 从 VSIX 安装
3. 重启 VSCode

**方式 B：从源码安装**

```bash
cd vscode-extension
npm install
npm run compile
npm run package
# 然后安装生成的 .vsix 文件
```

### 步骤 4: 开始审查

1. 打开命令面板 (`Ctrl+Shift+P`)
2. 输入 `Insightor: Full Review`
3. 输入 PR URL（如 `https://github.com/owner/repo/pull/123`）
4. 选择分析深度（`standard` 推荐）
5. 等待 30 秒，查看侧边栏结果！

---

## ✨ 功能特性

### 核心命令

| 命令 | 功能 | 耗时 |
|------|------|------|
| **Full Review** | 完整审查（描述 + 风险 + 代码审查） | ~45s |
| **Review PR** | 仅代码审查 | ~30s |
| **Describe PR** | 生成 PR 描述和文件概览 | ~15s |
| **Analyze Risks** | 识别安全、性能、并发风险 | ~20s |
| **Publish Review** | 发布审查结果到 GitHub | ~5s |

### 侧边栏视图

点击活动栏的 Insightor 图标查看：

```
📋 PR Summary
├── 📊 Score: 85/100 (Good to merge)
├── 🔴 CRITICAL (2)
│   ├── SQL 注入漏洞 → src/api/users.py:42
│   └── 未验证的用户输入 → src/auth.py:18
├── 🟡 HIGH (5)
├── 🔵 MEDIUM (8)
├── ⚪ LOW (3)
└── 📁 Files Changed (12)
    ├── [modified] src/api/users.py
    └── [added] src/utils/validator.py
```

**交互操作**：
- **点击发现** → 跳转到代码位置
- **Apply Fix** → 一键应用 AI 建议
- **刷新** → 重新加载结果

### 分析深度

| 深度 | 耗时 | Token | 适用场景 |
|------|------|-------|----------|
| **quick** | ~15s | ~3K | 小型 PR，快速检查 |
| **standard** | ~30s | ~8K | 大多数 PR（默认） |
| **deep** | ~60s | ~16K | 关键变更，复杂逻辑 |

---

## 📖 使用方法

### 基本工作流

```
1. 打开 VSCode
   ↓
2. Ctrl+Shift+P → "Insightor: Full Review"
   ↓
3. 输入 PR URL
   ↓
4. 选择分析深度
   ↓
5. 查看侧边栏结果 + Markdown 报告
   ↓
6. 编辑报告（可选）
   ↓
7. Ctrl+Shift+P → "Insightor: Publish Review"
   ↓
8. 发布到 GitHub
```

### 示例：审查并发布

```bash
# 1. 运行完整审查
Ctrl+Shift+P → "Insightor: Full Review"
输入: https://github.com/myorg/myrepo/pull/123
选择: standard

# 2. 编辑生成的 Markdown 文件
# insightor-full-review-123.md
# 勾选确认的发现，添加评论

# 3. 发布到 GitHub
Ctrl+Shift+P → "Insightor: Publish Review"
选择文件 → 确认发布
```

### 配置选项

打开 VSCode 设置 (`Ctrl+,`)，搜索 "insightor"：

```json
{
  // Python 可执行文件路径（虚拟环境用户必须配置）
  "insightor.pythonPath": "python",
  
  // 默认分析深度
  "insightor.defaultDepth": "standard",
  
  // 覆盖默认 LLM 模型（可选）
  "insightor.model": "",
  
  // 分析完成后自动打开结果
  "insightor.autoOpenResults": true,
  
  // 显示通知消息
  "insightor.showNotifications": true
}
```

**如果使用虚拟环境，必须配置 Python 路径：**

```json
{
  // Windows
  "insightor.pythonPath": "C:\\Users\\YourName\\Insightor\\venv\\Scripts\\python.exe",
  
  // macOS/Linux
  "insightor.pythonPath": "/Users/yourname/Insightor/venv/bin/python"
}
```

---

## 🔧 常见问题

### ❌ "Insightor CLI not found"

**原因**：Python 或 Insightor CLI 未正确安装

**解决**：
```bash
# 1. 验证 Python
python --version

# 2. 验证 Insightor
python -m insightor --version

# 3. 如果失败，重新安装
cd Insightor
pip install -e .

# 4. 在 VSCode 中配置 Python 路径
# 设置 → insightor.pythonPath → 虚拟环境的 python 路径
```

### ❌ "Review failed: API error"

**原因**：API Key 未配置或无效

**解决**：
```bash
# 1. 检查 .env 文件
cat .env  # 确保 API Key 存在

# 2. 验证格式（无引号、无空格）
DEEPSEEK_API_KEY=sk-xxx

# 3. 测试 API 连接
python -m insightor describe <PR_URL> --depth quick

# 4. 查看详细日志
# VSCode → View → Output → 选择 "Insightor"
```

### ❌ 结果不显示

**原因**：工作区未打开或结果文件未生成

**解决**：
```bash
# 1. 确保打开了工作区文件夹
# File → Open Folder

# 2. 检查结果文件
ls -la .insightor/reviews/

# 3. 点击侧边栏的刷新按钮

# 4. 查看输出日志
# View → Output → Insightor
```

### ❌ Python 路径错误（Windows）

**解决**：
```powershell
# 1. 查找 Python 路径
where python

# 2. 在 VSCode 设置中使用完整路径
{
  "insightor.pythonPath": "C:\\Python311\\python.exe"
}
```

**更多问题** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📚 完整文档

- **[INSTALL.md](INSTALL.md)** - 详细安装步骤
- **[QUICKSTART.md](QUICKSTART.md)** - 快速上手指南
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - 故障排查手册
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - 开发指南
- **[CHANGELOG.md](CHANGELOG.md)** - 版本历史

---

## 🎨 自定义

### 键盘快捷键

在 `keybindings.json` 中添加：

```json
[
  { "key": "ctrl+alt+r", "command": "insightor.reviewPR" },
  { "key": "ctrl+alt+f", "command": "insightor.fullReview" },
  { "key": "ctrl+alt+p", "command": "insightor.publishReview" }
]
```

### 项目级配置

在项目根目录创建 `.insightor.yml`：

```yaml
review:
  custom_rules: |
    1. 所有 API 路由必须有身份验证
    2. 使用参数化查询，禁止字符串拼接 SQL
  
  conventions: |
    - 使用 async/await 而非回调
    - 错误消息使用中文
  
  focus_categories: ["security", "performance"]
  min_severity: medium
  max_suggestions: 15
```

---

## 🤝 贡献

欢迎贡献！请查看 [DEVELOPMENT.md](DEVELOPMENT.md)。

---

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE)

---

## 📞 支持

- **报告问题**: [GitHub Issues](https://github.com/SCU-GuGuGaGa/Insightor/issues)
- **讨论区**: [GitHub Discussions](https://github.com/SCU-GuGuGaGa/Insightor/discussions)
- **主项目**: [Insightor](https://github.com/SCU-GuGuGaGa/Insightor)

---

<div align="center">

**Made with ❤️ by Insightor Team**

[⬆ 返回顶部](#insightor-vscode-扩展)

</div>
