const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection("mysql://u889453186_adminpanel:DildilPakistan786_786@195.35.59.84:3306/u889453186_adminpanel");

    try {
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Tables:', tables);

    } catch (error) {
        console.error('Query failed:', error);
    } finally {
        await connection.end();
    }
}

main();
