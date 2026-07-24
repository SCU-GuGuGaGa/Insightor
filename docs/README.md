# 📚 文档导航

欢迎来到 Insightor 文档中心！本指南帮助你快速找到需要的文档。

---

## 🎯 我想...

### 快速开始

| 我想... | 查看文档 | 时间 |
|---------|----------|------|
| **5 分钟快速开始** | [QUICKSTART.md](../QUICKSTART.md) | 5 分钟 |
| **完整安装指南** | [INSTALLATION.md](../INSTALLATION.md) | 10-15 分钟 |
| **使用 VSCode 扩展** | [vscode-extension/README.md](../vscode-extension/README.md) | 2 分钟 |

### 使用和配置

| 我想... | 查看文档 |
|---------|----------|
| **了解项目** | [README.md](../README.md) |
| **配置 API Key** | [INSTALLATION.md - API 密钥配置](../INSTALLATION.md#-api-密钥配置详解) |
| **使用 CLI 工具** | [README.md - CLI 使用](../README.md#-使用方法) |
| **使用 Web 控制台** | [web/README.md](../web/README.md) |
| **遇到问题** | [vscode-extension/TROUBLESHOOTING.md](../vscode-extension/TROUBLESHOOTING.md) |

### 开发和贡献

| 我想... | 查看文档 |
|---------|----------|
| **开发 VSCode 扩展** | [vscode-extension/DEVELOPMENT.md](../vscode-extension/DEVELOPMENT.md) |
| **发布 VSCode 扩展** | [vscode-extension/PUBLISHING_GUIDE.md](../vscode-extension/PUBLISHING_GUIDE.md) |
| **了解产品设计** | [PRODUCT.md](PRODUCT.md) |

### 历史和变更

| 我想... | 查看文档 |
|---------|----------|
| **查看版本历史** | [CHANGELOG.md](../CHANGELOG.md) |
| **了解最近改进** | [archive/COMPLETE_IMPROVEMENT_REPORT.md](archive/COMPLETE_IMPROVEMENT_REPORT.md) |
| **TypeScript 重构** | [vscode-extension/docs/typescript-refactor/](../vscode-extension/docs/typescript-refactor/) |

---

## 📁 文档结构

```
Insightor/
├── README.md                    # 项目主页
├── INSTALLATION.md              # 完整安装指南
├── QUICKSTART.md                # 5 分钟快速开始
├── CHANGELOG.md                 # 版本历史
│
├── docs/                        # 📁 文档中心
│   ├── README.md                # 本文件 - 文档导航
│   ├── PRODUCT.md               # 产品说明
│   ├── DOCS_CLEANUP_PLAN.md     # 文档整理方案
│   │
│   └── archive/                 # 📁 历史文档归档
│       ├── COMPLETE_IMPROVEMENT_REPORT.md     # 2024-07-24 完整改进报告
│       ├── FINAL_IMPROVEMENTS_SUMMARY.md      # 改进总结
│       ├── IMPROVEMENTS.md                    # 环境配置改进
│       ├── VSCODE_EXTENSION_ISSUES.md         # VSCode 扩展问题分析
│       ├── VSCODE_EXTENSION_READY.md          # 扩展发布说明
│       └── ...
│
├── vscode-extension/            # 📁 VSCode 扩展
│   ├── README.md                # 扩展主页
│   ├── INSTALL.md               # 扩展安装指南
│   ├── QUICKSTART.md            # 扩展快速开始
│   ├── TROUBLESHOOTING.md       # 故障排查
│   ├── DEVELOPMENT.md           # 开发指南
│   ├── PUBLISHING_GUIDE.md      # 发布指南
│   ├── CHANGELOG.md             # 扩展版本历史
│   │
│   └── docs/                    # 📁 扩展文档
│       ├── archive/             # 📁 归档
│       │   ├── delivery/        # 交付文档
│       │   └── development/     # 开发过程文档
│       │
│       └── typescript-refactor/ # TypeScript 重构
│           ├── plan.md          # 重构计划
│           └── complete.md      # 完成报告
│
└── web/                         # Web 控制台
    └── README.md
```

---

## 🎓 学习路径

### 路径 1: 新用户（CLI）

```
1. README.md - 了解项目
   ↓
2. QUICKSTART.md - 5 分钟快速开始
   ↓
3. INSTALLATION.md - 详细配置
   ↓
4. 开始使用！
```

### 路径 2: 新用户（VSCode 扩展）

```
1. vscode-extension/README.md - 了解扩展
   ↓
2. INSTALLATION.md - 配置环境
   ↓
3. vscode-extension/INSTALL.md - 安装扩展
   ↓
4. 开始使用！
```

### 路径 3: 开发者

```
1. README.md - 项目概览
   ↓
2. vscode-extension/DEVELOPMENT.md - 开发指南
   ↓
3. docs/typescript-refactor/ - 了解架构
   ↓
4. 开始贡献！
```

---

## 📖 核心文档说明

### 用户文档

- **[README.md](../README.md)** - 项目主页，包含项目介绍、功能特性、使用方法
- **[INSTALLATION.md](../INSTALLATION.md)** - 完整的安装配置指南，包含环境配置、API Key 获取、常见问题
- **[QUICKSTART.md](../QUICKSTART.md)** - 5 分钟快速开始，最精简的安装和使用流程
- **[CHANGELOG.md](../CHANGELOG.md)** - 版本历史和更新日志

### VSCode 扩展文档

- **[vscode-extension/README.md](../vscode-extension/README.md)** - 扩展主页
- **[vscode-extension/INSTALL.md](../vscode-extension/INSTALL.md)** - 扩展安装详细步骤
- **[vscode-extension/QUICKSTART.md](../vscode-extension/QUICKSTART.md)** - 扩展快速开始
- **[vscode-extension/TROUBLESHOOTING.md](../vscode-extension/TROUBLESHOOTING.md)** - 故障排查手册
- **[vscode-extension/DEVELOPMENT.md](../vscode-extension/DEVELOPMENT.md)** - 开发指南
- **[vscode-extension/PUBLISHING_GUIDE.md](../vscode-extension/PUBLISHING_GUIDE.md)** - 发布指南

### 开发文档

- **[PRODUCT.md](PRODUCT.md)** - 产品设计和说明
- **[vscode-extension/docs/typescript-refactor/](../vscode-extension/docs/typescript-refactor/)** - TypeScript 重构文档

### 归档文档

- **[archive/](archive/)** - 历史改进记录、问题分析、完成报告

---

## 🔍 快速搜索

### 按问题类型

**安装问题**
- Python 版本不对 → [INSTALLATION.md - 前置要求](../INSTALLATION.md#-前置要求)
- API Key 获取 → [INSTALLATION.md - API 密钥配置](../INSTALLATION.md#-api-密钥配置详解)
- Base URL 配置 → [INSTALLATION.md - 第三方网关](../INSTALLATION.md#3-第三方-api-网关可选)

**使用问题**
- 扩展找不到 CLI → [vscode-extension/TROUBLESHOOTING.md](../vscode-extension/TROUBLESHOOTING.md)
- 审查失败 → [vscode-extension/TROUBLESHOOTING.md](../vscode-extension/TROUBLESHOOTING.md)
- 结果不显示 → [vscode-extension/TROUBLESHOOTING.md](../vscode-extension/TROUBLESHOOTING.md)

**开发问题**
- 如何贡献代码 → [vscode-extension/DEVELOPMENT.md](../vscode-extension/DEVELOPMENT.md)
- 如何发布扩展 → [vscode-extension/PUBLISHING_GUIDE.md](../vscode-extension/PUBLISHING_GUIDE.md)

---

## 📞 获取帮助

如果文档中找不到答案：

1. **搜索 Issues** - https://github.com/SCU-GuGuGaGa/Insightor/issues
2. **提问讨论** - https://github.com/SCU-GuGuGaGa/Insightor/discussions
3. **提交 Issue** - https://github.com/SCU-GuGuGaGa/Insightor/issues/new

---

## 🎉 最近更新（2024-07-24）

- ✅ VSCode 扩展 Native TypeScript 实现
- ✅ 去除 Python 依赖
- ✅ 完善安装配置文档
- ✅ 整理文档结构

详见：[CHANGELOG.md](../CHANGELOG.md)

---

**需要帮助？从上面找到适合你的文档开始！** 📚
