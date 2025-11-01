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
  validFromDate: string | null
  validUntilDate : string | null
  arrEquipment : ItemEquipment[]
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

export interface ItemEquipment {
  EquipmentB: string | null
  InstalationDate: Date | null
  DescriptionE: string | null
  Emplaz: string | null
  Location: string | null
  DescriptionL: string | null
  Partner: string | null
  cup?: number
  workForce ?: WorkForce[]
}

export interface Header {
  oOfferType : OfferType | null
  oSalesOrganization : SalesOrganization | null
  oChannel : Channel | null
  oSector : Sector | null
  oSalesOffice : SalesOffice | null
  oSalesGroup : SalesGroup | null
  customerOrder : string | null
  orderDate : string | null
  oRequester : Requester | null
  department : string | null
  paymentTerms : string | null
  validFromDate : string | null
  validUntilDate : string | null
  oCurrency : Currency | null
}

export interface WorkForce{
  key: string
  item: string
  annual: number
  date: Date | string
  monthly: number
}
export interface WorkForce_Service{
  GrupoHR: string
  ValorTotal: string
  Moneda: string
  Cantidad: string
  Um: string
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
interface OfferType  {
  Vbtyp: string
  Auart: string
  Kappl: string
  Bezei: string
}
interface SalesOrganization  {
  Vkorg: string
  Vtext: string
}
interface Channel  {
  Vtweg: string
  Vtext: string
}
interface Sector  {
  Spart: string
  Vtext: string
}
interface SalesOffice  {
  Office: string
  Description: string 
}
interface SalesGroup  {
  Group: string
  Description: string 
}
interface Requester  {
  CustomerCode: string
  CompanyCode: string
  Name1: string
}
interface Currency  {
  CurrencyCode: string
  CurrencyName: string
}