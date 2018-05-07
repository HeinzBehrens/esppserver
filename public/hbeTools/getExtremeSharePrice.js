"use strict";
// Funktionen um den Share Preis der Extreme-Aktie zu holen
//
// getLatestSharePriceExtreme - Share-Price mit maximal 15 Minuten Verzug
// getSharePriceExtremeMonate - holt eine Liste mit Share-Preisen
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const classes_1 = require("./classes");
const wb = __importStar(require("./webseite"));
const moment = require("moment-holiday");
// ===============================================================================================================
// IEXTrading:
// https://iextrading.com/developer/docs/
const urlIexTrading1m = "https://api.iextrading.com/1.0/stock/extr/chart/1m"; // Daten für einen Monat
const urlIexTrading3m = "https://api.iextrading.com/1.0/stock/extr/chart/3m"; // Daten für einen Monat
const urlIexTrading1d = "https://api.iextrading.com/1.0/stock/extr/chart/"; // + yyyymmdd =>  Daten für einen Tag
const urlDelayedQuote = "https://api.iextrading.com/1.0/stock/extr/delayed-quote";
// ===============================================================================================================
/**
 *  eZeitraum: ENUM für den Zeitraum, der abgefragt werden soll
 */
var eZeitraum;
(function (eZeitraum) {
    eZeitraum[eZeitraum["Monat1"] = 0] = "Monat1";
    eZeitraum[eZeitraum["Monat3"] = 1] = "Monat3";
})(eZeitraum = exports.eZeitraum || (exports.eZeitraum = {}));
/**
 *
 * @description Holt die Share-Werte für einen Zeitraum
 *
 * @param dauer : enum-Wert bestimmt den Zeitraum für den Werte abgefragt werden
 *                eZeitraum.Monat1 oder eZeitraum Monat3
 * @returns PROMIISE <Iquandl>
 *          success: Liste der Share-Preise im Format Iquandl
 *          error: Fehlermeldung der Webseite
 */
function getSharePriceExtremeMonate(dauer) {
    return new Promise((res, reject) => {
        let curUrl = "";
        switch (dauer) {
            case eZeitraum.Monat1: {
                curUrl = urlIexTrading1m;
                break;
            }
            case eZeitraum.Monat3: {
                curUrl = urlIexTrading3m;
                break;
            }
            default:
                break;
        }
        wb.urlGet(curUrl)
            .then((data) => {
            const werte = JSON.parse(data);
            const intQuandl = new Array();
            werte.forEach((row) => {
                const erg = new classes_1.clStock();
                erg.date = moment(row.date);
                erg.open = row.open;
                erg.high = row.high;
                erg.low = row.low;
                erg.close = row.close;
                erg.volume = row.volume;
                intQuandl.push(erg);
            });
            res(intQuandl);
        })
            .catch((reason) => reject(reason));
    });
}
exports.getSharePriceExtremeMonate = getSharePriceExtremeMonate;
function getLatestShareInfoExtreme() {
    return new Promise((res, reject) => {
        wb.urlGet(urlDelayedQuote).then((data) => {
            const jsData = JSON.parse(data);
            const erg = new classes_1.clStock();
            erg.date = moment(jsData.delayedPriceTime); // moment(jsData.delayedPriceTime, X);
            erg.open = jsData.delayedPrice;
            erg.high = jsData.high;
            erg.low = jsData.low;
            res(erg);
        });
    });
}
exports.getLatestShareInfoExtreme = getLatestShareInfoExtreme;
function getLatestSharePriceExtreme() {
    let intProm;
    intProm = new Promise((resolve, reject) => {
        getLatestShareInfoExtreme()
            .then(iq => {
            const intErg = { datum: "", price: 0 };
            intErg.datum = iq.date.toISOString();
            intErg.price = iq.open;
            resolve(intErg);
        })
            .catch(err => reject(err));
    });
    return intProm;
}
exports.getLatestSharePriceExtreme = getLatestSharePriceExtreme;
//# sourceMappingURL=getExtremeSharePrice.js.map