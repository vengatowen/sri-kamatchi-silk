export interface ProductVariant {
  id: string;
  color: string;
  images: string[];
  stock: number;
  sortOrder?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  rating?: number;
  reviews?: number;
  image: string;
  gallery?: string[];
  category: string;
  subcategory?: string;
  subcategorySlug?: string;
  color?: string | null;
  fabric?: string | null;
  occasion?: string[] | string | null;
  sareeLength?: string;
  blouseLength?: string;
  blouseIncluded?: boolean;
  stock: number;
  description: string;
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  offer?: boolean;
  bestSeller?: boolean;
  variants?: ProductVariant[];
  selectedVariantId?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  payment: "Razorpay" | "Cash on Delivery";
  total: number;
  items: OrderItem[];
  address: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  joined: string;
  status: "Active" | "Blocked";
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: "Published" | "Draft";
  updated: string;
  excerpt: string;
}
