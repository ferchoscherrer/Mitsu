export interface Items {
  oMaterial : Material | null
  oCebe : Cebe | null
  selectedKeyCenter : string | null
  oOrderReason : Order_Reason | null
  netValue : number
  selectedWorkingHours : string | null
  selectedCustomerGroup1 : string | null
  selectedCustomerGroup3 : string | null
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