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
    this.ZCS_GET_BOM_MATERIAL_SRV = this.getOwnerComponent()?.getModel("ZCS_GET_BOM_MATERIAL_SRV") as ODataModel;

    this.oTarget = this.oRouter.getTarget("TargetEquipment") as Target;
    this.oTarget.attachDisplay((oEvent: Target$DisplayEvent) => {
        this.oInfoMaterial = oEvent.getParameter("data") as RoutingEquipment;
        console.log("=== TargetEquipment.attachDisplay ===");
        console.log("Data recibida en navegación:", this.oInfoMaterial);
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

    public onNavBack(): void {
    if (this.oInfoMaterial?.fromTarget) {
        const arrIDMaterialPos = this.oInfoMaterial?.materialPositions as number[];
        const arrEquipment: ItemEquipment[] = this.oContractManagement.getProperty('/arrEquipment');
        
        // Calculamos el total de los equipos asignados actualmente
        let iTotalCUP: number = 0;
        arrEquipment.forEach(oEquiment => iTotalCUP += Number(oEquiment.cup || 0));

        for (const iPosition of arrIDMaterialPos) {
            // CAMBIO: Solo sobreescribimos el netValue si el cálculo del equipo es mayor a 0
            // Si iTotalCUP es 0 (porque solo asignaste el equipo pero no abriste el CUP),
            // mantenemos el valor que ya tenía la fila (el valor clonado).
            if (iTotalCUP > 0) {
                this.oContractManagement.setProperty(`/arrMaterial/${iPosition}/netValue`, iTotalCUP);
            }
        }

        this.oContractManagement.setProperty('/arrEquipment', []);
        this.oRouter.getTargets()?.display(this.oInfoMaterial.fromTarget);
        this.oContractManagement.setProperty('/oConfig/isEdiatbleEquipment', true);
        BusyIndicator.hide();
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
    console.log("=== _ejecutarAsignacionFinal ===");
    console.log("Ruta equipo actual:", this.sPahtEquipement);
    console.log("Equipo seleccionado desde popup:", JSON.parse(JSON.stringify(oEquipmentObj)));

    const oCurrentEquipData = this.oContractManagement.getProperty(this.sPahtEquipement);
    console.log("Datos actuales antes de fusionar:", JSON.parse(JSON.stringify(oCurrentEquipData)));

    const oFusedEquipment = {
        ...oEquipmentObj,
        cup: oCurrentEquipData.cup || 0,
        workForce: oCurrentEquipData.workForce || []
    };

    console.log("Equipo fusionado FINAL:", JSON.parse(JSON.stringify(oFusedEquipment)));

    this.oContractManagement.setProperty(this.sPahtEquipement, oFusedEquipment);

    console.log("Equipo guardado en modelo:", JSON.parse(JSON.stringify(
        this.oContractManagement.getProperty(this.sPahtEquipement)
    )));

    let sMaterialDelMain = "";
    if (this.oInfoMaterial && this.oInfoMaterial.materialPositions && this.oInfoMaterial.materialPositions.length > 0) {
        const iIndexPosition = this.oInfoMaterial.materialPositions[0];
        const oMaterialObj = this.oContractManagement.getProperty(`/arrMaterial/${iIndexPosition}/oMaterial`);
        sMaterialDelMain = oMaterialObj ? (oMaterialObj.Material || "") : "";
    }

    console.log("Material tomado del Main para BOM:", sMaterialDelMain);

    if (oEquipmentObj.EquipmentB) {
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
    try {
        console.log("=== onAddEquipment ===");
        console.log("oInfoMaterial:", this.oInfoMaterial);

        const arrEquipments: ItemEquipment[] = this.oContractManagement.getProperty("/arrEquipment") || [];
        console.log("arrEquipments actual:", arrEquipments);

        const aPos = this.oInfoMaterial?.materialPositions;
        console.log("materialPositions:", aPos);

        if (!aPos || aPos.length === 0) {
            console.error("No hay materialPositions en oInfoMaterial");
            MessageBox.error("No se encontró la posición del material para agregar el equipo.");
            return;
        }

        const iIndex = aPos[0];
        console.log("iIndex detectado:", iIndex);

        const sMaterialPath = `/arrMaterial/${iIndex}`;
        console.log("Ruta material:", sMaterialPath);

        const oMaterialPos = this.oContractManagement.getProperty(sMaterialPath);
        console.log("oMaterialPos:", oMaterialPos);

        if (!oMaterialPos) {
            console.error("No existe la fila del material en la ruta:", sMaterialPath);
            MessageBox.error(`No existe el material en la ruta ${sMaterialPath}`);
            return;
        }

        const oTemp = oMaterialPos?.tempCUP;
        console.log("tempCUP recuperado:", oTemp);

        const oNewEquip: any = {
            EquipmentB: null,
            InstalationDate: null,
            DescriptionE: null,
            Emplaz: null,
            Location: null,
            DescriptionL: null,
            Partner: null,
            cup: oTemp ? oTemp.cup : 0,
            workForce: oTemp ? JSON.parse(JSON.stringify(oTemp.workForce || [])) : []
        };

        console.log("Nuevo equipo a insertar:", oNewEquip);

        arrEquipments.push(oNewEquip);

        console.log("arrEquipments después push:", arrEquipments);

        this.oContractManagement.setProperty("/arrEquipment", arrEquipments);
        this.oContractManagement.refresh(true);

        console.log("Modelo final /arrEquipment:", this.oContractManagement.getProperty("/arrEquipment"));
    } catch (error) {
        console.error("Error en onAddEquipment:", error);
        MessageBox.error("Error al agregar equipo. Revisa la consola.");
    }
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

   public onSaveEquipment() {
    BusyIndicator.show(0);
    const arrIDMaterialPos = this.oInfoMaterial?.materialPositions as number[];
    const arrEquipment: ItemEquipment[] = this.oContractManagement.getProperty('/arrEquipment');

    if (arrEquipment.length === 0) {
        MessageBox.information(this.oI18n.getText("errAddEquipment") || '');
    } else {
        for (const iPosition of arrIDMaterialPos) {
            // Inyectamos el arreglo completo
            this.oContractManagement.setProperty(`/arrMaterial/${iPosition}/arrEquipment`, arrEquipment);
            this.oContractManagement.setProperty(`/arrMaterial/${iPosition}/hasEquipment`, true);
            
            // Calculamos el valor final para la tabla del Main
            let iTotalCUP = 0;
            arrEquipment.forEach(e => iTotalCUP += Number(e.cup || 0));
            this.oContractManagement.setProperty(`/arrMaterial/${iPosition}/netValue`, iTotalCUP);
        }
        
        // REFRESH CRÍTICO: Esto hace que el Main "despierte" y vea los nuevos datos
        this.oContractManagement.refresh(true);
        this.onNavBack();
    }
    BusyIndicator.hide();
}





  // 🔧 FIX: Este método se dispara desde un BUTTON, no desde un Input
// Por eso NO debemos usar Input$ValueHelpRequestEvent
public async onOpenPopUpCup(oEvent: any): Promise<void> {

    // 🔥 AQUÍ OBTENEMOS EL PATH REAL DEL EQUIPO SELECCIONADO
    const oSource = oEvent.getSource(); // botón presionado
    const oBindingContext = oSource.getBindingContext("mContractManagement");

    // 🔴 ESTE ES EL PATH CRÍTICO (ej: /arrEquipment/1)
    this.sPahtEquipement = oBindingContext.getPath();

    console.log("=== onOpenPopUpCup ===");
    console.log("Path del equipo seleccionado:", this.sPahtEquipement);
    console.log("Equipo seleccionado:", this.oContractManagement.getProperty(this.sPahtEquipement));

    // 🔧 CARGAMOS LOS DATOS (local o servicio)
    await this._onGetWorkForce();

    // 🔧 Abrimos el popup
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
    private async _onGetWorkForce(): Promise<void> {
    BusyIndicator.show(0);
    try {
console.log("=== _onGetWorkForce ===");
console.log("Path recibido:", this.sPahtEquipement);

if (!this.sPahtEquipement) {
    console.error("❌ ERROR: sPahtEquipement está vacío");
    MessageBox.error("No se encontró el equipo seleccionado.");
    return;
}

        const oEquipment = this.oContractManagement.getProperty(this.sPahtEquipement);
        console.log("Equipo recuperado desde modelo:", JSON.parse(JSON.stringify(oEquipment)));

     if (oEquipment.workForce && oEquipment.workForce.length > 0) {

    console.log("El equipo YA tiene workForce local.");

    // 🔥 FIX: Convertir fechas string → Date
    const arrFixedWorkForce = oEquipment.workForce.map((item: any) => {
        return {
            ...item,
            date: item.date ? new Date(item.date) : new Date()
        };
    });

    console.log("WorkForce corregido:", arrFixedWorkForce);

    this.oContractManagement.setProperty('/arrWorkForce', arrFixedWorkForce);

    this._onCalculateTotalWorkForce();

    BusyIndicator.hide();
    return;
}

        const sEquipmentID = oEquipment.EquipmentB;
        console.log("No tenía workForce local. Se consultará servicio para equipo:", sEquipmentID);

        if (!sEquipmentID) {
            throw new Error("No se ha identificado el número de equipo.");
        }

        const { data } = await ERP.readDataKeysERP(`/ManoObraSet('${sEquipmentID}')`, this.ZCS_GET_COST_MAINTAIN_SRV);

        console.log("Respuesta servicio ManoObraSet:", data);

        const arrResults: WorkForce[] = [
            { key:'ZCS1', item: "Mano de Obra", annual: data.ValorTotal, date: new Date(), monthly: (data.ValorTotal/12) },
            { key:'ZCS2', item: "Serv trasl/Atn a falla", annual: 0, date: new Date(), monthly: 0 },
            { key:'ZCS3', item: "Otros materiales y/o inventarios", annual: data.ValorTotal, date: new Date(), monthly: (data.ValorTotal/12) },
            { key:'ZCS4', item: "Gastos de operación y venta", annual: 0, date: new Date(), monthly: 0 },
            { key:'ZCS5', item: "Utilidad", annual: 0, date: new Date(), monthly: 0 },
            { key:'06', item: "Total", annual: 0, date: new Date(), monthly: 0 }
        ];

        console.log("WorkForce armado desde servicio:", JSON.parse(JSON.stringify(arrResults)));

        this.oContractManagement.setProperty('/arrWorkForce', arrResults);
        this._onCalculateTotalWorkForce();

        console.log("arrWorkForce final en popup:", JSON.parse(JSON.stringify(
            this.oContractManagement.getProperty('/arrWorkForce')
        )));

    } catch (oError: any) {
        console.error("Error en _onGetWorkForce:", oError);
        this.oContractManagement.setProperty('/arrWorkForce', []);
        MessageBox.error(oError.message || "Error al obtener datos");
    } finally {
        this.oContractManagement.refresh(true);
        BusyIndicator.hide();
    }
}
  public onCloseWorkForce(): void {
    this.oContractManagement.setProperty("/arrWorkForce", []);
    this.oContractManagement.refresh(true);
    this.oFragmentCup.close();
}

public onSaveWorkForce(): void {
    console.log("=== onSaveWorkForce ===");

    if (!this.sPahtEquipement) {
        console.error("❌ ERROR: No hay path del equipo");
        MessageBox.error("No se pudo guardar el CUP, no se identificó el equipo.");
        return;
    }

    console.log("Ruta equipo actual:", this.sPahtEquipement);

    const arrWorkForce: any[] = this.oContractManagement.getProperty("/arrWorkForce") || [];
    console.log("arrWorkForce del popup antes de guardar:", JSON.parse(JSON.stringify(arrWorkForce)));

    const oFoundTotalMonthly = arrWorkForce.find((oWorkForce: any) => oWorkForce.key === "06");
    console.log("Fila TOTAL encontrada:", JSON.parse(JSON.stringify(oFoundTotalMonthly)));

    if (!oFoundTotalMonthly) {
        console.warn("No se encontró la fila con key = '06'");
        MessageBox.warning("No se encontró el total del CUP.");
        return;
    }

    const arrToSave = arrWorkForce.map((item: any) => {
        return {
            ...item,
            date: item.date instanceof Date ? item.date.toISOString() : item.date
        };
    });

    // Guardar CUP y workforce en el equipo actual
    this.oContractManagement.setProperty(
        `${this.sPahtEquipement}/cup`,
        Number(oFoundTotalMonthly.monthly || 0)
    );
    this.oContractManagement.setProperty(
        `${this.sPahtEquipement}/workForce`,
        arrToSave
    );

    // Recalcular total de CUP de todos los equipos
    const arrIDMaterialPos = this.oInfoMaterial?.materialPositions || [];
    const arrEquipment: ItemEquipment[] = this.oContractManagement.getProperty("/arrEquipment") || [];

    let iTotalCUP = 0;
    arrEquipment.forEach((e) => {
        iTotalCUP += Number(e.cup || 0);
    });

    // Reflejar inmediatamente en el material del Main
    for (const iPosition of arrIDMaterialPos) {
        this.oContractManagement.setProperty(`/arrMaterial/${iPosition}/arrEquipment`, arrEquipment);
        this.oContractManagement.setProperty(`/arrMaterial/${iPosition}/hasEquipment`, true);
        this.oContractManagement.setProperty(`/arrMaterial/${iPosition}/netValue`, iTotalCUP);
    }

    this.oContractManagement.refresh(true);

    console.log("CUP guardado en equipo:", this.oContractManagement.getProperty(`${this.sPahtEquipement}/cup`));
    console.log("workForce guardado en equipo:", JSON.parse(JSON.stringify(
        this.oContractManagement.getProperty(`${this.sPahtEquipement}/workForce`)
    )));
    console.log("Equipo completo después de guardar:", JSON.parse(JSON.stringify(
        this.oContractManagement.getProperty(this.sPahtEquipement)
    )));

    this.onCloseWorkForce();
}
   public _onCalculateTotalWorkForce(): void {
    const arrWorkForce = this.oContractManagement.getProperty("/arrWorkForce") || [];

    console.log("=== _onCalculateTotalWorkForce ===");
    console.log("arrWorkForce ANTES total:", JSON.parse(JSON.stringify(arrWorkForce)));

    let iTotalAnnual = 0;
    let iTotalMonthly = 0;

    for (const oWorkForce of arrWorkForce) {
        if (oWorkForce.key !== "06") {
            iTotalAnnual += Number(oWorkForce.annual || 0);
            iTotalMonthly += Number(oWorkForce.monthly || 0);
        }
    }

    const iIndexTotal = arrWorkForce.findIndex((item: any) => item.key === "06");

    if (iIndexTotal !== -1) {
        arrWorkForce[iIndexTotal].annual = iTotalAnnual;
        arrWorkForce[iIndexTotal].monthly = iTotalMonthly;
    }

    this.oContractManagement.setProperty("/arrWorkForce", arrWorkForce);
    this.oContractManagement.refresh(true);

    console.log("Total annual calculado:", iTotalAnnual);
    console.log("Total monthly calculado:", iTotalMonthly);
    console.log("arrWorkForce DESPUÉS total:", JSON.parse(JSON.stringify(arrWorkForce)));
}
public onChangeWorkForce(): void {
    this._onCalculateTotalWorkForce();
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
// fin de los cambios para el cup 

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
            // --- AÑADE ESTO ---
// Esto obliga a que todos los campos vinculados al modelo se actualicen en la UI
this.oContractManagement.refresh(true); 

// Si usas un ODataModel v2 directamente para la tabla, usa:
// this.getView().getModel().refresh(true);

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