"use strict";
/** GETCURRENCYIZB
 *
 * @function  export function getExchangeRate() -> Schlusskurs des letzten Handelstages
 * @function  getExchangeRateLast90Days         -> holt die Wechselkurse der letzten 90 Tage
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const webseite_1 = require("./webseite");
//#region Infos zur ECB
// Holt der Wechselkurs der ECB
// Aufruf: getExchangeRate()
//              http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml
//
// DOCUMENTATION: http://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html#dev
//
//
// <gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01" xmlns="http://www.ecb.int/vocabulary/2002-08-01/eurofxref">
//  <gesmes:subject>Reference rates</gesmes:subject>
//  <gesmes:Sender>
//    <gesmes:name>European Central Bank</gesmes:name>
//  </gesmes:Sender>
//   <Cube>
//    <Cube time="2018-04-09">
//      <Cube currency="USD" rate="1.2304"/>
//      <Cube currency="JPY" rate="131.66"/>
//      <Cube currency="BGN" rate="1.9558"/>
//      <Cube currency="CZK" rate="25.357"/>
//      <Cube currency="DKK" rate="7.4469"/>
//      <Cube currency="GBP" rate="0.87088"/>
//      <Cube currency="HUF" rate="312.10"/>
//      <Cube currency="PLN" rate="4.1952"/>
//      <Cube currency="RON" rate="4.6634"/>
//      <Cube currency="SEK" rate="10.2960"/>
//      <Cube currency="CHF" rate="1.1790"/>
//      <Cube currency="ISK" rate="121.30"/>
//      <Cube currency="NOK" rate="9.5883"/>
//      <Cube currency="HRK" rate="7.4320"/>
//      <Cube currency="RUB" rate="74.1130"/>
//      <Cube currency="TRY" rate="5.0018"/>
//      <Cube currency="AUD" rate="1.6050"/>
//      <Cube currency="BRL" rate="4.1490"/>
//      <Cube currency="CAD" rate="1.5726"/>
//      <Cube currency="CNY" rate="7.7686"/>
//      <Cube currency="HKD" rate="9.6576"/>
//      <Cube currency="IDR" rate="16958.23"/>
//      <Cube currency="ILS" rate="4.3397"/>
//      <Cube currency="INR" rate="79.9545"/>
//      <Cube currency="KRW" rate="1316.69"/>
//      <Cube currency="MXN" rate="22.5884"/>
//      <Cube currency="MYR" rate="4.7641"/>
//      <Cube currency="NZD" rate="1.6871"/>
//      <Cube currency="PHP" rate="63.999"/>
//      <Cube currency="SGD" rate="1.6158"/>
//      <Cube currency="THB" rate="38.475"/>
//      <Cube currency="ZAR" rate="14.9162"/>
//    </Cube>
//   </Cube>
// </gesmes:Envelope>
//#endregion
const xpath = require("xpath");
const dom = require("xmldom").DOMParser;
const moment = require("moment");
const url = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const url90 = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";
/** getExchangeRate
 * @description getExchangeRate holt die aktuelle (Schlusskurs des letzten Handelstages von der ECB)
 * @returns PROMISE<Iergebnis>
 *                 success: { datum: string_als_ISO_Datum, exchange_rate: number }
 *                 error: {Fehlermeldung der ECB}
 */
function getExchangeRate() {
    const prom = new Promise((resolve, reject) => {
        webseite_1.urlGet(url)
            .then((xlmString) => {
            const doc = new dom().parseFromString(xlmString);
            // Probleme bereitet hier der Namespace
            // damit ich den normalen Eintrag Cube finden kann, muss ich den normalen Namespace deklarieren
            // der Grund ist wohl, dass ein weiterer Namespace angelegt wurde ('gesmes')
            const sele2 = xpath.useNamespaces({
                xmlns: "http://www.ecb.int/vocabulary/2002-08-01/eurofxref"
            });
            // Cube mit Eintrag für USD finden
            const exchNode = sele2('//xmlns:Cube[@currency="USD"]/@rate', doc);
            const rate = exchNode[0].nodeValue;
            const timeNode = sele2("//xmlns:Cube/@time", doc);
            const datum = timeNode[0].nodeValue;
            const iErg = {
                datumAsIso: moment(datum).toISOString(),
                exchange_rate: rate
            };
            resolve(iErg);
        })
            .catch(reason => {
            console.log("Fehler in getExchangeRate");
            reject(reason);
        });
    });
    return prom;
}
exports.getExchangeRate = getExchangeRate;
//#region Beschribung 90 Tage IZB
// Von der EZB gibt es auch die letzten 90 Tage als XML-Datei (siehe hier: )
// https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
//
// <gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01" xmlns="http://www.ecb.int/vocabulary/2002-08-01/eurofxref">
//  <gesmes:subject>Reference rates</gesmes:subject>
//  <gesmes:Sender>
//    <gesmes:name>European Central Bank</gesmes:name>
//  </gesmes:Sender>
//  <Cube>
//    <Cube time="2018-04-20">
//      <Cube currency="USD" rate="1.2309"/>
//      <Cube currency="JPY" rate="132.41"/>
//      <Cube currency="BGN" rate="1.9558"/>
//#endregion
/** getExchangeRateLast90Days
 * @description: getExchangeRateLast90Days holt die Wechselkurse der letzten 90 Tage
 * @param: keine Parameter übergeben
 * @returns: success: Tabelle mit IDatExchg Einträgen als Promise
 *           error: Fehlermeldung der EZB
 */
function getExchangeRateLast90Days() {
    const prom = new Promise((resolve, reject) => {
        webseite_1.urlGet(url90)
            .then((xlmString) => {
            const doc = new dom().parseFromString(xlmString);
            const sele2 = xpath.useNamespaces({ xmlns: "http://www.ecb.int/vocabulary/2002-08-01/eurofxref" });
            // da jetzt Eintraege der letzten 90 Tage enthalten sind, hole ich zunächst die Liste aller <Cube>
            const listCube = sele2("//xmlns:Cube[@time]", doc);
            const exchTabelle = [];
            const test2 = listCube.map(ele => {
                // get Datum...
                // Achtung: um mit XPATH im angegebenen Context zu suchen (=> ele) muss ".//" genommen werden statt "//"
                const neuDatExchg = { datumAsIso: "", exchange_rate: 0 };
                neuDatExchg.datumAsIso = sele2("string(.//@time)", ele);
                // nun noch den Unterknoten mit USD finden
                neuDatExchg.exchange_rate = sele2('string(.//xmlns:Cube[@currency="USD"]/@rate)', ele);
                exchTabelle.push(neuDatExchg);
                return neuDatExchg;
            });
            resolve(exchTabelle);
        })
            .catch(reason => {
            console.log("Fehler in getExchangeRate");
            reject(reason);
        });
    });
    return prom;
}
exports.getExchangeRateLast90Days = getExchangeRateLast90Days;
//# sourceMappingURL=getCurrencyIZB.js.map