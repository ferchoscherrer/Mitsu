import Controller from "sap/ui/core/mvc/Controller";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ContextV2 from "sap/ui/model/odata/v2/Context";
import { Customer, DetailRouteArg, ItemEquipment, RoutingEquipment } from "../model/types";
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import Input, { Input$ValueHelpRequestEvent } from "sap/m/Input";
import { TableSelectDialog$ConfirmEvent, TableSelectDialog$SearchEvent } from "sap/m/TableSelectDialog";
import Dialog from "sap/m/Dialog";
import Fragment from "sap/ui/core/Fragment";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import { Button$PressEvent } from "sap/m/Button";
import Target, { Target$DisplayEvent } from "sap/ui/core/routing/Target";
import Table, { Table$RowSelectionChangeEvent } from "sap/ui/table/Table";
import MessageBox from "sap/m/MessageBox";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import ERP from "../modules/ERP";
import formatter from "contractmanagement/contractmanagement/model/formatter";

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

    private oFragmentEquipment: Dialog;
    private oFragmentCup:  Dialog;
    private sPahtEquipement: string;
    private arrIndexSelectRow: number[] = [];

    
    private ZCS_GET_COST_MAINTAIN_SRV: ODataModel;

    public formatter = formatter;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.oContractManagement = this.getOwnerComponent()?.getModel("mContractManagement") as JSONModel;
        this.oI18nModel = this.getOwnerComponent()?.getModel("i18n") as ResourceModel;
        this.oI18n = this.oI18nModel.getResourceBundle() as ResourceBundle;
        this.oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        this.ZCS_GET_COST_MAINTAIN_SRV = this.getOwnerComponent()?.getModel("ZCS_GET_COST_MAINTAIN_SRV") as ODataModel;

        this.oTarget = this.oRouter.getTarget("TargetEquipment") as Target;
        this.oTarget.attachDisplay((oEvent: Target$DisplayEvent) => {
            this.oInfoMaterial = oEvent.getParameter("data") as RoutingEquipment;
        });
    }

    public onNavBack(): void{
        if (this.oInfoMaterial?.fromTarget) {
            this.oRouter.getTargets()?.display(this.oInfoMaterial.fromTarget);
            this.oContractManagement.setProperty('/oConfig/isEdiatbleEquipment', true);
            BusyIndicator.hide();
            return;
        }
    }

    public async onOpenPopUpEquipment(oEvent : Input$ValueHelpRequestEvent): Promise<void> {

        this.onGetPathEquipement(oEvent);

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

    private onGetPathEquipement(oEvent : Input$ValueHelpRequestEvent) {
        const oSource : Input = oEvent.getSource();
        const oBindingContext = oSource.getBindingContext("mContractManagement") as ContextV2;
        this.sPahtEquipement = oBindingContext.getPath();
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

        if (this.sPahtEquipement)
            for(const oSelect of oSelectedContext){
                this.oContractManagement.setProperty(`${this.sPahtEquipement}`, oSelect.getObject());
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

    public onDeleteEquipment(){

        if (this.arrIndexSelectRow.length === 0) {
            MessageBox.alert(this.oI18n.getText("errorDeleteRows") ?? '')
        } else {
            MessageBox.warning(this.oI18n.getText("warnDeletePosition") || "",{
                actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.YES,
                onClose: (sAction : string ) =>{
                    if (sAction === 'YES') this._onDelete();
                }
            });
        }
        
    }

    private _onDelete(){

        const oTable = this.byId("tblEquipment") as Table;
        const arrEquipment : ItemEquipment[] = this.oContractManagement.getProperty(`/arrEquipment`);
    
        for (const indexRowSelect of this.arrIndexSelectRow){
            arrEquipment.splice(indexRowSelect,this.arrIndexSelectRow.length);   
        }
        this.oContractManagement.refresh(true);
        oTable.clearSelection();
        this.arrIndexSelectRow = [];
    }

    public onSelectRow(oEvent : Table$RowSelectionChangeEvent){
        const oSource : Table = oEvent.getSource();
        const arrSelectedRow : number[] = oSource.getSelectedIndices();

        this.arrIndexSelectRow = arrSelectedRow;
    }

    public onSaveEquipment () {
        BusyIndicator.show(0);

        const arrIDMaterialPos  = this.oInfoMaterial?.materialPositions as number[];
        const arrEquipment : ItemEquipment[] = this.oContractManagement.getProperty('/arrEquipment');

        if (arrEquipment.length === 0){
            MessageBox.information(this.oI18n.getText("errAddEquipment") || '')
        }else{

            for(const iPosition of arrIDMaterialPos){
                this.oContractManagement.setProperty(`/arrMaterial/${iPosition}/arrEquipment`, arrEquipment);
            }

            this.oContractManagement.setProperty('/arrEquipment', []);

            this.onNavBack();
        }

        BusyIndicator.hide();

    }

    public onClear () {
        const arrEquipment : ItemEquipment[] = this.oContractManagement.getProperty('/arrEquipment');

        for(let i=0; i < arrEquipment.length; i++){
            arrEquipment[i] = {
                DescriptionE: null,
                Emplaz: null,
                DescriptionL: null,
                EquipmentB: null,
                InstalationDate: null,
                Location: null,
                Partner: null
            };
        }        
    }

    public async onOpenPopUpCup(oEvent : Input$ValueHelpRequestEvent): Promise<void> {
        this.onGetPathEquipement(oEvent);
        this._onGetWorkForce();

        this.oFragmentCup ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.DialogCup",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentCup);
        this.oFragmentCup.open();
    }

    private async _onGetWorkForce() : Promise<void> {
        BusyIndicator.show(0)
        try {            
            // const { data } = await ERP.readDataKeysERP(
            //     "/ManoObraSet",
            //     this.ZCS_GET_COST_MAINTAIN_SRV,
            //     // arrFilter
            // );
            const arrResults = [
                {
                    key:'01',item: "Mano de Obra",annual: 200000,date: new Date(),monthly: 14000
                },
                {
                    key:'02',item: "Serv trasl/Atn a falla",annual: 200000,date: new Date(),monthly: 14000
                },
                {
                    key:'03',item: "Otros materiales y/o inventarios",annual: 200000,date: new Date(),monthly: 14000
                },
                {
                    key:'04',item: "Gastos de operación y venta",annual: 200000,date: new Date(),monthly: 14000
                },
                {
                    key:'05',item: "Utilidad",annual: 200000,date: new Date(),monthly: 14000
                },
                {
                    key:'06',item: "Total",annual: 0,date: new Date(),monthly: 0
                }
            ];
            // data.results; //as Contract_By_Customer_Header[];

            if (arrResults.length <= 0) 
                throw new Error(this.oI18n.getText("noDataWorkForce"));
                           
            this.oContractManagement.setProperty('/arrWorkForce', arrResults);
            this._onCalculateTotalWorkForce();
        } catch (oError: any) {
            this.oContractManagement.setProperty('/arrWorkForce', []);
            throw new Error(oError.message);
        } finally {
            this.oContractManagement.refresh(true);
            BusyIndicator.hide();
        }
    } 

    public onCloseWorkForce() {
        this.oContractManagement.setProperty('/arrWorkForce', []);
        this.oFragmentCup.close();
    }

    public onSaveWorkForce() {
        const arrWorkForce : any[]= this.oContractManagement.getProperty('/arrWorkForce');
        const oFoundTotalMonthly = arrWorkForce.find((oWorkForce)=> oWorkForce.key === '06');

        this.oContractManagement.setProperty(`${this.sPahtEquipement}/cup`, oFoundTotalMonthly.monthly);
        this.onCloseWorkForce();
    }

    public _onCalculateTotalWorkForce() {
        const arrWorkForce = this.oContractManagement.getProperty('/arrWorkForce');
        let iTotalAnnual : number = 0;
        let iTotalMonthly : number = 0;

        for(const oWorkForce of arrWorkForce){
            if (oWorkForce.key !== '06'){
                iTotalAnnual += Number(oWorkForce.annual || 0);
                iTotalMonthly += Number(oWorkForce.monthly || 0);
            }
        }

        arrWorkForce[5].annual = iTotalAnnual;
        arrWorkForce[5].monthly = iTotalMonthly;

    }
}