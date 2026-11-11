"use client";

import React, { useState, useEffect } from "react";
import {
  Column,
  Row,
  Heading,
  Text,
  Button,
  Input,
  PasswordInput,
  Textarea,
  Spinner,
} from "@once-ui-system/core";
import { ProfileData, defaultProfileData } from "@/types/profile.types";
import { ImageUpload } from "./ImageUpload";

export function ProfileEditor() {
  const [formData, setFormData] = useState<ProfileData>(defaultProfileData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setPasswordSuccess("Admin password updated successfully in the database!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setFormData(data.profile);
          }
        }
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setSuccessMessage("About & Profile details saved successfully!");
      if (data.profile) {
        setFormData(data.profile);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Row fillWidth paddingY="64" horizontal="center">
        <Spinner size="m" />
      </Row>
    );
  }

  return (
    <Column fillWidth gap="24">
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

      {/* Main Info */}
      <Column
        fillWidth
        gap="16"
        padding="24"
        background="surface"
        border="neutral-alpha-weak"
        radius="l"
      >
        <Heading variant="heading-strong-s">Personal & Job Info</Heading>

        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <Column fillWidth gap="8">
            <Input
              id="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
          </Column>

          <Column fillWidth gap="8">
            <Input
              id="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </Column>
        </Row>

        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <Column fillWidth gap="8">
            <Input
              id="role"
              label="Role / Title"
              placeholder="e.g. Software Engineer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </Column>

          <Column fillWidth gap="8">
            <Input
              id="email"
              label="Public Contact Email"
              placeholder="e.g. name@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </Column>
        </Row>

        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <Column fillWidth gap="8">
            <Input
              id="location"
              label="Location / Timezone"
              placeholder="e.g. Africa/Lagos"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </Column>
        </Row>

        <ImageUpload
          label="Profile Avatar Picture"
          value={formData.avatar}
          onChange={(url: string) =>
            setFormData((prev) => ({ ...prev, avatar: url }))
          }
          description="Upload a photo from your computer to use as your profile avatar"
        />
      </Column>

      {/* Bio / Intro Section */}
      <Column
        fillWidth
        gap="16"
        padding="24"
        background="surface"
        border="neutral-alpha-weak"
        radius="l"
      >
        <Heading variant="heading-strong-s">Introduction / Bio (About Page)</Heading>

        <Column fillWidth gap="8">
          <Input
            id="introTitle"
            label="Intro Section Title"
            value={formData.introTitle || "Introduction"}
            onChange={(e) =>
              setFormData({ ...formData, introTitle: e.target.value })
            }
          />
        </Column>

        <Column fillWidth gap="8">
          <Textarea
            id="introDescription"
            label="Bio Description"
            lines={6}
            placeholder="Write your personal introduction and overview here..."
            value={formData.introDescription}
            onChange={(e) =>
              setFormData({ ...formData, introDescription: e.target.value })
            }
          />
        </Column>
      </Column>

      {/* Links & Socials */}
      <Column
        fillWidth
        gap="16"
        padding="24"
        background="surface"
        border="neutral-alpha-weak"
        radius="l"
      >
        <Heading variant="heading-strong-s">Links, Calendar & Social Media</Heading>

        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <Column fillWidth gap="8">
            <Input
              id="calendarLink"
              label="Meeting / Cal.com Link"
              placeholder="https://cal.com/..."
              value={formData.calendarLink}
              onChange={(e) =>
                setFormData({ ...formData, calendarLink: e.target.value })
              }
            />
          </Column>

          <Column fillWidth gap="8">
            <Input
              id="resumeLink"
              label="Resume / CV Link"
              placeholder="https://canva.link/... or PDF link"
              value={formData.resumeLink}
              onChange={(e) =>
                setFormData({ ...formData, resumeLink: e.target.value })
              }
            />
          </Column>
        </Row>

        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <Column fillWidth gap="8">
            <Input
              id="githubLink"
              label="GitHub Profile URL"
              placeholder="https://github.com/..."
              value={formData.githubLink}
              onChange={(e) =>
                setFormData({ ...formData, githubLink: e.target.value })
              }
            />
          </Column>

          <Column fillWidth gap="8">
            <Input
              id="linkedinLink"
              label="LinkedIn Profile URL"
              placeholder="https://linkedin.com/in/..."
              value={formData.linkedinLink}
              onChange={(e) =>
                setFormData({ ...formData, linkedinLink: e.target.value })
              }
            />
          </Column>
        </Row>

        <Column fillWidth gap="8">
          <Input
            id="xLink"
            label="X (Twitter) Profile URL"
            placeholder="https://x.com/..."
            value={formData.xLink}
            onChange={(e) => setFormData({ ...formData, xLink: e.target.value })}
          />
        </Column>
      </Column>

      {/* Save Profile Button */}
      <Row fillWidth horizontal="end" vertical="center">
        <Button
          variant="primary"
          size="m"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? (
            <Row gap="8" vertical="center">
              <Spinner size="s" /> Saving...
            </Row>
          ) : (
            "Save Profile & About Us"
          )}
        </Button>
      </Row>

      {/* Admin Password Security Card */}
      <Column
        fillWidth
        gap="16"
        padding="24"
        background="surface"
        border="neutral-alpha-weak"
        radius="l"
      >
        <Column gap="4">
          <Heading variant="heading-strong-s">🔐 Admin Security & Password</Heading>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            Stored securely in your Neon database. You can update your login password here anytime without editing environment variables.
          </Text>
        </Column>

        {passwordError && (
          <Row
            fillWidth
            padding="12"
            background="danger-alpha-weak"
            border="danger-alpha-medium"
            radius="m"
          >
            <Text onBackground="danger-strong">⚠️ {passwordError}</Text>
          </Row>
        )}

        {passwordSuccess && (
          <Row
            fillWidth
            padding="12"
            background="success-alpha-weak"
            border="success-alpha-medium"
            radius="m"
          >
            <Text onBackground="success-strong">✓ {passwordSuccess}</Text>
          </Row>
        )}

        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <Column fillWidth gap="8">
            <PasswordInput
              id="currentPassword"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Column>

          <Column fillWidth gap="8">
            <PasswordInput
              id="newPassword"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Column>

          <Column fillWidth gap="8">
            <PasswordInput
              id="confirmPassword"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Column>
        </Row>

        <Row fillWidth horizontal="end" vertical="center">
          <Button
            variant="secondary"
            size="m"
            onClick={handlePasswordChange}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? (
              <Row gap="8" vertical="center">
                <Spinner size="s" /> Updating...
              </Row>
            ) : (
              "Update Admin Password"
            )}
          </Button>
        </Row>
      </Column>
    </Column>
  );
}

