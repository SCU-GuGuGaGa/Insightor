# Release Notes - v0.2.1

## 🎉 主要改进

### 1. ✨ 全新的 Webview 预览界面

现在审查结果可以在美观的 Webview 中展示，解决了 TreeView 显示不完整的问题。

**特性：**
- 🎨 **现代化 UI** - 类似网页的展示界面，支持完整内容滚动
- 📊 **可视化评分** - 大号圆形评分展示，一目了然
- 🎯 **分类汇总** - Critical/High/Medium/Low 问题分类卡片
- 💡 **代码对比** - 当前代码和建议修复的对比展示
- 🔗 **点击跳转** - 可以直接点击文件位置跳转

**使用方式：**
完成任何审查后（Full Review / Review PR / Describe PR / Risks PR），会弹出提示询问是否打开 Webview 预览。

### 2. 📄 自动生成 Markdown 报告

Full Review 现在会自动生成 Markdown 文件，方便发布到 GitHub。

**特性：**
- 自动保存为 `insightor-full-review-{PR编号}.md`
- 包含完整的审查结果：评分、摘要、文件变更、详细发现
- 格式化的 Markdown，可以直接复制到 GitHub 评论
- 自动在编辑器中打开生成的文件

**生成位置：**
工作区根目录 / `insightor-full-review-{PR编号}.md`

### 3. 📤 完整的 Publish Review 功能

一键发布审查报告到 GitHub PR。

**特性：**
- 自动从 Markdown 提取 PR URL
- 一键发布评论到 GitHub
- Dry Run 模式预览发布内容
- 完整的错误处理和日志

### 4. 🎯 更友好的操作方式

不再需要总是使用 `Ctrl+Shift+P` 了！

**新增快捷入口：**

#### ① 状态栏按钮
- 左下角显示 `$(checklist) Insightor` 按钮
- 点击即可快速运行 Full Review

#### ② 右键菜单
- 在编辑器中右键 → 看到 Insightor 菜单组
- 包含：Full Review、Review PR、Describe PR、Analyze Risks

#### ③ 侧边栏工具栏
- 打开 Insightor 侧边栏
- 工具栏显示：Full Review、刷新、设置 按钮
- 一键操作，无需输入命令

#### ④ 文件资源管理器右键
- 右键点击生成的 `.md` 文件（insightor-*.md）
- 直接选择 "Publish Review" 发布

### 5. 🔧 其他改进

- 修复了扩展激活问题（添加 `onStartupFinished` 激活事件）
- 优化了所有审查命令的用户体验
- 统一了结果展示方式
- 清理了旧版本 VSIX 文件（只保留最新版）
- 简化了 activationEvents 配置

## 📦 使用指南

### Full Review 完整流程

1. 点击命令 `Insightor: Full Review`
2. 输入 GitHub PR URL
3. 选择分析深度（quick/standard/deep）
4. 等待审查完成
5. 自动打开生成的 Markdown 文件
6. 选择是否打开 Webview 预览查看美化后的结果

### 发布到 GitHub

生成的 Markdown 文件可以通过以下方式发布：

1. **自动发布（推荐）**：
   - 运行命令 `Insightor: Publish Review`
   - 选择要发布的 markdown 文件（例如 `insightor-full-review-123.md`）
   - 选择模式：
     - `No - Publish to GitHub`：直接发布评论到 PR
     - `Yes - Dry run (preview only)`：预览模式，不实际发布（查看输出面板预览内容）
   - 扩展会自动从文件中提取 PR URL 并发布评论

2. **手动复制**：
   - 打开生成的 `.md` 文件
   - 复制内容到 GitHub PR 评论框

## 🎯 Webview vs TreeView

| 功能 | TreeView (侧边栏) | Webview (新) |
|------|------------------|--------------|
| 快速浏览 | ✅ 折叠式树状结构 | ✅ 完整页面展示 |
| 内容完整性 | ⚠️ 长文本会被截断 | ✅ 完整显示 |
| 可读性 | ⚠️ 纯文本 | ✅ 格式化 HTML |
| 代码对比 | ❌ 不支持 | ✅ 并排展示 |
| 跳转文件 | ✅ 点击 finding | ✅ 链接跳转 |

**建议用法：**
- TreeView 用于快速浏览问题列表
- Webview 用于详细查看完整报告
- Markdown 文件用于发布到 GitHub

## 🐛 已修复问题

- ✅ 修复了 "command not found" 错误
- ✅ 修复了 TreeView 长文本显示不完整的问题
- ✅ 修复了 Full Review 不生成 Markdown 文件的问题
- ✅ 修复了扩展激活时机的问题

## 📋 下一步计划

- [ ] 完善 Publish Review 功能（自动发布到 GitHub）
- [ ] 添加历史审查记录管理
- [ ] 支持自定义审查模板
- [ ] 支持团队共享配置

## 💡 提示

如果遇到问题，请：
1. 查看输出面板（View → Output → 选择 "Insightor V2"）
2. 检查配置是否完整（GitHub Token、LLM API Key）
3. 提交 Issue 到 [GitHub](https://github.com/SCU-GuGuGaGa/Insightor/issues)

---

感谢使用 Insightor！🚀
