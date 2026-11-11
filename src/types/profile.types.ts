import { person, about } from "@/resources/content";

export interface ProfileData {
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  location: string;
  calendarLink: string;
  resumeLink: string;
  githubLink: string;
  linkedinLink: string;
  xLink: string;
  introTitle: string;
  introDescription: string;
}

export const defaultProfileData: ProfileData = {
  firstName: person.firstName,
  lastName: person.lastName,
  name: person.name,
  role: person.role,
  avatar: person.avatar,
  email: person.email,
  location: person.location,
  calendarLink: about.calendar?.link || "https://cal.com/ekwebelam-williams-2zxckt/15min",
  resumeLink: "https://canva.link/rr056buhec7z124",
  githubLink: "https://github.com/williamsconcepts?tab=repositories",
  linkedinLink: "https://www.linkedin.com/in/ekwebelamchidiebube/",
  xLink: "https://www.x.com/@williamschuddy",
  introTitle: "Introduction",
  introDescription:
    "Software engineer passionate about building scalable, user-focused applications. With experience in both frontend and backend development, I enjoy solving complex problems through clean code, modern technologies, and intuitive digital experiences.",
};

