export type MenuData = {
  [key: string]: MenuItem[];
};

export type MenuItem = {
  title: string;
  items: (string | { name: string; link: string })[];
};
