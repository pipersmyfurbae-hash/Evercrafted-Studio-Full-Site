// EVERCRAFTED MARKETPLACE SCHEMA

export interface MarketplaceBlueprint {
  id: string;
  title: string;
  description: string;

  emotionTags: string[];
  styleTags: string[];

  blueprint: any[]; // canonical BlueprintElement[]
  renderPreview: string; // image URL

  price: number;
  creatorId: string;

  createdAt: string;
  downloads: number;
  rating: number;
}
