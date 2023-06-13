import { DataModelLibraryTemplateItem } from '.';

export const APM: DataModelLibraryTemplateItem = {
  name: 'APM',
  description: 'Asset performance monitoring',
  category: 'APM',
  versions: [
    {
      dml: `"---- [CDF Core] File"
type CDF_File {
  legacyExternalId: String
  name: String
  mimeType: String
}

"[CDF Core] 3D Model"
type CDF_3DModel {
  name: String
  modelId: Int
  revisionId: Int
}

"[CDF Core] Vector 3 (x,y,z)"
type CDF_Vec3 {
  x: Float
  y: Float
  z: Float
}

"[CDF Core] User"
type CDF_User @view {
  name: String
  email: String
  lastSeen: Timestamp
  preferences: JSONObject
}

"[CDF Core] Comment"
type CDF_Comment @view {
  textBody: String
  targetId: String
  targetType: String
  contextId: String
  contextType: String
  owner: CDF_User
  createdAt: Timestamp
  status: String
}

"[CDF Core] Represents a piece of equipment. Equipments serve as a central model, connecting many other models together"
interface CDF_Asset @view {
  "Basic information"
  sourceId: String
  title: String
  description: String

  "Contextualisation"
  parent: CDF_Asset
  children: [CDF_Asset]
  rootLocation: CDF_Asset
  threeDNodeIds: [Int] # 3D nodes cannot be stored in FDM due to size.

  files: [CDF_File] # To be replaced with core File type
}


"---- [APM Core] Represents a package of activities"
interface APM_WorkPackage @view {
  "Basic information"
  sourceId: String # ID of item as it states in source system
  title: String # Short title
  description: String # Long description

  "Scheduling information"
  startTime: Timestamp # Planned start time
  endTime: Timestamp # Planned end time

  "Contextualisation"
  activities: [APM_Activity] # Activities contained in this work package
  status: [String] # Statuses of work package (Completed, Ongoing, etc)
}

"[APM Core] Represents an activity to be done in the workplace. e.g. Inspection round, Replace a large equipment that requires isolation"
interface APM_Activity @view {
  "Basic information"
  sourceId: String # ID of item as it states in source system
  title: String # Short title
  description: String # Long description

  "Scheduling information"
  startTime: Timestamp # Planned start time
  endTime: Timestamp

  "Contextualisation"
  assets: [CDF_Asset] # Assets where activity is performed
  operations: [APM_Operation] # Subtasks of activity
  materials: [APM_MaterialRequirement] # Materials required to complete activity
  notifications: [APM_Notification] # Notifications solved by activity

  "Standard activity information"
  type: String # e.g. Preventive, Corrective
  status: [String] # Statuses of activity (Completed, Ongoing, etc)
  priority: Int # Numeric priority of activity (1 = highest priority)
}

"[APM Core] If an APM_Activity represents a task list, an operation is an individual task on that list. e.g. Turn off valve, Sign document, Prepare scaffolding"
interface APM_Operation @view {
  "Basic information"
  sourceId: String # ID of item as it states in source system
  title: String # Short title
  description: String # Long description

  "Scheduling information"
  startTime: Timestamp 
  endTime: Timestamp 

  "Contextualisation"
  asset: CDF_Asset

  "Standard activity information"
  resource: String # e.g. Welder, Mechanic, Supervisor
  numberOfResource: Int # Number of required resource
  hours: Int # Estimated hours required to complete operation (not total people hours)
  type: String # Whether activity is 'pre execution', 'post execution' or 'during execution'
  order: Int # Sequencing of operation within activity
}

"[APM Core] An activity can have required materials to be executed. "
interface APM_MaterialRequirement @view {
  activity: APM_Activity
  material: APM_Material # Description of material
  requiredQuantities: Int # If for an activity - amount required for that activity
  status: String # Status onshore (ready or not)
  offshoreStatus: String # Status offshore (ready or not)
  tags: [JSONObject] # Additional metadata
}

interface APM_Material @view {
  sourceId: String 
  description: String
}

"[APM Core] Enabling per project configuration of APM applications."
type APM_Configurations @view {
  name: String
  appDataSpaceId: String
  appDataSpaceVersion: String
  customerDataSpaceId: String
  customerDataSpaceVersion: String
  featureConfiguration: JSONObject
  fieldConfiguration: JSONObject
  rootLocationsConfiguration: JSONObject
}


"---- [APM MODULE: Planning] A collection of activities, used by planners for organisation and optimisation (in Maintain)"
type APM_Plan @view {
  "Basic information"
  name: String
  description: String
  tags: [String]
  imageUrl: String
  isArchived: Boolean

  "Governance"
  owner: CDF_User
  sharedWith: [String]
  defaultPermission: String

  "Activity filters"
  locations: [String]
  startTime: Timestamp
  endTime: Timestamp
  duration: Int
  regenerationInterval: Int
  isStatic: Boolean
  activityIds: [String]
  fixedList: JSONObject
  filters: JSONObject
  activities: [APM_Activity]
}

"[APM MODULE: Planning] An optimisation made to an activity, but not committed to the source"
type APM_Optimisation @view {
  activity: APM_Activity
  activityField: String
  originalValue: String
  nextValue: String
  source: String
  creator: String
  createdAt: Timestamp
  isArchived: Boolean
  status: String
}


"---- [APM MODULE: Execution] An issue that has been raised on the field"
interface APM_Notification @view {
  "Basic information"
  title: String # Short description
  description: String # Long description

  "Contextualisation"
  asset: CDF_Asset
}

"[APM MODULE: Execution] A checklist of tasks that need to be done. Custom created, or derived from an APM_Activity"
type APM_Checklist @view {
  sourceId: String
  title: String
  description: String
  type: String
  status: String

  startTime: Timestamp
  endTime: Timestamp

  items: [APM_ChecklistItem]
  rootLocation: CDF_Asset
  assignedTo: [String]
  
  isArchived: Boolean
  createdBy: CDF_User
  updatedBy: CDF_User
}

"[APM MODULE: Execution] An individual task in the above APM_Checklist"
type APM_ChecklistItem @view {
  sourceId: String
  title: String
  description: String
  labels: [String]
  order: Int
  status: String

  startTime: Timestamp
  endTime: Timestamp

  asset: CDF_Asset
  fileExternalIds: [String]
  measurements: [APM_Measurement]
  observations: [APM_Observation]
  note: String 

  createdBy: CDF_User
  updatedBy: CDF_User
}

"[APM MODULE: Execution] A template of a checklist, that can be generated when required"
type APM_RoundTemplate @view {
  name: String
  items: [APM_RoundTemplateItem]
  title: String
  status: String
  rootLocation: CDF_Asset
  assignedTo: [String]

  isArchived: Boolean
  createdBy: CDF_User
  updatedBy: CDF_User

}

"[APM MODULE: Execution] Items within the APM_RoundTemplate about"
type APM_RoundTemplateItem @view {
  name: String
  labels: [String]
  order: Int

  asset: CDF_Asset

  createdBy: CDF_User
  updatedBy: CDF_User
}

"[APM MODULE: Execution] A scheduling system for when to automatically generate a template"
type APM_TemplateSchedule @view {
  title: String 
  active: Boolean
  recurrance: String # Daily, Weekly, Yearly
  byDay: [String] # [MO, TU]
  byYear: [String] # [1, 32]
  

  startTime: Timestamp # 6:00 AM
  endTime: Timestamp # duration

  template: APM_RoundTemplate
  items: [APM_RoundTemplateItem]

  createdBy: CDF_User
  updatedBy: CDF_User
}

"[APM Module: Execution] A report might contain measurements related to that report."
type APM_Measurement @view {
  timeSeries: TimeSeries
  measuredAt: Timestamp
  numericReading: Int
  min: Int
  max: Int
  order: Int
}


"---- [APM MODULE: Reliability] Additional fields on asset for reliability tracking"
interface APM_ReliabilityAsset {
  criticality: Int # How critical is this piece of equipment to operations (1 - highest priority)
  consequenceOfFailure: String # Written description of consequence if asset was to fail
  
  actions: [APM_Action]
  failureModes: [APM_FailureMode]
}

"[APM Module: Reliability] An action item for an asset created from a failure mode or RCA"
type APM_Action @view {
  name: String
  description: String
  frequency: Int # How often you must do this action
  actionType: String # e.g. CBM, Manual, Rounds, Inspection etc
  expectedCost: Int

  createdFromFailureMode: APM_FailureMode
  status: String
}

"[APM Module: Reliability] A definition of how something can fail, how to measure it, etc"
type APM_FailureMode @view {
  "Basic info"
  name: String
  modeDescription: String # What type of failure (E.g. vibration)
  effect: String # Isolated effect of failure (e.g. damage to bearing)
  failureMechanism: String # How it fails, symptoms (e.g. vibration)
  troubleshooting: [String]
  asset: [CDF_Asset]

  "Numeric measurements of a failuremode"
  probabilityPercentage: Float
  severity: Float
  detectability: Float
  expectedMeanTimeBetweenFailure: Int 

  "Actions"
  actions: [APM_Action]
}

"[APM Module: Reliability] An activity will result in a report. This might further result in notifications being raised"
type APM_Observation @view {
  triggerType: String
  mediaFiles: [CDF_File]
  activity: APM_Activity 

  notificationSourceId: String

  asset: [CDF_Asset]

  "Observation data"
  description: String
  troubleshooting: String
  status: String # "Draft / Done"
  model: CDF_3DModel
  position: CDF_Vec3

  "System data"
  createdBy: String # "User ID"
  updatedBy: String # "User ID"
}


"--- LERVIK implementation"
type LERVIK_Material implements APM_Material {
  sourceId: String
  title: String
  description: String
}
type LERVIK_Notification implements APM_Notification {
  "Basic information"
  title: String 
  description: String 

  "Contextualisation"
  asset: LERVIK_Asset
}
interface LERVIK_Asset implements CDF_Asset & APM_ReliabilityAsset {
  "Basic information"
  sourceId: String
  title: String
  description: String

  "Contextualisation"
  parent: LERVIK_Asset
  children: [LERVIK_Asset]
  rootLocation: LERVIK_Asset
  threeDNodeIds: [Int] # 3D nodes cannot be stored in FDM due to size.

  files: [CDF_File] # To be replaced with core File type
  criticality: Int # How critical is this piece of equipment to operations (1 - highest priority)
  consequenceOfFailure: String # Written description of consequence if asset was to fail
  
  actions: [APM_Action]
  failureModes: [APM_FailureMode]
}
type LERVIK_WorkPackage implements APM_WorkPackage {
  "Basic information"
  sourceId: String
  title: String 
  description: String 

  "Scheduling information"
  startTime: Timestamp 
  endTime: Timestamp 

  "Contextualisation"
  activities: [APM_Activity]
  status: [String]
}
type LERVIK_Activity implements APM_Activity @view {
  "Basic information"
  sourceId: String
  title: String 
  description: String 

  "Scheduling information"
  startTime: Timestamp # When the activity is Planned
  endTime: Timestamp

  "Contextualisation"
  assets: [LERVIK_Asset]
  operations: [LERVIK_Operation]
  notifications: [LERVIK_Notification]
  materials: [APM_MaterialRequirement]

  "Standard activity information"
  type: String 
  status: [String]
  priority: Int
  campaign: String
}
type LERVIK_Operation implements APM_Operation @view {
  "Basic information"
  sourceId: String
  title: String 
  description: String 

  "Scheduling information"
  startTime: Timestamp 
  endTime: Timestamp 

  "Contextualisation"
  asset: CDF_Asset

  "Standard activity information"
  resource: String 
  type: String 
  order: Int
  numberOfResource: Int
  hours: Int
}

type LERVIK_Valve implements CDF_Asset & APM_ReliabilityAsset & LERVIK_Asset {
  "Basic information"
  sourceId: String
  title: String
  description: String

  "Contextualisation"
  parent: LERVIK_Asset
  children: [LERVIK_Asset]
  rootLocation: LERVIK_Asset
  threeDNodeIds: [Int] # 3D nodes cannot be stored in FDM due to size.

  files: [CDF_File] # To be replaced with core File type
  criticality: Int # How critical is this piece of equipment to operations (1 - highest priority)
  consequenceOfFailure: String # Written description of consequence if asset was to fail
  
  actions: [APM_Action]
  failureModes: [APM_FailureMode]
  MTTC: Float
  MTTO: Float
}`,
      version: '1',
      date: new Date('2023-06-03'),
    },
  ],
};
