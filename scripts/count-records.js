const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection("mysql://u889453186_adminpanel:DildilPakistan786_786@195.35.59.84:3306/u889453186_adminpanel");

    try {
        const tables = ['projects', 'project_images', 'services', 'technologies', 'categories'];
        for (const table of tables) {
            const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`${table}: ${rows[0].count}`);
        }

    } catch (error) {
        console.error('Query failed:', error);
    } finally {
        await connection.end();
    }
}

main();
