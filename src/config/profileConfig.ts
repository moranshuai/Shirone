import type { ProfileConfig } from "@/types/config";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 博主资料：头像 / 名称 / 简介 / 社交链接（侧栏 Profile 卡片、页脚、RSS 作者等消费）。
 * 类型见 src/types/config.ts。
 */
export const profileConfig: ProfileConfig = withUserConfig("profile", {
	avatar: "/assets/tianlu-avatar.png",
	name: "天禄",
	bio: "你好，我是天禄。这里收藏小小灵感、认真笔记，也留一盏温暖的灯。",
	links: [],
});
