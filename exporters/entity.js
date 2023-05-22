import { pageSize, mapEntityProperties } from "./config.js";
import { extractEntity } from "./common.js";

export class Entity {
    constructor() {}

    async export({ models }) {
        let offset = 0;
        let rows = [];
        let total = await models.entity.count();
        while (offset <= total) {
            for (let row of await models.entity.findAll({ limit: pageSize, offset })) {
                const properties = [
                    ["ecountrycode", "countryCode"],
                    ["eorgcode", "organisationCode"],
                    ["esubname", "subName"],
                    ["elegalno", "legalNumber"],
                    ["estartdate", "startDate"],
                    ["esdatemod", "startDateModifier"],
                    ["estart", "startDateISOString"],
                    ["eenddate", "endDate"],
                    ["eedatemod", "endDateModifier"],
                    ["eend", "endDateISOString"],
                    ["edatequal", "dateQualifier"],
                    ["elegalstatus", "legalStatus"],
                    ["efunction", "function"],
                    ["esumnote", "summaryNote"],
                    ["efullnote", "fullNote"],
                    ["egender", "gender"],
                    ["ereference", "reference"],
                    ["enote", "processingNotes"],
                    ["eappenddate", "recordAppendDate"],
                    ["elastmod", "recordLastModified"],
                    ["elogo", "logo"],
                    ["eurl", "url"],
                    ["earchives", "archives"],
                    "epub",
                    ["eonline", "online"],
                    ["egallery", "gallery"],
                    ["eowner", "owner"],
                    ["erating", "rating"],
                    ["estatus", "status"],
                    "x_efunction",
                ];

                let type = row.etype.split("-").map((v) => v.trim().replace(" ", "_"));

                let alsoKnownAs = await models.entityname.findAll({
                    where: { eid: row.eid },
                });
                alsoKnownAs = alsoKnownAs.map((entity) => {
                    return { "@id": `#${encodeURIComponent(entity.eid)}_alsoKnownAs` };
                });
                let entityEvent = await models.entityevent.findAll({ where: { eid: row.eid } });
                entityEvent = entityEvent.map((entity) => {
                    return { "@id": `#${encodeURIComponent(entity.eid)}_event` };
                });
                const entity = {
                    "@id": `#${encodeURIComponent(row.eid)}`,
                    "@type": type,
                    identifier: row.eid,
                    name: row.ename,
                    alsoKnownAs: alsoKnownAs.map((e) => ({ "@id": e["@id"] })),
                    relatedEvents: entityEvent.map((e) => ({ "@id": e["@id"] })),
                };

                //console.log("TYPES", type);

                // TODO -- Add vocab classes for ENTITY

                mapEntityProperties(row, entity, properties);

                let extractEntities = [
                    { type: "Person", value: row.eprepared, property: "preparedBy" },
                    { type: "Place", value: row.ebthplace, property: "birthPlace" },
                    { type: "State", value: row.ebthstate, property: "birthState" },
                    { type: "Country", value: row.ebthCountry, property: "birthCountry" },
                    { type: "Place", value: row.edthplace, property: "deathPlace" },
                    { type: "State", value: row.edthstate, property: "deathState" },
                    { type: "Country", value: row.edthCountry, property: "deathCountry" },
                    { type: "Nationality", value: row.enationality, property: "nationality" },
                ];
                for (let e of extractEntities) {
                    if (e.value) {
                        let d = extractEntity({
                            type: e.type,
                            value: e.value,
                        });
                        rows.push(d);
                        entity[e.property] = { "@id": d["@id"] };
                    }
                }

                // push the entity definition into the graph
                rows.push(entity);
            }
            offset += pageSize;
        }
        return rows;
    }
}
