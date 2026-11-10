import type { XfMusicConfig } from "../types/xfMusicConfig";
import { withUserConfig } from "../utils/config-overlay";

// 本站已授权启用；其他站点可用 xf-music.yaml 覆盖关闭。
export const xfMusicConfig: XfMusicConfig = withUserConfig("xfMusic", {
	enable: true,
	playlistId: "9792383506",
});
