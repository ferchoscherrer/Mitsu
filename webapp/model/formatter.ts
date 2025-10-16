export default {

    materialDescription(material: string, desc: string) : string {
        if (!material && !desc) return "";
        const cleanIdMaterial = material ? material.replace(/^0+/, "") : "";
        return `${cleanIdMaterial} - ${desc || ""}`;
    }
    
}

