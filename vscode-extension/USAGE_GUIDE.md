# Insightor VSCode 扩展使用指南

## 🚀 快速开始

### 1. 配置扩展

首次使用需要配置 GitHub Token 和 LLM API Key：

```
打开设置：Ctrl+, (Windows/Linux) 或 Cmd+, (Mac)
搜索 "insightor"
```

**必需配置：**
- `insightor.githubToken` - GitHub Personal Access Token ([获取方法](https://github.com/settings/tokens))
- `insightor.llm.provider` - 选择 LLM 提供商（openai / anthropic / deepseek）
- `insightor.llm.apiKey` - LLM API Key

**可选配置：**
- `insightor.llm.baseUrl` - API 网关地址（使用官方 API 时无需配置）
- `insightor.llm.model` - 指定模型（留空使用默认）
- `insightor.defaultDepth` - 默认分析深度（quick / standard / deep）

### 2. 运行审查

#### 方式一：命令面板

1. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac)
2. 输入 "Insightor"
3. 选择命令：
   - **Full Review** - 完整审查（推荐）
   - **Review PR** - 代码审查
   - **Describe PR** - 生成 PR 描述
   - **Analyze Risks** - 风险分析

#### 方式二：侧边栏

1. 点击左侧的 Insightor 图标
2. 点击工具栏上的按钮

## 📊 完整审查流程

### Step 1: 运行 Full Review

```
Ctrl+Shift+P → Insightor: Full Review
```

1. 输入 PR URL，例如：`https://github.com/owner/repo/pull/123`
2. 选择分析深度：
   - `quick` - 快速扫描（~30s）
   - `standard` - 标准分析（~2min）⭐ 推荐
   - `deep` - 深度分析（~5min）
3. 等待分析完成

### Step 2: 查看结果

分析完成后，扩展会：

1. ✅ 自动打开生成的 Markdown 文件
   - 文件位置：`工作区根目录/insightor-full-review-{PR编号}.md`
   - 包含完整的审查报告

2. 🎯 弹出提示询问是否打开 Webview 预览
   - 点击 "打开 Webview 预览" 查看美化的 HTML 界面
   - 或点击 "仅查看 Markdown" 继续编辑文件

3. 📋 在侧边栏显示结果树
   - 按严重程度分组的问题列表
   - 点击问题跳转到代码位置

### Step 3: 发布到 GitHub

#### 自动发布（推荐）

```
Ctrl+Shift+P → Insightor: Publish Review
```

1. 选择要发布的 Markdown 文件（例如 `insightor-full-review-123.md`）
2. 选择模式：
   - **No - Publish to GitHub** - 直接发布到 PR
   - **Yes - Dry run** - 预览模式（查看输出面板）
3. 发布成功后可以在 PR 页面看到评论

#### 手动复制

1. 打开生成的 `.md` 文件
2. 复制内容（Ctrl+A, Ctrl+C）
3. 粘贴到 GitHub PR 评论框

## 🎨 查看选项

### 1. TreeView（侧边栏）

**优点：**
- 快速浏览问题列表
- 按严重程度分组
- 点击跳转到代码

**适用场景：**
- 快速扫描有哪些问题
- 逐个检查和修复

### 2. Webview（HTML 预览）

**优点：**
- 美观的可视化界面
- 完整内容展示（无截断）
- 代码对比展示
- 大号评分指示器

**适用场景：**
- 查看完整报告
- 展示给团队成员
- 截图分享

### 3. Markdown 文件

**优点：**
- 可以直接编辑
- 适合发布到 GitHub
- 便于存档和分享

**适用场景：**
- 发布评论到 PR
- 保存审查记录
- 团队协作

## 🔧 其他命令

### Review PR（代码审查）

仅运行代码审查，不包含描述和风险分析：

```
Ctrl+Shift+P → Insightor: Review PR
```

- 支持增量模式（只审查新改动）
- 聚焦代码质量问题

### Describe PR（生成描述）

生成 PR 的描述和文件变更摘要：

```
Ctrl+Shift+P → Insightor: Describe PR
```

- PR 类型识别（Feature / Bugfix / Refactor 等）
- 变更概览
- 文件级别的改动说明

### Analyze Risks（风险分析）

专注分析潜在风险：

```
Ctrl+Shift+P → Insightor: Analyze Risks
```

- 可选择聚焦领域：security / performance / concurrency
- 识别高风险改动

### Open Settings（打开设置）

快速打开 Insightor 设置：

```
Ctrl+Shift+P → Insightor: Open Settings
```

## 💡 使用技巧

### 技巧 1：查看详细日志

如果遇到问题，查看输出面板：

```
View → Output → 选择 "Insightor V2"
```

### 技巧 2：Dry Run 测试

发布前先用 Dry Run 预览：

```
Insightor: Publish Review → 选择文件 → Yes - Dry run
```

在输出面板查看将要发布的内容。

### 技巧 3：保存审查历史

生成的 Markdown 文件可以提交到仓库：

```bash
git add insightor-full-review-*.md
git commit -m "docs: add PR review report"
```

### 技巧 4：自定义分析深度

根据 PR 大小选择合适的深度：

- 小型 PR（< 5 文件）→ `quick`
- 中型 PR（5-20 文件）→ `standard`
- 大型 PR（> 20 文件）→ `deep`

### 技巧 5：批量审查

对于多个 PR，可以依次运行 Full Review：

1. 运行第一个 PR 的审查
2. 等待完成后关闭 Webview
3. 运行下一个 PR 的审查
4. 所有生成的文件都会保存在工作区

## ⚠️ 常见问题

### Q: 提示 "配置不完整"

**解决方法：**
1. 打开设置检查 GitHub Token 和 LLM API Key
2. 确保 Token 有正确的权限（repo, pull_request）
3. 运行 `Insightor: Open Settings` 快速配置

### Q: 审查失败或超时

**解决方法：**
1. 检查网络连接
2. 尝试切换分析深度为 `quick`
3. 查看输出面板的详细错误信息
4. 确认 API Key 有足够的配额

### Q: Webview 不显示

**解决方法：**
1. 检查是否点击了提示中的按钮
2. 手动运行命令后在侧边栏查看 TreeView
3. 重启 VSCode

### Q: Publish 失败

**解决方法：**
1. 确认 GitHub Token 有 `repo` 权限
2. 检查 PR URL 是否正确
3. 使用 Dry Run 模式测试
4. 查看输出面板的错误详情

## 📚 更多资源

- [GitHub 仓库](https://github.com/SCU-GuGuGaGa/Insightor)
- [安装指南](./INSTALL.md)
- [快速开始](./QUICKSTART.md)
- [故障排除](./TROUBLESHOOTING.md)
- [发布指南](./PUBLISHING_GUIDE.md)

## 🆘 获取帮助

遇到问题？

1. 查看 [故障排除文档](./TROUBLESHOOTING.md)
2. 搜索 [已有 Issues](https://github.com/SCU-GuGuGaGa/Insightor/issues)
3. 提交 [新 Issue](https://github.com/SCU-GuGuGaGa/Insightor/issues/new)

---

🤖 **Insightor** - 让 AI 帮你做 Code Review！
