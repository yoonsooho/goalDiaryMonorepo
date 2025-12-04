import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://goaldiary.vercel.app";
    const now = new Date();

    return [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${baseUrl}/main`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
        },
    ];
}
