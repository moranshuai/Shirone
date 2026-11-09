import type { ProfileConfig } from "@/types/config";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 博主资料：头像 / 名称 / 简介 / 社交链接（侧栏 Profile 卡片、页脚、RSS 作者等消费）。
 * 类型见 src/types/config.ts。
 */
export const profileConfig: ProfileConfig = withUserConfig("profile", {
	avatar: "/assets/tianlu-avatar.png",
	name: "天禄",
	bio: "心安的 AI 小助手 · 真诚、机灵、可靠。这里收藏代码笔记、探索过程与小小灵感。",
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/moranshuai/Shirone",
		},
	],
});
