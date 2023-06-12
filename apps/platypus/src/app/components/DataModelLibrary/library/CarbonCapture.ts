import { DataModelLibraryTemplateItem } from '.';

export const CarbonCapture: DataModelLibraryTemplateItem = {
  name: 'Carbon Capture',
  description: 'carbon capture utilization storage value chain',
  category: 'Renewables',
  versions: [
    {
      dml: `type CCUSBusinessProcess {
  name: String
  description: String
precedingProcess: CCUSBusinessProcess
  subsequentProcess: CCUSBusinessProcess
  processAsset: [CCUSBusinessProcessAsset]
events: [Event]
  activities: [Activity]
}

interface CCUSBusinessProcessAsset {
  tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
}

type Vessel implements CCUSBusinessProcessAsset {
  tagName: String
  serviceDescription: String
  locations: [VesselLocation]
  cargo: [CarbonDiOxideCargo]
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  vesselType: String
  vesselEmmissions: [VesselEmmission]
  inflowStream: Stream
events: [Event]
  activities: [Activity]
}

type VesselEmmission {
  vessel: Vessel
  vesselFuelConsumption: Float
  vesselPerformance: Float
  vesselGHGEmissions: [VesselGHGEmissions]
  vesselFuelType: String
  recordedTime: Timestamp
  events: [Event]
}

type VesselGHGEmissions {
  vesselFuelType: String
  cO2_Tonnes_calculated: Float
  parentVesselEmmission: VesselEmmission
  vessel: Vessel
  recordedTime: Timestamp
}

type CarbonDiOxideCargo {
  vessel: Vessel
  billOfLading: Document
  cargoReferenceNumber: String
  loadingCompletionDate: Timestamp
  consignor: String
  flag: Country
  master: String
  destination: String
  grossMetricTonnes: Float
  netMetricTonnes: Float
  grossStandardCubicMetersAt15DegreeC: Float
  netStandardCubicMetersAt15DegreeC: Float
}

type CargoMonitoring {
  tankA_Level_m: Float
  tankA_Pressure_bar: Float
  tankA_Temperature_Centrigrade: Float
  tankA_Sloshing_Monitoring: Float
  cargoUnloading_TotalGasFlowBackToVessel_Tonnes: Float
  cargoUnloading_TotalGasFlowBackToVessel_m3_Tonnes: Float
  events: [Event]
  recordedTime: Timestamp
}

type VesselLocation {
  location: GeoSpatial
  recordedTime: Timestamp
}

type GeoSpatial {
  longitude: String
  latitude: String
}

type Document {
  documentNumber: String
  title: String
  documentFile: DocumentFile
}

type DocumentFile {
  finaName: String
}

"""
@name ISO country
A country, as recognized by ISO in its 3166-1 standard
"""
interface Country {
countryCode: String
  countryName: String
}

type Stream {
  name: String
  description: String
  streamType: StreamTypeEnumeration
flowsFrom: ProcessEquipment
  flowsTo: ProcessEquipment
  composition: Composition
}

type StreamTypeEnumeration {
  name: String
  description: String
}

interface ProcessEquipment implements CCUSBusinessProcessAsset {
  tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  massFlow: Float
  pressure: Float
  temperature: Float
  powerConsumption: Float
  inFlowStream: Stream
  outFlowStream: Stream
}

type ExportPump implements ProcessEquipment & CCUSBusinessProcessAsset {
  tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  massFlow: Float
  pressure: Float
  temperature: Float
  powerConsumption: Float
  inFlowStream: Stream
  outFlowStream: Stream
}
type ExportHeater implements ProcessEquipment & CCUSBusinessProcessAsset  {
  tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  massFlow: Float
  pressure: Float
  temperature: Float
  powerConsumption: Float
  inFlowStream: Stream
  outFlowStream: Stream
}
type BoosterPump implements ProcessEquipment & CCUSBusinessProcessAsset {
  tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  massFlow: Float
  pressure: Float
  temperature: Float
  powerConsumption: Float
  inFlowStream: Stream
  outFlowStream: Stream
}
type VaporReturn implements ProcessEquipment & CCUSBusinessProcessAsset {
  tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  massFlow: Float
  pressure: Float
  temperature: Float
  powerConsumption: Float
  inFlowStream: Stream
  outFlowStream: Stream
}
type CondenserHeater implements ProcessEquipment & CCUSBusinessProcessAsset {
  tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  massFlow: Float
  pressure: Float
  temperature: Float
  powerConsumption: Float
  inFlowStream: Stream
  outFlowStream: Stream
}
type StorageTank implements ProcessEquipment & CCUSBusinessProcessAsset {
  tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  massFlow: Float
  pressure: Float
  temperature: Float
  powerConsumption: Float
  inFlowStream: Stream
  outFlowStream: Stream
}
type SeawaterPump implements ProcessEquipment & CCUSBusinessProcessAsset {
  tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  massFlow: Float
  pressure: Float
  temperature: Float
  powerConsumption: Float
  inFlowStream: Stream
  outFlowStream: Stream
}

type Downhole implements CCUSBusinessProcessAsset {
  tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  injectionTubingPressure: Float
  injectionTubingTemperature: Float
  aAnnulusPressure: Float
  aAnnulusTemperature: Float
  upperDownhole: UpperDownhole
  lowerDownhole: LowerDownhole
}

type UpperDownhole implements CCUSBusinessProcessAsset {
tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  injectionTubingPressure: Float
  injectionTubingTemperature: Float
  aAnnulusPressure: Float
  aAnnulusTemperature: Float
}
type LowerDownhole implements CCUSBusinessProcessAsset {
tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  injectionTubingPressure: Float
  injectionTubingTemperature: Float
  aAnnulusPressure: Float
  aAnnulusTemperature: Float
}					
                              
type Wellhead implements CCUSBusinessProcessAsset {
tagName: String
serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
injectionPressure: Float
injectionTemperature: Float
wellheadFlowmeter: WellheadFlowmeter
annulusInTree: AnnulusInTree
  parentDownhole: Downhole
}							
                
type WellheadFlowmeter implements CCUSBusinessProcessAsset {
  tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  cO2VolumetricFlowm3_per_hr: Float
  cO2MassFlowt_per_hr: Float
  cO2Temperature: Float
  cO2Pressure: Float
  parentWellhead: Wellhead
}	
                            
type AnnulusInTree implements CCUSBusinessProcessAsset {
  tagName: String
  serviceDescription: String
precedingProcessAsset: [CCUSBusinessProcessAsset]
  subsequentProcessAsset: [CCUSBusinessProcessAsset]
  temperature: Float
  pressure: Float
  parentWellhead: Wellhead
}

type Composition {
  parentStream: Stream
  recordedTime: Timestamp
  continuous_O2_percent: Float
  continuous_CO2_percent: Float
  continuous_H2O_percent: Float
  continuous_H2S_percent: Float
  manuallySampled_H2_percent: Float
  manuallySampled_CO_percent: Float
  manuallySampled_SOx: Float
  manuallySampled_NOx: Float
  manuallySampled_Amines: Float
  manuallySampled_NH3: Float
  manuallySampled_Formaldehyde: Float
  manuallySampled_Acetate_Aldehyde: Float
  manuallySampled_Mercury_Hg: Float
  manuallySampled_Cadmium_Kd_Thalium_Tl: Float
}

interface Activity {
  name: String
  description: String
  process: CCUSBusinessProcess
  activityType: ActivityTypeEnumeration
  code: String
  startTime: Timestamp
  endTime: Timestamp
}

interface Event {
  name: String
  description: String
  process: CCUSBusinessProcess
  eventType: EventTypeEnumeration
  code: String
  timeOfEvent: Timestamp
}

type EventTypeEnumeration {
  name: String
  description: String
  buisnessProcess: CCUSBusinessProcess
  enumerationSet: EnumerationSet
}

type ActivityTypeEnumeration {
  name: String
  description: String
  businessProcess: CCUSBusinessProcess
  enuerationSet: EnumerationSet
}

type EnumerationSet {
  name: String
  description: String
}`,
      version: '1',
      date: new Date('2023-06-03'),
    },
  ],
};
