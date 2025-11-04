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

export interface ItemsAndData{
  quotationItems: QuotationItemsInSet[]
  quotationData: QuotationDataInSet[]
}

export interface KeyWorkForce {
  "01": string
  "02": string
  "03": string
  "04": string
  "05": string
}

export interface EquipmentByWorkForce {
  arrEquipment : QuotationEquipmentInSet[]
  arrWorkForce : QuotationConditionsInSet[]
}

export interface Create_Quotation {
  QuotationHeaderIn: QuotationHeaderIn
  QuotationItemsInSet: QuotationItemsInSet[]
  QuotationPartnersSet: QuotationPartnersSet[]
  QuotationDataInSet: QuotationDataInSet[]
  ReturnSet?: any[]
}

export interface QuotationHeaderIn {
  CompCdeB: string
  Currency: string
  DistrChan: string
  Division: string
  DocType: string
  Pmnttrms: string
  PurchNoC: string
  SalesGrp: string
  SalesOff: string
  SalesOrg: string
  ReqDateH: string | Date
  CtValidF: string | Date
  CtValidT: string | Date
  QtValidF: string | Date
  QtValidT: string | Date
}

export interface QuotationItemsInSet {
  Currency: string
  Division: string
  ItmNumber: string
  Material: string
  Plant: string
  PrcGroup2: string
  PrcGroup3: string
  ProfitCtr: string
  ShortText: string
  TargetQty: string
  TargetVal: string
  TargetQu: string
  QuotationConditionsInSet: QuotationConditionsInSet[]
  QuotationEquipmentInSet: QuotationEquipmentInSet[]
}

export interface QuotationConditionsInSet {
  ItmNumber: string
  CondType: string
  CondValue: string
  Currency: string
  CondUnit: string
  CondPUnt: string
}

export interface QuotationEquipmentInSet {
  ItmNumber: string
  Equipment: string
  InstalationDate: string | Date
}

export interface QuotationPartnersSet {
  PartnRole: string
  PartnNumb: string
}

export interface QuotationDataInSet {
  ItmNumber: string
  ValPer: string
  ValPerUn: string
  ValPerCa: string
  InstDate: string | Date
  AcceptDat: string | Date
  ConStDat: string | Date
  ConSiDat: string | Date
  CancProc: string
  ConEnAct: string
  CancParty: string
  Cancreason: string
  ConEnDat: string | Date
  CancDoc: string
  ConStRul: string
  ActDatrul: string
  ConEnRul: string
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