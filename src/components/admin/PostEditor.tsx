"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Column,
  Row,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Badge,
  Spinner,
  Line,
  SmartLink,
} from "@once-ui-system/core";
import { ImageUpload } from "./ImageUpload";

export interface PostFormData {
  title: string;
  slug: string;
  subtitle?: string;
  publishedAt: string;
  summary: string;
  content: string;
  tag?: string;
  image?: string;
  status: "published" | "draft";
}

interface PostEditorProps {
  initialData?: PostFormData;
  isEditing?: boolean;
}

export function PostEditor({ initialData, isEditing = false }: PostEditorProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    subtitle: initialData?.subtitle || "",
    publishedAt:
      initialData?.publishedAt || new Date().toISOString().split("T")[0],
    summary: initialData?.summary || "",
    content: initialData?.content || "",
    tag: Array.isArray(initialData?.tag)
      ? (initialData.tag as any[]).filter(Boolean).join(", ")
      : (typeof initialData?.tag === "string" ? initialData.tag : ""),
    image: initialData?.image || "",
    status: initialData?.status || "published",
  });

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingInline, setIsUploadingInline] = useState(false);

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingInline(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload image");

      const imageMarkdown = `\n\n![${file.name.replace(/\.[^/.]+$/, "")}](${data.url})\n\n`;
      setFormData((prev) => ({
        ...prev,
        content: prev.content + imageMarkdown,
      }));
    } catch (err: any) {
      setError(err?.message || "Failed to upload image to content");
    } finally {
      setIsUploadingInline(false);
      if (inlineImageInputRef.current) inlineImageInputRef.current.value = "";
    }
  };

  // Auto-generate slug from title if creating a new post and slug hasn't been manually altered
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(isEditing);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, title: newTitle };
      if (!hasManuallyEditedSlug && !isEditing) {
        updated.slug = newTitle
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return updated;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasManuallyEditedSlug(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.slug.trim()) {
      setError("Slug is required");
      return;
    }
    if (!formData.summary.trim()) {
      setError("Summary is required");
      return;
    }
    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/admin/posts/${encodeURIComponent(initialData?.slug || formData.slug)}`
        : "/api/admin/posts";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save post");
      }

      setSuccessMessage(
        isEditing
          ? "Post updated successfully!"
          : "Post created successfully! Redirecting to admin...",
      );

      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Something went wrong saving the post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Column fillWidth maxWidth="l" gap="24" paddingY="32">
      {/* Top Header & Navigation */}
      <Row fillWidth horizontal="between" vertical="center">
        <Column gap="4">
          <Row gap="8" vertical="center">
            <SmartLink href="/admin">
              <Text variant="label-default-s" onBackground="neutral-weak">
                ← Back to Dashboard
              </Text>
            </SmartLink>
          </Row>
          <Heading variant="heading-strong-l">
            {isEditing ? `Edit: ${formData.title || "Post"}` : "Create New Blog Post"}
          </Heading>
        </Column>

        <Row gap="8" vertical="center">
          <Button
            variant="secondary"
            onClick={() => router.push("/admin")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Row gap="8" vertical="center">
                <Spinner size="s" /> Saving...
              </Row>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Publish Post"
            )}
          </Button>
        </Row>
      </Row>

      {/* Notifications */}
      {error && (
        <Row
          fillWidth
          padding="16"
          background="danger-alpha-weak"
          border="danger-alpha-medium"
          radius="m"
        >
          <Text onBackground="danger-strong">⚠️ {error}</Text>
        </Row>
      )}

      {successMessage && (
        <Row
          fillWidth
          padding="16"
          background="success-alpha-weak"
          border="success-alpha-medium"
          radius="m"
        >
          <Text onBackground="success-strong">✓ {successMessage}</Text>
        </Row>
      )}

      {/* Post Metadata Card */}
      <Column
        fillWidth
        gap="16"
        padding="24"
        background="surface"
        border="neutral-alpha-weak"
        radius="l"
      >
        <Heading variant="heading-strong-s">Post Details & Metadata</Heading>

        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <Column fillWidth gap="8">
            <Input
              id="title"
              label="Title *"
              placeholder="e.g. Building scalable web architectures"
              value={formData.title}
              onChange={handleTitleChange}
            />
          </Column>

          <Column fillWidth gap="8">
            <Input
              id="slug"
              label="Slug (URL Path) *"
              placeholder="e.g. building-scalable-web-architectures"
              value={formData.slug}
              onChange={handleSlugChange}
            />
          </Column>
        </Row>

        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <Column fillWidth gap="8">
            <Input
              id="publishedAt"
              label="Publish Date (YYYY-MM-DD)"
              placeholder="2026-11-11"
              value={formData.publishedAt}
              onChange={(e) =>
                setFormData({ ...formData, publishedAt: e.target.value })
              }
            />
          </Column>

          <Column fillWidth gap="8">
            <Input
              id="tag"
              label="Tag / Category"
              placeholder="e.g. Next.js, Engineering, React"
              value={formData.tag || ""}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
            />
          </Column>
        </Row>

        <ImageUpload
          label="Cover Image"
          value={formData.image || ""}
          onChange={(url: string) =>
            setFormData((prev) => ({ ...prev, image: url }))
          }
          description="Upload a cover image from your device (saved to Neon DB)"
        />

        <Column fillWidth gap="8">
          <Input
            id="summary"
            label="Summary / Excerpt *"
            placeholder="A short overview that appears on the blog index and SEO previews..."
            value={formData.summary}
            onChange={(e) =>
              setFormData({ ...formData, summary: e.target.value })
            }
          />
        </Column>

        <Row gap="16" vertical="center">
          <Text variant="label-default-s">Status:</Text>
          <Row gap="8">
            <Button
              variant={formData.status === "published" ? "primary" : "secondary"}
              size="s"
              onClick={() => setFormData({ ...formData, status: "published" })}
            >
              Published
            </Button>
            <Button
              variant={formData.status === "draft" ? "primary" : "secondary"}
              size="s"
              onClick={() => setFormData({ ...formData, status: "draft" })}
            >
              Draft
            </Button>
          </Row>
        </Row>
      </Column>

      {/* Editor & Preview Section */}
      <Column
        fillWidth
        gap="16"
        padding="24"
        background="surface"
        border="neutral-alpha-weak"
        radius="l"
      >
        <Row fillWidth horizontal="between" vertical="center" s={{ direction: "column", gap: "12", align: "flex-start" }}>
          <Heading variant="heading-strong-s">Article Content (Markdown / MDX)</Heading>
          <Row gap="8" vertical="center">
            {activeTab === "edit" && (
              <>
                <input
                  type="file"
                  ref={inlineImageInputRef}
                  onChange={handleInlineImageUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <Button
                  size="s"
                  variant="secondary"
                  disabled={isUploadingInline}
                  onClick={() => inlineImageInputRef.current?.click()}
                >
                  {isUploadingInline ? (
                    <Row gap="8" vertical="center">
                      <Spinner size="s" /> Uploading...
                    </Row>
                  ) : (
                    "📷 + Insert Image"
                  )}
                </Button>
              </>
            )}
            <Button
              size="s"
              variant={activeTab === "edit" ? "primary" : "secondary"}
              onClick={() => setActiveTab("edit")}
            >
              Write
            </Button>
            <Button
              size="s"
              variant={activeTab === "preview" ? "primary" : "secondary"}
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </Button>
          </Row>
        </Row>

        {activeTab === "edit" ? (
          <Column fillWidth gap="8">
            <Textarea
              id="content"
              lines={24}
              placeholder="Write your article in Markdown/MDX here...&#10;&#10;## Subheading&#10;&#10;Paragraph text goes here with **bold** or *italic* text.&#10;&#10;```javascript&#10;console.log('Hello world!');&#10;```"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
            <Row horizontal="between" vertical="center" paddingX="8">
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Supports standard Markdown syntax, headings, lists, code blocks, and Once UI components.
              </Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {formData.content.length} characters
              </Text>
            </Row>
          </Column>
        ) : (
          <Column
            fillWidth
            minHeight={20}
            padding="24"
            background="page"
            border="neutral-alpha-weak"
            radius="m"
            gap="16"
          >
            <Heading variant="heading-strong-l">{formData.title || "Untitled Post"}</Heading>
            {formData.summary && (
              <Text variant="body-default-m" onBackground="neutral-medium">
                {formData.summary}
              </Text>
            )}
            <Line background="neutral-alpha-weak" fillWidth height="1" />
            <div
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
                fontFamily: "var(--font-body)",
              }}
            >
              {formData.content || (
                <Text onBackground="neutral-weak" style={{ fontStyle: "italic" }}>
                  Nothing to preview yet. Switch back to Write to compose your post.
                </Text>
              )}
            </div>
          </Column>
        )}
      </Column>
    </Column>
  );
}
