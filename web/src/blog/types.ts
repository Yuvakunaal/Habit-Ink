export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: number;
  category: string;
  tags: string[];
  excerpt: string;
  author: string;
  content: string;
  keywords?: string[];
}
