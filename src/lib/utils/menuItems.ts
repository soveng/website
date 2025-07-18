// Single source of truth for menu items
export interface MenuItem {
  name: string;
  url: string;
}

export function getAllMenuItems(menu: any): MenuItem[] {
  const { main } = menu;
  
  // Get all items from the "More" dropdown
  const moreItems = main.find((item: any) => item.name === "More")?.children || [];
  
  // Return items in the order they appear in the mobile nav
  return moreItems;
}

export function getFooterMenuItems(menu: any): MenuItem[] {
  // Use the same items as mobile nav, maintaining the same order
  return getAllMenuItems(menu);
}