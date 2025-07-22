export type Feature = {
  button: button;
  image: string;
  bulletpoints?: string[];
  weeklyRhythm?: boolean;
  content: string;
  title: string;
};

export type Button = {
  enable: boolean;
  label: string;
  link: string;
};

export interface Link {
  name: string;
  url: string;
}

export interface Book {
  title: string;
  author: string;
  description: string;
  cover: string;
  links: Link[];
}
