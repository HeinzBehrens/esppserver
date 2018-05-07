"use strict";
// UPDATEDATABASES.TS
//
// Planung: Update der Datenbanken
//    a) update der Tabelle Stock mit den Schlusskursen von EXTR
//    b) update der Tabelle Stock mit den Schlusskursen von EUR->USD
//    c) update der Tabelle Aktie mit den aktuellen Gewinn/Verlust-Werten
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// HBE: update noch programmieren
// updateDatenbank
// holt für 1 bis 3 Monate die Close-Kurse von Extremen und trägt diese in die Datenbank ein
//
const classes_1 = require("../public/hbeTools/classes");
const getExtremeSharePrice_1 = require("../public/hbeTools/getExtremeSharePrice");
const finance_1 = require("./finance");
const moment = require("moment");
const db = __importStar(require("../public/hbeTools/crud"));
const getCurrencyIZB_1 = require("../public/hbetools/getCurrencyIZB");
// HBE: updateStockTable muss noch als Promise geschrieben werden ...
/** updateStockTable
 *
 * @param dbName  Name der Database
 * @param tbStock Name der Tabelle
 */
function updateStockTable(dbName, tbStock) {
    let allWerte;
    // Alle Aktienwerte fuer den letzten Monat holen
    getExtremeSharePrice_1.getSharePriceExtremeMonate(getExtremeSharePrice_1.eZeitraum.Monat1)
        .then((werte) => {
        allWerte = werte;
        // das letzte Datum aus der Tabelle holen
        return db.getMaxOf(dbName, tbStock, "date");
    })
        .then((lastDate) => {
        // wenn die Tabelle noch leer ist, dann ist das Datum ungültig
        let maxdate = moment(lastDate);
        if (!maxdate.isValid())
            maxdate = moment("1900-01-01");
        console.log("letztes Datum in Tabelle " + tbStock + ": " + maxdate.format("LLLL"));
        // alle Aktienwerte herausfiltern, deren Datum größer als maxDatum ist:
        const neueAktienWerte = allWerte.filter((record) => {
            return moment(record.date) > maxdate;
        });
        console.log("Anzahl geholt: " + allWerte.length);
        console.log("Anzahl übrig: " + neueAktienWerte.length);
        // nun kann ich die neuen Werte eintragen
        if (neueAktienWerte.length > 0) {
            Promise.all(db.insertArrayOfRecords(dbName, tbStock, classes_1.Iquandl, neueAktienWerte))
                .then(() => console.log("Erfolgreich"))
                .catch(err => console.log("nicht erfolgreich: " + err.message));
        }
    })
        .catch(reason => console.log("Fehler in updateDatenbank: " + reason));
}
function getExchangeRateFromArray(datum, arDatExch) {
    const erg = arDatExch.find((eintrag) => {
        return eintrag.datumAsIso === datum;
    });
    if (erg === undefined)
        return 0;
    else
        return erg.exchange_rate;
}
function updateExchangeRatesInDb() {
    // ExchangeRate als json-object holen
    // hole stock-daten, bei denen exchange-rate fehlt
    // durchgehen und aus jedem Eintrag Datum holen
    // exchangerate aus dem json-object holen
    // exchange-rate eintragen
    // record abspeichern
    // // ExchangeRate als json-object holen
    // const dataFromXmlFile = readTextFile("G:/Heinz/Programmierung/2018/espp_server/dist/usd.xml")
    // const jsonExchangeData = XML_TO_JSON(dataFromXmlFile)
    // // dataFromXmlFile = JSON.stringify(jsonExchangeData)
    // // Suchfunktion für ein bestimmtes Datum
    // function getExchangeRateForDate(datum: Moment): number {
    //   const dateAsStringForExchange = datum.format("YYYY-MM-DD")
    //   const gefEintrag = jsonExchangeData.CompactData.DataSet.Series.Obs.find((element: any) => {
    //     return element._attributes.TIME_PERIOD === dateAsStringForExchange
    //   })
    //   if (gefEintrag) return gefEintrag._attributes.OBS_VALUE
    //   return 0
    // }
    getCurrencyIZB_1.getExchangeRateLast90Days().then(arDatExchg => {
        // hole stock-daten, bei denen Exchange-rate fehlt
        // select * from  Stock where Stock.exchangeUSDEUR is null limit 10;
        db.getWhere(finance_1.mySQLdb, finance_1.tbNameStock, " exchangeUSDEUR is null limit 50").then((val) => {
            val.forEach(element => {
                let newRec = new classes_1.Iquandl();
                newRec = db.convertJsonToClass(element, newRec);
                const exchangeRate = getExchangeRateFromArray(newRec.date.format("YYYY-MM-DD"), arDatExchg);
                if (exchangeRate !== 0) {
                    newRec.exchangeUSDEUR = exchangeRate;
                    db
                        .updateRecord(finance_1.mySQLdb, finance_1.tbNameStock, newRec, classes_1.Iquandl)
                        .then(rec => {
                        console.log(rec.date.format("LLL") + "erfolgreich gespeichert");
                    })
                        .catch(reason => {
                        console.log("Update nicht erfolgreich für Rec: " + newRec.date.format());
                    });
                }
            });
        });
    });
}
function updateDatabase() {
    updateStockTable(finance_1.mySQLdb, finance_1.tbNameStock);
}
//# sourceMappingURL=updateDatabases.js.map