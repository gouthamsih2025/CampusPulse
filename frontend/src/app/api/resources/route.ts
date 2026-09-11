import { NextRequest, NextResponse } from "next/server";

export interface IResource {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  stars?: number;
  author: string;
  tags: string[];
}

const fallbackResources: IResource[] = [
  {
    id: "res-1",
    title: "Developer Roadmaps (Web, Mobile, AI, DevOps)",
    description: "Community-driven visual step-by-step guides and learning paths for computer science and engineering students.",
    category: "Career & Learning Paths",
    url: "https://roadmap.sh",
    stars: 285000,
    author: "roadmapsh",
    tags: ["Frontend", "Backend", "FullStack", "Android", "Computer Science"],
  },
  {
    id: "res-2",
    title: "Free Programming Books & CS Courses",
    description: "Freely available programming books, university lecture notes, and interactive tutorials across 40+ technologies.",
    category: "Open Source Documentation",
    url: "https://github.com/EbookFoundation/free-programming-books",
    stars: 330000,
    author: "EbookFoundation",
    tags: ["Books", "Tutorials", "Free", "Open Source"],
  },
  {
    id: "res-3",
    title: "JavaScript & React Design Patterns",
    description: "Comprehensive guide to architectural design patterns, performance optimizations, and component best practices in modern React.",
    category: "Frontend Engineering",
    url: "https://patterns.dev",
    stars: 24000,
    author: "patterns-dev",
    tags: ["React", "TypeScript", "Design Patterns", "Web Performance"],
  },
  {
    id: "res-4",
    title: "Full Stack Open (University of Helsinki)",
    description: "Deep dive into modern web development with React, Node.js, Express, MongoDB, TypeScript, GraphQL, and CI/CD.",
    category: "Full Stack Courses",
    url: "https://fullstackopen.com/en/",
    stars: 18000,
    author: "University of Helsinki",
    tags: ["React", "Node.js", "MongoDB", "TypeScript", "REST"],
  },
  {
    id: "res-5",
    title: "System Design Primer & Distributed Systems",
    description: "Learn how to build large-scale systems, prepare for technical interviews, and understand database indexing & scaling.",
    category: "System Architecture",
    url: "https://github.com/donnemartin/system-design-primer",
    stars: 270000,
    author: "donnemartin",
    tags: ["Architecture", "Databases", "Scalability", "CS Fundamentals"],
  },
  {
    id: "res-6",
    title: "Android Kotlin Fundamentals & Jetpack Compose",
    description: "Official open-source curriculum and code samples for native Android development with modern Compose architecture.",
    category: "Mobile Development",
    url: "https://developer.android.com/courses",
    stars: 15000,
    author: "Google Developers",
    tags: ["Android", "Kotlin", "Compose", "Mobile"],
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "web";

    // Attempt to enrich with public GitHub Open Source API if available
    let githubItems: IResource[] = [];
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+topic:education&sort=stars&order=desc&per_page=4`,
        {
          headers: {
            "User-Agent": "CampusPulse-Academic-Platform",
            Accept: "application/vnd.github.v3+json",
          },
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.items && Array.isArray(data.items)) {
          githubItems = data.items.map((repo: any) => ({
            id: `gh-${repo.id}`,
            title: repo.name.replace(/[-_]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            description: repo.description || "Open source community learning repository.",
            category: "Public GitHub Learning Repositories",
            url: repo.html_url,
            stars: repo.stargazers_count,
            author: repo.owner?.login || "Open Source",
            tags: repo.topics?.slice(0, 4) || ["Open Source", "Education"],
          }));
        }
      }
    } catch (apiError) {
      console.warn("Public GitHub API fallback active:", apiError);
    }

    // Merge public API results with curated student resources
    const allResources = [...githubItems, ...fallbackResources];
    return NextResponse.json({
      success: true,
      source: githubItems.length > 0 ? "GitHub Open-Source Public API + Curated" : "Curated Student Library (Offline Mode)",
      count: allResources.length,
      resources: allResources,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        source: "Offline Curated Library",
        resources: fallbackResources,
        error: error.message,
      },
      { status: 200 }
    );
  }
}
