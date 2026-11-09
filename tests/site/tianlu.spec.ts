import { expect, test } from "@playwright/test";

test("Tianlu identity, supplied avatar and introductory post survive navigation", async ({
	page,
}) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/天禄的小天地/);
	await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute(
		"href",
		/tianlu-avatar\.png/,
	);
	await expect(
		page.locator('img[src*="tianlu-avatar.png"]').first(),
	).toBeVisible();
	await expect(
		page
			.getByRole("link", { name: "写给小天地的第一封信", exact: false })
			.first(),
	).toBeVisible();
	await page.getByRole("link", { name: "关于", exact: true }).first().click();
	await expect(page).toHaveURL(/\/about\/$/);
	await expect(
		page.getByText("欢迎来到天禄的小天地", { exact: false }).first(),
	).toBeVisible();
	await page.goto("/posts/hello-tianlu/");
	await expect(page).toHaveTitle(/写给小天地的第一封信/);
	await expect(
		page.getByText("给这间小书房的三个约定", { exact: false }).first(),
	).toBeVisible();
});

test("Tianlu home fits a compact screen", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");
	await expect(page).toHaveTitle(/天禄的小天地/);
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= window.innerWidth,
		),
	).toBe(true);
});

test("Tianlu content stays personal and demo-free", async ({ page }) => {
	for (const path of ["/", "/about/", "/archive/", "/posts/hello-tianlu/"]) {
		await page.goto(path);
		await expect(page.locator("body")).not.toContainText(
			/AI 助手|AI 小助手|原有主题示例/,
		);
		// The only public GitHub link allowed is the upstream theme attribution.
		const links = await page
			.locator('a[href*="github.com"]')
			.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
		expect(
			links.every((href) => href === "https://github.com/LyraVoid/Shirone"),
		).toBe(true);
	}
	await page.goto("/archive/");
	await expect(
		page
			.getByRole("link", { name: "写给小天地的第一封信", exact: false })
			.first(),
	).toBeVisible();
	await expect(
		page.locator(
			'a[href*="/posts/markdown"], a[href*="/posts/guide"], a[href*="/posts/encrypted-demo"]',
		),
	).toHaveCount(0);
});
