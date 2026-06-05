export type ProductStatus = "Active" | "Inactive";
export type ProductCategory = "Dry" | "Wet" | "Fresh" | "Prescription";
export type ProductPlatform = "Chewy" | "Zooplus";

export type ProductIngredient = "Turkey" | "Rice" | "Zinc sulfate" | "Oat fiber" | "Egg product";

export type ProductRow = {
  id: string;
  foodName: string;
  brand: string;
  affiliateUrl: string;
  platform: ProductPlatform;
  category: ProductCategory;
  ingredient: ProductIngredient;
  benefits: string;
  whyRecommended: string;
  thingsToConsider: string;
  allergyTags: string;
  budgetTag: string;
  description: string;
  clicks: number;
  status: ProductStatus;
};

export const PRODUCT_PAGE_SIZE = 8;

export const PRODUCT_CATEGORY_OPTIONS: ProductCategory[] = ["Dry", "Wet", "Fresh", "Prescription"]; 

export const LIFESTAGE_OPTIONS: string[] = ["", "all", "puppy", "adult", "senior", "gestation"];
export const PRODUCT_INGREDIENT_OPTIONS: ProductIngredient[] = [
  "Turkey",
  "Rice",
  "Zinc sulfate",
  "Oat fiber",
  "Egg product",
];

export const PRODUCT_TABLE_ROWS: ProductRow[] = [
  {
    id: "blue-buffalo-adult-dry",
    foodName: "Blue Buffalo Adult Dry Food",
    brand: "Blue Buffalo",
    affiliateUrl: "https://zooplus.to/3xYz12",
    platform: "Chewy",
    category: "Dry",
    ingredient: "Turkey",
    benefits: "Gentle on stomach, high protein, supports immunity.",
    whyRecommended: "Ideal for sensitive digestion and active dogs.",
    thingsToConsider: "Store in a cool, dry place and seal after opening.",
    allergyTags: "Chicken-free, Grain-free",
    budgetTag: "Premium",
    description: "Balanced dry food designed for adult dogs with sensitive tummies.",
    clicks: 1243,
    status: "Active",
  },
  {
    id: "royal-canin-gastro",
    foodName: "Royal Canin Gastro Care",
    brand: "Royal Canin",
    affiliateUrl: "https://chewy.com/r/abc11",
    platform: "Zooplus",
    category: "Dry",
    ingredient: "Rice",
    benefits: "Easy digestion, gut support, balanced nutrients.",
    whyRecommended: "Great recovery diet after stomach issues.",
    thingsToConsider: "Use with vet recommendation for long-term feeding.",
    allergyTags: "Sensitive stomach",
    budgetTag: "Premium",
    description: "Digestive support formula with controlled fat and fiber balance.",
    clicks: 527,
    status: "Active",
  },
  {
    id: "purina-pro-plan-wet",
    foodName: "Purina Pro Plan Wet",
    brand: "Purina",
    affiliateUrl: "https://zooplus.to/4aBc55",
    platform: "Zooplus",
    category: "Wet",
    ingredient: "Zinc sulfate",
    benefits: "Hydration-friendly, skin health support.",
    whyRecommended: "Useful for dogs that prefer moist texture.",
    thingsToConsider: "Refrigerate unused portion after opening.",
    allergyTags: "Grain-free",
    budgetTag: "Mid-range",
    description: "Palatable wet diet with added micronutrients for coat care.",
    clicks: 1392,
    status: "Active",
  },
  {
    id: "hills-science-diet-dry",
    foodName: "Hill's Science Diet",
    brand: "Hill's",
    affiliateUrl: "https://zooplus.to/4aBc77",
    platform: "Chewy",
    category: "Dry",
    ingredient: "Oat fiber",
    benefits: "Digestive support and steady energy release.",
    whyRecommended: "Good maintenance option for adult dogs.",
    thingsToConsider: "Transition gradually over 7 days.",
    allergyTags: "Wheat-free",
    budgetTag: "Mid-range",
    description: "Well-balanced daily nutrition for medium activity dogs.",
    clicks: 720,
    status: "Inactive",
  },
  {
    id: "farmers-dog-fresh",
    foodName: "The Farmer's Dog Fresh",
    brand: "Farmer's Dog",
    affiliateUrl: "https://chewy.com/r/def22",
    platform: "Chewy",
    category: "Fresh",
    ingredient: "Egg product",
    benefits: "Fresh meal texture, high digestibility.",
    whyRecommended: "Works well for picky eaters.",
    thingsToConsider: "Requires refrigerated storage.",
    allergyTags: "Beef-free",
    budgetTag: "Premium",
    description: "Freshly prepared meals with clean ingredients.",
    clicks: 201,
    status: "Active",
  },
  {
    id: "royal-canin-vet-prescription",
    foodName: "Royal Canin Veterinary",
    brand: "Royal Canin",
    affiliateUrl: "https://zooplus.to/5dEf11",
    platform: "Chewy",
    category: "Prescription",
    ingredient: "Zinc sulfate",
    benefits: "Targeted nutrition for specific conditions.",
    whyRecommended: "Suitable for medically guided food plans.",
    thingsToConsider: "Should be used under veterinary guidance.",
    allergyTags: "Vet-diet",
    budgetTag: "Premium",
    description: "Clinical nutrition line for special dietary management.",
    clicks: 1500,
    status: "Active",
  },
  {
    id: "wellness-core-dry",
    foodName: "Wellness CORE Dry",
    brand: "Wellness",
    affiliateUrl: "https://zooplus.to/6gHi90",
    platform: "Zooplus",
    category: "Dry",
    ingredient: "Oat fiber",
    benefits: "Protein-rich with digestive-friendly fiber.",
    whyRecommended: "Good fit for active adult dogs.",
    thingsToConsider: "Monitor portion sizes to avoid overfeeding.",
    allergyTags: "Corn-free",
    budgetTag: "Mid-range",
    description: "Dry kibble focused on protein and digestive health.",
    clicks: 399,
    status: "Active",
  },
  {
    id: "merrick-classic-wet",
    foodName: "Merrick Classic Wet",
    brand: "Merrick",
    affiliateUrl: "https://chewy.com/r/def99",
    platform: "Zooplus",
    category: "Wet",
    ingredient: "Egg product",
    benefits: "Soft texture and high palatability.",
    whyRecommended: "Good topper or complete meal for seniors.",
    thingsToConsider: "Use within 48 hours after opening.",
    allergyTags: "Chicken-free",
    budgetTag: "Mid-range",
    description: "Classic wet recipe for dogs needing softer food texture.",
    clicks: 102,
    status: "Inactive",
  },
  {
    id: "blue-buffalo-small-breed",
    foodName: "Blue Buffalo Small Breed",
    brand: "Blue Buffalo",
    affiliateUrl: "https://zooplus.to/7kLm21",
    platform: "Chewy",
    category: "Dry",
    ingredient: "Turkey",
    benefits: "Smaller kibble size and focused energy profile.",
    whyRecommended: "Designed for small breed chewing comfort.",
    thingsToConsider: "Keep feeding quantity aligned with dog weight.",
    allergyTags: "Corn-free",
    budgetTag: "Mid-range",
    description: "Small-breed formula supporting daily vitality.",
    clicks: 688,
    status: "Active",
  },
  {
    id: "purina-sensitive-fresh",
    foodName: "Purina Sensitive Fresh",
    brand: "Purina",
    affiliateUrl: "https://chewy.com/r/hij44",
    platform: "Chewy",
    category: "Fresh",
    ingredient: "Rice",
    benefits: "Fresh profile with easy-to-digest carbohydrate source.",
    whyRecommended: "Helps dogs with mild digestive sensitivity.",
    thingsToConsider: "Store chilled and serve at room temperature.",
    allergyTags: "Soy-free",
    budgetTag: "Mid-range",
    description: "Fresh-texture meal with gentle ingredients.",
    clicks: 444,
    status: "Active",
  },
];