import { getSetting, saveSetting, isDbConfigured } from "./db";
import { ProfileData, defaultProfileData } from "@/types/profile.types";
import fs from "fs";
import path from "path";

export type { ProfileData };
export { defaultProfileData };

const LOCAL_PROFILE_PATH = path.join(process.cwd(), "src", "resources", "profile.json");

export async function getProfileData(): Promise<ProfileData> {
  if (isDbConfigured()) {
    try {
      const data = await getSetting<ProfileData>("profile");
      if (data) return { ...defaultProfileData, ...data };
    } catch (err) {
      console.error("Error reading profile from DB, falling back to local:", err);
    }
  }

  // Fallback to local json file if exists
  if (fs.existsSync(LOCAL_PROFILE_PATH)) {
    try {
      const content = fs.readFileSync(LOCAL_PROFILE_PATH, "utf-8");
      return { ...defaultProfileData, ...JSON.parse(content) };
    } catch (e) {
      // ignore
    }
  }

  return defaultProfileData;
}

export async function updateProfileData(data: Partial<ProfileData>): Promise<ProfileData> {
  const current = await getProfileData();
  const updated: ProfileData = {
    ...current,
    ...data,
    name: `${data.firstName || current.firstName} ${data.lastName || current.lastName}`.trim(),
  };

  if (isDbConfigured()) {
    await saveSetting("profile", updated);
  }

  // Also persist to local JSON file for dev fallback
  try {
    fs.writeFileSync(LOCAL_PROFILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write local profile.json (read-only in serverless):", err);
  }

  return updated;
}

