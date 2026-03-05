const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection("mysql://u889453186_adminpanel:DildilPakistan786_786@195.35.59.84:3306/u889453186_adminpanel");

    try {
        const [projects] = await connection.execute('SELECT id, mainImage FROM projects LIMIT 5');
        console.log('Projects:', projects);

        const [services] = await connection.execute('SELECT id, icon, heroImage FROM services LIMIT 5');
        console.log('Services:', services);

        const [techs] = await connection.execute('SELECT id, icon FROM technologies LIMIT 5');
        console.log('Techs:', techs);

        const [projImages] = await connection.execute('SELECT id, imageUrl FROM project_images LIMIT 5');
        console.log('Project Images:', projImages);

    } catch (error) {
        console.error('Query failed:', error);
    } finally {
        await connection.end();
    }
}

main();
