export type Talk = {
  id: number;
  title: string;
  speakerId: number;
  track: "core" | "data" | "ai";
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
