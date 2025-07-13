// sort by date
export const sortByDate = (array: { data: { date: string } }[]) => {
  const sortedArray = array.sort(
    (a: { data: { date: string } }, b: { data: { date: string } }) =>
      new Date(b.data.date && b.data.date).valueOf() - new Date(a.data.date && a.data.date).valueOf()
  );
  return sortedArray;
};

// sort product by weight
export const sortByWeight = (array: { data: { weight?: number } }[]) => {
  const withWeight = array.filter((item: { data: { weight?: number } }) => item.data.weight);
  const withoutWeight = array.filter((item: { data: { weight?: number } }) => !item.data.weight);
  const sortedWeightedArray = withWeight.sort(
    (a: { data: { weight?: number } }, b: { data: { weight?: number } }) => (a.data.weight || 0) - (b.data.weight || 0)
  );
  const sortedArray = [...new Set([...sortedWeightedArray, ...withoutWeight])];
  return sortedArray;
};
