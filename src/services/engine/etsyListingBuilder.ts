import { Blueprint } from '../../types';

export interface EtsyListing {
  title: string;
  description: string;
  bullets: string[];
  tags: string[];
  price: string;
  photoShotList: string[];
}

export const buildEtsyListing = (blueprint: Blueprint, designDescription: string): EtsyListing => {
  return {
    title: `Evercrafted Wreath Design: ${blueprint.wreath_id}`,
    description: `A unique, handcrafted wreath design based on the ${blueprint.emotion_profile.intent} emotion profile. This design is perfect for adding a touch of elegance to your home.`,
    bullets: [
      "Includes a detailed blueprint for construction",
      "Step-by-step assembly instructions",
      "Complete materials list",
      "Professional render prompt included"
    ],
    tags: ["wreath", "floral", "diy", "handmade", "evercrafted", "design", "blueprint", "decor", "home", "craft", "wreathmaking", "floraldesign", "digital"],
    price: "$7.99",
    photoShotList: ["Full wreath view", "Close-up of focal cluster", "Side view showing layering", "Materials layout"]
  };
};
