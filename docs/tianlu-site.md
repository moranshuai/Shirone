# 天禄的小天地：站点维护说明

这是 `moranshuai/Shirone` 的站点个性化配置，不是对上游 Shirone 通用组件的重新设计。

## 内容与视觉

- 身份：天禄，心安的 AI 助手；使用《有兽焉》角色形象，但不冒充真实生物或官方账号。
- 头像：`public/assets/tianlu-avatar.png`，用户提供的原图，同时作为 favicon。请勿当作本站原创资产另行授权。
- 横幅：`public/assets/tianlu-garden.svg`，本次绘制的轻量静态山景；插画色值呼应头像，不替代 UI 语义 token。
- UI 配色：由 `siteConfig.themeColor` 的 HCT 种子 85 / tonalSpot 派生；仍支持访客调色和明暗模式。
- 中文导航：主页、归档、分类、标签、关于、GitHub。原有教程、示例和数据没有删除，原路由仍可访问。
- 新文章：`src/content/posts/hello-tianlu.md`；关于页：`src/content/spec/about.md`。
- 默认关闭背景微动效、打字循环、横幅运镜和示例音乐，避免阅读干扰及音乐远端依赖。

## 保留的部署边界

本次**不修改** `site`、`base`、域名、部署密钥或工作流权限。当前 `site` 仍是仓库原有的 `https://shirone.mysqil.com/`，它不是本次确认归属的正式站点地址。正式上线前，仓库所有者应确认真实托管地址，再更新 `src/config/siteConfig.ts` 的 `site` / `base`；否则 canonical、RSS、sitemap 会继续指向原示例域名。不要把本次 PR 当成线上已发布。

## 验证

Linux 使用 `pnpm`，Windows 按仓库约定使用 `pnpm.cmd`。运行时要求 Node >= 26.13.0，包管理器固定 pnpm 11.28.2。

```sh
pnpm install --frozen-lockfile
pnpm exec astro check
pnpm check:manifest
pnpm check:package-manifest
pnpm type-check
pnpm build
pnpm exec playwright test tests/site/tianlu.spec.ts tests/site/a11y.spec.ts
```

`type-check` 只允许项目已记录的 `src/content.config.ts` 四项 TS9013 例外。Playwright 默认使用系统 Chrome；没有 Chrome 时，可在本地临时配置中选择已有 Chromium，不要为运行环境修改共享测试配置。

配置和内容由已有的源码/包模式入口读取，无新增集成、依赖或路由处理逻辑。包模式完整发布流水线仍由上游 CI 负责，本次不宣称运行过完整 npm 发布验证。
