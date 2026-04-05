import { FloralAsset, InventoryItem } from '../../types';

export const mapAssetToInventory = (asset: FloralAsset): InventoryItem => {
  return {
    id: asset.sku,
    name: asset.name,
    category: asset.category as InventoryItem['category'],
    colorFamily: asset.color,
    quantity: 1, // Default quantity
    visualWeight: asset.dimension_profile.bloom_diameter_inches.typical > 3 ? 'heavy' : 'medium'
  };
};
