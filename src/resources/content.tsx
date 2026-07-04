import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "Chidiebube",
  lastName: "Williams",
  name: `Chidiebube Williams`,
  role: "Software Engineer",
  avatar: "/images/avatar.jpg",
  email: "chidiekwebelam@gmail.com",
  location: "Africa/Lagos", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["English", "Igbo"], // optional: Leave the array empty if you don't want to display languages
  locale: "en", // BCP 47 language tag for the HTML lang attribute, e.g., 'en', 'ja', 'zh-TW'
};

const newsletter: Newsletter = {
  display: true,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: <>My weekly newsletter about creativity and engineering</>,
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  // Set essentials: true for links you want to show on the about page
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/williamsconcepts?tab=repositories",
    essential: true,
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/ekwebelamchidiebube/",
    essential: true,
  },
  {
    name: "Instagram",
    icon: "instagram",
    link: "https://www.instagram.com/abumebubedike/",
    essential: false,
  },
  {
    name: "X",
    icon: "twitter",
    link: "https://www.x.com/@williamschuddy",
    essential: true,
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
    essential: true,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>Building your idea with code</>,
  featured: {
    display: true,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Blog</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured work
        </Text>
      </Row>
    ),
    href: "/work/building-once-ui-a-customizable-design-system",
  },
  subline: (
    <>
      I'm {person.firstName}, a {person.role.toLowerCase()}, Welcome to where I craft intuitive <br /> user experiences.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://cal.com/ekwebelam-williams-2zxckt/15min",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        {person.firstName} is a {person.role.toLowerCase()} passionate about building scalable, user-focused applications. With experience in both frontend and backend development, I enjoy solving complex problems through clean code, modern technologies, and intuitive digital experiences.
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Selected Projects",
    experiences: [
      {
        company: "Maintx360",
        timeframe: "2026",
        role: "CMMS Platform",
        achievements: [
          <>
            Designed a maintenance management system for oil and gas operations, centralizing asset
            tracking, work orders, and technician workflows.
          </>,
          <>
            Built a dashboard-first experience focused on preventive maintenance planning and
            operational visibility.
          </>,
        ],
        images: [
          {
            src: "/images/projects/project-01/maintx360.png",
            alt: "Maintx360 project preview",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        company: "OilOps360",
        timeframe: "2026",
        role: "Operations Compliance Platform",
        achievements: [
          <>
            Created a compliance-focused web app for managing contractor records, inspections, and
            document recovery workflows.
          </>,
          <>
            Simplified operational reporting and protected critical records through a recovery-driven
            user experience.
          </>,
        ],
        images: [
          {
            src: "/images/projects/project-01/oilops2.png",
            alt: "OilOps360 project preview",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        company: "Community Library",
        timeframe: "2026",
        role: "Frontend Library Manager",
        achievements: [
          <>
            Built a browser-based library management system using HTML, CSS, and JavaScript with
            local storage persistence.
          </>,
          <>
            Implemented book and member management, borrowing flows, and real-time dashboard
            statistics.
          </>,
        ],
        images: [
          {
            src: "/images/projects/project-01/library.png",
            alt: "Community Library preview",
            width: 16,
            height: 9,
          },
        ],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Studies",
    institutions: [
       {
        name: "Cyphercresent Limited",
        description: <>Studied Entrepreneurship.</>,
      },
      {
        name: "Cyphercresent Limited",
        description: <>Studied software engineering.</>,
      },
      {
        name: "Cyphercresent Limited",
        description: <>Studied UI/UX design.</>,
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical skills",
    skills: [
      {
        title: "Figma",
        description: (
          <>Able to prototype in Figma with unnatural speed.</>
        ),
        tags: [
          {
            name: "Figma",
            icon: "figma",
          },
        ],
        // optional: leave the array empty if you don't want to display images
        images: [
          {
            src: "/images/projects/project-01/ui1.png",
            alt: "Project image",
            width: 16,
            height: 9,
          },
          {
            src: "/images/projects/project-01/ui2.png",
            alt: "Project image",
            width: 16,
            height: 9,
          },
           {
            src: "/images/projects/project-01/cookie.png",
            alt: "Project image",
            width: 16,
            height: 9,
          },
        ],
      },
       {
        title: "JavaScript",
        description: (
          <>A digital operations compliance platform for the oil and gas industry that centralizes contractor compliance, asset inspections, and record recovery workflows.</>
        ),
        tags: [
          {
            name: "JavaScript",
            icon: "javascript",
          },
          {
            name: "HTML",
            icon: "html",
          },
          {
            name: "CSS",
            icon: "css",
          },
        ],
        // optional: leave the array empty if you don't want to display images
        images: [
          {
            src: "/images/projects/project-01/oilops2.png",
            alt: "Project image",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        title: "Next.js",
        description: (
          <>Building a polished dashboard application with Next.js + Postgres.</>
        ),
        tags: [
          {
            name: "JavaScript",
            icon: "javascript",
          },
          {
            name: "Next.js",
            icon: "nextjs",
          },
          {
            name: "Postgres",
            icon: "postgres",
          },
        ],
        // optional: leave the array empty if you don't want to display images
        images: [
          {
            src: "/images/projects/project-01/acme.png",
            alt: "Project image",
            width: 16,
            height: 9,
          },
        ],
      },
       {
        title: "React.js",
        description: (
          <>Building A modern React pizza ordering experience built with Tailwind CSS</>
        ),
        tags: [
          {
            name: "JavaScript",
            icon: "javascript",
          },
          {
            name: "React.js",
            icon: "react",
          },
          {
            name: "Tailwind CSS",
            icon: "tailwind",
          },
        ],
        // optional: leave the array empty if you don't want to display images
        images: [
          {
            src: "/images/projects/project-01/fast1.png",
            alt: "Project image",
            width: 16,
            height: 9,
          },
        ],
      },
  
    ],
  },

  certifications: {
    display: true, // set to false to hide this section
    title: "Certifications",
    skills: [
      {
        title: "Software Engineering",
        description: (
          <>Founded a strong foundation in software engineering principles, web development, and user experience design.</>
        ),
        tags: [
          {
            name: "HTML",
            icon: "html",
          },
          {
            name: "CSS",
            icon: "css",
          },
          {
            name: "JavaScript",
            icon: "javascript",
          },
          {
            name: "Express.js",
            icon: "express",
          },
          {
            name: "Node.js",
            icon: "nodejs",
          },
          {
            name: "Next.js",
            icon: "nextjs",
          },
          {
            name: "UI/UX Design",
            icon: "figma",
          },
        ],
        // optional: leave the array empty if you don't want to display images
        images: [
          {
            src: "/images/projects/project-01/cert1.png",
            alt: "Project image",
            width: 16,
            height: 9,
          },
          {
            src: "/images/projects/project-01/cert2.png",
            alt: "Project image",
            width: 16,
            height: 9,
          },
          {
            src: "/images/projects/project-01/cert3.png",
            alt: "Project image",
            width: 16,
            height: 9,
          },
        ],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing about design and tech...",
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  // Images by https://lorant.one
  // These are placeholder images, replace with your own
  images: [
    {
      src: "/images/gallery/horizontal-1.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-4.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-3.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-1.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-2.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-2.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-4.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-3.jpg",
      alt: "image",
      orientation: "vertical",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };
