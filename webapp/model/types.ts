export interface Items {
  oMaterial : Material | null
  oCebe : Cebe | null
  selectedKeyCenter : string | null
  oOrderReason : Order_Reason | null
  netValue : number
  selectedWorkingHours : string | null
  selectedCustomerGroup1 : string | null
  selectedCustomerGroup3 : string | null
  hasEquipment : boolean
}

export interface Customer {
  CustomerCode: string
  CompanyCode: string
  Name1: string
}


export interface DetailRouteArg{
    "?query" : Query
}

export interface RoutingEquipment {
  materialPositions: number[]
  fromTarget: string
}

interface Query {
  oMaterial : Order_Reason
}

interface Material {
  Mtart: string
  Material: string
  Description: string
}

interface Cebe {
  Profit: string
  Description: string
}

interface Order_Reason {
  Reason: string
  Description: string
}

export interface ItemEquipment {
  EquipmentB: string | null
  InstalationDate: Date | null
  DescriptionE: string | null
  Emplaz: string | null
  Location: string | null
  DescriptionL: string | null
  Partner: string | null
}