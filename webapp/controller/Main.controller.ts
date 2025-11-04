import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Controller from "sap/ui/core/mvc/Controller";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import ContextV2 from "sap/ui/model/odata/v2/Context";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import { TableSelectDialog$ConfirmEvent, TableSelectDialog$SearchEvent } from "sap/m/TableSelectDialog";
import { Create_Quotation, Customer, EquipmentByWorkForce, Header, ItemEquipment, Items, ItemsAndData, KeyWorkForce, QuotationConditionsInSet, QuotationDataInSet, QuotationEquipmentInSet, QuotationHeaderIn, QuotationItemsInSet, QuotationPartnersSet, WorkForce } from "../model/types";
import Input, { Input$ValueHelpRequestEvent } from "sap/m/Input";
import formatter from "contractmanagement/contractmanagement/model/formatter";
import Table, { Table$RowSelectionChangeEvent } from "sap/ui/table/Table";
import MessageBox from "sap/m/MessageBox";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import busydialog from "sap/ca/ui/utils/busydialog";
import Button, { Button$PressEvent } from "sap/m/Button";
import ERP from "contractmanagement/contractmanagement/modules/ERP";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";

/**
 * @namespace contractmanagement.contractmanagement.controller
 */
export default class Main extends Controller {

    public formatter = formatter;
    
    private oContractManagement: JSONModel;
    private oI18nModel: ResourceModel;
    private oI18n: ResourceBundle;
    private oRouter: Router;

    private oFragmentOfferType: Dialog;
    private oFragmentSalesOrg: Dialog;
    private oFragmentChannel: Dialog;
    private oFragmentSector: Dialog;
    private oFragmentSalesOffice: Dialog;
    private oFragmentSalesGroup: Dialog;
    private oFragmentRequester: Dialog;
    private oFragmentCurrency: Dialog;
    private oFragmentMaterial: Dialog;
    private oFragmentCabe: Dialog;
    private oFragmentOrderReason: Dialog;

    private sPahtMaterial: string;
    private arrIndexSelectRowMaterial: number[] = [];

    private ZSD_CREATE_QUOTATION_CUSTOMER_SRV: ODataModel;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.oContractManagement = this.getOwnerComponent()?.getModel("mContractManagement") as JSONModel;
        this.oI18nModel = this.getOwnerComponent()?.getModel("i18n") as ResourceModel;
        this.oI18n = this.oI18nModel.getResourceBundle() as ResourceBundle;
        this.oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        this.ZSD_CREATE_QUOTATION_CUSTOMER_SRV = this.getOwnerComponent()?.getModel("ZSD_CREATE_QUOTATION_CUSTOMER_SRV") as ODataModel;
    }

    public async onOpenPopUpOfferType(): Promise<void> {

        this.oFragmentOfferType ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.TblOfferType",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentOfferType);
        this.oFragmentOfferType.open();
    }

    public onSearchOfferType(oEvent: TableSelectDialog$SearchEvent): void {

        let sValue: string = oEvent.getParameter("value") || "";
        let oFilter = new Filter({
            filters: [
                new Filter("Auart", FilterOperator.Contains, sValue),
                new Filter("Bezei", FilterOperator.Contains, sValue)
            ],
            and: false
        });
        let oBinding = oEvent.getSource().getBinding("items") as ODataListBinding;
        oBinding.filter([oFilter]);
    }

    public onSelectOfferType(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];

        for(const oSelect of oSelectedContext){            
            this.oContractManagement.setProperty(`/header/oOfferType`, oSelect.getObject());
        }
    }

    public async onOpenPopUpSalesOrganization(): Promise<void> {

        this.oFragmentSalesOrg ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.TblSalesOrganization",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentSalesOrg);
        this.oFragmentSalesOrg.open();
    }

    public onSearchSalesOrganization(oEvent: TableSelectDialog$SearchEvent): void {

        let sValue: string = oEvent.getParameter("value") || "";
        let oFilter = new Filter({
            filters: [
                new Filter("Vkorg", FilterOperator.Contains, sValue),
                new Filter("Vtext", FilterOperator.Contains, sValue)
            ],
            and: false
        });
        let oBinding = oEvent.getSource().getBinding("items") as ODataListBinding;
        oBinding.filter([oFilter]);
    }

    public onSelectSalesOrganization(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];

        for(const oSelect of oSelectedContext){            
            this.oContractManagement.setProperty(`/header/oSalesOrganization`, oSelect.getObject());
        }
    }

    public async onOpenPopUpChannel(): Promise<void> {

        this.oFragmentChannel ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.TblChannel",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentChannel);
        this.oFragmentChannel.open();
    }

    public onSearchChannel(oEvent: TableSelectDialog$SearchEvent): void {

        let sValue: string = oEvent.getParameter("value") || "";
        let oFilter = new Filter({
            filters: [
                new Filter("Vtweg", FilterOperator.Contains, sValue),
                new Filter("Vtext", FilterOperator.Contains, sValue)
            ],
            and: false
        });
        let oBinding = oEvent.getSource().getBinding("items") as ODataListBinding;
        oBinding.filter([oFilter]);
    }

    public onSelectChannel(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];

        for(const oSelect of oSelectedContext){            
            this.oContractManagement.setProperty(`/header/oChannel`, oSelect.getObject());
        }
    }

    public async onOpenPopUpSector(): Promise<void> {

        this.oFragmentSector ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.TblSector",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentSector);
        this.oFragmentSector.open();
    }

    public onSearchSector(oEvent: TableSelectDialog$SearchEvent): void {

        let sValue: string = oEvent.getParameter("value") || "";
        let oFilter = new Filter({
            filters: [
                new Filter("Spart", FilterOperator.Contains, sValue),
                new Filter("Vtext", FilterOperator.Contains, sValue)
            ],
            and: false
        });
        let oBinding = oEvent.getSource().getBinding("items") as ODataListBinding;
        oBinding.filter([oFilter]);
    }

    public onSelectSector(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];

        for(const oSelect of oSelectedContext){            
            this.oContractManagement.setProperty(`/header/oSector`, oSelect.getObject());
        }
    }

    public async onOpenPopUpSalesOffice(): Promise<void> {

        this.oFragmentSalesOffice ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.TblSalesOffice",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentSalesOffice);
        this.oFragmentSalesOffice.open();
    }

    public onSearchSalesOffice(oEvent: TableSelectDialog$SearchEvent): void {

        let sValue: string = oEvent.getParameter("value") || "";
        let oFilter = new Filter({
            filters: [
                new Filter("Office", FilterOperator.Contains, sValue),
                new Filter("Description", FilterOperator.Contains, sValue)
            ],
            and: false
        });
        let oBinding = oEvent.getSource().getBinding("items") as ODataListBinding;
        oBinding.filter([oFilter]);
    }

    public onSelectSalesOffice(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];

        for(const oSelect of oSelectedContext){            
            this.oContractManagement.setProperty(`/header/oSalesOffice`, oSelect.getObject());
        }
    }

    public async onOpenPopUpSalesGroup(): Promise<void> {

        this.oFragmentSalesGroup ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.TblSalesGroup",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentSalesGroup);
        this.oFragmentSalesGroup.open();
    }

    public onSearchSalesGroup(oEvent: TableSelectDialog$SearchEvent): void {

        let sValue: string = oEvent.getParameter("value") || "";
        let oFilter = new Filter({
            filters: [
                new Filter("Group", FilterOperator.Contains, sValue),
                new Filter("Description", FilterOperator.Contains, sValue)
            ],
            and: false
        });
        let oBinding = oEvent.getSource().getBinding("items") as ODataListBinding;
        oBinding.filter([oFilter]);
    }

    public onSelectSalesGroup(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];

        for(const oSelect of oSelectedContext){            
            this.oContractManagement.setProperty(`/header/oSalesGroup`, oSelect.getObject());
        }
    }    

    public async onOpenPopUpRequester(): Promise<void> {

        this.oFragmentRequester ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.TblCustomer",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentRequester);
        this.oFragmentRequester.open();
    }

    public onSearchRequester(oEvent: TableSelectDialog$SearchEvent): void {

        let sValue: string = oEvent.getParameter("value") || "";
        let oFilter = new Filter({
            filters: [
                new Filter("CustomerCode", FilterOperator.Contains, sValue),
                new Filter("Name1", FilterOperator.Contains, sValue)
            ],
            and: false
        });
        let oBinding = oEvent.getSource().getBinding("items") as ODataListBinding;
        oBinding.filter([oFilter]);
    }

    public onSelectRequester(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];

        for(const oSelect of oSelectedContext){            
            this.oContractManagement.setProperty(`/header/oRequester`, oSelect.getObject());
        }
    }

    public async onOpenPopUpCurrency(): Promise<void> {

        this.oFragmentCurrency ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.TblCurrency",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentCurrency);
        this.oFragmentCurrency.open();
    }

    public onSearchCurrency(oEvent: TableSelectDialog$SearchEvent): void {

        let sValue: string = oEvent.getParameter("value") || "";
        let oFilter = new Filter({
            filters: [
                new Filter("CurrencyCode", FilterOperator.Contains, sValue),
                new Filter("CurrencyName", FilterOperator.Contains, sValue)
            ],
            and: false
        });
        let oBinding = oEvent.getSource().getBinding("items") as ODataListBinding;
        oBinding.filter([oFilter]);
    }

    public onSelectCurrency(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];

        for(const oSelect of oSelectedContext){            
            this.oContractManagement.setProperty(`/header/oCurrency`, oSelect.getObject());
        }
    }

    public addMaterial(){
        let arrMaterial : Items[] = this.oContractManagement.getProperty(`/arrMaterial`);
        const oHeader : Header = this.oContractManagement.getProperty(`/header`);
        const oMaterial : Items = {
            oMaterial: null,
            oCebe: null,
            selectedKeyCenter: null,
            oOrderReason: null,
            netValue: 0,
            selectedWorkingHours: null,
            selectedCustomerGroup1: null,
            selectedCustomerGroup3: null,
            hasEquipment: false,
            validFromDate: oHeader.validFromDate,
            validUntilDate : oHeader.validUntilDate,
            arrEquipment : []
        }

        arrMaterial.push(oMaterial);
        this.oContractManagement.refresh(true);
    }

    public onDeleteRow(){
        const oTable = this.byId("tblMaterial") as Table;
        const arrMaterial : Items[] = this.oContractManagement.getProperty(`/arrMaterial`);

        if (this.arrIndexSelectRowMaterial.length === 0) {
            MessageBox.alert(this.oI18n.getText("errorDeleteRows") ?? '')
        } else {
            for (const indexRowSelect of this.arrIndexSelectRowMaterial){
                arrMaterial.splice(indexRowSelect,1);   
            }
            this.oContractManagement.refresh(true);
            oTable.clearSelection();
            this.arrIndexSelectRowMaterial = [];
        }

    }

    public onSelectRow(oEvent : Table$RowSelectionChangeEvent){
        const oSource : Table = oEvent.getSource();
        const arrSelectedRow : number[] = oSource.getSelectedIndices();

        this.arrIndexSelectRowMaterial = arrSelectedRow;
    }

    private onGetPathMaterial(oEvent : Input$ValueHelpRequestEvent) {
        const oSource : Input = oEvent.getSource();
        const oBindingContext = oSource.getBindingContext("mContractManagement") as ContextV2;
        this.sPahtMaterial = oBindingContext.getPath();
    }

    public async onOpenPopUpMaterial(oEvent : Input$ValueHelpRequestEvent): Promise<void> {
        this.onGetPathMaterial(oEvent);

        this.oFragmentMaterial ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.TblMaterial",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentMaterial);
        this.oFragmentMaterial.open();
    }

    public onSearchMaterial(oEvent: TableSelectDialog$SearchEvent): void {

        let sValue: string = oEvent.getParameter("value") || "";
        let oFilter = new Filter({
            filters: [
                new Filter("Material", FilterOperator.Contains, sValue),
                new Filter("Description", FilterOperator.Contains, sValue)
            ],
            and: false
        });
        let oBinding = oEvent.getSource().getBinding("items") as ODataListBinding;
        oBinding.filter([oFilter]);
    }

    public onSelectMaterial(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];
        if (this.sPahtMaterial)
            for(const oSelect of oSelectedContext){
                this.oContractManagement.setProperty(`${this.sPahtMaterial}/oMaterial`, oSelect.getObject());
                this.sPahtMaterial = '';
            }
    }

    public async onOpenPopUpCebe(oEvent : Input$ValueHelpRequestEvent): Promise<void> {
        this.onGetPathMaterial(oEvent);

        this.oFragmentCabe ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.TblCebe",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentCabe);
        this.oFragmentCabe.open();
    }

    public onSearchCebe(oEvent: TableSelectDialog$SearchEvent): void {

        let sValue: string = oEvent.getParameter("value") || "";
        let oFilter = new Filter({
            filters: [
                new Filter("Profit", FilterOperator.Contains, sValue),
                new Filter("Description", FilterOperator.Contains, sValue)
            ],
            and: false
        });
        let oBinding = oEvent.getSource().getBinding("items") as ODataListBinding;
        oBinding.filter([oFilter]);
    }

    public onSelectCebe(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];
        if (this.sPahtMaterial)
            for(const oSelect of oSelectedContext){
                this.oContractManagement.setProperty(`${this.sPahtMaterial}/oCebe`, oSelect.getObject());
                this.sPahtMaterial = '';
            }
    }

    public async onOpenPopUpOrderReason(oEvent : Input$ValueHelpRequestEvent): Promise<void> {
        this.onGetPathMaterial(oEvent);

        this.oFragmentOrderReason ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.TblOrderReason",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentOrderReason);
        this.oFragmentOrderReason.open();
    }

    public onSearchOrderReason(oEvent: TableSelectDialog$SearchEvent): void {

        let sValue: string = oEvent.getParameter("value") || "";
        let oFilter = new Filter({
            filters: [
                new Filter("Reason", FilterOperator.Contains, sValue),
                new Filter("Description", FilterOperator.Contains, sValue)
            ],
            and: false
        });
        let oBinding = oEvent.getSource().getBinding("items") as ODataListBinding;
        oBinding.filter([oFilter]);
    }

    public onSelectOrderReason(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];
        if (this.sPahtMaterial)
            for(const oSelect of oSelectedContext){
                this.oContractManagement.setProperty(`${this.sPahtMaterial}/oOrderReason`, oSelect.getObject());
                this.sPahtMaterial = '';
            }
    }

    public onAssignEquipment() { 
        BusyIndicator.show(0);
        try {
            this._onValidateData();
            this._onEquipment();
        } catch (oError: any) {
            MessageBox.error(oError.message);
        } finally {
            BusyIndicator.hide()
        }
    }

    private _onEquipment() {        
        this.oRouter.getTargets()?.display("TargetEquipment", {
            materialPositions: this.arrIndexSelectRowMaterial,
            fromTarget: "TargetMain"
        });
    }

    private _onValidateData(){        
        const oRequester : Customer = this.oContractManagement.getProperty(`/header/oRequester`);

        if (this.arrIndexSelectRowMaterial.length === 0) throw new Error(this.oI18n.getText("errorAddEquipment") ?? '');

        if (!oRequester) throw new Error(this.oI18n.getText('errorCustomer'))
    }

    public showEquipment(oEvent : Button$PressEvent, _toCup=false) {
        const oSource : Button = oEvent.getSource();
        const oBinding = oSource.getBindingContext("mContractManagement") as ContextV2;
        const sPath : string = oBinding.getPath();
        const oMaterial : Items = this.oContractManagement.getProperty(sPath);

        for(const oEquipment of oMaterial.arrEquipment){
            if (_toCup && !oEquipment.cup) oEquipment.cup = 0;
        }

        this.oContractManagement.setProperty('/arrEquipment', oMaterial.arrEquipment);
        this.oContractManagement.setProperty('/isEquipmentCup', _toCup);

        this._onEquipment();
    }

    public async onSave (){        
        try {
            BusyIndicator.show(0);
            this._onValidateDataSave();
            const oHeader : Header = this.oContractManagement.getProperty('/header');
            const oQuotationHeaderIn : QuotationHeaderIn = this._headerIn();
            const oItemsAndDataSet : ItemsAndData = this._itemsAndData();
            const oJsonCreate : Create_Quotation = {
                QuotationDataInSet: oItemsAndDataSet.quotationData,
                QuotationHeaderIn: oQuotationHeaderIn,
                QuotationItemsInSet: oItemsAndDataSet.quotationItems,
                QuotationPartnersSet: [{
                    PartnNumb: oHeader.oRequester?.CustomerCode || "",
                    PartnRole: "SO"
                }]
            }

            const { data: oResponse } = await ERP.createDataERP('/QuotationHeaderSet', this.ZSD_CREATE_QUOTATION_CUSTOMER_SRV,  oJsonCreate);
            
            MessageBox.success(this.oI18n.getText("successSave",[oResponse.SalesDocument]) || "" );

        } catch (oError:any) {
            debugger
            MessageBox.error(oError.message);
        }finally {
            BusyIndicator.hide();
        }

    }

    private _onValidateDataSave (){
        const arrMaterial : Items[] = this.oContractManagement.getProperty('/arrMaterial');
        const oFoundNotEquipment = arrMaterial.find(oMaterial=> oMaterial.arrEquipment.length === 0);

        if (arrMaterial.length === 0 ) throw new Error(this.oI18n.getText("errorMaterialAdd"));
        if (oFoundNotEquipment) throw new Error(this.oI18n.getText("errorSave"));

    }

    private _headerIn() : QuotationHeaderIn {
        const oHeader : Header = this.oContractManagement.getProperty('/header');
        const oCurrentDate : Date = new Date();

        return {
            CompCdeB: oHeader.oSalesOrganization?.Vkorg || "",
            Currency: oHeader.oCurrency?.CurrencyCode || "",
            DistrChan: oHeader.oChannel?.Vtweg || "",
            Division: oHeader.oSector?.Spart || "",
            DocType: oHeader.oOfferType?.Auart || "",
            Pmnttrms: "Z030",
            PurchNoC: oHeader.customerOrder || "",
            SalesGrp: oHeader.oSalesGroup?.Group || "",
            SalesOff: oHeader.oSalesOffice?.Office || "",
            SalesOrg: oHeader.oSalesOrganization?.Vkorg || "",
            ReqDateH: oCurrentDate,
            CtValidF: oHeader.validFromDate || "",
            CtValidT: oHeader.validUntilDate || "",
            QtValidF: oCurrentDate,
            QtValidT: new Date(oCurrentDate.setDate(oCurrentDate.getDate() + 5))
        };
    }

    private _itemsAndData() : ItemsAndData {
        const oHeader : Header = this.oContractManagement.getProperty('/header');
        const arrMaterial : Items[] = this.oContractManagement.getProperty('/arrMaterial');
        let arrQuotationItemsInSet : QuotationItemsInSet[] = [];
        let arrQuotationDataInSet : QuotationDataInSet[] = [{
            ItmNumber: "0".padStart(6,'0'),
            ValPer: "",
            ValPerCa: "",
            ValPerUn: "",
            InstDate: new Date("0000000000000"),
            AcceptDat: new Date("0000000000000"),
            ConStDat: oHeader.validFromDate || "",
            ConSiDat: new Date("0000000000000"),
            ConEnDat: oHeader.validUntilDate || "",
            ActDatrul: "",
            CancDoc: "",
            CancParty: "",
            CancProc: "",
            Cancreason: "",
            ConEnAct:"",
            ConEnRul:"",
            ConStRul:""
        }];

        for (let i = 0; i < arrMaterial.length; i++) {
            const oMaterial = arrMaterial[i];
            const iPosition : string = ((i+1)*10).toString();
            const oEquipmentAndWorkForce : EquipmentByWorkForce = this._equipmentAndWorForce(oMaterial.arrEquipment, oHeader.oCurrency?.CurrencyCode || "");
            const oQuotationItemsInSet : QuotationItemsInSet = {
                Currency: oHeader.oCurrency?.CurrencyCode || "",
                Division:  oHeader.oSector?.Spart || "",
                ItmNumber: iPosition.padStart(6,'0'),
                Material: oMaterial.oMaterial?.Material || "",
                Plant: oMaterial.selectedKeyCenter || "",
                PrcGroup2: oMaterial.selectedCustomerGroup3 || "",
                PrcGroup3: oMaterial.selectedWorkingHours || "",
                ProfitCtr: oMaterial.oCebe?.Profit || "",
                ShortText: oHeader.customerOrder || "",
                TargetQty: iPosition,
                TargetQu: "SR",
                TargetVal: oMaterial.netValue.toString(),
                QuotationConditionsInSet: oEquipmentAndWorkForce.arrWorkForce,
                QuotationEquipmentInSet: oEquipmentAndWorkForce.arrEquipment
            };
            const oQuotationDataInSet: QuotationDataInSet = {                
                ItmNumber: iPosition.padStart(6,'0'),
                ValPer: "",
                ValPerCa: "",
                ValPerUn: "",
                InstDate: oEquipmentAndWorkForce.arrEquipment[0].InstalationDate,
                AcceptDat: new Date("0000000000000"),
                ConStDat: oHeader.validFromDate || "",
                ConSiDat: new Date("0000000000000"),
                ConEnDat: oHeader.validUntilDate || "",
                ActDatrul: "",
                CancDoc: "",
                CancParty: "",
                CancProc: "",
                Cancreason: "",
                ConEnAct:"",
                ConEnRul:"",
                ConStRul:""
            };

            arrQuotationItemsInSet.push(oQuotationItemsInSet);
            arrQuotationDataInSet.push(oQuotationDataInSet);
        }

        return {
            quotationItems: arrQuotationItemsInSet,
            quotationData: arrQuotationDataInSet
        }
    }

    private _equipmentAndWorForce(arrEquipment : ItemEquipment[], sCurrency : string) : EquipmentByWorkForce {

        let arrQuotationEquipmentInSet : QuotationEquipmentInSet[] = [];
        let arrQuotationConditionsInSet : QuotationConditionsInSet[] = [];

        for (let i = 0; i < arrEquipment.length; i++) {
            const oEquipment = arrEquipment[i];
            const arrWorkForce = oEquipment.workForce as WorkForce[];
            const iPosition : string = ((i+1)*10).toString();
            const oQuotationEquipmentInSet : QuotationEquipmentInSet = {
                ItmNumber: iPosition.padStart(6,'0'),
                Equipment: oEquipment.EquipmentB || "",
                InstalationDate: oEquipment.InstalationDate || ""
            };

            arrQuotationEquipmentInSet.push(oQuotationEquipmentInSet);

            for (const oWorkForce of arrWorkForce){
                if (oWorkForce.key !== '06'){
                    const oQuotationConditionsInSet : QuotationConditionsInSet = {
                        ItmNumber: iPosition.padStart(6,'0'),
                        CondPUnt: iPosition,
                        CondType: oWorkForce.monthly >=0 ? oWorkForce.key : "",
                        CondUnit: "SR",
                        CondValue: oWorkForce.monthly.toString(),
                        Currency: sCurrency
                    }
                    
                    arrQuotationConditionsInSet.push(oQuotationConditionsInSet);
                }
            }            
        }

        return {
            arrEquipment: arrQuotationEquipmentInSet,
            arrWorkForce: arrQuotationConditionsInSet
        };
    } 

    public onClear () {
        const oHeader : Header = {
            customerOrder: null,
            department: null,
            oChannel: null,
            oCurrency: null,
            oOfferType: null,
            orderDate: null,
            oRequester: null,
            oSalesGroup: null,
            oSalesOffice: null,
            oSalesOrganization: null,
            oSector: null,
            paymentTerms: null,
            validFromDate: null,
            validUntilDate: null
        };
        this.oContractManagement.setProperty('/header', oHeader);
        this.oContractManagement.setProperty('/arrMaterial', []);
        this.oContractManagement.setProperty('/arrEquipment', []);
        this.oContractManagement.setProperty('/oConfig/isEdiatbleEquipment', true);
        this.oContractManagement.setProperty('/isEquipmentCup', true);
        this.oContractManagement.setProperty('/arrWorkForce', true);
    }
}