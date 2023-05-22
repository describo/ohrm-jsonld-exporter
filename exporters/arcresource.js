import { pageSize, mapEntityProperties } from "./config.js";

export class ArcResource {
    constructor() {}

    async export({ models }) {
        let offset = 0;
        let rows = [];
        let total = await models.arcresource.count();
        while (offset <= total) {
            for (let row of await models.arcresource.findAll({ limit: pageSize, offset })) {
                // console.log(row.get());
                const properties = [
                    ["repid", "repositoryId"],
                    ["arrepref", "archiveIdentifier"],
                    ["arrepreflink", "archiveLink"],
                    ["arlanguage", "resourceLanguage"],
                    ["arstatedate", "startDate"],
                    ["arsdatemod", "startDateModifier"],
                    ["arstart", "startDateISOString"],
                    ["arenddate", "endDate"],
                    ["aredatemod", "endDateModifier"],
                    ["arend", "endDateISOString"],
                    ["arquantityl", "linearMetres"],
                    ["arquantityn", "numberOfItems"],
                    ["arquantityt", "typeOfItems"],
                    ["arformats", "formatOfItems"],
                    ["araccess", "accessConditions"],
                    "arotherfa",
                    ["arref", "organisationalIdentifier"],
                    ["arappendate", "recordCreationDate"],
                    ["arlastmodd", "recordLastModifiedDate"],
                    ["arcreator", "resourceCreator"],
                    ["arlevel", "levelOfCollection"],
                    ["arprocessing", "processingNote"],
                    ["arstatus", "outputStatus"],
                ];

                const arcresource = {
                    "@id": `#${encodeURIComponent(row.arcid)}`,
                    "@type": "ArchivalResource",
                    identifier: row.arcid,
                    name: row.artitle,
                    subTitle: row.arsubtitle,
                    description: row.ardescription,
                };
                mapEntityProperties(row, arcresource, properties);
                if (row.arprepared) {
                    rows.push({
                        "@id": `#${encodeURIComponent(row.arprepared)}`,
                        "@type": "Person",
                        name: row.arprepared,
                    });
                    arcresource.preparedBy = { "@id": `#${encodeURIComponent(row.arprepared)}` };
                }
                let extractEntities = [
                    { type: "Person", value: row.arprepared, property: "preparedBy" },
                ];
                for (let e of extractEntities) {
                    if (e.value) {
                        let d = extractEntity({
                            type: e.type,
                            value: e.value,
                        });
                        rows.push(d);
                        arcresource[e.property] = { "@id": d["@id"] };
                    }
                }

                rows.push(arcresource);
            }
            offset += pageSize;
        }
        return rows;
    }
}
