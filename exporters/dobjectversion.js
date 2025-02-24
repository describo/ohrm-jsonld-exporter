import { pageSize, mapEntityProperties } from "./config.js";
import { extractEntity } from "./common.js";

export class DObjectVersion {
    constructor() {}

    async export({ models }) {
        let offset = 0;
        let rows = [];
        let total = await models.dobjectversion.count();
        while (offset <= total) {
            for (let row of await models.dobjectversion.findAll({ limit: pageSize, offset })) {
                // console.log(row.get());
                const properties = [
                    ["dovformat", "format"],
                    ["dovdefault", "primaryVersion"],
                    "dovattributes",
                    ["dovstartdate", "startDate"],
                    ["dovsdatemod", "startDateModifier"],
                    ["dovstart", "startDateISOString"],
                    ["dovenddate", "endDate"],
                    ["dovedatemod", "endDateModifier"],
                    ["dovend", "endDateISOString"],
                    ["dovphysdesc", "physicalDescription"],
                    ["dovcreator", "resourceCreator"],
                    ["dovcontrol", "controlCode"],
                    ["dovreference", "note"],
                    ["dovnotes", "processingNotes"],
                    ["dovstatus", "outputStatus"],
                    ["dovappendate", "recordAppendDate"],
                    ["dovlastmodd", "recordLastModified"],
                    "dovimagedisplay",
                    "dovorder",
                    ["dovportrait", "imageOrientation"],
                ];

                const dobject = {
                    "@id": encodeURI(row.dov),
                    "@type": ["File", "DigitalObject", row.dovtype],
                    dobjectIdentifier: row.doid,
                    name: row.dovtitle ?? row.dov,
                    description: row.dovdescription,
                    dobject: { "@id": `#${encodeURIComponent(row.doid)}` },
                };
                if (row.arcid) dobject.linkedArchivalResource = { "@id": row.arcid };
                if (row.pubid) dobject.linkedPublishedResource = { "@id": row.pubid };
                mapEntityProperties(row, dobject, properties);

                let extractEntities = [{ type: "Place", value: row.doplace, property: "place" }];
                for (let e of extractEntities) {
                    if (e.value) {
                        let d = extractEntity({
                            type: e.type,
                            value: e.value,
                        });
                        rows.push(d);
                        dobject[e.property] = { "@id": d["@id"] };
                    }
                }
                rows.push(dobject);
            }
            offset += pageSize;
        }
        return rows;
    }
}
