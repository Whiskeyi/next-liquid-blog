import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}/`,
    lastModified: post.date
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date().toISOString()
    },
    {
      url: `${siteConfig.url}/archive/`,
      lastModified: new Date().toISOString()
    },
    ...posts
  ];
}
