
import PocketBase from 'pocketbase';
import fs from 'fs';

const PB_URL = 'http://192.168.1.110:8090';
const ADMIN_EMAIL = 'jlcor2011@gmail.com';
const ADMIN_PASS = 'Zepelon2026!!!';

const pb = new PocketBase(PB_URL);

async function migrate() {
    try {
        console.log("Conectando a PocketBase...");
        await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
        console.log("Autenticado.");

        let collection = await pb.collections.getOne('projects');
        const fieldsInfo = collection.fields || [];
        const validFields = fieldsInfo.map(f => f.name);
        const urlFields = fieldsInfo.filter(f => f.type === 'url').map(f => f.name);

        console.log("Campos válidos en la DB:", validFields.join(", "));

        console.log("Leyendo datos...");
        const dataPath = 'C:\\Users\\jlcor\\.gemini\\antigravity\\brain\\d6344ed1-0c08-44c1-a9ea-24349cbd012d\\data_records.json';
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        console.log(`Importando ${data.length} registros...`);
        for (const record of data) {
            try {
                // Saneamiento de datos
                const cleanRecord = {};
                for (const key of Object.keys(record)) {
                    if (validFields.includes(key) && !['id', 'created', 'updated'].includes(key)) {
                        let value = record[key];
                        if (urlFields.includes(key)) {
                            if (!value || value === "#N/A" || !value.startsWith('http')) {
                                value = null;
                            }
                        }
                        cleanRecord[key] = value;
                    }
                }

                // Buscar si existe
                const result = await pb.collection('projects').getList(1, 1, {
                    filter: `Cod = "${record.Cod}"`
                });

                if (result.totalItems > 0) {
                    await pb.collection('projects').update(result.items[0].id, cleanRecord);
                    console.log(`✅ Actualizado: ${record.Cod} - ${record.Promocion}`);
                } else {
                    await pb.collection('projects').create(cleanRecord);
                    console.log(`✅ Creado: ${record.Cod} - ${record.Promocion}`);
                }
            } catch (err) {
                console.error(`❌ Error en ${record.Cod}:`, err.message);
                if (err.data) console.error("   Detalle:", JSON.stringify(err.data));
            }
        }

        console.log("\n¡MIGRACIÓN FINALIZADA!");

    } catch (err) {
        console.error("ERROR FATAL:", err.message);
    }
}

migrate();
