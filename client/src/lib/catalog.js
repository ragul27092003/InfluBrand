export const CATEGORIES = [
  "Auto",
  "Beauty",
  "Books",
  "Comedy",
  "Education",
  "Entertainment",
  "Fashion",
  "Fitness",
  "Food",
  "Gaming",
  "Health",
  "Home",
  "Investment",
  "Lifestyle",
  "Parenting",
  "Pet",
  "Photography",
  "Technology",
  "Travel",
];

export const CITIES = [
  "Ahmedabad",
  "Bangalore",
  "Bhopal",
  "Chandigarh",
  "Chennai",
  "Coimbatore",
  "Delhi",
  "Hyderabad",
  "Indore",
  "Jaipur",
  "Kochi",
  "Kolkata",
  "Lucknow",
  "Mumbai",
  "Nagpur",
  "Pune",
  "Surat",
  "Visakhapatnam",
];

export const PLATFORMS = ["instagram", "youtube", "tiktok"];

// The backend doesn't store a rating field yet, so derive a display-only
// rating (3.5–5.0) from engagement rate — deterministic per influencer id.
export function derivedRating(influencer) {
  const base = 3.5 + Math.min(1.5, (influencer.engagement || 0) / 10);
  return Math.round(base * 10) / 10;
}

export function formatCount(value) {
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return `${value}`;
}

export function formatRupees(value) {
  if (value == null) return "On request";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
