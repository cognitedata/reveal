import { DataModelLibraryTemplateItem } from '.';

export const ISO14224: DataModelLibraryTemplateItem = {
  name: 'ISO 14224',
  description:
    'ISO 14224 is an international standard developed by the International Organization for Standardization (ISO). It is titled "Petroleum, petrochemical and natural gas industries - Collection and exchange of reliability and maintenance data for equipment" and provides guidelines for the collection and exchange of data related to reliability and maintenance of equipment in the petroleum, petrochemical, and natural gas industries.',
  category: 'Oil & Gas',
  versions: [
    {
      dml: `type Iso14224_Industry {
  name: String
  businessCategories: [Iso14224_BusinessCategory]
  standardReference: String
}

type Iso14224_BusinessCategory {
  name: String
  industry: Iso14224_Industry
  businessAreas: [Iso14224_BusinessArea]
  standardReference: String
}

type Iso14224_BusinessArea {
  name: String
  businessCategory: Iso14224_BusinessCategory
  installationCategories: [Iso14224_InstallationCategory]
  standardReference: String
}

type Iso14224_InstallationCategory {
  name: String
  businessArea: Iso14224_BusinessArea
  plantOrUnitClassifications: [Iso14224_PlantOrUnitClassification]
  standardReference: String
}

type Iso14224_Installation {
  name: String
  code: String
  installationCategory: Iso14224_InstallationCategory
  geographicalLocation: Iso3166_Country
  plants: [Iso14224_PlantOrUnit]
}

type Iso3166_Country {
  name: String
  code: String
}

type Iso14224_PlantOrUnitClassification {
  name: String
  installationCategory: Iso14224_InstallationCategory
  standardReference: String
}

type Iso14224_PlantOrUnit {
  name: String
  code: String
  plantOrUnitClassification: Iso14224_PlantOrUnitClassification
  installation: Iso14224_Installation
  systems: [Iso14224_System]
}

type Iso14224_SystemSectionClassification {
  name: String
  systemClassification: [Iso14224_SystemClassification]
  standardReference: String
}

type Iso14224_SystemClassification {
  name: String
  code: String
  systemSectionClassification: Iso14224_SystemSectionClassification
  standardReference: String
}

type Iso14224_System {
  name: String
  code: String
  systemClassification: Iso14224_SystemClassification
  plant: Iso14224_PlantOrUnit
  equipmentUnits: [Iso14224_EquipmentUnit]
}

type Iso14224_Reference {
  name: String # Extract names from the standards
  code: String
  appliedToEquipmentClasses: [Iso14224_EquipmentClass]
}

type Iso14224_EquipmentCategory {
  name: String
  equipmentClasses: [Iso14224_EquipmentClass]
  standardReference: String
}

interface Iso14224_EquipmentClass {
  code: String
  name: String
  equipmentCategory: Iso14224_EquipmentCategory
  subunitTypes: [Iso14224_EquipmentSubunitType]
  equipmentTypes: [Iso14224_EquipmentType]
  failuremodes: [Iso14224_FailureMode]
  standardReference: String
}

interface Iso14224_EquipmentType {
  code: String
  name: String
  equipmentClass: Iso14224_EquipmentClass
  standardReference: String
}

# When making domain model for customer, instance of a type will have to use 
# specific implementation of equipment class, subunit and component


interface Iso14224_EquipmentUnit {
  tagNumber: String
  description: String
  equipmentType: Iso14224_EquipmentType
  system: Iso14224_System
  serialNumber: String
  manufacturerName: String
  manufacturingModelDesignation: String
  normalOperatingStateOrMode: Iso14224_NormalOperatingStateOrMode
  commissioningDate: Timestamp
  startDateOfCurrentService: Timestamp
  surveillanceTime: Float
  operationalTime: Float
  numberOfPeriodicTestDemandsDuringSurveillance: Int
  numberOfOperationalDemandsDuringSurveillance: Int
  totalWellsDrilledDuringSurveillance: Int
  additionalInformation: String
  sourceOfData: String
  equipmentSubunits: [Iso14224_EquipmentSubunit]
}

type Iso14224_NormalOperatingStateOrMode {
  name: String
  standardReference: String
}

type Iso14224_EquipmentSubunit {
  tagNumber: String
  description: String
  subunitOfEquipmentUnit: Iso14224_EquipmentUnit
  equipmentSubunitType: Iso14224_EquipmentSubunitType
  equipmentComponents: [Iso14224_EquipmentComponent]
}

type Iso14224_EquipmentComponent {
  tagNumber: String
  description: String
  componentOfEquipmentSubunit: Iso14224_EquipmentSubunit
  equipmentSubunitType: Iso14224_EquipmentSubunitComponentType
  parts: [Iso14224_Part]
}

type PartType {
  code: String
  name: String
}

type Iso14224_Part {
  equipmentComponent: Iso14224_EquipmentComponent
  partType: PartType
  tagNumber: String
  description: String
}

type Iso14224_FailureMode {
  code: String
  name: String
  applicableEquipmentClass: [Iso14224_EquipmentClass]
  description: String
  failureMechanisms: [Iso14224_FailureMechanism]
  standardReference: String
}

type Iso14224_FailureMechanism {
  code: String
  notation: String
  subdivisionCode : String
  subdivisionNotation : String
  description : String
  subdivisions: [Iso14224_FailureMechanism]
  standardReference: String
}

type Iso14224_FailureCause {
  code: String
  notation: String
  subdivisionCode: String
  subdivisionNotation: String
  description: String
  subdivisions: [Iso14224_FailureCause]
  standardReference: String
}

type MaintenanceRecommendation {
  id: String
  name: String
}

type Iso14224_EquipmentSubunitType {
  name: String
  equipmentClass: Iso14224_EquipmentClass
  componentTypes: [Iso14224_EquipmentSubunitComponentType]
  standardReference: String
}

type Iso14224_EquipmentSubunitComponentType {
  name: String
  equipmentSubunitType: Iso14224_EquipmentSubunitType
  standardReference: String
}


interface Iso14224_Pump implements Iso14224_EquipmentUnit {
  tagNumber: String
  description: String
  equipmentType: Iso14224_EquipmentType
  system: Iso14224_System
  serialNumber: String
  manufacturerName: String
  manufacturingModelDesignation: String
  normalOperatingStateOrMode: Iso14224_NormalOperatingStateOrMode
  commissioningDate: Timestamp
  startDateOfCurrentService: Timestamp
  surveillanceTime: Float
  operationalTime: Float
  numberOfPeriodicTestDemandsDuringSurveillance: Int
  numberOfOperationalDemandsDuringSurveillance: Int
  totalWellsDrilledDuringSurveillance: Int
  additionalInformation: String
  sourceOfData: String
  equipmentSubunits: [Iso14224_EquipmentSubunit]
  typeOfDriverName: String
  typeOfDriverCode: String
  typeOfFluidHandled: String
  fluidCorrosiveErosiveClass: String
  pumpApplication: String
  pumpDesign: String
  designRatedPower: Float
  designRatedPower_UOM: String
  normalOperatingDesignCapacity: Float
  normalOperatingDesignCapacity_UOM: String
  designSuctionPressure: Float
  designSuctionPressure_UOM: String
  designDischargePressure: Float
  designDischargePressure_UOM: String
  designSpeedRPM: Float
  designSpeedRPM_UOM: String
  numberOfStages: Int
  bodyType: String
  shaftOrientation: String
  shaftSealingType: String
  transmissionType: String
  couplingType: String
  environment: String
  pumpCooling_ExtSys_YesOrNo: String
  radialBearingType: String
  thrustBearingType: String
  bearingSupportType: String
}

type Iso14224_ElectricMotor implements Iso14224_EquipmentUnit {
  tagNumber: String
  description: String
  equipmentType: Iso14224_EquipmentType
  system: Iso14224_System
  serialNumber: String
  manufacturerName: String
  manufacturingModelDesignation: String
  normalOperatingStateOrMode: Iso14224_NormalOperatingStateOrMode
  commissioningDate: Timestamp
  startDateOfCurrentService: Timestamp
  surveillanceTime: Float
  operationalTime: Float
  numberOfPeriodicTestDemandsDuringSurveillance: Int
  numberOfOperationalDemandsDuringSurveillance: Int
  totalWellsDrilledDuringSurveillance: Int
  additionalInformation: String
  sourceOfData: String
  equipmentSubunits: [Iso14224_EquipmentSubunit]
  typeOfDrivenUnit: Iso14224_EquipmentType #Should this be picked up from the driven unit
  drivenUnit: Iso14224_EquipmentUnit
  maxDesignPowerOUT: Float
  maxDesignPowerOUT_UOM: String
  operatingPower: Float
  operatingPower_UOM: String
  variableSpeed_YesOrNo: String
  designSpeed: Float
  designSpeed_UOM: String
  motorType: String
  insulationClassStator_IEC60034_1: String
  temperatureRise_Stator_IEC60034_1: String
  insulationClassRotor: String
  degreeOfProtection_IEC60529: String
  typeOfExProtection: String
}

interface Iso14224_Compressor implements Iso14224_EquipmentUnit {
  tagNumber: String
  description: String
  equipmentType: Iso14224_EquipmentType
  system: Iso14224_System
  serialNumber: String
  manufacturerName: String
  manufacturingModelDesignation: String
  normalOperatingStateOrMode: Iso14224_NormalOperatingStateOrMode
  commissioningDate: Timestamp
  startDateOfCurrentService: Timestamp
  surveillanceTime: Float
  operationalTime: Float
  numberOfPeriodicTestDemandsDuringSurveillance: Int
  numberOfOperationalDemandsDuringSurveillance: Int
  totalWellsDrilledDuringSurveillance: Int
  additionalInformation: String
  sourceOfData: String
  equipmentSubunits: [Iso14224_EquipmentSubunit]
  compressedMedium: String
  typeOfDrivenUnit: Iso14224_EquipmentType #Should this be picked up from the driven unit
  drivenUnit: Iso14224_EquipmentUnit
  gasHandled: Float
  gasHandled_UOM: String
  suctionPressure_firstStage_design: Float
  suctionPressure_firstStage_design_UOM: String
  suctionPressure_firstStage_operating: Float
  suctionPressure_firstStage_operating_UOM: String
  dischargePressure_lastStage_design: Float
  dischargePressure_lastStage_design_UOM: String
  dischargePressure_lastStage_operating: Float
  dischargePressure_lastStage_operating_UOM: String
  flowRate_design: Float
  flowRate_design_UOM: String
  flowRate_operating: Float
  flowRate_operating_UOM: String
  dischargeTemperature_design: Float
  dischargeTemperature_design_UOM: String
  dischargeTemperature_operating: Float
  dischargeTemperature_operating_UOM: String
  designPower: Float
  designPower_UOM: String
  utilization: Float
  utilization_UOM: String
  polytropicHead: Float
  polytropicHead_UOM: String
  numberOfCasings: Int
  numberOfStages: Int
  bodyType: String
  shaftSealingType: String
  intercoolerFitted_YesOrNo: String
  shaftSealSystemType: String
  radialBearingType: String
  thrustBearingType: String
  designSpeed: Float
  designSpeed_UOM: String
  couplingType: String
}

type Iso14224_ReciprocatingCompressor implements Iso14224_Compressor & Iso14224_EquipmentUnit {
  tagNumber: String
  description: String
  equipmentType: Iso14224_EquipmentType
  system: Iso14224_System
  serialNumber: String
  manufacturerName: String
  manufacturingModelDesignation: String
  normalOperatingStateOrMode: Iso14224_NormalOperatingStateOrMode
  commissioningDate: Timestamp
  startDateOfCurrentService: Timestamp
  surveillanceTime: Float
  operationalTime: Float
  numberOfPeriodicTestDemandsDuringSurveillance: Int
  numberOfOperationalDemandsDuringSurveillance: Int
  totalWellsDrilledDuringSurveillance: Int
  additionalInformation: String
  sourceOfData: String
  equipmentSubunits: [Iso14224_EquipmentSubunit]
  compressedMedium: String
  typeOfDrivenUnit: Iso14224_EquipmentType #Should this be picked up from the driven unit
  drivenUnit: Iso14224_EquipmentUnit
  gasHandled: Float
  gasHandled_UOM: String
  suctionPressure_firstStage_design: Float
  suctionPressure_firstStage_design_UOM: String
  suctionPressure_firstStage_operating: Float
  suctionPressure_firstStage_operating_UOM: String
  dischargePressure_lastStage_design: Float
  dischargePressure_lastStage_design_UOM: String
  dischargePressure_lastStage_operating: Float
  dischargePressure_lastStage_operating_UOM: String
  flowRate_design: Float
  flowRate_design_UOM: String
  flowRate_operating: Float
  flowRate_operating_UOM: String
  dischargeTemperature_design: Float
  dischargeTemperature_design_UOM: String
  dischargeTemperature_operating: Float
  dischargeTemperature_operating_UOM: String
  designPower: Float
  designPower_UOM: String
  utilization: Float
  utilization_UOM: String
  polytropicHead: Float
  polytropicHead_UOM: String
  numberOfCasings: Int
  numberOfStages: Int
  bodyType: String
  shaftSealingType: String
  intercoolerFitted_YesOrNo: String
  shaftSealSystemType: String
  radialBearingType: String
  thrustBearingType: String
  designSpeed: Float
  designSpeed_UOM: String
  couplingType: String
  cylinderConfiguration: String
  cylinderOrientation: String
  workingPrinciple: String
  packingType: String
}

type Iso14224_CentrifugalPump implements Iso14224_Pump & Iso14224_EquipmentUnit {
  tagNumber: String
  description: String
  equipmentType: Iso14224_EquipmentType
  system: Iso14224_System
  serialNumber: String
  manufacturerName: String
  manufacturingModelDesignation: String
  normalOperatingStateOrMode: Iso14224_NormalOperatingStateOrMode
  commissioningDate: Timestamp
  startDateOfCurrentService: Timestamp
  surveillanceTime: Float
  operationalTime: Float
  numberOfPeriodicTestDemandsDuringSurveillance: Int
  numberOfOperationalDemandsDuringSurveillance: Int
  totalWellsDrilledDuringSurveillance: Int
  additionalInformation: String
  sourceOfData: String
  equipmentSubunits: [Iso14224_EquipmentSubunit]
  typeOfDriverName: String
  typeOfDriverCode: String
  typeOfFluidHandled: String
  fluidCorrosiveErosiveClass: String
  pumpApplication: String
  pumpDesign: String
  designRatedPower: Float
  designRatedPower_UOM: String
  normalOperatingDesignCapacity: Float
  normalOperatingDesignCapacity_UOM: String
  designSuctionPressure: Float
  designSuctionPressure_UOM: String
  designDischargePressure: Float
  designDischargePressure_UOM: String
  designSpeedRPM: Float
  designSpeedRPM_UOM: String
  numberOfStages: Int
  bodyType: String
  shaftOrientation: String
  shaftSealingType: String
  transmissionType: String
  couplingType: String
  environment: String
  pumpCooling_ExtSys_YesOrNo: String
  radialBearingType: String
  thrustBearingType: String
  bearingSupportType: String
  numberOfImpellers: Float
}

type Iso14224_ReciprocatingPump implements Iso14224_Pump & Iso14224_EquipmentUnit {
  tagNumber: String
  description: String
  equipmentType: Iso14224_EquipmentType
  system: Iso14224_System
  serialNumber: String
  manufacturerName: String
  manufacturingModelDesignation: String
  normalOperatingStateOrMode: Iso14224_NormalOperatingStateOrMode
  commissioningDate: Timestamp
  startDateOfCurrentService: Timestamp
  surveillanceTime: Float
  operationalTime: Float
  numberOfPeriodicTestDemandsDuringSurveillance: Int
  numberOfOperationalDemandsDuringSurveillance: Int
  totalWellsDrilledDuringSurveillance: Int
  additionalInformation: String
  sourceOfData: String
  equipmentSubunits: [Iso14224_EquipmentSubunit]
  typeOfDriverName: String
  typeOfDriverCode: String
  typeOfFluidHandled: String
  fluidCorrosiveErosiveClass: String
  pumpApplication: String
  pumpDesign: String
  designRatedPower: Float
  designRatedPower_UOM: String
  normalOperatingDesignCapacity: Float
  normalOperatingDesignCapacity_UOM: String
  designSuctionPressure: Float
  designSuctionPressure_UOM: String
  designDischargePressure: Float
  designDischargePressure_UOM: String
  designSpeedRPM: Float
  designSpeedRPM_UOM: String
  numberOfStages: Int
  bodyType: String
  shaftOrientation: String
  shaftSealingType: String
  transmissionType: String
  couplingType: String
  environment: String
  pumpCooling_ExtSys_YesOrNo: String
  radialBearingType: String
  thrustBearingType: String
  bearingSupportType: String
  numberOfCylinders: String
}

type Iso14224_RotaryPump implements Iso14224_Pump & Iso14224_EquipmentUnit {
  tagNumber: String
  description: String
  equipmentType: Iso14224_EquipmentType
  system: Iso14224_System
  serialNumber: String
  manufacturerName: String
  manufacturingModelDesignation: String
  normalOperatingStateOrMode: Iso14224_NormalOperatingStateOrMode
  commissioningDate: Timestamp
  startDateOfCurrentService: Timestamp
  surveillanceTime: Float
  operationalTime: Float
  numberOfPeriodicTestDemandsDuringSurveillance: Int
  numberOfOperationalDemandsDuringSurveillance: Int
  totalWellsDrilledDuringSurveillance: Int
  additionalInformation: String
  sourceOfData: String
  equipmentSubunits: [Iso14224_EquipmentSubunit]
  typeOfDriverName: String
  typeOfDriverCode: String
  typeOfFluidHandled: String
  fluidCorrosiveErosiveClass: String
  pumpApplication: String
  pumpDesign: String
  designRatedPower: Float
  designRatedPower_UOM: String
  normalOperatingDesignCapacity: Float
  normalOperatingDesignCapacity_UOM: String
  designSuctionPressure: Float
  designSuctionPressure_UOM: String
  designDischargePressure: Float
  designDischargePressure_UOM: String
  designSpeedRPM: Float
  designSpeedRPM_UOM: String
  numberOfStages: Int
  bodyType: String
  shaftOrientation: String
  shaftSealingType: String
  transmissionType: String
  couplingType: String
  environment: String
  pumpCooling_ExtSys_YesOrNo: String
  radialBearingType: String
  thrustBearingType: String
  bearingSupportType: String
  numberOfRotors: Float
}

type Iso14224_StorageTank implements Iso14224_EquipmentUnit {
  tagNumber: String
  description: String
  equipmentType: Iso14224_EquipmentType
  system: Iso14224_System
  serialNumber: String
  manufacturerName: String
  manufacturingModelDesignation: String
  normalOperatingStateOrMode: Iso14224_NormalOperatingStateOrMode
  commissioningDate: Timestamp
  startDateOfCurrentService: Timestamp
  surveillanceTime: Float
  operationalTime: Float
  numberOfPeriodicTestDemandsDuringSurveillance: Int
  numberOfOperationalDemandsDuringSurveillance: Int
  totalWellsDrilledDuringSurveillance: Int
  additionalInformation: String
  sourceOfData: String
  equipmentSubunits: [Iso14224_EquipmentSubunit]
  storedProduct: String
  productSpecificGravity: Float
  designStandard: String
  designPressure: Float
  designPressure_UOM: String
  designVacuum: Float
  designVacuum_UOM: String
  volume: Float
  volume_UOM: String
  size_Diameter: Float
  size_Diameter_UOM: String
  size_Height: Float
  size_Height_UOM: String
  design_MinTemperature: Float
  design_MinTemperature_UOM: String
  design_MaxTemperature: Float
  design_MaxTemperature_UOM: String
  operatingTemperature: Float
  operatingTemperature_UOM: String
  shellMaterialType: String
  shellMaterialCode: String
  roofMaterialType: String
  roofMaterialCode: String
  coating_Yes_No: String
  heatingSystem_Yes_No: String
  refrigeratedTankSystem_Yes_No: String
  roofType: String
  floatingRoofType: String
  wallThickness: Float
  wallThickness_UOM: String
  mixer_Agitator_Yes_No: String
  secondaryContainment_Yes_No: String
}

type Iso14224_DetectionMethod {
  code: String
  notation: String
  description: String
  activityType: String
  standardReference: String
}

type Iso14224_FailureRecord {
  failureRecordId: String
  failureRecordType: String
  failureDate: Timestamp
  equipmentUnit: Iso14224_EquipmentUnit
  failureMode: Iso14224_FailureMode
  failureImpactOnHSE: Iso14224_FailureConsequenceClassification
  failureImpactOnOperations: Iso14224_FailureConsequenceClassification
  failureImpactOnEqpmFunction: Iso14224_FailureFunctionImpact
  failureMechanism: Iso14224_FailureMechanism
  failureCause: Iso14224_FailureCause
  subunitFailed: Iso14224_EquipmentSubunit
  componentFailed: Iso14224_EquipmentComponent
  detectionMethod: Iso14224_DetectionMethod
  operatingConditionAtFailure: String
  operationalPhaseAtFailure: String
  sisFailureModeClassification: String
  comments: String
}

type Iso14224_MaintenanceCategory {
  code: String
  name: String
  standardReference: String
}

type Iso14224_MaintenanceRecord {
  maintenanceRecordId: String
  equipmentUnit: Iso14224_EquipmentUnit
  failureRecord: Iso14224_FailureRecord
  maintenanceStartDate: Timestamp
  maintenanceEndDate: Timestamp
  maintenanceDeadline: Timestamp
  maintenanceCategory: Iso14224_MaintenanceCategory
  maintenancePriority: String
  interval: String # Is this type correct?
  maintenanceActivity: Iso14224_MaintenanceActivity
  maintenanceImpactOnOperations: String
  subunitMaintained: Iso14224_EquipmentSubunit
  componentMaintained: Iso14224_EquipmentComponent
  sparePartLocation: String
  maintenanceHoursMeachanical: Float
  maintenanceHoursElectrical: Float
  maintenanceHoursInstrument: Float
  maintenanceHoursOthers: Float
  maintenanceHoursTotal: Float
  maintenanceEquipmentResources: [String]
  activeMaintenanceTime: Float
  downTime: Float
  maintenanceDelays: String
  remarks: String
}

type Iso14224_MaintenanceActivity {
  code: Int
  name: String
  description: String
  examples: String
  use: [Iso14224_MaintenanceCategory]
  standardReference: String
}

type Iso14224_FailureConsequenceClassification {
  consequenceImpact: String
  severityCategory: String
  categoryDescription: String
  consequenceImpactDescription: String
  classification: String
  numberedClassification: Int
  index: Int
  standardReference: String
}

type Iso14224_FailureOccurenceClassification {
  failureModeOccurrence: String
  occurenceDescription: String
  rating: Int
  frequencyPerThousand: Float
  frequency: String
  probability: Float
  probabilityDescription: String
  standardReference: String
}

type Iso14224_FailureFunctionImpact {
  failureFunctionImpactLevel: Int
  description:String
  standardReference: String
}`,
      version: '1',
      date: new Date('2023-04-03'),
    },
  ],
};
