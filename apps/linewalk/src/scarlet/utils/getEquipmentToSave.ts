import { EquipmentData } from 'scarlet/types';

/**
 * Prepare equipment to save.
 * Removes unapproved detections
 *
 * @param {EquipmentData} equipment
 * @returns {EquipmentData} Transformed equipment
 */
export const getEquipmentToSave = (
  equipment: EquipmentData
): EquipmentData => ({
  ...equipment,
  equipmentElements: equipment.equipmentElements.map((dataElement) => ({
    ...dataElement,
    detections: dataElement.detections.filter((detection) => detection.state),
  })),
  components: equipment.components.map((component) => ({
    ...component,
    componentElements: component.componentElements.map((dataElement) => ({
      ...dataElement,
      detections: dataElement.detections.filter((detection) => detection.state),
    })),
  })),
});
