export default {

    materialDescription(material: string, desc: string) : string {
        if (!material && !desc) return "";
        const cleanIdMaterial = material ? material.replace(/^0+/, "") : "";
        return `${cleanIdMaterial} - ${desc || ""}`;
    },

    formatAmmount(value: string) : string {
        if (value == null || value === "") return "";

        const iNumber = Number(value || '0');
        if (isNaN(iNumber)) return "";

        const formatter = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        return formatter.format(iNumber);
    }
    
}

