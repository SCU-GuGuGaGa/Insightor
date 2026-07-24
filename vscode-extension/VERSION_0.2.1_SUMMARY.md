# v0.2.1 完整更新说明

## 🎉 主要功能

### 1. Webview 预览界面
- 美观的 HTML 展示，支持完整内容滚动
- 可视化评分圆圈、分类卡片
- 代码对比展示

### 2. Markdown 报告生成
- Full Review 自动生成 `insightor-full-review-{PR}.md`
- 自动在编辑器中打开
- GitHub 友好格式

### 3. Publish Review
- 一键发布到 GitHub PR
- Dry Run 预览模式
- 自动提取 PR URL

### 4. Quick Actions 面板
- 侧边栏显示所有功能按钮
- 简洁的符号图标（▶ ✓ ≡ ! ↑ ⚙）
- 每个按钮有说明文字

### 5. 多种访问方式
- ① 侧边栏快捷操作面板（最直观）
- ② 状态栏按钮（最快捷）
- ③ 编辑器右键菜单
- ④ 文件资源管理器右键
- ⑤ 命令面板（Ctrl+Shift+P）

### 6. 代理支持
- 默认禁用代理（避免 VPN 冲突）
- 可选配置：`insightor.proxy.enabled`
- 自定义代理：`insightor.proxy.url`
- 修复关闭 VPN 后的连接错误

### 7. 优化的扩展图标
- 128x128 标准尺寸
- 28KB 文件大小
- 包体积减少 1MB

## 🐛 修复的问题

1. ✅ 修复 "command not found" 错误
2. ✅ 修复 TreeView 长文本截断
3. ✅ 修复 Full Review 后进度条不消失
4. ✅ 修复 VPN 关闭后连接失败（ECONNREFUSED 127.0.0.1:7892）

## 📝 技术改进

- 新增 `WelcomeViewProvider` - 快捷操作面板
- 新增 `MarkdownGenerator` - 报告生成服务
- 完善 `GitHubService` - 支持代理配置
- 完善 `LLMService` - 支持代理配置
- 优化进度通知流程

## 🚀 下一步

1. 修改 README.md（插件市场展示）
2. 更新使用文档
3. 发布到 VSCode Marketplace

## 📦 文件

- insightor-vscode-0.2.1.vsix (6.55 MB)
- 包含 4751 个文件
- 新图标：resources/icon.png (28 KB)

## 🔗 Git 提交

```bash
# 查看提交历史
git log --oneline -5

# 推送到远程
git push origin feactor/zhw

# 创建 PR
# 在 GitHub 上创建 Pull Request: feactor/zhw -> main
```

---

生成时间：2026-07-24
