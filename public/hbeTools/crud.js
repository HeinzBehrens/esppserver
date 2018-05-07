"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3 = __importStar(require("sqlite3"));
const moment = require("moment");
// enhaltene Funktionen
// MakeArrays -> MakeArray (instance: any, private nameOfClass: any): wird benötigt, um Klassen als Record abzuspeichern
// convertJsonToClass( jsonObj: any, instanceOfClass: any ) ->  JSON-Object in bestehende Klasse umwandeln
// openDb(dbName: string) -> interne Funktion -> öffnet die Datenbank
// closeDb(): interne Funktion -> schließt die Datenbank
// getAll(gDbName: string, tbName: string) ->  holt alle Records aus der Datenbank
// getID(gDbName: string, tbName: string, id: number) -> holt einen Record aus der Datenbank anhand seiner ID
// getWhere(gDbName: string, tbName: string, was: string) -> holt alle Records, die eine Bedingung erfüllen
// insertArrayOfRecords(gDbName: string, tbName: string, nameOfClass: any, table: any[]) -> spe
//#region Konstanten
/**
 * globDb : verweist auf die geöffnete Datenbank
 *        wird von openDb und closeDb verwendet
 */
let globDb;
//#endregion
//#region Classes
// Überlegung zur Speicherung von Datumfeldern
// wähle für SQLite: ISO8601 und damit TEXT als Datumsfeld
// Konvertierung: CLASS -> JSON: JSON.stringify(class) ==> Datum wird im ISO8601 Format ausgegeben
// Konvertierung: JSON  -> CLASS hier muss das Datum bearbeitet werden: new Date(dateString)
//
// so wie es aussieht, hat dies nur im Angular zu erfolgen...
// in der ersten Spalte muss der Index stehen!!!!!
// das Indexfeld muss außerdem mit 'ndx..' starten: ndxArzt, ndxTermin etc.
// und natürlich darf kein anderes Feld mit ndx starten!!!!
class MakeArrays {
    constructor(instance, nameOfClass) {
        this.instance = instance;
        this.nameOfClass = nameOfClass;
        this.listPropNamesForInsert = "";
        this.arValues = [];
        this.updateSetString = "";
        this.whereString = "";
        this.arNames = [];
        this.instance = instance;
        this.arNames = Object.getOwnPropertyNames(instance);
        // this.arValues = Object.values(this.instance); // siehe Anmerkungen unten zu Object.values...
        this.arValues = Object.keys(this.instance).map(key => this.instance[key]);
        // Baue ein Feld auf mit Elementen: columnName = new_value
        let removeIndexFieldForInsert = -1;
        const arString = [];
        let whereString = ""; // für indexFeld: ndxValue = xxx
        this.arNames.forEach((val, ndx) => {
            // in der Klasse kann gekennzeichnet werden, wenn das Feld nicht in der Datenbank existiert!
            if (instance.notInDb(val))
                return;
            if (!val.startsWith("ndx")) {
                // bestimmte Typen werden gesondert behandelt
                // STRING: in Hochkomma eingeschlossen
                // BOOLEAN: als '0' oder '1'
                // MOMENT: als ISO-String
                if (typeof this.arValues[ndx] === "string")
                    arString.push(val + " = '" + this.arValues[ndx] + "'");
                else if (typeof this.arValues[ndx] === "boolean")
                    if (this.arValues[ndx] === false)
                        arString.push(val + " = " + "0");
                    else
                        arString.push(val + " = " + "1");
                else if (moment.isMoment(this.arValues[ndx])) {
                    // arString.push(val + " = " + (this.arValues[ndx] == false) ? '0' : '1')
                    const d = moment();
                    arString.push(val + " = '" + this.arValues[ndx].toISOString() + "'");
                    this.arValues[ndx] = this.arValues[ndx].toISOString();
                }
                else
                    arString.push(val + " = " + this.arValues[ndx]);
            }
            else if (typeof this.arValues[ndx] === "string")
                // Strings müssen in Hochkomma eingefasst werden
                whereString = val + " = '" + this.arValues[ndx] + "'";
            else if (this.arValues[ndx] === -1) {
                // dann existiert der Index noch nicht, also entfernen in arValues und nicht zum whereString hinzufügen
                removeIndexFieldForInsert = ndx;
            }
            else {
                whereString = val + " = " + this.arValues[ndx];
            }
        }, this);
        this.updateSetString = arString.join(",");
        this.whereString = whereString;
        if (removeIndexFieldForInsert > -1) {
            this.arValues.splice(removeIndexFieldForInsert, 1);
            this.arNames.splice(removeIndexFieldForInsert, 1);
            this.listPropNamesForInsert = "(" + this.arNames.join(",") + ")";
        }
        this.listFragezeichenForInsert =
            "(" +
                Array.apply(null, Array(this.arValues.length))
                    .map(String.prototype.valueOf, "?")
                    .join(",") +
                ")";
    }
}
//#endregion
/** convertJsonToClass
 *
 * @description wandelt ein JSON-Object in eine Klasse um
 * @param jsonObj das umzuwandelnde JSON-Object
 * @param instanceOfClass die Instanz der Klasse, in die es umgewandelt werden soll
 * @return die erstellte Klasse ( ist auch in instanceOfClass enthalten )
 */
function convertJsonToClass(jsonObj, instanceOfClass) {
    // gehe die Eigenschaften der Klassen durch, und versuche einen Eintrag im jsonObj dazu zu finden 
    // Object.values gibt es erst in 2017... man könnte in tsconfig.json 
    // die Zeile lib erweitern..
    // "compilerOptions": { ... "lib": { "es2017"}}
    // aber dann werden keine polyfills mehr geladen (müsste man selbst machen, aber keine Ahnung wie)
    // https://stackoverflow.com/questions/42966362/how-to-use-object-values-with-typescript/42967397?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
    //    const arValues = Object.values(instanceOfClass);
    const arValues = Object.keys(instanceOfClass).map(key => instanceOfClass[key]);
    const arNames = Object.getOwnPropertyNames(instanceOfClass);
    arNames.forEach((fieldName, ndx) => {
        switch (typeof arValues[ndx]) {
            case "string":
                if (jsonObj.hasOwnProperty(arNames[ndx]))
                    instanceOfClass[fieldName] = jsonObj[fieldName];
                break;
            case "number":
                if (jsonObj.hasOwnProperty(arNames[ndx]))
                    instanceOfClass[fieldName] = jsonObj[fieldName];
                break;
            case "object":
                if (moment.isMoment(instanceOfClass[fieldName]))
                    instanceOfClass[fieldName] = moment(jsonObj[fieldName]);
                break;
            default:
                console.log("in convertJsonToClass ist der Typ:  " + typeof arValues[ndx] + " noch nicht definiert!");
        }
    });
    return instanceOfClass;
}
exports.convertJsonToClass = convertJsonToClass;
/** openDB
 * @description openDB öffnet die SQLITE-Datenbank
 * @param dbName : Pfad + Name der Datenbank ohne Endung (es wird die Endung .sqlite noch angehängt)
 */
function openDb(dbName) {
    if (globDb)
        return globDb;
    globDb = new sqlite3.Database(dbName.trim() + ".sqlite", err => {
        if (err)
            console.log("Fehler beim Öffnen der Datenbank: " + err.name + " - " + err.message);
    });
    return globDb;
}
/** closeDb
 * @description closeDb schließt eine eventuell geöffnete Datenbank (in Variable globDb)
 */
function closeDb() {
    if (globDb) {
        globDb.close(err => {
            if (err) {
                console.log("Fehler beim Schließen der DB");
            }
            else {
                console.log("Datenbank geschlossen!");
            }
        });
    }
}
exports.closeDb = closeDb;
/** getAll
 * @description: getAll - holt aus der globalen Datenbank alle Einträge der angegebenen Tabelle
 * @returns: Promise<string> : JSON-formatierter String
 * @param tbName : Name der Tabelle
 */
function getAll(gDbName, tbName) {
    return new Promise((res, reject) => {
        const db = openDb(gDbName);
        let erg = "";
        db.all("SELECT * From " + tbName, (err, rows) => {
            if (err) {
                console.log("Fehler getAll von " + tbName + ": " + err.name + " - " + err.message);
                reject(undefined);
            }
            console.log(JSON.stringify(rows));
            erg = JSON.stringify(rows);
            res(erg);
        });
    });
}
exports.getAll = getAll;
/** getID
 * @description: getID - holt den Record mit der ROWID == Id bzw. INDEX == ndxXXX == Id
 * @param tbName : Name der Tabelle
 * @param id : gesuchter Index
 * @returns PROMISE mit Record oder Fehlermeldung
 */
function getID(gDbName, tbName, id) {
    return new Promise((res, reject) => {
        const db = openDb(gDbName);
        const erg = "";
        db.get("Select * from " + tbName + " WHERE ROWID=" + id, (err, row) => {
            if (err) {
                reject("Record with ID " + id + " not found!");
            }
            else {
                res(row);
            }
        });
    });
}
exports.getID = getID;
/** getWhere
 * @description getWhere - holt alle Records, die bestimmte Bedingungen erfüllen
 * @param gDbName Name der Datenbank
 * @param tbName Name der Tabelle
 * @param was SQL Where Clause ohne den Parameter WHERE
 * @returns success: alle Records, die die Where-Clause erfüllen als Promise
 *          error: undefined
 * @example getWhere (" 'fieldname' like '%hal%' limit 10 ")
 */
function getWhere(gDbName, tbName, was) {
    return new Promise((res, reject) => {
        const db = openDb(gDbName);
        const sql = "SELECT * From " + tbName + " WHERE " + was;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log("Fehler in getWhere db.all von " + tbName + ": " + err.name + " - " + err.message);
                reject(undefined);
            }
            res(rows);
        });
    });
}
exports.getWhere = getWhere;
/** insertArrayOfRecords
 * @description: insertArrayOfRecords: mehrfacher Eintrag in eine Tabelle, Records als Array übergeben
 * @param tbName : Name der Tabelle
 * @param nameOfClass : Name der Klasse für die Formatierung der Records
 * @param table : Tabelle mit den Records als Array<nameOfClass>
 */
function insertArrayOfRecords(gDbName, tbName, nameOfClass, table) {
    // ich brauche für den Insert drei Werte
    //  mA.listPropNamesForInsert => die Liste der Spaltennamen
    //  mA.listFragezeichenForInsert => die Platzhalter als Fragezeichen
    //  mA.arValues die Werte...
    //
    // die Werte werden jetzt in eine eigene Tabelle gepackt
    let tablePropNamesForInsert = "";
    const tableFragezeichenForInsert = "";
    const werteTabelle = [];
    // da es sich um neue Elemente handelt müssen noch die Daten
    // für createdAt und updatedAt gesetzt werden
    //
    table.forEach(element => {
        element.createdAt = moment();
        element.updatedAt = moment();
        const mA = new MakeArrays(element, nameOfClass);
        // tableFragezeichenForInsert = mA.listFragezeichenForInsert;
        tablePropNamesForInsert = mA.listPropNamesForInsert;
        // Values in einen geklammerten String umwandeln, und jedes Element in Hochkomma einschließen...
        const test = "(" +
            mA.arValues
                .map(ele => {
                return "'" + ele + "'";
            })
                .join(",") +
            ")";
        werteTabelle.push(test);
    });
    // Anzahl legt die Menge der Records fest, die mit einem Statement eingetragen werden
    // mehr als 50 habe ich nicht gestestet
    //
    // Fasse jeweile 50 Einträge zusammen, und trage diesen Sammelrecord in eine neue Tabelle ein
    const massenEintragTabelle = [];
    const Anz = 50;
    let start = 0;
    let ende = start + Anz;
    do {
        massenEintragTabelle.push(werteTabelle.slice(start, ende).join(","));
        ende = Math.min((ende += Anz), werteTabelle.length + 1);
        start += Anz;
    } while (start < werteTabelle.length);
    const db = openDb(gDbName);
    const promiArr = [];
    db.serialize(() => {
        massenEintragTabelle.forEach(masse => {
            const promi = new Promise((res, reject) => {
                db.run("INSERT Into " + tbName + " " + tablePropNamesForInsert + " VALUES " + masse, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        console.log("Rec inserted in " + tbName + " - ID:" + this.lastID);
                        res(true);
                    }
                });
            }); // end of promise...
            promiArr.push(promi);
        });
    });
    return promiArr;
}
exports.insertArrayOfRecords = insertArrayOfRecords;
/** insertRecord
 * @description : Neueintrag eines Records in eine Datenbank
 * @param tbName : Name der Tabelle in die eingetragen wird
 * @param instanceOfClass : der einzutragende Record als Klasse
 * @param nameOfClass : Name der Klasse, die einzutragen ist
 * @returns PROMISE: success - den eingetragenen Record als Object (==> convertJsonToClass falls erforderlich)
 *                   error - den zurückgegebenen Fehler
 */
function insertRecord(gDbName, tbName, instanceOfClass, nameOfClass) {
    return new Promise((resolve, reject) => {
        const db = openDb(gDbName);
        // Bei einem Neueintrag werden die Daten gesetzt...
        instanceOfClass.createdAt = moment();
        instanceOfClass.updatedAt = moment();
        const mA = new MakeArrays(instanceOfClass, nameOfClass);
        db.run("INSERT Into " + tbName + " " + mA.listPropNamesForInsert + " VALUES " + mA.listFragezeichenForInsert, mA.arValues, function (err) {
            if (err) {
                console.log("Err-insertRecord: " + err.name + ": " + err.message);
                reject(err);
            }
            else {
                console.log("Rec inserted in " + tbName + " - ID:" + this.lastID);
                getID(gDbName, tbName, this.lastID)
                    .then(rec => {
                    resolve(rec);
                })
                    .catch(reason => {
                    console.error("Fehler (insertRecord/db.run/getID): " + reason);
                    reject(reason);
                });
            }
        });
    });
}
exports.insertRecord = insertRecord;
/** updateRecord
 * @description Update eines Records
 * @param tbName : Name der Tabelle, in die der Update eingetragen wird
 * @param instanceOfClass
 * @param nameOfClass
 * @returns Success: PROMISE mit Record mit neuer modifizierter modifiedISO Zeit
 *          Error: UNDEFINED
 */
function updateRecord(gDbName, tbName, instanceOfClass, nameOfClass) {
    return new Promise((res, reject) => {
        const db = openDb(gDbName);
        // modifiedISO/updatedAt wird gesetzt
        instanceOfClass.updatedAt = moment();
        const mA = new MakeArrays(instanceOfClass, nameOfClass);
        // Update Anweisung muss folgendermaßen aufgebaut werden
        // UPDATE table SET column_1 = new_value_1, column_2 = new_value_2
        // WHERE  search_condition
        // ORDER column_or_expression
        // LIMIT row_count OFFSET offset;
        db.run("UPDATE " + tbName + " SET " + mA.updateSetString + " WHERE " + mA.whereString, function (err) {
            if (err) {
                console.log("Fehler: " + err.name + ": " + err.message);
                reject(err);
            }
            else {
                // bei einem Update wird lediglich die Anzahl der upgedateten Records geliefert.. muss hier also 1 sein
                console.log("Rec updated in " + tbName + " - betroffen:" + this.changes);
                if (this.changes === 1)
                    res(instanceOfClass);
                else
                    reject(undefined);
            }
        });
    });
}
exports.updateRecord = updateRecord;
/** deleteRecord
 * @description deleteRecord: Löscht einen Record anhand des Indexes
 * @param tbName : Name der Tabelle, in die der Update eingetragen wird
 * @param ndxName : Name des Indexfeldes der Tabelle
 * @param ndx : Index, des zu löschenden Records
 */
function deleteRecord(gDbName, tbName, ndxName, ndx) {
    return new Promise((res, reject) => {
        const db = openDb(gDbName);
        db.run("DELETE FROM " + tbName + " WHERE " + ndxName + " = " + ndx, function (err) {
            let result = false;
            let nicht = "";
            if (err) {
                console.log("Fehler in deleteRecord: " + err.name + " - " + err.message);
            }
            else {
                if (this.changes === 1)
                    result = true;
                else
                    nicht = " NICHT";
                const str = "deleteRecord in " + tbName + " - NDX: " + ndx + nicht + " erfolgreich! ";
                console.log(str);
            }
            if (result)
                res(true);
            else
                reject(false);
        });
    });
}
exports.deleteRecord = deleteRecord;
/** getMaxOf
 *  @description getMaxOf ==> liefert den höchsten Wert einer Spalte
 * @param tbName
 * @param columnName
 * @returns PROMISE<any>
 *          success: höchster Wert der Spalte
 *          error:   Rückgabe der Fehlermeldung
 */
function getMaxOf(gDbName, tbName, columnName) {
    return new Promise((reso, reject) => {
        const MaxWert = "MAX (" + columnName + ")";
        const sql = "SELECT " + MaxWert + " From " + tbName;
        console.log(sql);
        const db = openDb(gDbName);
        db.get(sql, (err, row) => {
            if (err) {
                reject(err.message);
            }
            reso(row[MaxWert]);
        });
    });
}
exports.getMaxOf = getMaxOf;
function getMaxOfWhere(gDbName, tbName, columnName, was) {
    const prom = new Promise((resolve, reject) => {
        const MaxWert = "MAX (`" + columnName + "`)";
        const sql = "SELECT " + MaxWert + " From " + tbName + " WHERE " + was;
        const db = openDb(gDbName);
        db.get(sql, (err, row) => {
            if (err) {
                reject(err.message);
            }
            resolve(row[MaxWert]);
        });
    });
    return prom;
}
exports.getMaxOfWhere = getMaxOfWhere;
// TODO: getRecord für Datum
// SELECT HolidayDate
// FROM Holidays
// WHERE (HolidayDate >= '1/1/2011')
//   AND (HolidayDate <= '1/1/2012')
//# sourceMappingURL=crud.js.map