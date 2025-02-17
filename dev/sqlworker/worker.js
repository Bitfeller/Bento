// SQLWorker utilized for updating db for v0.4.0

const { connect, query } = require('./sql.js');

(async () => {
    const conn = await connect();
    const users = await query("SELECT * FROM users");
    let updated = 0;
    for(let row of users) {
        let last = row.userdata;
        row.userdata = row.userdata.replaceAll('\\n', '').replaceAll('\\r', '').replaceAll('\u0009', '');
        if(last != row.userdata) {
            updated++;
            await query("UPDATE users SET userdata = '" + row.userdata + "' WHERE id = " + row.id);
        }
    }
    console.log(`Updated ${updated} users.`);
    updated = 0;

    const decks = await query("SELECT * FROM decks");
    for(let row of decks) {
        let last = row.data;
        row.data = row.data.replaceAll('\\n', '').replaceAll('\\r', '');
        if(last != row.data) {
            updated++;
            await query("UPDATE decks SET data = '" + row.data + "' WHERE id = " + row.id);
        }
    }
    console.log(`Updated ${updated} decks.`);

    conn.end();
})();