"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment-holiday");
// Beispiel einer Klasse
// export class testclass implements IBaseClass {
//  public ndxIndexName: number -1  // dieses Feld muss als ERSTES existieren...
//                                  // kein anderes Feld darf mit ndx... starten
//  weitere Pflichtfelder: createdAt, updatedAt als Moment!!!!!!
//  =============================================================
//  public xxx : type 
//  constructor () {}
//  notInDb(fieldname: string): boolean {}
// }
class clStock {
    constructor() {
        this.ndxStock = -1;
        this.open = 0;
        this.high = 0;
        this.low = 0;
        this.close = 0;
        this.volume = 0;
        this.exDividend = 0;
        this.splitRatio = 0;
        this.adjOpen = 0;
        this.adjHigh = 0;
        this.adjLow = 0;
        this.adjClose = 0;
        this.adjVolume = 0;
        this.exchangeUSDEUR = 0;
        this.date = moment();
        this.createdAt = moment();
        this.updatedAt = moment();
    }
    notInDb(fieldname) {
        return false;
    }
}
exports.clStock = clStock;
var eActionAktie;
(function (eActionAktie) {
    eActionAktie["EuroEingang"] = "EuroEingang";
    eActionAktie["EuroAusgang"] = "EuroAusgang";
    eActionAktie["EuroInAktie"] = "EuroInAktie";
    eActionAktie["AktieInEuro"] = "AktieInEuro";
    eActionAktie["None"] = "none";
})(eActionAktie = exports.eActionAktie || (exports.eActionAktie = {}));
class clAktie {
    constructor() {
        this.ndxAktie = -1;
        this.USD = 0;
        this.EUR = 0;
        this.EXTR = 0;
        this.GewVerl = 0;
        this.capital_involved = 0;
        this.exchangeUSDEUR = 0;
        this.kursEXTR = 0;
        this.action = ""; // eActionAktie
        this.date = moment();
        this.updatedAt = moment();
        this.createdAt = moment();
    }
    notInDb(fieldname) {
        return false;
    }
}
exports.clAktie = clAktie;
//# sourceMappingURL=classes.js.map