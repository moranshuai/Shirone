import type { MusicPlayer, SongInfo } from "xf-music-player";
import { xfMusicTheme } from "./xf-music-theme";

let mounting: Promise<void> | undefined;
let player: MusicPlayer | undefined;
let semanticsObserver: MutationObserver | undefined;

/** Persistent shell owner: never recreated on Swup content replacement. */
export function mountXfMusic(host: HTMLElement): Promise<void> {
	if (mounting) return mounting;
	mounting = mount(host).catch((error: unknown) => {
		mounting = undefined;
		host.dataset.state = "error";
		console.warn("XF Music Player unavailable", error);
	});
	return mounting;
}

async function mount(host: HTMLElement): Promise<void> {
	const playlistId = host.dataset.playlistId;
	if (!playlistId || !/^\d+$/.test(playlistId) || !host.isConnected) return;
	const [{ default: Player }] = await Promise.all([
		import("xf-music-player"),
		import("xf-music-player/modules/lyrics"),
		import("xf-music-player/modules/themes"),
	]);
	if (!host.isConnected || player) return;
	player = new Player({
		tagName: "tianlu-music-player",
		language: document.documentElement.lang.startsWith("zh") ? "zh" : "en",
		attributes: {
			theme: "xf-original-theme",
			customThemeName: "xf-site-brand-theme",
			customThemeStyle: xfMusicTheme,
			mode: "cloud",
			// The provider owns one bounded request for the persistent shell, not a route.
			audioProvider: async () => {
				try {
					const response = await fetch(
						`https://music.api.xfyun.club/api/v1/music/playlist-songs?platform=qq&playlistId=${playlistId}`,
						{ signal: AbortSignal.timeout(8000) },
					);
					if (
						!response.ok ||
						!response.headers.get("content-type")?.includes("application/json")
					)
						throw new Error("Invalid playlist response");
					const body = await response.text();
					if (new TextEncoder().encode(body).length > 512 * 1024)
						throw new Error("Playlist response too large");
					const payload = JSON.parse(body);
					if (payload.code !== 200 || !Array.isArray(payload.data))
						throw new Error("Playlist unavailable");
					const songs: SongInfo[] = payload.data.filter(
						(song: unknown): song is SongInfo => {
							if (!song || typeof song !== "object") return false;
							const item = song as Record<string, unknown>;
							return (
								(typeof item.id === "string" || typeof item.id === "number") &&
								typeof item.title === "string" &&
								item.title.length <= 500 &&
								["artist", "cover", "src", "lyricsUrl", "lyrics_url"].every(
									(key) =>
										item[key] == null ||
										(typeof item[key] === "string" &&
											(item[key] as string).length <= 4096),
								)
							);
						},
					);
					host.dataset.playlistState = songs.length ? "ready" : "empty";
					return songs;
				} catch (error) {
					host.dataset.playlistState = "error";
					console.warn("XF playlist unavailable", error);
					return [];
				}
			},
			autoplay: false,
			isAutoPopup: false,
			isAutoPlaylist: false,
			rememberPlayback: false,
			audioVisualizer: false,
			colorfulLyric: false,
			volume: 0.5,
			bottom: "88px",
		},
	});
	player.mount(host);
	host.dataset.state = "mounted";
	// The SDK prefixes custom skin selectors; at-rules cannot pass through that
	// rewriter. Install this preference boundary as native shadow CSS instead.
	const installMotionBoundary = (attempt = 0) => {
		const root =
			player?.PlayerElement?.shadowRoot?.querySelector(
				"music-player-box",
			)?.shadowRoot;
		if (!root) {
			if (attempt < 120)
				requestAnimationFrame(() => installMotionBoundary(attempt + 1));
			return;
		}
		const style = document.createElement("style");
		style.textContent = `@media (prefers-reduced-motion: reduce) {
			/* !important boundary: SDK-generated motion; site owns user preference. */
			:host, *, *::before, *::after { animation: none !important; transition: none !important; }
		}`;
		root.append(style);
		// Repair SDK semantics using its own localized tooltip copy, not new UI text.
		const enhance = () => {
			for (const lyrics of root.querySelectorAll(".lyrics-control-box")) {
				// Upstream labels this toggle separately from changing lyric text.
				const title = lyrics.getAttribute("title");
				if (title) lyrics.setAttribute("aria-description", title);
				lyrics.removeAttribute("aria-label");
			}
			for (const heading of root.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
				heading.setAttribute("role", "presentation");
			}
			for (const input of root.querySelectorAll<HTMLInputElement>("input")) {
				const tip = host.dataset.lyricsLabel;
				if (tip) input.setAttribute("aria-label", tip);
			}
			for (const list of root.querySelectorAll<HTMLElement>(
				".song-list-control",
			))
				list.tabIndex = 0;
		};
		enhance();
		semanticsObserver = new MutationObserver(enhance);
		semanticsObserver.observe(root, { childList: true, subtree: true });
	};
	installMotionBoundary();
	const syncTheme = () => {
		const el = player?.PlayerElement;
		if (el) {
			const dark = document.documentElement.classList.contains("dark");
			const colors: Record<string, string> = {
				bg: "--surface-container",
				accent: "--inverse-primary",
				text: "--on-surface",
				secondary: "--on-surface-variant",
				line: "--outline-variant",
				soft: "--surface-container-high",
			};
			for (const [name, token] of Object.entries(colors)) {
				if (dark) el.style.setProperty(`--tianlu-xf-${name}`, `var(${token})`);
				else el.style.removeProperty(`--tianlu-xf-${name}`);
			}
		}

		player?.PlayerElement?.toggleAttribute(
			"data-site-dark",
			document.documentElement.classList.contains("dark"),
		);
	};
	syncTheme();
	const observer = new MutationObserver(syncTheme);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});
	// No unload/beforeunload: BFCache keeps the persistent shell and media state.
	// A real page teardown releases everything; Swup navigation leaves it untouched.
	window.addEventListener(
		"pagehide",
		(event) => {
			if (event.persisted) return;
			observer.disconnect();
			semanticsObserver?.disconnect();
			semanticsObserver = undefined;
			void player?.destroy();
			player = undefined;
			mounting = undefined;
		},
		{ once: true },
	);
}
