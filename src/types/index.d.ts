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
