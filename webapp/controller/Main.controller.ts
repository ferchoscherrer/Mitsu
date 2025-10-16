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
import { Items } from "../model/types";
import Input, { Input$ValueHelpRequestEvent } from "sap/m/Input";
import formatter from "../model/formatter";

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

    private sPahtMaterial: string;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.oContractManagement = this.getOwnerComponent()?.getModel("mContractManagement") as JSONModel;
        this.oI18nModel = this.getOwnerComponent()?.getModel("i18n") as ResourceModel;
        this.oI18n = this.oI18nModel.getResourceBundle() as ResourceBundle;
        this.oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
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
        const oMaterial : Items = {
            oMaterial: undefined
        }

        arrMaterial.push(oMaterial);

        this.oContractManagement.refresh(true);
    }

    public async onOpenPopUpMaterial(oEvent : Input$ValueHelpRequestEvent): Promise<void> {
        const oSource : Input = oEvent.getSource();
        const oBindingContext = oSource.getBindingContext("mContractManagement") as ContextV2;
        this.sPahtMaterial = oBindingContext.getPath();

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
}