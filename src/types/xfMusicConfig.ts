/** 小枫播放器（与旧侧栏播放器互斥使用）。 */
export interface XfMusicConfig {
	/** 关闭时不输出宿主或加载播放器。 */
	enable: boolean;
	/** 公开QQ音乐歌单ID，不是排行榜ID。 */
	playlistId: string;
}
