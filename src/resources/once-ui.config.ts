import {
  DataStyleConfig,
  DisplayConfig,
  EffectsConfig,
  FontsConfig,
  MailchimpConfig,
  ProtectedRoutesConfig,
  RoutesConfig,
  SameAsConfig,
  SchemaConfig,
  SocialSharingConfig,
  StyleConfig,
} from "@/types";
import { home, person, social } from "./content";

// IMPORTANT: Replace with your own domain address - it's used for SEO in meta tags and schema
const baseURL: string = "https://portfolio-gamma-lyart-27.vercel.app/";

const routes: RoutesConfig = {
  "/": true,
  "/about": true,
  "/work": true,
  "/blog": true,
  "/music": true,
};

const display: DisplayConfig = {
  location: true,
  time: true,
  themeSwitcher: true,
};

// Enable password protection on selected routes
// Set password in the .env file, refer to .env.example
const protectedRoutes: ProtectedRoutesConfig = {
  "/work/automate-design-handovers-with-a-figma-to-code-pipeline": true,
};

// Import and set font for each variant
import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";

const heading = Geist({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const label = Geist({
  variable: "--font-label",
  subsets: ["latin"],
  display: "swap",
});

const code = Geist_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});

const fonts: FontsConfig = {
  heading: heading,
  body: body,
  label: label,
  code: code,
};

// default customization applied to the HTML in the main layout.tsx
const style: StyleConfig = {
 theme:       'dark',         // dark | light
neutral:     'gray',         // sand | gray | slate
brand:       'blue',         // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
accent:      'indigo',       // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
solid:       'contrast',     // color | contrast
solidStyle:  'flat',         // flat | plastic
border:      'playful',      // rounded | playful | conservative
surface:     'translucent',  // filled | translucent
transition:  'all',          // all | micro | macro
scaling:     '100',          // 90 | 95 | 100 | 105 | 110
};

const dataStyle: DataStyleConfig = {
  variant: "gradient", // flat | gradient | outline
  mode: "categorical", // categorical | divergent | sequential
  height: 24, // default chart height
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false,
  },
};

// const effects: EffectsConfig = {
  const effects = {
  mask: {
    cursor: false,
    x: 50,
    y: 0,
    radius: 100
  },
  gradient: {
    display: true,
    x: 50,
    y: -25,
    width: 100,
    height: 100,
    tilt: 0,
    colorStart: 'accent-background-strong',
    colorEnd: 'static-transparent',
    opacity: 50
  },
  dots: {
    display: true,
    size: 2,
    color: 'brand-on-background-weak',
    opacity: 20
  },
  lines: {
    display: false,
    color: 'neutral-alpha-weak',
    opacity: 100
  },
  grid: {
    display: false,
    color: 'neutral-alpha-weak',
    opacity: 100,
    width: 'var(--static-space-32)',
    height: 'var(--static-space-32)'
  }
};

const mailchimp: MailchimpConfig = {
  action: "https://url/subscribe/post?parameters",
  effects: {
    mask: {
      cursor: true,
      x: 50,
      y: 0,
      radius: 100,
    },
    gradient: {
      display: true,
      opacity: 90,
      x: 50,
      y: 0,
      width: 50,
      height: 50,
      tilt: 0,
      colorStart: "accent-background-strong",
      colorEnd: "static-transparent",
    },
    dots: {
      display: true,
      opacity: 20,
      size: "2",
      color: "brand-on-background-weak",
    },
    grid: {
      display: false,
      opacity: 100,
      color: "neutral-alpha-medium",
      width: "0.25rem",
      height: "0.25rem",
    },
    lines: {
      display: false,
      opacity: 100,
      color: "neutral-alpha-medium",
      size: "16",
      thickness: 1,
      angle: 90,
    },
  },
};

// default schema data — pulls from content.tsx so there's one source of truth
const schema: SchemaConfig = {
  logo: "",
  type: "Person",
  name: person.name,
  description: home.description,
  email: person.email,
};

// social links — derived from the social array in content.tsx to avoid duplication
const sameAs: SameAsConfig = {
  threads: social.find((s) => s.name === "Threads")?.link ?? "",
  linkedin: social.find((s) => s.name === "LinkedIn")?.link ?? "",
  discord: social.find((s) => s.name === "Discord")?.link ?? "",
};

// social sharing configuration for blog posts
const socialSharing: SocialSharingConfig = {
  display: true,
  platforms: {
    x: true,
    linkedin: true,
    facebook: false,
    pinterest: false,
    whatsapp: false,
    reddit: false,
    telegram: false,
    email: true,
    copyLink: true,
  },
};

export {
  display,
  mailchimp,
  routes,
  protectedRoutes,
  baseURL,
  fonts,
  style,
  schema,
  sameAs,
  socialSharing,
  effects,
  dataStyle,
};
