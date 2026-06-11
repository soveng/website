export interface MenuItem {
  name: string;
  url: string;
  featured?: boolean;
  hasChildren?: boolean;
  children?: MenuItem[];
}

export interface FooterSection {
  title: string;
  links: MenuItem[];
}

export interface Menu {
  main: MenuItem[];
  footer: {
    sections: FooterSection[];
  };
}

export function getAllMenuItems(menu: Menu): MenuItem[] {
  const { main } = menu;

  const moreItems =
    main.find((item: MenuItem) => item.name === "More")?.children || [];

  return moreItems;
}

export function getFooterSections(menu: Menu): FooterSection[] {
  return menu.footer.sections;
}

export function isExternalUrl(url: string): boolean {
  return url.startsWith("http") || url.startsWith("mailto");
}
