export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  tags: string[];
  ingredients?: string[];
  size?: string;
  benefits?: string[];
}

export const products: Product[] = [
  // Skincare Products
  {
    id: 1,
    name: "Hydrating Face Serum",
    brand: "Glow Essentials",
    category: "skincare",
    price: 45.99,
    originalPrice: 59.99,
    description: "A powerful hydrating serum with hyaluronic acid and vitamin C for radiant, plump skin.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 1247,
    inStock: true,
    tags: ["hydrating", "anti-aging", "vitamin-c"],
    ingredients: ["Hyaluronic Acid", "Vitamin C", "Niacinamide", "Aloe Vera"],
    size: "30ml",
    benefits: ["Deep hydration", "Brightens skin", "Reduces fine lines", "Improves texture"]
  },
  {
    id: 2,
    name: "Gentle Foaming Cleanser",
    brand: "Pure Beauty",
    category: "skincare",
    price: 28.50,
    description: "A gentle yet effective cleanser that removes impurities without stripping natural oils.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 892,
    inStock: true,
    tags: ["cleanser", "gentle", "foaming"],
    ingredients: ["Glycerin", "Coconut Oil", "Chamomile Extract", "Aloe Vera"],
    size: "150ml",
    benefits: ["Removes makeup", "Gentle on skin", "Maintains pH balance", "Suitable for all skin types"]
  },
  {
    id: 3,
    name: "Retinol Night Cream",
    brand: "Age Defy",
    category: "skincare",
    price: 65.00,
    originalPrice: 85.00,
    description: "Advanced retinol formula for overnight skin renewal and wrinkle reduction.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 567,
    inStock: true,
    tags: ["retinol", "anti-aging", "night-cream"],
    ingredients: ["Retinol", "Peptides", "Ceramides", "Niacinamide"],
    size: "50ml",
    benefits: ["Reduces wrinkles", "Improves skin texture", "Increases collagen", "Fades dark spots"]
  },

  // Makeup Products
  {
    id: 4,
    name: "Long-Wear Foundation",
    brand: "Perfect Match",
    category: "makeup",
    price: 42.00,
    description: "24-hour long-wear foundation with buildable coverage and natural finish.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 2156,
    inStock: true,
    tags: ["foundation", "long-wear", "buildable"],
    size: "30ml",
    benefits: ["24-hour wear", "Buildable coverage", "Natural finish", "Oil-free"]
  },
  {
    id: 5,
    name: "Matte Liquid Lipstick",
    brand: "Bold Beauty",
    category: "makeup",
    price: 24.99,
    originalPrice: 32.99,
    description: "Ultra-matte liquid lipstick with intense color payoff and comfortable wear.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
    rating: 4.5,
    reviews: 1893,
    inStock: true,
    tags: ["lipstick", "matte", "long-lasting"],
    size: "3.5ml",
    benefits: ["8-hour wear", "Transfer-proof", "Comfortable", "Intense color"]
  },
  {
    id: 6,
    name: "Volumizing Mascara",
    brand: "Lash Luxe",
    category: "makeup",
    price: 29.50,
    description: "Volumizing mascara that adds dramatic volume and length to lashes.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 3421,
    inStock: true,
    tags: ["mascara", "volumizing", "lengthening"],
    size: "10ml",
    benefits: ["Adds volume", "Lengthens lashes", "Smudge-proof", "Easy removal"]
  },

  // Hair Care Products
  {
    id: 7,
    name: "Repair Hair Mask",
    brand: "Silk & Shine",
    category: "haircare",
    price: 38.00,
    originalPrice: 48.00,
    description: "Intensive repair mask for damaged and dry hair with keratin and argan oil.",
    image: "https://images.unsplash.com/photo-1522338146-1111936b1b1c?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 756,
    inStock: true,
    tags: ["hair-mask", "repair", "keratin"],
    ingredients: ["Keratin", "Argan Oil", "Shea Butter", "Biotin"],
    size: "200ml",
    benefits: ["Repairs damage", "Adds shine", "Reduces frizz", "Strengthens hair"]
  },
  {
    id: 8,
    name: "Color-Protect Shampoo",
    brand: "Vibrant Locks",
    category: "haircare",
    price: 26.50,
    description: "Sulfate-free shampoo specifically formulated to protect and preserve hair color.",
    image: "https://images.unsplash.com/photo-1522338146-1111936b1b1c?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 1123,
    inStock: true,
    tags: ["shampoo", "color-protect", "sulfate-free"],
    ingredients: ["Coconut Oil", "Vitamin E", "UV Filters", "Panthenol"],
    size: "250ml",
    benefits: ["Protects color", "Sulfate-free", "Gentle cleansing", "Adds shine"]
  },
  {
    id: 9,
    name: "Heat Protectant Spray",
    brand: "Style Shield",
    category: "haircare",
    price: 22.00,
    description: "Lightweight heat protectant spray that shields hair from heat damage up to 450°F.",
    image: "https://images.unsplash.com/photo-1522338146-1111936b1b1c?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 2341,
    inStock: true,
    tags: ["heat-protectant", "spray", "lightweight"],
    size: "150ml",
    benefits: ["Heat protection up to 450°F", "Lightweight", "Non-greasy", "Adds shine"]
  },

  // Fragrances
  {
    id: 10,
    name: "Floral Paradise EDP",
    brand: "Scent Stories",
    category: "fragrances",
    price: 89.00,
    originalPrice: 120.00,
    description: "A romantic floral fragrance with notes of jasmine, rose, and vanilla.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 445,
    inStock: true,
    tags: ["perfume", "floral", "romantic"],
    size: "50ml",
    benefits: ["Long-lasting", "Unique blend", "Elegant packaging", "Suitable for all occasions"]
  },
  {
    id: 11,
    name: "Fresh Citrus Body Mist",
    brand: "Zest & Zen",
    category: "fragrances",
    price: 18.50,
    description: "Refreshing citrus body mist perfect for daily wear and summer days.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
    rating: 4.4,
    reviews: 892,
    inStock: true,
    tags: ["body-mist", "citrus", "fresh"],
    size: "100ml",
    benefits: ["Refreshing", "Light scent", "Perfect for summer", "Affordable luxury"]
  },
  {
    id: 12,
    name: "Vanilla Dream Perfume",
    brand: "Sweet Scents",
    category: "fragrances",
    price: 65.00,
    description: "Warm and comforting vanilla fragrance with hints of caramel and musk.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 678,
    inStock: true,
    tags: ["perfume", "vanilla", "warm"],
    size: "30ml",
    benefits: ["Warm scent", "Long-lasting", "Comforting", "Perfect for evenings"]
  }
];

export const categories = [
  { id: 'skincare', name: 'Skincare', icon: '🧴' },
  { id: 'makeup', name: 'Makeup', icon: '💄' },
  { id: 'haircare', name: 'Hair Care', icon: '💇‍♀️' },
  { id: 'fragrances', name: 'Fragrances', icon: '🌸' }
];

export const getProductsByCategory = (category: string) => {
  return products.filter(product => product.category === category);
};

export const getProductById = (id: number) => {
  return products.find(product => product.id === id);
};

export const searchProducts = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.brand.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};