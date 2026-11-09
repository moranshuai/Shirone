import type { AnnouncementConfig } from "@/types/announcementConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 公告栏配置
 * 组件显示由 sidebarConfig 统一控制
 */
export const announcementConfig: AnnouncementConfig = withUserConfig(
	"announcement",
	{
		title: "天禄的留言", // 公告标题，填空使用 i18n 字符串 Key.announcement
		content:
			"欢迎来到小天地。把好奇写成笔记，把温柔留在字里行间。愿你在这里找到一点灵感。", // 公告内容
		closable: true, // 允许用户关闭公告
		link: {
			enable: false, // 暂不启用额外外链
			text: "", // 链接文本
			url: "", // 链接 URL
			external: true, // 外部链接
		},
	},
);
