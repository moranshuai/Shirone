# 天禄的小天地：站点维护说明

这是 `moranshuai/Shirone` 的站点个性化配置，不是对上游 Shirone 通用组件的重新设计。

## 内容与视觉

- 介绍：简洁温暖的天禄介绍，不添加虚构身份或经历；角色形象不代表官方账号。
- 头像：`public/assets/tianlu-avatar.png`，用户提供的原图，同时作为 favicon。请勿当作本站原创资产另行授权。
- 横幅：`public/assets/tianlu-garden.svg`，本次绘制的轻量静态山景；插画色值呼应头像，不替代 UI 语义 token。
- UI 配色：由 `siteConfig.themeColor` 的 HCT 种子 85 / tonalSpot 派生；仍支持访客调色和明暗模式。
- 中文导航：主页、归档、分类、标签、关于；无 GitHub 社交或导航入口。删除 22 篇上游示例文章（含 1 篇草稿）、2 个示例系列及文章附属图片，仅保留第一封信。关闭示例项目和时间线页面，移除罗盘 GitHub 卡片；主题版权致谢保留。
- 新文章：`src/content/posts/hello-tianlu.md`；关于页：`src/content/spec/about.md`。
- 默认关闭背景微动效、打字循环、横幅运镜和原侧栏示例音乐，避免阅读干扰及音乐远端依赖。

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

## 小枫播放器（2026-11-10）

- `src/config/xfMusicConfig.ts` 启用 XF Music Player 1.0.8，QQ 音乐歌单 `9792383506`；旧 `musicConfig.enable` 保持关闭，不叠加播放器。
- 白紫「官网品牌」皮肤来自用户主题包，样式在 `src/utils/xf-music-theme.ts`。固定白紫是第三方皮肤的站点特例；暗色同步站点语义表面。
- 默认不播放、不自动展开、不记忆恢复播放、不启用音频可视化或樱花。播放器置于 Swup 替换容器外，仅创建一个实例，切页保留（SDK 可能随页面事件收起面板，不重建实例）。
- 公开接口为 `https://music.api.xfyun.club/api/v1/music/playlist-songs?platform=qq&playlistId=9792383506`。只请求公开支持的歌单，不存储或提交临时音频签名、不绕过会员/版权限制。歌曲授权、可播性及服务稳定性不由本站保证。
- 关闭：`xfMusicConfig.enable=false`，或内容配置 `config/xf-music.yaml` 设置 `enable: false`。禁用后不输出宿主，不加载播放器及其样式/外部接口。
- npm 依赖固定版本；源码/许可与保留修改权见 `public/licenses/xf-music-player/NOTICE.txt` 和同目录 LGPL 许可。不要把播放器重新声明为 MIT。

- 网络失败、HTTP 错误或非法响应时歌单静默为空，正文与站内切页仍可用；请求限时 8 秒，不循环重试。该远程歌单不回落到已禁用的示例音乐。
- 2026-11-10 现场元数据探测：公开接口 code 200、20 首，歌手包含许嵩及许嵩/郎朗；未验证每首音频可播性，也未进行有声播放。自动化使用固定歌单夹具，与现场探测分别记录。

- 验证：Astro check 0 errors / 0 warnings；类型检查通过（沿用 content.config.ts 已记录的 4 处 TS9013 例外）；生产构建、Pagefind 与字体预算通过。播放器 5 项回归、站点 3 项回归及首页/网格/归档/关于的明暗 8 项 axe 扫描通过，播放器展开态也在 1280px / 390px 下分别进行明暗 axe 扫描。
- 仓库已有检查限制：Markdown manifest 仍引用已移除的上游示例文章，故完整 `check:manifest` 未通过；atom manifest 与 package manifest 通过。Biome 无错误，保留已有 remark-restore-bare-directives.mjs 可选链警告；Astro 保留已有 execCommand 弃用提示。
- 禁用构建实测：24 个 HTML 无播放器宿主，10 个直接脚本入口均无播放器运行时代码/主题/接口引用；启用配置已恢复并重新构建。SDK 仍可作为独立懒加载产物存在于构建目录，但禁用页面没有加载入口。
