// The categories a talk can fall into. One list, used by the form, the list page
// and the Jev question. Adding a value here makes lib/jev.ts stop compiling until
// you describe the new category there.
export const CATEGORIES = [
  "frontend",
  "backend",
  "mobile",
  "ai",
  "data-engineering",
  "databases",
  "devops",
  "cloud",
  "security",
  "performance",
  "testing",
  "accessibility",
  "design-systems",
  "developer-tools",
  "architecture",
  "networking",
  "embedded",
  "blockchain",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Talk = {
  id: number;
  title: string;
  speakerId: number;
  category: Category;
  votes: number;
};

export type Speaker = {
  id: number;
  name: string;
  bio: string;
};

export type Comment = {
  id: number;
  talkId: number;
  text: string;
};
