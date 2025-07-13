// similar products
const similarItems = (
  currentItem: { data: { categories: string[]; tags: string[] }; id: string },
  allItems: { data: { categories: string[]; tags: string[] }; id: string }[]
) => {
  // set categories
  const { categories = [] } =
    currentItem.data.categories.length > 0 ? { categories: currentItem.data.categories } : {};

  // set tags
  const { tags = [] } = currentItem.data.tags.length > 0 ? { tags: currentItem.data.tags } : {};

  // filter by categories
  const filterByCategories = allItems.filter(
    (item: { data: { categories: string[]; tags: string[] }; id: string }) =>
      categories.find((category) => item.data.categories.includes(category))
  );

  // filter by tags
  const filterByTags = allItems.filter(
    (item: { data: { categories: string[]; tags: string[] }; id: string }) =>
      tags.find((tag) => item.data.tags.includes(tag))
  );

  // merged after filter
  const mergedItems = [...new Set([...filterByCategories, ...filterByTags])];

  // filter by slug
  const filterBySlug = mergedItems.filter((product) => product.id !== currentItem.id);

  return filterBySlug;
};

export default similarItems;
