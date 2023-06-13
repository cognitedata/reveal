import { DataModelLibraryTemplateItem } from '.';

export const ValueStream: DataModelLibraryTemplateItem = {
  name: 'Value stream',
  description: 'Value stream model',
  category: 'Manufacturing',
  versions: [
    {
      dml: `type Supplier {
  name:String,
  assetType:String,
  processPlan:CallOffNotification,
  processStart:CallOff,
  rawMaterial:RawMaterial
}

type CallOffNotification {
  callOffNotificationType:String,
  callOffNotificationFrequency:String,
  callOffMedium:String
}

type CallOff {
  callOffType:String,
  callOff:String,
  callOffMedium:String
}

type Process {
  productionControl:ProductionControl,
  callOff:CallOff,
  order:Order,
  schedule:Schedule,
  processSteps:[ProcessStep]
}

type ProductionControl {
  productionControlId:String,
  productionControlTool:String,
  productForecast:Forecast,
  callOffNotification: CallOffNotification
}

type Order {
  process:Process
  orderType:String,
  orderFrequency:String,
  orderMedium:String
}

type Forecast {
  forecasType:String,
  forecastFrequency:String,
  forecastMedium:String
}

type Customer {
  name:String,
  productPlan:Forecast,
  productOrder: Order,
  product:Product
}

type Schedule {
  scheduleID:String,
  scheduleType:String,
  scheduleFrequency:String
}

type RawMaterial {
  name:String,
  materialType:InMaterial,
  volume: Int,
  arrivalFrequency:String
}

type ProcessStep {
  firstStep:Boolean,
  lastStep:Boolean,
  previousStep:ProcessStep,
  nextStep:ProcessStep,
  materialIn:InMaterial,
  productOut:OutMaterial,
  process:Process
  metrics:ProcessStepMetrics
}

type ProcessStepMetrics{
  inventory:Int,
  leadTime_NVA:Float,
  nva_Unit:String,
  valueAddedTime_VA:Float,
  va_Unit:String,
  quantity_Qty:Int,
  operator:Int
  shifts:Float
  cycleTime_CT:Float,
  ct_Unit:String,
  changeoverTime_CO:Float,
  co_Unit:String,
  uptime:Float,
  uptime_Unit:String,
  necessaryNotAddingValueTime_NNVA:Float,
  nnva_Unit:String
}

type MaterialType{
  name:String
}

type InMaterial {
  name:String,
  materialType:MaterialType
}

type OutMaterial {
  name:String,
  materialType:MaterialType
}

type Product {
  name:String,
  materialType:OutMaterial
}`,
      version: '1',
      date: new Date('2023-06-03'),
    },
  ],
};
