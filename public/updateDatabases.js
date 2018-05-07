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
// HBE: Dokumentation erstellen
// HBE: update noch programmieren
// updateDatenbank
// holt für 1 bis 3 Monate die Close-Kurse von Extremen und trägt diese in die Datenbank ein
//
const getExtremeSharePrice_1 = require("../public/hbeTools/getExtremeSharePrice");
const moment = require("moment");
const db = __importStar(require("../public/hbeTools/crud"));
const getCurrencyIZB_1 = require("../public/hbetools/getCurrencyIZB");
const classes_1 = require("../public/hbetools/classes");
exports.mySQLdb = "./dist/db/Extr_Stock";
exports.tbNameStock = "Stock";
exports.tbNameAktie = "Aktien";
exports.test1 = "Testwert zum exportieren...";
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
            Promise.all(db.insertArrayOfRecords(dbName, tbStock, classes_1.clStock, neueAktienWerte))
                .then(() => console.log("Erfolgreich"))
                .catch(err => console.log("nicht erfolgreich: " + err.message));
        }
        else {
            console.log("Keine neuen Aktienkurse für Extreme!");
        }
    })
        .catch(reason => console.log("Fehler in updateDatenbank: " + reason));
}
// HBE: getExchangeRateFromArray noch als Promise schreiben 
function getExchangeRateFromArray(datum, arDatExch) {
    const erg = arDatExch.find((eintrag) => {
        return eintrag.datumAsIso === datum;
    });
    // eventuell lag ein Bank-Holiday in der EU vor (z.B. Ostermontag)
    // daher prüfen, ob es einen Wert nach dem gesuchten Datum gibt, wenn ja,
    // dann wird der Wert VOR derm gesuchten Datum noch einmal genommen...
    if (erg === undefined) {
        const ergNeuer = arDatExch.find((eintrag) => {
            return eintrag.datumAsIso > datum;
        });
        if (ergNeuer) {
            const ergAelter = arDatExch.find((eintrag) => {
                return eintrag.datumAsIso < datum;
            });
            return ergAelter ? ergAelter.exchange_rate : 0;
        }
        else
            return 0; // wenn kein neueres Datum existiert
    }
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
        db.getWhere(exports.mySQLdb, exports.tbNameStock, " (exchangeUSDEUR is null  or exchangeUSDEUR = 0) and `date` >= 2018 limit 50;").then((val) => {
            console.log(val.length > 0 ? "Neu einzutragende Exchange-Rates: " + val.length : "Keine neu einzugragenden Exchange-Rates!");
            val.forEach(element => {
                let newRec = new classes_1.clStock();
                newRec = db.convertJsonToClass(element, newRec);
                const exchangeRate = getExchangeRateFromArray(newRec.date.format("YYYY-MM-DD"), arDatExchg);
                if (exchangeRate !== 0) {
                    newRec.exchangeUSDEUR = exchangeRate;
                    db
                        .updateRecord(exports.mySQLdb, exports.tbNameStock, newRec, classes_1.clStock)
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
// HBE: aktuelle Arbeit...
/**
 *
 * @param sqlDb die Datenbank
 * @param tbAktie die Tabelle mit den Aktien
 */
function updateTableAktien(sqlDb, tbAktie, tbStock, startDate) {
    const prom = new Promise((resolve, reject) => {
        // alle Einträge aus der Stocktabelle holen, die größer oder gleich dem Datum sind
        const was = " `date` >= '" + startDate.format("YYYY-MM-DD") + "' AND (`action` = null OR `action` = '')";
        db
            .getMaxOfWhere(sqlDb, tbAktie, "date", was)
            .then(letztesDatum => {
            if (letztesDatum == null)
                letztesDatum = moment("2018-01-01");
            // mal nachschauen, ob es in der Tabelle Stock Einträge ab diesem Datum gibt
            return db.getWhere(sqlDb, tbStock, " `date` >= '" + startDate.format("YYYY-MM-DD") + "' order by `date` asc limit 200");
        })
            .then((rows) => {
            // jede einzelne Reihe anschauen, und wenn noch kein Eintrag in der Tabelle Aktie existiert, dann eintragen
            // existiert der Eintrag schon, dann muss ich keine Übertrag mehr von Tabelle Stock zur Tabelle Aktie machen
            let listOfProm = [];
            rows.forEach((row, ndx) => {
                let recStock = new classes_1.clStock();
                // Eintrag von JSON in Class konvertieren
                db.convertJsonToClass(row, recStock);
                // nachschauen, ob es zu diesem Datum schon einen Eintrag in Table Aktie gibt
                const whereStr = " `date` >= '" +
                    recStock.date.toISOString() +
                    "' AND (`action` = null OR `action` = '' OR `action` = '" +
                    classes_1.eActionAktie.None +
                    "')";
                // als Promise in Liste eintragen
                listOfProm.push(db
                    .getWhere(sqlDb, tbAktie, whereStr)
                    .then((val) => {
                    // entweder 1 oder gar kein Eintrag; alles andere ist falsch
                    if (val.length !== 0)
                        return;
                    // neuen Record erstellen
                    let recAktie = new classes_1.clAktie();
                    recAktie.date = recStock.date;
                    recAktie.action = classes_1.eActionAktie.None;
                    recAktie.exchangeUSDEUR = recStock.exchangeUSDEUR;
                    recAktie.kursEXTR = recStock.close;
                    // nun kann ich den Record eintragen
                    return db.insertRecord(sqlDb, exports.tbNameAktie, recAktie, classes_1.clAktie);
                    // .then ( newRec => {console.log ("Record in Table Aktie eingetragen12")} )
                    // .catch ( reason => { console.log ("Record konnte nicht in Table Aktie eingetragen werden: " + reason)})
                })
                    .then(newRec => {
                    console.log("noch mal newRec: " + newRec.date);
                    return true;
                })
                    .catch(reason => {
                    console.log("Fehler bei der Suche nach Datum in Tabelle Aktien: " + reason);
                    return false;
                }));
            }); // hier endet die Schleife
            return Promise.all(listOfProm);
        })
            .then((val) => {
            console.log("alle Einträge erfolgreich");
            return (true);
        })
            .catch(err => {
            console.log("Fehler in updateTableAktien/getMaxOfWhere: " + err);
            reject(err);
        })
            .then(erg => {
            console.log("dies hatte ich nicht erwartet: " + erg);
            resolve(true);
        });
    });
    return prom;
}
function actionForAktie(dbName, tbl, action) {
    return new Promise((resolve, reject) => {
        switch (action.action) {
            case classes_1.eActionAktie.EuroEingang:
            case classes_1.eActionAktie.EuroInAktie:
                db.insertRecord(dbName, tbl, action, classes_1.clAktie)
                    .then((rec) => {
                    let aktienRec = new classes_1.clAktie();
                    const eingRec = db.convertJsonToClass(rec, aktienRec);
                    console.log("Record eingetragen: NDX:" + eingRec.ndxAktie + " - created: " + eingRec.createdAt.format("LLL"));
                    resolve("Record Actin eingetragen");
                })
                    .catch(reason => {
                    console.log("Record wurde nicht eingetragen!" + reason);
                    reject(false);
                });
                break;
            default: {
                console.error(`action ${action.action} ist nicht bekannt!`);
                reject("action wurde nicht erkannt");
            }
        } //switch
    });
}
exports.actionForAktie = actionForAktie;
/** updateTableAktienActions
 *  trägt die Aktionen ab einem bestimmten Startdatum ein und berechnet ab dann die entsprechenden Einträg
 *  1. alle Aktionen ab Startdatum holen
 *  2. für jede Aktion
 *      a) letzter Eintrag vor oder gleich Aktionstag aus Tabelle holen
 *      b) alle Einträge bis vor Min(nächster Aktionstag oder Tabellenende) holen
 *      c) Berechnungen durchführen und Records updaten
 *
 * @param dbName
 * @param tbl
 * @param startDate
 * @description updateTableAktienActions
 */
function updateTableAktienActions(dbName, tbl, startDate) {
    return new Promise((resolve, reject) => {
        console.log("was passiert hier");
        console.info("etwas mit infos");
        console.error("oder mit Fehlern");
        let recAktien = [];
        // letzten Eintrag vor Startdatum holen
        let was = " `date` < '" + startDate.format("YYYY-MM-DD") +
            "' AND `action` ='" + classes_1.eActionAktie.None + "' ORDER BY `date` DESC LIMIT 1";
        db.getMaxOfWhere(dbName, tbl, 'date', was)
            .then((neuesStartDat) => {
            console.log("MaxDat: " + neuesStartDat);
            // alle Einträge ab diesem Datum holen
            was = " `date` >= '" + neuesStartDat + "' ORDER BY `date` ASC";
            return db.getWhere(dbName, tbl, was);
        })
            .then(rows => {
            // alles in clAktie umwandeln 
            rows.forEach(row => {
                let newRec = new classes_1.clAktie();
                newRec = db.convertJsonToClass(row, newRec);
                recAktien.push(newRec);
            });
            // jetzt der Reihe nach durchgehen
            let arrPromUpdates = [];
            let vorherAktie = recAktien[0];
            let chgEUR = 0;
            let chgEXTR = 0;
            let chgCapInv = 0;
            recAktien.forEach((aktie, ndx) => {
                if (ndx === 0)
                    return; // ich starte erst bei 1, 0 ist schon in vorherAktie         
                switch (aktie.action) {
                    case classes_1.eActionAktie.None: { // Werte von vorher übernehmen
                        aktie.capital_involved = vorherAktie.capital_involved + chgCapInv;
                        aktie.EUR = +(vorherAktie.EUR + chgEUR).toFixed(2);
                        aktie.USD = vorherAktie.USD;
                        aktie.EXTR = vorherAktie.EXTR + chgEXTR;
                        aktie.GewVerl = aktie.EUR + aktie.USD * aktie.exchangeUSDEUR + aktie.EXTR * aktie.kursEXTR * aktie.exchangeUSDEUR - aktie.capital_involved;
                        chgEUR = 0;
                        chgEXTR = 0;
                        chgCapInv = 0;
                        vorherAktie = aktie;
                        break;
                    }
                    case classes_1.eActionAktie.EuroEingang: {
                        chgEUR += aktie.EUR;
                        chgCapInv += aktie.EUR;
                        break;
                    }
                    case classes_1.eActionAktie.EuroInAktie: {
                        chgEUR += aktie.EUR;
                        chgEXTR += aktie.EXTR;
                        break;
                    }
                    default: {
                        console.error("Fehler in updateTableAktienActions/switch: Unbekannt ist:" + aktie.action);
                    }
                } // end switch
                arrPromUpdates.push(db.updateRecord(dbName, tbl, aktie, classes_1.clAktie));
            });
            return Promise.all(arrPromUpdates);
        })
            .then((val) => { console.log("Erfolgreich nach update!"); })
            .catch((reason) => reject("Fehler in updateTableAktienActions: " + reason));
    });
}
function updateDatabase() {
    // HBE: nächsten drei Zeilen noch aktivieren...
    // updateStockTable(mySQLdb, tbNameStock )
    // updateExchangeRatesInDb()
    let action = new classes_1.clAktie();
    action.date = moment("2018-02-28");
    // action.action = eActionAktie.EuroInAktie
    // action.EUR = -1233.67
    // action.EXTR = 142
    action.EUR = 1234.56;
    action.action = classes_1.eActionAktie.EuroEingang;
    console.log("action eintragen");
    actionForAktie(exports.mySQLdb, exports.tbNameAktie, action).then(() => {
        console.log("erfolgreich action eingetragen");
        return updateTableAktien(exports.mySQLdb, exports.tbNameAktie, exports.tbNameStock, moment("2018-02-01"));
    })
        .then(erg => {
        console.log(erg);
        updateTableAktienActions(exports.mySQLdb, exports.tbNameAktie, moment("2018-02-27"))
            .then(erg => {
            console.log("Ergebnis aus updateTableAktionActions: " + erg);
        })
            .catch((reason) => {
            console.error("Fehler in updateTableAktionActions");
        });
    })
        .catch(reason => console.log(reason));
    // let action = new clAktie()
    // action.date = moment("2018-03-31")
    // action.action = eActionAktie.EuroEingang
    // action.EUR = 1000.11
    // actionForAktie(mySQLdb, tbNameAktie, action)
    // Aktienkauf
}
exports.updateDatabase = updateDatabase;
//# sourceMappingURL=updateDatabases.js.map