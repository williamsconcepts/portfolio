"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Column,
  Row,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Spinner,
  Line,
  SmartLink,
} from "@once-ui-system/core";
import { ImageUpload } from "./ImageUpload";

export interface ProjectFormData {
  title: string;
  slug: string;
  subtitle?: string;
  publishedAt: string;
  summary: string;
  content: string;
  images: string[];
  link?: string;
  tag?: string;
  status: "published" | "draft";
}

interface ProjectEditorProps {
  initialData?: ProjectFormData;
  isEditing?: boolean;
}

export function ProjectEditor({ initialData, isEditing = false }: ProjectEditorProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<ProjectFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    subtitle: initialData?.subtitle || "",
    publishedAt:
      initialData?.publishedAt || new Date().toISOString().split("T")[0],
    summary: initialData?.summary || "",
    content: initialData?.content || "",
    images: initialData?.images || [],
    link: initialData?.link || "",
    tag: initialData?.tag || "",
    status: initialData?.status || "published",
  });

  const [imagesInput, setImagesInput] = useState(
    (initialData?.images || []).join(", "),
  );
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

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setImagesInput(raw);
    const parsed = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, images: parsed }));
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
        ? `/api/admin/projects/${encodeURIComponent(initialData?.slug || formData.slug)}`
        : "/api/admin/projects";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save project");
      }

      setSuccessMessage(
        isEditing
          ? "Project updated successfully!"
          : "Project created successfully! Redirecting...",
      );

      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Something went wrong saving the project");
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
            {isEditing ? `Edit: ${formData.title || "Project"}` : "Create New Work Project"}
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
              "Publish Project"
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

      {/* Project Details Card */}
      <Column
        fillWidth
        gap="16"
        padding="24"
        background="surface"
        border="neutral-alpha-weak"
        radius="l"
      >
        <Heading variant="heading-strong-s">Project Details & Media</Heading>

        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <Column fillWidth gap="8">
            <Input
              id="title"
              label="Project Title *"
              placeholder="e.g. Maintx360"
              value={formData.title}
              onChange={handleTitleChange}
            />
          </Column>

          <Column fillWidth gap="8">
            <Input
              id="slug"
              label="Slug (URL Path) *"
              placeholder="e.g. maintx360"
              value={formData.slug}
              onChange={(e) => {
                setHasManuallyEditedSlug(true);
                setFormData({ ...formData, slug: e.target.value });
              }}
            />
          </Column>
        </Row>

        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <Column fillWidth gap="8">
            <Input
              id="link"
              label="Live / GitHub Link"
              placeholder="https://maintx360.netlify.app/ or GitHub link"
              value={formData.link || ""}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
          </Column>

          <Column fillWidth gap="8">
            <Input
              id="tag"
              label="Category / Tag"
              placeholder="e.g. Full-Stack, CMMS, React, Fastify"
              value={formData.tag || ""}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
            />
          </Column>

          <Column fillWidth gap="8">
            <Input
              id="publishedAt"
              label="Date (YYYY-MM-DD)"
              placeholder="2026-07-04"
              value={formData.publishedAt}
              onChange={(e) =>
                setFormData({ ...formData, publishedAt: e.target.value })
              }
            />
          </Column>
        </Row>

        <ImageUpload
          multiple
          label="Project Carousel Images"
          value={formData.images}
          onChange={(urls: string[]) =>
            setFormData((prev) => ({ ...prev, images: urls }))
          }
          description="Upload one or more screenshots or mockups (saved directly to Neon DB)"
        />

        <Column fillWidth gap="8">
          <Input
            id="summary"
            label="Short Summary / Card Description *"
            placeholder="A digital maintenance management platform for oil and gas assets..."
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
          <Heading variant="heading-strong-s">Case Study Content (Markdown / MDX)</Heading>
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
              placeholder="Write your project case study here...&#10;&#10;## Overview&#10;&#10;Explain what the project solves and its core impact.&#10;&#10;## Key Features&#10;&#10;- Feature 1&#10;- Feature 2&#10;&#10;## Tech Stack & Architecture"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
            <Row horizontal="between" vertical="center" paddingX="8">
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Supports full Markdown: headings, bullet points, callouts, and code blocks.
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
            <Heading variant="heading-strong-l">{formData.title || "Untitled Project"}</Heading>
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
                  Nothing to preview yet. Switch back to Write to compose your case study.
                </Text>
              )}
            </div>
          </Column>
        )}
      </Column>
    </Column>
  );
}

