import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
	// Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
	author: "Prathamesh Joshi",
	// Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
	date: {
		locale: "en-GB",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
	// Used as the default description meta property and webmanifest description
	description: "openaiml is where I make AI, ML, and quantum computing feel less like black boxes.",
	// HTML lang property, found in src/layouts/Base.astro L:18 & astro.config.ts L:48
	lang: "en-GB",
	// Meta property, found in src/components/BaseHead.astro L:42
	ogLocale: "en_GB",
	// Used to construct the meta title property found in src/components/BaseHead.astro L:11, and webmanifest name found in astro.config.ts L:42
	title: "OpenAI/ML",
};

// Used to generate links in both the Header & Footer.
export const menuLinks: { path: string; title: string }[] = [
	{
		path: "/",
		title: "Home",
	},
	// {
	// 	path: "/about/",
	// 	title: "About",
	// },
	{
		path: "/posts/",
		title: "Blogs",
	},
	{
		path: "/tools/",
		title: "Tools & Stack",
	},
	{
		path: "/tags/research-paper",
		title: "Research Papers",
	},
	{
		path: "/tags/",
		title: "Tags",
	},
	
];