import { EngineBlueprint, EngineElement, Role } from '../types';

/**
 * Converts an EngineElement to a UI-friendly representation.
 * Derived values like clock_position are calculated here.
 */
export const engineToUI = (element: EngineElement) => {
  const { theta, radius, layer, role } = element;
  
  // Convert theta to clock position (e.g. 0 deg -> 12:00, 90 deg -> 3:00)
  const hour = (Math.round((theta / 30) + 12) % 12) || 12;
  const clock_position = `${hour}:00`;
  
  return {
    ...element,
    clock_position,
    category: role, // UI uses category for styling
    radius_label: layer // UI uses layer as radius label
  };
};

/**
 * Converts a UI element back to an EngineElement.
 * This is useful if the user edits a derived property (though we prefer editing engine props).
 */
export const uiToEngine = (uiElement: any): EngineElement => {
  const { theta, radius, layer, role, id, scale, rotation } = uiElement;
  
  return {
    id,
    role: role as Role,
    theta: Number(theta),
    radius: Number(radius),
    layer: layer as any,
    scale: Number(scale),
    rotation: Number(rotation)
  };
};

/**
 * Transforms an entire EngineBlueprint for UI display.
 */
export const transformBlueprintForUI = (blueprint: EngineBlueprint) => {
  return {
    ...blueprint,
    elements: blueprint.elements.map(engineToUI)
  };
};
