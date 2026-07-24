# VSCode 扩展发布指南

## 🎯 发布方式

VSCode 扩展有 3 种发布方式：

### 方式 1: 发布到 VSCode 扩展市场（推荐）✨
- ✅ 用户可以直接搜索安装
- ✅ 自动更新
- ✅ 最专业的方式

### 方式 2: 发布 VSIX 文件到 GitHub Releases
- ✅ 用户手动下载安装
- ✅ 适合内部使用
- ✅ 无需审核

### 方式 3: 私有分发
- ✅ 直接分享 VSIX 文件
- ✅ 最快速的方式
- ✅ 适合测试

---

## 🚀 方式 1: 发布到 VSCode 扩展市场

### 步骤 1: 准备工作

#### 1.1 更新 package.json 元数据

```json
{
  "name": "insightor-vscode",
  "displayName": "Insightor - AI PR Review",
  "description": "AI-powered GitHub PR review in VSCode. No Python required!",
  "version": "0.2.0",
  "publisher": "your-publisher-name",  // ⚠️ 需要创建
  "icon": "resources/icon.png",
  "repository": {
    "type": "git",
    "url": "https://github.com/SCU-GuGuGaGa/Insightor.git"
  },
  "bugs": {
    "url": "https://github.com/SCU-GuGuGaGa/Insightor/issues"
  },
  "homepage": "https://github.com/SCU-GuGuGaGa/Insightor#readme",
  "keywords": [
    "github",
    "pull request",
    "code review",
    "ai",
    "llm",
    "typescript",
    "native"
  ],
  "categories": [
    "Other",
    "Linters"
  ]
}
```

#### 1.2 创建发布者账号

1. 访问：https://marketplace.visualstudio.com/manage/createpublisher
2. 使用 Microsoft 账号登录
3. 创建发布者 ID（如 `insightor-team`）
4. 记录你的发布者名称

#### 1.3 获取 Personal Access Token (PAT)

1. 访问：https://dev.azure.com
2. 点击右上角头像 → **Personal access tokens**
3. 点击 **+ New Token**
4. 设置：
   - Name: `VSCode Extension Publishing`
   - Organization: **All accessible organizations**
   - Expiration: 自定义（建议 90 天）
   - Scopes: **Marketplace** → 勾选 **Manage**
5. 点击 **Create**，复制生成的 token（格式：`xxx...`）

⚠️ **重要**：Token 只显示一次，请妥善保存！

### 步骤 2: 安装发布工具

```bash
cd vscode-extension
npm install -g @vscode/vsce
```

### 步骤 3: 登录发布者账号

```bash
vsce login your-publisher-name
# 输入刚才获取的 Personal Access Token
```

### 步骤 4: 打包扩展

```bash
# 编译代码
npm run compile

# 打包为 VSIX
vsce package
```

这会生成 `insightor-vscode-0.2.0.vsix` 文件。

### 步骤 5: 发布到市场

```bash
vsce publish
```

发布后：
- 审核时间：通常 5-30 分钟
- 发布后链接：https://marketplace.visualstudio.com/items?itemName=your-publisher-name.insightor-vscode

---

## 📦 方式 2: 发布到 GitHub Releases

### 步骤 1: 打包 VSIX

```bash
cd vscode-extension
npm run compile
npm run package
```

### 步骤 2: 创建 GitHub Release

```bash
# 1. 提交所有更改
git add .
git commit -m "feat: Native TypeScript implementation (v0.2.0)"

# 2. 创建标签
git tag vscode-v0.2.0
git push origin vscode-v0.2.0

# 3. 在 GitHub 上创建 Release
# 访问：https://github.com/SCU-GuGuGaGa/Insightor/releases/new
# 选择标签：vscode-v0.2.0
# 上传文件：insightor-vscode-0.2.0.vsix
```

### 步骤 3: 用户安装方式

用户下载 VSIX 后：
1. 打开 VSCode
2. 扩展面板 (`Ctrl+Shift+X`)
3. 点击 `...` → 从 VSIX 安装
4. 选择下载的文件

---

## 🔧 方式 3: 私有分发（测试用）

直接分享 `insightor-vscode-0.2.0.vsix` 文件给其他人。

---

## ⚠️ 发布前检查清单

### 1. 代码质量

```bash
# 运行 linter
npm run lint

# 编译检查
npm run compile

# 确保没有错误
```

### 2. 功能测试

- [ ] Native 模式能正常工作
- [ ] Python CLI 模式能正常工作（兼容性）
- [ ] 配置读取正确
- [ ] 命令都能执行
- [ ] 侧边栏正常显示

### 3. 文档完整

- [ ] README.md 清晰
- [ ] CHANGELOG.md 更新
- [ ] 配置说明完整

### 4. package.json 检查

- [ ] `version` 正确（建议改为 0.2.0）
- [ ] `publisher` 已设置
- [ ] `repository` URL 正确
- [ ] `keywords` 完整
- [ ] `icon` 文件存在

---

## 📝 推荐的发布流程

### 第一次发布（建议）

**步骤 1: GitHub Release（快速测试）**

```bash
# 1. 更新版本号
cd vscode-extension
# 编辑 package.json，version: "0.2.0"

# 2. 打包
npm run compile
npm run package

# 3. 提交代码
git add .
git commit -m "feat: Native TypeScript v0.2.0"
git push

# 4. 创建 Release
git tag vscode-v0.2.0
git push origin vscode-v0.2.0
# 在 GitHub 上传 VSIX
```

**步骤 2: 让几个人测试（1-2 周）**

在 README 中添加：
```markdown
## 安装

### 测试版本
1. 下载 [insightor-vscode-0.2.0.vsix](https://github.com/SCU-GuGuGaGa/Insightor/releases/download/vscode-v0.2.0/insightor-vscode-0.2.0.vsix)
2. VSCode → 扩展 → ... → 从 VSIX 安装
```

**步骤 3: 修复问题，发布到市场**

收集反馈 → 修复 bug → 发布到 VSCode 扩展市场

---

## 🎯 现在立即可以做的

### 选项 A: 快速测试（推荐）

```bash
# 1. 打包
cd vscode-extension
npm run compile
npm run package

# 2. 自己测试安装
# 在 VSCode 中从 VSIX 安装

# 3. 分享给团队成员测试
# 直接发送 .vsix 文件
```

### 选项 B: 正式发布

```bash
# 1. 创建发布者账号（见上文）
# 2. 获取 PAT token
# 3. 安装 vsce
npm install -g @vscode/vsce

# 4. 登录
vsce login your-publisher-name

# 5. 发布
vsce publish
```

---

## 📋 发布后的用户安装步骤

### 如果发布到市场

```
1. 打开 VSCode
2. 扩展面板 (Ctrl+Shift+X)
3. 搜索 "Insightor"
4. 点击安装 ✨
5. 配置 API Key（设置中搜索 "insightor"）
6. 开始使用！
```

### 如果通过 GitHub Releases

```
1. 下载 insightor-vscode-0.2.0.vsix
2. VSCode → 扩展 → ... → 从 VSIX 安装
3. 配置 API Key
4. 开始使用！
```

---

## 🐛 常见问题

### Q1: 发布失败 "Error: Make sure to edit the README.md file"

**解决**：确保 `vscode-extension/README.md` 存在且不是默认内容。

### Q2: "ERROR Missing publisher name"

**解决**：在 `package.json` 中添加：
```json
{
  "publisher": "your-publisher-name"
}
```

### Q3: "Personal Access Token verification failed"

**解决**：
1. 检查 token 是否正确复制
2. 确保 Scope 包含 **Marketplace (Manage)**
3. 重新生成 token

### Q4: 图标不显示

**解决**：确保 `resources/icon.png` 存在且大小为 128x128px。

---

## 📊 发布策略建议

### 阶段 1: 内部测试（当前）

- ✅ 打包 VSIX
- ✅ 团队成员测试
- ✅ 收集反馈

### 阶段 2: GitHub Release（1-2 周后）

- ✅ 修复主要 bug
- ✅ 完善文档
- ✅ 发布到 GitHub Releases

### 阶段 3: VSCode 市场（1 个月后）

- ✅ 功能完整
- ✅ 文档完善
- ✅ 测试充分
- ✅ 发布到官方市场

---

## 🎯 立即行动计划

### 今天可以做的

```bash
# 1. 更新版本号到 0.2.0
cd vscode-extension
# 编辑 package.json

# 2. 打包
npm run compile
npm run package

# 3. 测试安装
# 在你的 VSCode 中安装测试

# 4. 分享给团队
# 发送 .vsix 文件给团队成员
```

### 本周可以做的

1. ✅ 收集团队反馈
2. ✅ 修复发现的 bug
3. ✅ 完善 README
4. ✅ 准备发布到 GitHub Releases

### 下周可以做的

1. ✅ 创建发布者账号
2. ✅ 获取 PAT token
3. ✅ 发布到 VSCode 市场

---

## 📝 发布说明模板

创建 `CHANGELOG.md`：

```markdown
# Change Log

## [0.2.0] - 2026-07-24

### 🎉 重大更新

- **Native TypeScript 实现** - 无需 Python 环境！
- **一键安装** - 从 5-6 步简化到 1 步
- **配置简化** - 在 VSCode 设置中配置

### ✨ 新功能

- 纯 TypeScript 实现，去除 Python CLI 依赖
- 支持 OpenAI、Anthropic、DeepSeek
- 配置从 VSCode 设置读取
- 双模式支持（Native + Python CLI）

### 🐛 Bug 修复

- 改进错误提示
- 优化配置读取逻辑

### 📚 文档

- 新增完整安装指南
- 新增 5 分钟快速开始
- 改进配置说明

## [0.1.1] - Previous Version

- Initial release with Python CLI
```

---

## 🎊 总结

### 现在的状态

- ✅ 代码已完成
- ✅ 编译成功
- ⏳ 尚未打包发布

### 用户现在能用吗？

- ❌ 不能直接从市场安装（未发布）
- ✅ 可以通过 VSIX 文件安装（需要先打包）

### 下一步

**立即**：打包 VSIX，测试安装
```bash
cd vscode-extension
npm run package
```

**本周**：GitHub Release 测试版

**下周**：发布到 VSCode 市场

---

**需要我帮你执行打包命令吗？**
