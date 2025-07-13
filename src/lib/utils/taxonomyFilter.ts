import { slugify } from '@/lib/utils/textConverter';

const taxonomyFilter = (posts: { data: Record<string, string[]> }[], name: string, key: string) =>
  posts.filter((post) => post.data[name].map((name: string) => slugify(name)).includes(key));

export default taxonomyFilter;
