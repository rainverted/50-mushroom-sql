const mysql = require('mysql2/promise');

const app = {}

app.init = async () => {
    // prisijungti prie duomenu bazes
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'mushroom',
    });

    let sql = '';
    let rows = [];

    function upperName(str) {
        return str[0].toUpperCase() + str.slice(1);
    }

    //**1.** _Isspausdinti, visu grybu pavadinimus ir ju kainas, grybus isrikiuojant nuo brangiausio link pigiausio_
    sql = 'SELECT `mushroom`, `price` FROM `mushroom` ORDER BY `mushroom`.`price` DESC';
    [rows] = await connection.execute(sql);

    // LOGIC BELOW
    let price = 0;
    console.log('Grybai:')
    for (let i = 0; i < rows.length; i++) {
        const mushroomName = rows[i].mushroom;
        const mushroomPrice = rows[i].price;

        console.log(`${i + 1}) ${upperName(mushroomName)} - ${mushroomPrice} EUR / kg`);
    }
    console.log('');

    //**2.** _Isspausdinti, visu grybautoju vardus_
    sql = 'SELECT `name` FROM `gatherer`';
    [rows] = await connection.execute(sql);
    //map funkcija sukuria nauja array masyva uzpildydama iskviestais elementais 
    const gathererNames = rows.map(gatherer => gatherer.name);
    console.log(`Grybautojai: ${gathererNames.join(', ')}.`);
    console.log('');

    //**3.** _Isspausdinti, brangiausio grybo pavadinima_
    sql = 'SELECT `mushroom` \
    FROM `mushroom` \
    WHERE `price` = (SELECT MAX(`price`) FROM `mushroom`)';
    [rows] = await connection.execute(sql);
    const largestPriceShroom = rows[0].mushroom;
    console.log(`Brangiausias grybas yra: ${upperName(largestPriceShroom)}.`);
    console.log('');

    //**4.** _Isspausdinti, pigiausio grybo pavadinima_
    sql = 'SELECT `mushroom` \
    FROM `mushroom` \
    WHERE `price` = (SELECT MIN(`price`) FROM `mushroom`)';
    [rows] = await connection.execute(sql);
    const lowestPriceShroom = rows[0].mushroom;
    console.log(`Pigiausias grybas yra: ${upperName(lowestPriceShroom)}.`);
    console.log('');

    //**5.** _Isspausdinti, visu kiek vidutiniskai reikia grybu, jog jie svertu 1 kilograma (suapvalinti iki vieno skaiciaus po kablelio), isrikiuojant pagal pavadinima nuo abeceles pradzios link pabaigos_


    sql = 'SELECT `mushroom`, `weight`\
            FROM `mushroom`';


    [rows] = await connection.execute(sql);
    console.log('Grybai:');

}

app.init();

module.exports = app;