// Single source of truth for menu items
export interface MenuItem {
  name: string;
  url: string;
  hasChildren?: boolean;
  children?: MenuItem[];
}

export interface Menu {
  main: MenuItem[];
  footer: MenuItem[];
}

export function getAllMenuItems(menu: Menu): MenuItem[] {
  const { main } = menu;

  // Get all items from the "More" dropdown
  const moreItems = main.find((item: MenuItem) => item.name === 'More')?.children || [];

  // Return items in the order they appear in the mobile nav
  return moreItems;
}

export function getFooterMenuItems(menu: Menu): MenuItem[] {
  // Get all items from the "More" dropdown but exclude Media, Videos, and Policy
  // since Media and Videos are already covered by social media buttons
  // and Policy should only appear in the main menu
  const allItems = getAllMenuItems(menu);
  return allItems.filter((item) => item.name !== 'Media' && item.name !== 'Videos' && item.name !== 'Policy');
}
