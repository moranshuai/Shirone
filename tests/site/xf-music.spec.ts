import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
	test(`XF player is collapsed, silent and persists at ${width}px`, async ({
		page,
	}) => {
		await page.setViewportSize({ width, height: 900 });
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.addInitScript(() => {
			// Never permit audible playback, and count attempts even in shadow DOM.
			(window as unknown as { playAttempts: number }).playAttempts = 0;
			HTMLMediaElement.prototype.play = async () => {
				(window as unknown as { playAttempts: number }).playAttempts++;
			};
		});
		await page.route("https://music.api.xfyun.club/**", (route) =>
			route.fulfill({
				json: {
					code: 200,
					data: [
						{
							id: "test-1",
							title: "测试曲目",
							artist: "测试歌手",
							src: "https://example.invalid/test.mp3",
							duration: 120,
						},
					],
				},
			}),
		);
		await page.goto("/", { waitUntil: "domcontentloaded" });
		const host = page.locator("tianlu-music-player");
		await expect(host).toHaveCount(1);
		const box = host.locator(".music-player-box");
		await expect(box).toBeAttached();
		await expect(box).not.toHaveClass(/shrink/);
		await expect(host.locator(".song-name").first()).toContainText("测试曲目");
		await page.screenshot({
			path: `/home/node/.openclaw/media/xf-player/${width}-collapsed.png`,
		});
		expect(
			await page.evaluate(() =>
				Array.from(document.querySelectorAll("audio")).every((a) => a.paused),
			),
		).toBe(true);
		await host.evaluate((e) => e.setAttribute("data-test-persist", "yes"));
		await host.locator(".switching-btn").click();
		await expect(box).toHaveClass(/shrink/);
		await expect
			.poll(async () => (await box.boundingBox())?.x)
			.toBeGreaterThanOrEqual(0);
		const rect = await box.boundingBox();
		expect(rect?.width).toBeLessThanOrEqual(width);
		expect(rect?.x).toBeGreaterThanOrEqual(0);
		expect((rect?.x ?? 0) + (rect?.width ?? 0)).toBeLessThanOrEqual(width);
		await expect(host.locator(".switching-btn")).toHaveCSS(
			"transition-duration",
			"0s",
		);
		expect(
			await page.evaluate(
				() => (window as unknown as { playAttempts: number }).playAttempts,
			),
		).toBe(0);
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= innerWidth,
			),
		).toBe(true);
		await page.waitForFunction(() =>
			getComputedStyle(document.documentElement)
				.getPropertyValue("--mc-primary")
				.trim()
				.startsWith("#"),
		);
		const a11y = await new AxeBuilder({ page })
			.include("tianlu-music-player")
			.analyze();
		expect(a11y.violations).toEqual([]);
		await page.screenshot({
			path: `/home/node/.openclaw/media/xf-player/${width}-expanded.png`,
		});
		// A real link click exercises Swup even when the mobile navigation is hidden.
		await page
			.locator('a[href="/about/"]')
			.first()
			.evaluate((el) => (el as HTMLAnchorElement).click());
		await expect(page).toHaveURL(/\/about\/$/);
		await expect(host).toHaveAttribute("data-test-persist", "yes");
		await expect(host).toHaveCount(1);
		// SDK intentionally collapses its panel on route changes; retain the same
		// instance and reopen to inspect the dark skin, without touching playback.
		if (!(await box.getAttribute("class"))?.includes("shrink"))
			await host.locator(".switching-btn").click();
		await expect(box).toHaveClass(/shrink/);
		await page.evaluate(() => {
			localStorage.setItem("theme", "dark");
			document.documentElement.classList.add("dark");
		});
		await expect(host).toHaveAttribute("data-site-dark", "");
		await expect(host.locator(".control-box")).not.toHaveCSS(
			"background-color",
			"rgb(255, 255, 255)",
		);
		const darkA11y = await new AxeBuilder({ page })
			.include("tianlu-music-player")
			.analyze();
		expect(darkA11y.violations).toEqual([]);
		expect(
			await page.evaluate(
				() => (window as unknown as { playAttempts: number }).playAttempts,
			),
		).toBe(0);
		await page.screenshot({
			path: `/home/node/.openclaw/media/xf-player/${width}-dark.png`,
		});
	});
}

for (const failure of ["network", "http", "invalid"] as const) {
	test(`XF playlist ${failure} failure leaves the page usable`, async ({
		page,
	}) => {
		await page.route("https://music.api.xfyun.club/**", (route) =>
			failure === "network"
				? route.abort()
				: route.fulfill({
						status: failure === "http" ? 503 : 200,
						json: { code: 500, data: null },
					}),
		);
		await page.goto("/", { waitUntil: "domcontentloaded" });
		await expect(page.locator("[data-xf-music-runtime]")).toHaveAttribute(
			"data-playlist-state",
			"error",
		);
		await expect(page.locator("tianlu-music-player")).toHaveCount(1);
		await page
			.locator('a[href="/about/"]')
			.first()
			.evaluate((el) => (el as HTMLAnchorElement).click());
		await expect(page).toHaveURL(/\/about\/$/);
		await expect(page.locator("tianlu-music-player")).toHaveCount(1);
	});
}
