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
    let i = 0;

    function upperName(str) {
        return str[0].toUpperCase() + str.slice(1);
    }

    function rating() {

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
            FROM `mushroom`\
            ORDER BY `mushroom`.`mushroom` ASC ';

    [rows] = await connection.execute(sql);
    console.log('Grybai:');
    for (mushroomName of rows) {
        const shroomCountperKg = 1000 / mushroomName.weight;
        console.log(`${++i}) ${upperName(mushroomName.mushroom)} - ${(shroomCountperKg).toFixed(1)}`);
    }
    console.log('');

    //**6.** _Isspausdinti, visu grybautoju krepselyje esanciu grybu kiekius (issirikiuojant pagal grybautojo varda nuo abeceles pradzios link pabaigos)
    sql = 'SELECT `name`, SUM(`count`) as amount\
    FROM `basket` \
    LEFT JOIN `gatherer` \
        ON `gatherer`.`id` = `basket`.`gatherer_id` \
    GROUP BY `basket`.`gatherer_id` \
    ORDER BY `name`';


    // su ON sulyginam, kas skirtingose lentelese yra bendro
    // GROUP BY grupavimas reiksmiu pagal pasirinkta parametra
    // ORDER BY rykiavimas pagal pasirinkta parametra

    [rows] = await connection.execute(sql);
    console.log('Grybu kiekis pas grybautoja:');
    for (gatherer of rows) {
        console.log(`${++i}) ${upperName(gatherer.name)} - ${gatherer.amount} grybu`);
    }
    console.log('');

    //**7.** _Isspausdinti, visu grybautoju krepseliu kainas (issirikiuojant nuo brangiausio link pigiausio krepselio), suapvalinant iki centu_
    sql = 'SELECT `name`, SUM(`count` * `price` * `weight`/ 1000) as cost\
    FROM `basket` \
    LEFT JOIN `gatherer` \
        ON `gatherer`.`id` = `basket`.`gatherer_id` \
    LEFT JOIN `mushroom` \
        ON `mushroom`.`id` = `basket`.`mushroom_id` \
    GROUP BY `basket`.`gatherer_id` \
    ORDER BY `cost` DESC ';

    [rows] = await connection.execute(sql);
    console.log('Grybu krepselio kainos pas grybautoja:');
    for (gatherer of rows) {
        console.log(`${++i}) ${upperName(gatherer.name)} - ${+gatherer.cost} EUR`);
    }

    //**8** _Isspausdinti, kiek nuo geriausiai vertinamu iki blogiausiai vertinamu grybu yra surinkta. Spausdinima turi atlikti funkcija, kuri gauna vieninteli parametra - kalbos pavadinima, pagal kuria reikia sugeneruoti rezultata

    //lang = 'en'- default kalba
    async function mushroomsByRating(lang = 'en') {
        sql = 'SELECT `ratings`.`id`, `name_' + lang + '`, SUM(`count`) as amount\
    FROM `ratings`\
    LEFT JOIN `mushroom`\
    ON `mushroom`.`rating` = `ratings`.`id`\
    LEFT JOIN `basket`\
    ON `basket`.`mushroom_id` = `mushroom`.`id`\
    GROUP BY `ratings`.`id`\
    ORDER BY `ratings`.`id` DESC';
        [rows] = await connection.execute(sql);
        console.log(rows);
    }
    mushroomsByRating('lt');
    mushroomsByRating('en');
    mushroomsByRating();

    //**9** _Isspausdinti, visus grybus, kuriu ivertinimas geresnis arba lygus 4 zvaigzdutem, isrikiuotus gerejimo tvarka_
    sql = 'SELECT `rating`, `mushroom` FROM `mushroom`\
            ORDER BY `rating` ASC';
    [rows] = await connection.execute(sql);
    console.log(rows);
    let mushroomList = [];
    for (const { rating, mushroom } of rows) {
        if (rating >= 4) {
            mushroomList.push(upperName(mushroom));
        }
    }
    console.log(`Grybai: ${mushroomList.join(', ')}.`);

    //**10** _Isspausdinti, visus grybus, kuriu ivertinimas yra viena is nurodytu reiksmiu: 1, 3 arba 5 zvaigzdutem, isrikiuotus gerejimo tvarka_

    sql = 'SELECT `mushroom`, `rating`\
    FROM `mushroom` \
    WHERE rating IN (1, 3, 5) \
    ORDER BY `rating` ASC';

    //IN operator allows you to determine if a value matches any value in a list of values

    [rows] = await connection.execute(sql)
    console.log(rows);
    let ratingList = [];
    for (const { mushroom } of rows) {
        ratingList.push(upperName(mushroom));
    }
    console.log(`Grybai: ${ratingList.join(', ')}.`);

}
app.init();

module.exports = app;