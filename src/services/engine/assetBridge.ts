import { FloralAsset, InventoryItem } from '../../types';

export const mapAssetToInventory = (asset: FloralAsset): InventoryItem => {
  return {
    id: asset.sku,
    sku: asset.sku,
    name: asset.name,
    category: asset.category,
    color: asset.color,
    colorFamily: asset.color,
    stock: 100, // Default stock
    quantity: 1, // Default quantity
    role: (asset.category.toLowerCase().includes('focal') ? 'focal' : 'filler') as any,
    visualWeight: asset.dimension_profile.bloom_diameter_inches.typical > 3 ? 'heavy' : 'medium'
  };
};
