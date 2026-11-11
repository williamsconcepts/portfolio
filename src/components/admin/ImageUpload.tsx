"use client";

import React, { useState, useRef } from "react";
import {
  Column,
  Row,
  Text,
  Button,
  Spinner,
  Badge,
} from "@once-ui-system/core";

interface ImageUploadProps {
  label: string;
  value: string | string[];
  onChange: (value: any) => void;
  multiple?: boolean;
  description?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  multiple = false,
  description,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const images: string[] = multiple
    ? Array.isArray(value)
      ? value
      : value
        ? [value]
        : []
    : typeof value === "string" && value
      ? [value]
      : [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || `Failed to upload ${file.name}`);
        }

        uploadedUrls.push(data.url);
      }

      if (multiple) {
        onChange([...images, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls[0]);
      }
    } catch (err: any) {
      setError(err?.message || "Error uploading image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    if (multiple) {
      const filtered = images.filter((_, idx) => idx !== indexToRemove);
      onChange(filtered);
    } else {
      onChange("");
    }
  };

  return (
    <Column fillWidth gap="8">
      <Row fillWidth horizontal="between" vertical="center">
        <Text variant="label-default-s">{label}</Text>
        {multiple && images.length > 0 && (
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {images.length} {images.length === 1 ? "image" : "images"} selected
          </Text>
        )}
      </Row>

      {description && (
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {description}
        </Text>
      )}

      {error && (
        <Row
          fillWidth
          padding="8"
          background="danger-alpha-weak"
          border="danger-alpha-medium"
          radius="m"
        >
          <Text variant="body-default-xs" onBackground="danger-strong">
            ⚠️ {error}
          </Text>
        </Row>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
        multiple={multiple}
        style={{ display: "none" }}
      />

      {/* Upload Button & Drop Area */}
      <Row
        fillWidth
        padding="16"
        background="surface"
        border="neutral-alpha-weak"
        radius="m"
        horizontal="between"
        vertical="center"
        s={{ direction: "column", gap: "12", align: "flex-start" }}
      >
        <Column gap="2">
          <Text variant="body-default-s">
            {multiple ? "Select one or more images from your device" : "Upload an image from your device"}
          </Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            PNG, JPG, WebP, GIF, or SVG (Up to 10MB) — Saved to Neon DB
          </Text>
        </Column>

        <Button
          type="button"
          variant="secondary"
          size="m"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Row gap="8" vertical="center">
              <Spinner size="s" /> Uploading...
            </Row>
          ) : (
            `📁 Browse Image${multiple ? "s" : ""}`
          )}
        </Button>
      </Row>

      {/* Image Previews */}
      {images.length > 0 && (
        <Row wrap gap="12" paddingY="8">
          {images.map((src, index) => (
            <Column
              key={`${src}-${index}`}
              position="relative"
              border="neutral-alpha-weak"
              radius="m"
              style={{
                overflow: "hidden",
                width: multiple ? "140px" : "180px",
                height: multiple ? "100px" : "120px",
                background: "var(--surface)",
              }}
            >
              <img
                src={src}
                alt={`Preview ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                }}
              >
                <Button
                  size="s"
                  variant="danger"
                  onClick={() => handleRemove(index)}
                  style={{
                    padding: "2px 8px",
                    minWidth: "auto",
                    height: "24px",
                    fontSize: "11px",
                  }}
                >
                  ✕
                </Button>
              </div>
            </Column>
          ))}
        </Row>
      )}
    </Column>
  );
}

