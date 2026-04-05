import { Tier, hasTierAccess, normalizeTier } from './tierService';

export type BillingMode = 'tier_included' | 'add_on' | 'standalone' | 'hybrid';

export interface AppCatalogItem {
  id: string;
  name: string;
  route: string;
  billingMode: BillingMode;
  requiredTier: Tier;
}

export const APP_CATALOG: AppCatalogItem[] = [
  { id: 'memory_weaver', name: 'Memory Weaver', route: '/app/apps/memory', billingMode: 'tier_included', requiredTier: 'bloom' },
  { id: 'inventory_weaver', name: 'Inventory Weaver', route: '/app/apps/inventory', billingMode: 'tier_included', requiredTier: 'craft' },
  { id: 'blueprint_studio', name: 'Blueprint Studio', route: '/app/apps/studio', billingMode: 'tier_included', requiredTier: 'studio' },
  { id: 'creator_dashboard', name: 'Creator Dashboard', route: '/app/apps/upload', billingMode: 'hybrid', requiredTier: 'studio' },
  { id: 'motion_engine', name: 'Motion Engine', route: '/app/apps/motion', billingMode: 'add_on', requiredTier: 'studio' },
  { id: 'ai_placement_editor', name: 'AI Placement Editor', route: '/app/apps/placement', billingMode: 'tier_included', requiredTier: 'studio' },
  { id: 'visualize_with_ai', name: 'Visualize with AI', route: '/app/visualize-with-ai', billingMode: 'tier_included', requiredTier: 'craft' },
  { id: 'wreath_remixer', name: 'Wreath Remixer', route: '/app/wreath-remixer', billingMode: 'add_on', requiredTier: 'studio' },
  { id: 'render_prompt_builder', name: 'Render Prompt Builder', route: '/app/render-prompt-builder', billingMode: 'tier_included', requiredTier: 'craft' },
  { id: 'assistant', name: 'Assistant', route: '/app/assistant', billingMode: 'tier_included', requiredTier: 'bloom' },
  { id: 'sourcing', name: 'Sourcing', route: '/app/sourcing', billingMode: 'tier_included', requiredTier: 'bloom' },
  { id: 'market', name: 'Market', route: '/app/market', billingMode: 'standalone', requiredTier: 'bloom' },
  { id: 'inventory_vision', name: 'Inventory Vision', route: '/app/inventory-vision', billingMode: 'add_on', requiredTier: 'craft' },
  { id: 'moodboard_parser', name: 'Moodboard Parser', route: '/app/moodboard-parser', billingMode: 'tier_included', requiredTier: 'craft' },
  { id: 'customer_retention', name: 'Customer Retention', route: '/app/customer-retention', billingMode: 'add_on', requiredTier: 'studio' },
  { id: 'reverse_engineer', name: 'Reverse Engineer', route: '/app/reverse-engineer', billingMode: 'add_on', requiredTier: 'studio' },
  { id: 'validator', name: 'Validator', route: '/app/validator', billingMode: 'tier_included', requiredTier: 'craft' },
  { id: 'marketplace', name: 'Marketplace', route: '/app/marketplace', billingMode: 'standalone', requiredTier: 'bloom' },
  { id: 'order_studio', name: 'Order Studio', route: '/app/order-studio', billingMode: 'standalone', requiredTier: 'craft' },
  { id: 'productivity_dashboard', name: 'Productivity Dashboard', route: '/app/productivity-dashboard', billingMode: 'tier_included', requiredTier: 'bloom' },
  { id: 'profit_predictor', name: 'Profit Predictor', route: '/app/profit-predictor', billingMode: 'add_on', requiredTier: 'craft' },
  { id: 'trend_forecaster', name: 'Trend Forecaster', route: '/app/trend-forecaster', billingMode: 'add_on', requiredTier: 'craft' },
  { id: 'shipping_optimizer', name: 'Shipping Optimizer', route: '/app/shipping-optimizer', billingMode: 'add_on', requiredTier: 'craft' },
  { id: 'workflow_automator', name: 'Workflow Automator', route: '/app/workflow-automator', billingMode: 'add_on', requiredTier: 'studio' },
];

export function getAppById(id: string): AppCatalogItem | undefined {
  return APP_CATALOG.find((app) => app.id === id);
}

export function canAccessApp(params: {
  appId: string;
  rawTier?: string;
  allowedApps?: string[];
}): boolean {
  const app = getAppById(params.appId);
  if (!app) {
    return false;
  }

  const normalizedTier = normalizeTier(params.rawTier);
  if (hasTierAccess(normalizedTier, app.requiredTier)) {
    return true;
  }

  return Boolean(params.allowedApps?.includes(app.id));
}
