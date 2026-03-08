export interface TastingCard {
  id: string;
  photo?: string;
  name: string;
  year: string;
  country: string;
  region?: string;
  producer?: string;
  style: string;
  impression?: string;
  date: string;
  aromaIntensity?: number;
  primaryAromas?: string;
  secondaryAromas?: string;
  flavor?: string;
  finish?: string;
  color?: string;
  density?: string;
  rating: number;
  notes?: string;
  likes: number;
}

export interface UserProfile {
  nickname: string;
  bio: string;
  avatar: string;
}

export interface Friend {
  id: string;
  nickname: string;
  avatar: string;
  bio: string;
  tastingsCount: number;
  avgRating: number;
  tastings: TastingCard[];
}
