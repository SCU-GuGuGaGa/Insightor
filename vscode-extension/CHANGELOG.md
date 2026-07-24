# Changelog

All notable changes to the "insightor-vscode" extension will be documented in this file.

## [0.2.3] - 2026-07-24

### Added
- ✨ **Webview Preview** - Beautiful HTML preview for review results with modern UI
- 📄 **Markdown Report Generation** - Full Review now auto-generates markdown files (insightor-full-review-{PR}.md)
- 📤 **Publish Review** - Auto-publish review comments to GitHub PR with dry-run support
- 🎨 **Visual Score Display** - Large circular score indicator in Webview
- 📊 **Findings Dashboard** - Categorized cards showing Critical/High/Medium/Low counts
- 💡 **Code Comparison View** - Side-by-side display of current code and suggested fixes
- 🎯 **Status Bar Button** - Quick access to Full Review from bottom-left status bar
- 📋 **Editor Context Menu** - Right-click in editor to access Insightor commands
- 🗂️ **Explorer Context Menu** - Right-click on .md files to publish directly
- 🔘 **Sidebar Toolbar Buttons** - One-click access to Full Review, Refresh, and Settings

### Fixed
- ✅ Fixed "command not found" error by adding `onStartupFinished` activation event
- ✅ Fixed TreeView long text truncation issue with Webview alternative
- ✅ Fixed missing markdown file generation in Full Review
- ✅ Improved extension activation timing

### Changed
- 🔄 All review commands now offer Webview preview option after completion
- 📝 Full Review automatically opens generated markdown file
- 🎯 Enhanced user experience with actionable prompts and multiple access points
- 📤 Publish Review now fully functional (reads markdown, extracts PR URL, posts comment)
- 🧹 Cleaned up activationEvents (simplified to onStartupFinished only)
- 🗑️ Removed old VSIX files (kept latest version only)

### Technical
- Added `MarkdownGenerator` service for report generation
- Updated `InsightorServiceV2.fullReview()` to save markdown reports
- Enhanced `CommandHandler` with `showReviewWebview()` method
- Improved type safety across all services

## [0.2.2] - 2026-07-24

### Fixed
- Fixed extension activation issues on marketplace

## [0.2.0] - 2026-07-24

### Added
- 🚀 **Native TypeScript Implementation** - No Python required!
- Pure TypeScript services using @octokit/rest for GitHub API
- Multi-provider LLM support (OpenAI, Anthropic, DeepSeek)
- Multi-level configuration (VSCode settings → env vars → .env)
- Configuration wizard for first-time setup

### Services
- `GitHubService` - GitHub API integration
- `LLMService` - Multi-provider LLM abstraction
- `AnalysisService` - PR analysis logic
- `ConfigService` - Configuration management
- `InsightorServiceV2` - Pure TypeScript orchestrator

### Configuration
- `insightor.useNativeImplementation` - Toggle between native/Python modes
- `insightor.githubToken` - GitHub personal access token
- `insightor.llm.provider` - LLM provider selection
- `insightor.llm.apiKey` - LLM API key
- `insightor.llm.baseUrl` - Optional API gateway URL
- `insightor.llm.model` - Model override

## [0.1.0] - 2026-05-30

### Added
- Initial release of Insightor VSCode extension
- Command: Review PR - Run complete code review
- Command: Describe PR - Generate PR description
- Command: Analyze Risks - Identify security and performance risks
- Command: Full Review - Run all analysis tools
- Command: Publish Review - Publish to GitHub
- Sidebar view with tree structure for review results
- Findings organized by severity (critical, high, medium, low, info)
- Click to jump to code location
- Apply fix button for suggested code changes
- Webview panel for detailed finding information
- Configuration options for Python path, depth, model
- Progress notifications during analysis
- Output channel for detailed logs

### Features
- Integration with Insightor CLI
- Support for quick/standard/deep analysis depths
- Incremental review mode
- Dry-run mode for publish
- Auto-open results after analysis
- Merge readiness score display
- File walkthrough view
- Syntax highlighting in code suggestions

### Configuration
- `insightor.pythonPath` - Python executable path
- `insightor.defaultDepth` - Default analysis depth
- `insightor.model` - LLM model override
- `insightor.autoOpenResults` - Auto-open results
- `insightor.showNotifications` - Show notifications

## [Unreleased]

### Planned
- Complete Publish Review functionality (auto-post to GitHub)
- Inline code decorations for findings
- Quick fix code actions
- Diff view for suggested changes
- History of past reviews
- Custom rule configuration UI
- Multi-PR batch review
- Integration with GitHub Pull Requests extension
- Code lens for review status
- Diagnostic integration
