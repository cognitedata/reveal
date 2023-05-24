import { DataModelLibraryTemplateItem } from '.';

export const ISO14224: DataModelLibraryTemplateItem = {
  name: 'ISO 14224',
  description:
    'ISO 14224 is an international standard developed by the International Organization for Standardization (ISO). It is titled "Petroleum, petrochemical and natural gas industries - Collection and exchange of reliability and maintenance data for equipment" and provides guidelines for the collection and exchange of data related to reliability and maintenance of equipment in the petroleum, petrochemical, and natural gas industries.',
  category: 'Oil & Gas',
  versions: [
    {
      dml: `type EquipmentClass {
  equipmentClassCode: String
  equipmentCategory: EquipmentCategory
  equipmentClassName: String
  subunitTypes: [EquipmentSubunitType]
}

type EquipmentCategory {
  equipmentCategoryName: String
}

type Equipment {
  id: String
  equipmentClass: EquipmentClass
  equipmentDescription: String
  equipmentSerialNumber: String
  plant: Plant
  manufacturerName: String
  failureModePerEquipmentClass: FailureModePerEquipmentClass
  failureModeCode: String
}

type EquipmentSubunit {
  unitName: String
  equipmentSubunitType: EquipmentSubunitType
  subunitOfEquipment: Equipment
}

type EquipmentComponent {
  unitName: String
  equipmentSubunitType: EquipmentSubunitComponentType
  componentOfEquipmentSubunit: EquipmentSubunit
}

type FailureMode {
  failureModeCode: String
  failureModeName: String
  applicableEquipmentClass: [EquipmentClass]
}

type FailureModePerEquipmentClass {
  failureModeCode: String
  failureModeName: String
  failureMode: FailureMode
  applicableEquipmentClass: EquipmentClass
  failureModeDescription: String
}

type ConditionState {
  id: String
  conditionStateName: String
  sdMinThreshold: Float
  sdMaxThreshold: Float
  failureCause: FailureCause
  maintenanceRecommendation: MaintenanceRecommendation
  failureEventType: FailureEventType
  failureModePerEquipmentClass: FailureModePerEquipmentClass
  parameter: String
  timeSeriesName: String
  equipment: Equipment
  equipmentSubunit: EquipmentSubunit
  equipmentComponent: EquipmentComponent
}

type FailureCause {
  failureCauseCode: String
  name: String
}

type MaintenanceRecommendation {
  id: String
  name: String
}

type FailureEventType {
  failureEventId: String
  failureEventType: String
  failureEventDate: String
}

type EquipmentSubunitType {
  equipmentSubunitType: String
  equipmentClass: EquipmentClass
  componentTypes: [EquipmentSubunitComponentType]
}

type EquipmentSubunitComponentType {
  equipmentComponentType: String
  equipmentSubunitType: EquipmentSubunitType
}

type BusinessCategoryType {
  businessCategoryType: String
}

type BusinessAreaType {
  businessAreaType: String
  businessCategoryType: BusinessCategoryType
}

type PlantorUnitType {
  plantType: String
  businessAreaType: BusinessAreaType
}

type Plant {
  plant: String
  plantType: PlantorUnitType
  businessAreaType: BusinessAreaType
  businessCategoryType: BusinessCategoryType
}`,
      version: '1',
      date: new Date('2023-04-03'),
    },
  ],
};
