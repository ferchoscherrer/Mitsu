import Controller from "sap/ui/core/mvc/Controller";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ContextV2 from "sap/ui/model/odata/v2/Context";
import { Customer, DetailRouteArg, ItemEquipment, RoutingEquipment, WorkForce, WorkForce_Service } from "../model/types";
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
import ERP from "contractmanagement/contractmanagement/modules/ERP";
import formatter from "contractmanagement/contractmanagement/model/formatter";
import MessageToast from "sap/m/MessageToast";


import { BOMItem } from "../model/types";

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

    // --- INICIO CÓDIGO NUEVO (Propiedades) ---
    private oFragmentBOM: Dialog; // Referencia al nuevo fragmento
    private ZCS_GET_BOM_MATERIAL_SRV: ODataModel; // Nuevo Modelo OData
    private sCurrentEquipmentID: string; // Para guardar el ID del equipo actual
    // --- FIN CÓDIGO NUEVO ---

    
    private ZCS_GET_COST_MAINTAIN_SRV: ODataModel;

    public formatter = formatter;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.oContractManagement = this.getOwnerComponent()?.getModel("mContractManagement") as JSONModel;
        this.oI18nModel = this.getOwnerComponent()?.getModel("i18n") as ResourceModel;
        this.oI18n = this.oI18nModel.getResourceBundle() as ResourceBundle;
        this.oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        this.ZCS_GET_COST_MAINTAIN_SRV = this.getOwnerComponent()?.getModel("ZCS_GET_COST_MAINTAIN_SRV") as ODataModel;


        // --- INICIO CÓDIGO NUEVO (Inicializar modelo BOM) ---
        // Asegúrate de que este ID "ZCS_GET_BOM_MATERIAL_SRV" coincida con tu manifest.json
        this.ZCS_GET_BOM_MATERIAL_SRV = this.getOwnerComponent()?.getModel("ZCS_GET_BOM_MATERIAL_SRV") as ODataModel; 
        // --- FIN CÓDIGO NUEVO ---

        this.oTarget = this.oRouter.getTarget("TargetEquipment") as Target;
        this.oTarget.attachDisplay((oEvent: Target$DisplayEvent) => {
            this.oInfoMaterial = oEvent.getParameter("data") as RoutingEquipment;
        });
    }


    public onValidateNumber(oEvent: any): void {
        const oInput = oEvent.getSource();
        let sValue = oEvent.getParameter("value");

        // 1. Eliminar cualquier caracter que no sea número o punto
        // Nota: Permitimos comas si tu formato usa comas, aquí asumo formato estándar (1234.56)
        // Si usas puntos para decimales, usa esta regex: /[^0-9.]/g
        let sNewValue = sValue.replace(/[^0-9.,]/g, "");

        // 2. Si el valor cambió (porque había letras), actualizamos el input
        if (sValue !== sNewValue) {
            oInput.setValue(sNewValue);
        }
    }

    public onNavBack(): void{
        if (this.oInfoMaterial?.fromTarget) {

            const arrIDMaterialPos  = this.oInfoMaterial?.materialPositions as number[];
            const arrEquipment : ItemEquipment[] = this.oContractManagement.getProperty('/arrEquipment');
            let iTotalCUP : number = 0;

            if (arrEquipment.length >= 1){

                arrEquipment.forEach(oEquiment=> iTotalCUP += Number(oEquiment.cup || 0) )

                for(const iPosition of arrIDMaterialPos){
                    this.oContractManagement.setProperty(`/arrMaterial/${iPosition}/netValue`, iTotalCUP);
                }

                this.oContractManagement.setProperty('/arrEquipment', []);
            }

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

    // se comenta para agregar nueva
  /*  public onSelectEquipment(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];

        if (this.sPahtEquipement)
            for(const oSelect of oSelectedContext){
                this.oContractManagement.setProperty(`${this.sPahtEquipement}`, oSelect.getObject());
                
            }
    }
    */
   /*
   public onSelectEquipment(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];

        if (this.sPahtEquipement) {
            for(const oSelect of oSelectedContext){
                // CORRECCIÓN: Asignar el tipo 'ItemEquipment' al objeto recuperado
                //const oEquipmentObj = oSelect.getObject() as ItemEquipment;
                const oEquipmentObj = oSelect.getObject() as any;
                
                this.oContractManagement.setProperty(`${this.sPahtEquipement}`, oEquipmentObj);
                const sMaterialDelItem = oEquipmentObj.Material || oEquipmentObj.Matnr || "";

                // Ahora TypeScript ya sabe que existe .EquipmentB
                if (oEquipmentObj.EquipmentB) {
                    this.onCheckBOM(oEquipmentObj.EquipmentB, sMaterialDelItem);
                }
            }
        }
    } */

/*
        // inicio - cambio de funcion para validar si existe ya un documento de venta con el equipo

        public onSelectEquipment(oEvent: TableSelectDialog$ConfirmEvent): void {
        const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];

        // 1. Recuperamos el Material desde el Modelo Principal (Main)
        // Usamos la información de navegación para saber qué posición se está editando
        let sMaterialDelMain = "";
        
        if (this.oInfoMaterial && this.oInfoMaterial.materialPositions && this.oInfoMaterial.materialPositions.length > 0) {
            // Tomamos el índice de la primera posición seleccionada en el Main
            const iIndexPosition = this.oInfoMaterial.materialPositions[0];
            
            // Leemos el objeto Material guardado en el modelo mContractManagement
            // Ruta: /arrMaterial/{indice}/oMaterial
            const oMaterialObj = this.oContractManagement.getProperty(`/arrMaterial/${iIndexPosition}/oMaterial`);
            
            if (oMaterialObj) {
                // Asumiendo que la propiedad se llama 'Material' en tu tipo Material
                sMaterialDelMain = oMaterialObj.Material || "";
            }
        }
        
        console.log("Material recuperado del Main:", sMaterialDelMain); // Para depuración

        // 2. Procesamos la selección del equipo
        if (this.sPahtEquipement) {
            for(const oSelect of oSelectedContext){
                const oEquipmentObj = oSelect.getObject() as any; // Cast a any o ItemEquipment
                
                this.oContractManagement.setProperty(`${this.sPahtEquipement}`, oEquipmentObj);

                // 3. Llamamos a onCheckBOM enviando el Material del Main
                if (oEquipmentObj.EquipmentB) {
                    // Pasamos: (ID del Equipo, ID del Material del Contrato)
                    this.onCheckBOM(oEquipmentObj.EquipmentB, sMaterialDelMain);
                }
            }
        }
    }

    // Fin - cambio de funcion para validar si existe ya un documento de venta con el equipo
    */
   
    public async onSelectEquipment(oEvent: TableSelectDialog$ConfirmEvent): Promise<void> {
    const oSelectedContext = oEvent.getParameter("selectedContexts") as ContextV2[];
    if (!this.sPahtEquipement || oSelectedContext.length === 0) return;

    const oEquipmentObj = oSelectedContext[0].getObject() as any;
    const sEquipmentID = oEquipmentObj.EquipmentB;

    // Llamada al OData para verificar oferta previa
    const bTieneOferta = await this._validarExistenciaOferta(sEquipmentID);

    if (bTieneOferta) {
        MessageBox.warning(
            `Atención: El equipo ${sEquipmentID} ya tiene una oferta N°  registrada en los últimos meses. ¿Desea continuar?`,
            {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: (sAction: string) => {
                    if (sAction === MessageBox.Action.YES) {
                        //this._finalizarAsignacion(oEquipmentObj);
                        this._ejecutarAsignacionFinal(oEquipmentObj);
                    }
                }
            }
        );
    } else {
        //this._finalizarAsignacion(oEquipmentObj);
        this._ejecutarAsignacionFinal(oEquipmentObj);
    }
}
/*
private _finalizarAsignacion(oEquipmentObj: any): void {
    this.oContractManagement.setProperty(`${this.sPahtEquipement}`, oEquipmentObj);
    // ... resto de tu lógica para BOM o materiales
}
*/
private _ejecutarAsignacionFinal(oEquipmentObj: any): void {
    // A. Asignación al modelo local (mContractManagement)
    this.oContractManagement.setProperty(`${this.sPahtEquipement}`, oEquipmentObj);

    // B. Recuperar el Material del Main para el servicio de BOM
    let sMaterialDelMain = "";
    if (this.oInfoMaterial && this.oInfoMaterial.materialPositions && this.oInfoMaterial.materialPositions.length > 0) {
        const iIndexPosition = this.oInfoMaterial.materialPositions[0];
        const oMaterialObj = this.oContractManagement.getProperty(`/arrMaterial/${iIndexPosition}/oMaterial`);
        sMaterialDelMain = oMaterialObj ? (oMaterialObj.Material || "") : "";
    }

    // C. DISPARAR FUNCIONALIDAD DE BOM (Restaurada)
    if (oEquipmentObj.EquipmentB) {
        // Esta es la función que abre tu diálogo de materiales y Toast
        this.onCheckBOM(oEquipmentObj.EquipmentB, sMaterialDelMain);
    }
}

    private async _validarExistenciaOferta(sEquipmentID: string): Promise<boolean> {
    try {
        // Construimos el endpoint con la llave del equipo
        // Ejemplo: /ValidarEquipoSet('000000000010001234')
        const sEntity = ERP.generateEntityWithKeys("/ValidaEquiposSet", { 
            Equipo: sEquipmentID 
        });

        const { data } = await ERP.readDataKeysERP(
            sEntity, 
            this.ZCS_GET_COST_MAINTAIN_SRV
        );

        return data.Existe === true || data.Existe === "X";
    } catch (error) {
        console.error("Error al validar equipo:", error);
        return false;
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
        await this._onGetWorkForce();

        this.oFragmentCup ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.DialogCup",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentCup);
        this.oFragmentCup.open();
    }


    //inicio - se comenta funcion para mejorarla
    /*
    private async _onGetWorkForce() : Promise<void> {
        BusyIndicator.show(0)
        try {            
            const { data } = await ERP.readDataKeysERP(
                "/ManoObraSet('53')",
                this.ZCS_GET_COST_MAINTAIN_SRV,
                // arrFilter
            );
            //debugger
            const arrResults : WorkForce[] = [
                {
                    key:'ZCS1',item: "Mano de Obra",annual: data.ValorTotal ,date: new Date(),monthly: (data.ValorTotal/12)
                },
                {
                    key:'ZCS2',item: "Serv trasl/Atn a falla",annual: 0,date: new Date(),monthly: 0
                },
                {
                    key:'ZCS3',item: "Otros materiales y/o inventarios",annual: data.ValorTotal,date: new Date(),monthly: (data.ValorTotal/12)
                },
                {
                    key:'ZCS4',item: "Gastos de operación y venta",annual: 0,date: new Date(),monthly: 0
                },
                {
                    key:'ZCS5',item: "Utilidad",annual: 0,date: new Date(),monthly: 0
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
            MessageBox.error(oError.message)
            // throw new Error(oError.message);
        } finally {
            this.oContractManagement.refresh(true);
            BusyIndicator.hide();
        }
    } 
*/
    //fin - se comenta funcion para mejorarla

    // inicio - funcion mejorada
    private async _onGetWorkForce() : Promise<void> {
        BusyIndicator.show(0);
        try {            
            // 1. Recuperamos el objeto del equipo actual usando el path guardado
            // (Asegúrate de que 'sPahtEquipement' se haya seteado en onOpenPopUpCup)
            const oEquipment = this.oContractManagement.getProperty(this.sPahtEquipement);
            
            // 2. Obtenemos el ID del equipo (EquipmentB)
            // Si tu propiedad se llama diferente (ej. Equipment), cámbialo aquí.
            const sEquipmentID = oEquipment.EquipmentB;

            if (!sEquipmentID) {
                throw new Error("No se ha identificado el número de equipo para consultar la mano de obra.");
            }

            // 3. Llamada dinámica al OData inyectando el ID del equipo
            const { data } = await ERP.readDataKeysERP(
                `/ManoObraSet('${sEquipmentID}')`, 
                this.ZCS_GET_COST_MAINTAIN_SRV
            );
            
            // 4. Mapeo de resultados (Lógica original conservada)
            const arrResults : WorkForce[] = [
                {
                    key:'ZCS1', item: "Mano de Obra", annual: data.ValorTotal, date: new Date(), monthly: (data.ValorTotal/12)
                },
                {
                    key:'ZCS2', item: "Serv trasl/Atn a falla", annual: 0, date: new Date(), monthly: 0
                },
                {
                    key:'ZCS3', item: "Otros materiales y/o inventarios", annual: data.ValorTotal, date: new Date(), monthly: (data.ValorTotal/12)
                },
                {
                    key:'ZCS4', item: "Gastos de operación y venta", annual: 0, date: new Date(), monthly: 0
                },
                {
                    key:'ZCS5', item: "Utilidad", annual: 0, date: new Date(), monthly: 0
                },
                {
                    key:'06', item: "Total", annual: 0, date: new Date(), monthly: 0
                }
            ];

            if (arrResults.length <= 0) 
                throw new Error(this.oI18n.getText("noDataWorkForce"));
                           
            this.oContractManagement.setProperty('/arrWorkForce', arrResults);
            this._onCalculateTotalWorkForce();

        } catch (oError: any) {
            this.oContractManagement.setProperty('/arrWorkForce', []);
            // Manejo de error más amigable si falla la lectura del equipo
            const sMsg = oError.message || "Error al obtener datos de mano de obra";
            MessageBox.error(sMsg);
        } finally {
            this.oContractManagement.refresh(true);
            BusyIndicator.hide();
        }
    }
    //fin - funcion mejorada

    public onCloseWorkForce() {
        this.oContractManagement.setProperty('/arrWorkForce', []);
        this.oFragmentCup.close();
    }

    public onSaveWorkForce() {
        const arrWorkForce : any[]= this.oContractManagement.getProperty('/arrWorkForce');
        const oFoundTotalMonthly = arrWorkForce.find((oWorkForce)=> oWorkForce.key === '06');

        this.oContractManagement.setProperty(`${this.sPahtEquipement}/cup`, oFoundTotalMonthly.monthly);
        this.oContractManagement.setProperty(`${this.sPahtEquipement}/workForce`, arrWorkForce);
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



    /**
     * Consulta el servicio OData ZCS_GET_BOM_MATERIAL_SRV con el filtro Intrm eq '3'
     * y abre el diálogo de revisión.
     */
    public async onCheckBOM(sEquipmentID: string, sMaterial: string): Promise<void> {
        this.sCurrentEquipmentID = sEquipmentID;

       MessageToast.show("Se te mostrarán los materiales permitidos en la cobertura, espera un momento", {
            at: "CenterTop", // Posición: Centro vertical y horizontal
            width: "25rem",      // Ancho un poco mayor para que se lea bien
            offset: "0 20", // Mover 0px horizontal, 50px hacia abajo       // Duración en milisegundos (3 segundos)
            duration: 3000
            
        });

        BusyIndicator.show(0);

        try {
            // 1. Preparamos el filtro específico
            const aFilters = [
                new Filter("Intrm", FilterOperator.EQ, sMaterial),
                new Filter("Werks", FilterOperator.EQ, "TLP1") 
            ];

            // 2. Llamada usando tu helper ERP
            const { data } = await ERP.readDataKeysERP(
                "/BomItemsSet", 
                this.ZCS_GET_BOM_MATERIAL_SRV, 
                aFilters
            );

            // 3. Mapeo de resultados
            const arrBOM: any[] = data.results.map((item: any) => ({
                Material: item.Idnrk,
                Description: item.Ojtxp,
                Quantity: item.Mnglg,
                Unit: item.Mmein,
                IsManual: false
            }));

            // 4. Actualizar Modelo Local
            this.oContractManagement.setProperty('/arrBOM', arrBOM);
            this.oContractManagement.setProperty('/isCustomBOM', false);

            // 5. Abrir Popup
            await this.onOpenBOMDialog();

        } catch (error: any) {
            MessageBox.error("Error al obtener la lista de materiales (BOM): " + error.message);
        } finally {
            BusyIndicator.hide();
        }
    }

    public async onOpenBOMDialog(): Promise<void> {
        this.oFragmentBOM ??= await Fragment.load({
            id: this.getView()?.getId(),
            name: "contractmanagement.contractmanagement.view.fragment.DialogBOM",
            controller: this,
        }) as Dialog;

        this.getView()?.addDependent(this.oFragmentBOM);
        this.oFragmentBOM.open();
    }

    public onSwitchToCustomBOM(): void {
        MessageBox.confirm(
            this.oI18n.getText("confirmCustomBOM") || "Al modificar, se creará una alternativa. ¿Desea continuar?",
            {
                onClose: (sAction: string) => {
                    if (sAction === MessageBox.Action.OK) {
                        this.oContractManagement.setProperty('/isCustomBOM', true);
                    }
                }
            }
        );
    }

    public onAddBOMMaterial(): void {
        const arrBOM = this.oContractManagement.getProperty('/arrBOM');
        arrBOM.push({
            Material: "",
            Description: "",
            Quantity: 1,
            Unit: "PC",
            IsManual: true
        });
        this.oContractManagement.refresh(true);
    }

    public async onConfirmBOM(): Promise<void> {
        const bIsCustom = this.oContractManagement.getProperty('/isCustomBOM');
        const arrBOM = this.oContractManagement.getProperty('/arrBOM');

        this.oFragmentBOM.close();

        if (bIsCustom) {
            await this._createAlternativeBOM(arrBOM);
        } else {
            MessageBox.success(this.oI18n.getText("bomAssigned") || "Lista de materiales estándar asignada.");
        }
    }

    private async _createAlternativeBOM(arrBOM: any[]): Promise<void> {
        BusyIndicator.show(0);
        try {
            const oPayload = {
                Equipment: this.sCurrentEquipmentID,
                Items: arrBOM
            };

            await ERP.createDataERP(
                "/AlternativeBOMSet", 
                this.ZCS_GET_COST_MAINTAIN_SRV, 
                oPayload
            );

            MessageBox.success(this.oI18n.getText("alternativeCreated") || "Alternativa creada exitosamente.");

        } catch (error: any) {
            MessageBox.error(error.message);
            this.oFragmentBOM.open(); 
        } finally {
            BusyIndicator.hide();
        }
    }

    public onCancelBOM(): void {
        this.oFragmentBOM.close();
        this.oContractManagement.setProperty('/arrBOM', []);
    }
}