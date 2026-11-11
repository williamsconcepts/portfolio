"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Column,
  Row,
  Flex,
  Heading,
  Text,
  Button,
  Badge,
  Input,
  Spinner,
  Line,
  SmartLink,
} from "@once-ui-system/core";
import { ProfileEditor } from "@/components/admin/ProfileEditor";

interface PostItem {
  slug: string;
  metadata: {
    title: string;
    subtitle?: string;
    publishedAt: string;
    summary: string;
    tag?: any;
    image?: string;
    status?: "published" | "draft";
  };
  content?: string;
}

interface ProjectItem {
  slug: string;
  metadata: {
    title: string;
    subtitle?: string;
    publishedAt: string;
    summary: string;
    images?: string[];
    link?: string;
    tag?: any;
    status?: "published" | "draft";
  };
  content?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posts" | "projects" | "profile">("posts");

  // Posts State
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [deletingPostSlug, setDeletingPostSlug] = useState<string | null>(null);

  // Projects State
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [deletingProjectSlug, setDeletingProjectSlug] = useState<string | null>(null);

  // DB & Sync State
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  const formatTag = (tag: any): string => {
    if (Array.isArray(tag)) return tag.filter(Boolean).join(", ");
    if (typeof tag === "string") return tag;
    return "";
  };

  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const res = await fetch("/api/admin/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setIsDbConnected(Boolean(data.isDbConfigured));
      } else if (res.status === 401) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchProjects();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const handleSyncPosts = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus(null);
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus(data.message || "Posts synced successfully!");
        fetchPosts();
      } else {
        setSyncStatus(data.message || "Failed to sync posts");
      }
    } catch (err: any) {
      setSyncStatus(err?.message || "Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncProjects = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus(null);
      const res = await fetch("/api/admin/seed-projects", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus(data.message || "Projects synced successfully!");
        fetchProjects();
      } else {
        setSyncStatus(data.message || "Failed to sync projects");
      }
    } catch (err: any) {
      setSyncStatus(err?.message || "Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeletePost = async (slug: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete post "${title}"?`)) {
      return;
    }

    try {
      setDeletingPostSlug(slug);
      const res = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.slug !== slug));
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      alert("Error deleting post");
    } finally {
      setDeletingPostSlug(null);
    }
  };

  const handleDeleteProject = async (slug: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete project "${title}"?`)) {
      return;
    }

    try {
      setDeletingProjectSlug(slug);
      const res = await fetch(`/api/admin/projects/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.slug !== slug));
      } else {
        alert("Failed to delete project");
      }
    } catch (err) {
      alert("Error deleting project");
    } finally {
      setDeletingProjectSlug(null);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const q = searchQuery.toLowerCase();
    const title = String(p.metadata.title || "").toLowerCase();
    const summary = String(p.metadata.summary || "").toLowerCase();
    const tag = formatTag(p.metadata.tag).toLowerCase();
    const slug = String(p.slug || "").toLowerCase();
    return title.includes(q) || summary.includes(q) || tag.includes(q) || slug.includes(q);
  });

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    const title = String(p.metadata.title || "").toLowerCase();
    const summary = String(p.metadata.summary || "").toLowerCase();
    const tag = formatTag(p.metadata.tag).toLowerCase();
    const slug = String(p.slug || "").toLowerCase();
    return title.includes(q) || summary.includes(q) || tag.includes(q) || slug.includes(q);
  });

  return (
    <Column fillWidth maxWidth="l" gap="24" paddingY="32">
      {/* Top Header */}
      <Row fillWidth horizontal="between" vertical="center" s={{ direction: "column", gap: "16" }}>
        <Column gap="4">
          <Row gap="8" vertical="center">
            <Heading variant="heading-strong-l">Portfolio Admin</Heading>
            {isDbConnected ? (
              <Badge background="success-alpha-weak" onBackground="success-strong">
                Neon Postgres Active
              </Badge>
            ) : (
              <Badge background="warning-alpha-weak" onBackground="warning-strong">
                Local Storage Mode
              </Badge>
            )}
          </Row>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Manage your blog posts, work case studies, and personal profile in one place.
          </Text>
        </Column>

        <Row gap="8" vertical="center">
          <Button
            variant="secondary"
            size="m"
            onClick={handleLogout}
          >
            Log Out
          </Button>

          {activeTab === "posts" && (
            <Button
              variant="primary"
              size="m"
              onClick={() => router.push("/admin/new")}
            >
              + New Post
            </Button>
          )}

          {activeTab === "projects" && (
            <Button
              variant="primary"
              size="m"
              onClick={() => router.push("/admin/projects/new")}
            >
              + New Project
            </Button>
          )}
        </Row>
      </Row>

      {/* Tabs Switcher */}
      <Row
        fillWidth
        gap="8"
        background="surface"
        padding="4"
        radius="m-4"
        border="neutral-alpha-weak"
      >
        <Button
          size="m"
          variant={activeTab === "posts" ? "primary" : "secondary"}
          onClick={() => {
            setActiveTab("posts");
            setSearchQuery("");
          }}
        >
          📝 Blog Posts ({posts.length})
        </Button>
        <Button
          size="m"
          variant={activeTab === "projects" ? "primary" : "secondary"}
          onClick={() => {
            setActiveTab("projects");
            setSearchQuery("");
          }}
        >
          💼 Work & Projects ({projects.length})
        </Button>
        <Button
          size="m"
          variant={activeTab === "profile" ? "primary" : "secondary"}
          onClick={() => {
            setActiveTab("profile");
            setSearchQuery("");
          }}
        >
          👤 About & Profile
        </Button>
      </Row>

      {/* Neon DB Info Banner */}
      {isDbConnected ? (
        <Row
          fillWidth
          padding="16"
          background="surface"
          border="neutral-alpha-weak"
          radius="m"
          horizontal="between"
          vertical="center"
          s={{ direction: "column", gap: "12" }}
        >
          <Column gap="2">
            <Text variant="label-default-s">⚡ Neon Postgres Connected</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Content is saved directly to your serverless Postgres database on Vercel.
            </Text>
          </Column>

          <Row gap="8" vertical="center">
            {syncStatus && (
              <Text variant="body-default-xs" onBackground="success-strong">
                {syncStatus}
              </Text>
            )}
            {activeTab === "posts" && (
              <Button
                variant="secondary"
                size="s"
                onClick={handleSyncPosts}
                disabled={isSyncing}
              >
                {isSyncing ? "Syncing..." : "Sync Local Posts to Neon"}
              </Button>
            )}
            {activeTab === "projects" && (
              <Button
                variant="secondary"
                size="s"
                onClick={handleSyncProjects}
                disabled={isSyncing}
              >
                {isSyncing ? "Syncing..." : "Sync Local Projects to Neon"}
              </Button>
            )}
          </Row>
        </Row>
      ) : (
        <Row
          fillWidth
          padding="16"
          background="warning-alpha-weak"
          border="warning-alpha-medium"
          radius="m"
          horizontal="between"
          vertical="center"
          s={{ direction: "column", gap: "12" }}
        >
          <Column gap="2">
            <Text variant="label-default-s" onBackground="warning-strong">
              ℹ️ Running in Local Mode
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-strong">
              To connect Neon on Vercel, attach the Neon Postgres integration in your Vercel project dashboard.
              Changes created now are saved to your local MDX files.
            </Text>
          </Column>
        </Row>
      )}

      {/* ==================== TAB 1: BLOG POSTS ==================== */}
      {activeTab === "posts" && (
        <Column fillWidth gap="16">
          <Row fillWidth horizontal="between" vertical="center" s={{ direction: "column", gap: "12" }}>
            <Row fillWidth maxWidth={24}>
              <Input
                id="search-posts"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Row>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Showing {filteredPosts.length} of {posts.length} posts
            </Text>
          </Row>

          {isLoadingPosts ? (
            <Flex fillWidth paddingY="64" horizontal="center">
              <Spinner size="m" />
            </Flex>
          ) : filteredPosts.length === 0 ? (
            <Column
              fillWidth
              padding="48"
              background="surface"
              border="neutral-alpha-weak"
              radius="l"
              center
              gap="16"
            >
              <Heading variant="heading-strong-s">No posts found</Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {searchQuery
                  ? "No posts match your search query."
                  : "You haven't created any posts yet."}
              </Text>
              <Button variant="primary" onClick={() => router.push("/admin/new")}>
                Create your first post
              </Button>
            </Column>
          ) : (
            <Column fillWidth gap="12">
              {filteredPosts.map((post) => {
                const isDeleting = deletingPostSlug === post.slug;
                const isDraft = post.metadata.status === "draft";
                const tagDisplay = formatTag(post.metadata.tag);

                return (
                  <Row
                    key={post.slug}
                    fillWidth
                    padding="20"
                    background="surface"
                    border="neutral-alpha-weak"
                    radius="m"
                    horizontal="between"
                    vertical="center"
                    s={{ direction: "column", gap: "16", align: "flex-start" }}
                  >
                    <Column gap="8" fillWidth>
                      <Row gap="8" vertical="center" wrap>
                        <Heading variant="heading-strong-s">
                          {post.metadata.title}
                        </Heading>
                        {isDraft ? (
                          <Badge background="warning-alpha-weak" onBackground="warning-strong">
                            Draft
                          </Badge>
                        ) : (
                          <Badge background="success-alpha-weak" onBackground="success-strong">
                            Published
                          </Badge>
                        )}
                        {tagDisplay && (
                          <Badge background="neutral-alpha-weak" onBackground="neutral-medium">
                            {tagDisplay}
                          </Badge>
                        )}
                      </Row>

                      <Text
                        variant="body-default-s"
                        onBackground="neutral-weak"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "650px",
                        }}
                      >
                        {post.metadata.summary}
                      </Text>

                      <Row gap="16" vertical="center">
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          📅 {post.metadata.publishedAt || "No date"}
                        </Text>
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          🔗 /blog/{post.slug}
                        </Text>
                      </Row>
                    </Column>

                    <Row gap="8" vertical="center">
                      <Button
                        size="s"
                        variant="secondary"
                        onClick={() => router.push(`/blog/${post.slug}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="s"
                        variant="secondary"
                        onClick={() => router.push(`/admin/edit/${post.slug}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="s"
                        variant="danger"
                        disabled={isDeleting}
                        onClick={() => handleDeletePost(post.slug, post.metadata.title)}
                      >
                        {isDeleting ? "..." : "Delete"}
                      </Button>
                    </Row>
                  </Row>
                );
              })}
            </Column>
          )}
        </Column>
      )}

      {/* ==================== TAB 2: WORK & PROJECTS ==================== */}
      {activeTab === "projects" && (
        <Column fillWidth gap="16">
          <Row fillWidth horizontal="between" vertical="center" s={{ direction: "column", gap: "12" }}>
            <Row fillWidth maxWidth={24}>
              <Input
                id="search-projects"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Row>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Showing {filteredProjects.length} of {projects.length} projects
            </Text>
          </Row>

          {isLoadingProjects ? (
            <Flex fillWidth paddingY="64" horizontal="center">
              <Spinner size="m" />
            </Flex>
          ) : filteredProjects.length === 0 ? (
            <Column
              fillWidth
              padding="48"
              background="surface"
              border="neutral-alpha-weak"
              radius="l"
              center
              gap="16"
            >
              <Heading variant="heading-strong-s">No projects found</Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {searchQuery
                  ? "No projects match your search query."
                  : "You haven't created any projects yet."}
              </Text>
              <Button
                variant="primary"
                onClick={() => router.push("/admin/projects/new")}
              >
                Create your first project
              </Button>
            </Column>
          ) : (
            <Column fillWidth gap="12">
              {filteredProjects.map((project) => {
                const isDeleting = deletingProjectSlug === project.slug;
                const isDraft = project.metadata.status === "draft";
                const tagDisplay = formatTag(project.metadata.tag);

                return (
                  <Row
                    key={project.slug}
                    fillWidth
                    padding="20"
                    background="surface"
                    border="neutral-alpha-weak"
                    radius="m"
                    horizontal="between"
                    vertical="center"
                    s={{ direction: "column", gap: "16", align: "flex-start" }}
                  >
                    <Column gap="8" fillWidth>
                      <Row gap="8" vertical="center" wrap>
                        <Heading variant="heading-strong-s">
                          {project.metadata.title}
                        </Heading>
                        {isDraft ? (
                          <Badge background="warning-alpha-weak" onBackground="warning-strong">
                            Draft
                          </Badge>
                        ) : (
                          <Badge background="success-alpha-weak" onBackground="success-strong">
                            Published
                          </Badge>
                        )}
                        {tagDisplay && (
                          <Badge background="neutral-alpha-weak" onBackground="neutral-medium">
                            {tagDisplay}
                          </Badge>
                        )}
                      </Row>

                      <Text
                        variant="body-default-s"
                        onBackground="neutral-weak"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "650px",
                        }}
                      >
                        {project.metadata.summary}
                      </Text>

                      <Row gap="16" vertical="center">
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          📅 {project.metadata.publishedAt || "No date"}
                        </Text>
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          🔗 /work/{project.slug}
                        </Text>
                        {project.metadata.link && (
                          <SmartLink href={project.metadata.link}>
                            <Text variant="body-default-xs" onBackground="brand-medium">
                              Live Site ↗
                            </Text>
                          </SmartLink>
                        )}
                      </Row>
                    </Column>

                    <Row gap="8" vertical="center">
                      <Button
                        size="s"
                        variant="secondary"
                        onClick={() => router.push(`/work/${project.slug}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="s"
                        variant="secondary"
                        onClick={() => router.push(`/admin/projects/edit/${project.slug}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="s"
                        variant="danger"
                        disabled={isDeleting}
                        onClick={() => handleDeleteProject(project.slug, project.metadata.title)}
                      >
                        {isDeleting ? "..." : "Delete"}
                      </Button>
                    </Row>
                  </Row>
                );
              })}
            </Column>
          )}
        </Column>
      )}

      {/* ==================== TAB 3: ABOUT & PROFILE ==================== */}
      {activeTab === "profile" && <ProfileEditor />}
    </Column>
  );
}
