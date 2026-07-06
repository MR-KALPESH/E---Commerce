import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

// Get all blogs (cached)
export const getBlogs = unstable_cache(
  async () => {
    return await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });
  },
  ["blogs"],
  { tags: ["blogs"] }
);

// Get single blog by slug (cached)
export const getBlogBySlug = unstable_cache(
  async (slug: string) => {
    return await prisma.blog.findUnique({
      where: { slug },
    });
  },
  ["blogs"],
  { tags: ["blogs"] }
);
