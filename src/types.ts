export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  publishedDate: string;
  status: 'Draft' | 'Published';
  isFeatured: boolean;
  featuredImage: string;
  tags: string[];
  views: number;
  readingTime: string;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
}

export interface VisitorStats {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  visitorHistory: { day: string; count: number }[];
}

export interface NewsletterSubscription {
  email: string;
  timestamp: string;
}
