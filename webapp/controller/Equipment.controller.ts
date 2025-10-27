import Controller from "sap/ui/core/mvc/Controller";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ContextV2 from "sap/ui/model/odata/v2/Context";
import { Customer, DetailRouteArg, ItemEquipment, RoutingEquipment } from "../model/types";
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import { Input$ValueHelpRequestEvent } from "sap/m/Input";
import { TableSelectDialog$ConfirmEvent, TableSelectDialog$SearchEvent } from "sap/m/TableSelectDialog";
import Dialog from "sap/m/Dialog";
import Fragment from "sap/ui/core/Fragment";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import { Button$PressEvent } from "sap/m/Button";
import Target, { Target$DisplayEvent } from "sap/ui/core/routing/Target";

/**
 * @namespace contractmanagement.contractmanagement.controller
 */
export default class Equipment extends Controller {
    private oContractManagement: JSONModel;
    private oI18nModel: ResourceModel;
    private oI18n: ResourceBundle;
    private oRouter: Router;
    private oTarget: Target;
    private oInfoMaterial: RoutingEquipment | undefined;

    // pop-Up

    private oFragmentEquipment: Dialog;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.oContractManagement = this.getOwnerComponent()?.getModel("mContractManagement") as JSONModel;
        this.oI18nModel = this.getOwnerComponent()?.getModel("i18n") as ResourceModel;
        this.oI18n = this.oI18nModel.getResourceBundle() as ResourceBundle;
        this.oRouter = (this.getOwnerComponent() as UIComponent).getRouter();

        this.oTarget = this.oRouter.getTarget("TargetEquipment") as Target;
        this.oTarget.attachDisplay((oEvent: Target$DisplayEvent) => {
            this.oInfoMaterial = oEvent.getParameter("data") as RoutingEquipment;
        });
    }

    public onNavBack(): void{
        if (this.oInfoMaterial?.fromTarget) {
            this.oRouter.getTargets()?.display(this.oInfoMaterial.fromTarget);
            return;
        }
    }

    public async onOpenPopUpEquipment(oEvent : Input$ValueHelpRequestEvent): Promise<void> {
        const oRequester : Customer = this.oContractManagement.getProperty(`/header/oRequester`);
        const oFilter = new Filter({
            filters: [
                new Filter('Partner', FilterOperator.EQ, oRequester.CustomerCode)
            ]
        });

        this.oFragmentEquipment ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.TblEquipment",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentEquipment);

        const oBinding = this.oFragmentEquipment.getBinding("items") as ODataListBinding;
        oBinding.filter(oFilter);

        this.oFragmentEquipment.open();
    }

    public onSearchEquipment(oEvent: TableSelectDialog$SearchEvent): void {

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

    public onSelectEquipment(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];

        for(const oSelect of oSelectedContext){
            debugger
            // this.oContractManagement.setProperty(`${this.sPahtMaterial}/oOrderReason`, oSelect.getObject());
        }
    }

    public onAddEquipment(oEvent: Button$PressEvent): void {
        const arrEquipments: ItemEquipment[] = this.oContractManagement.getProperty(`/arrEquipment`);
        arrEquipments.push({
            EquipmentB: null,
            InstalationDate: null,
            DescriptionE: null,
            Emplaz: null,
            Location: null,
            DescriptionL: null,
            Partner: null
        });
        this.oContractManagement.refresh(true);
    }
}