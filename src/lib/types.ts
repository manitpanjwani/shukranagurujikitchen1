export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
};

export type MenuItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  is_veg: boolean;
  is_bestseller: boolean;
  in_stock: boolean;
  rating: number;
  reviews_count: number;
  image_url: string | null;
  sort_order: number;
  category?: Category | null;
};

export type Offer = {
  id: string;
  title: string;
  subtitle: string | null;
  code: string | null;
  active: boolean;
  sort_order: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  created_at: string;
};

export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  desktop_url: string | null;
  mobile_url: string | null;
  active: boolean;
  sort_order: number;
};
