// Funktionen um den Share Preis der Extreme-Aktie zu holen
//
// getLatestSharePriceExtreme - Share-Price mit maximal 15 Minuten Verzug
// getSharePriceExtremeMonate - holt eine Liste mit Share-Preisen

import { clStock } from "./classes";
import * as wb from "./webseite"
const moment: any = require("moment-holiday");

// ===============================================================================================================
// IEXTrading:
// https://iextrading.com/developer/docs/
const urlIexTrading1m: string =
  "https://api.iextrading.com/1.0/stock/extr/chart/1m"; // Daten für einen Monat
const urlIexTrading3m: string =
  "https://api.iextrading.com/1.0/stock/extr/chart/3m"; // Daten für einen Monat
const urlIexTrading1d: string =
  "https://api.iextrading.com/1.0/stock/extr/chart/"; // + yyyymmdd =>  Daten für einen Tag
const urlDelayedQuote: string =
  "https://api.iextrading.com/1.0/stock/extr/delayed-quote";
// ===============================================================================================================

/**
 *  eZeitraum: ENUM für den Zeitraum, der abgefragt werden soll
 */
export enum eZeitraum {
  Monat1,
  Monat3
}

interface Iextrading {
  date: string;
  open: number;
  low: number;
  high: number;
  close: number;
  volume: number;
}

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
export function getSharePriceExtremeMonate(dauer: eZeitraum): Promise<clStock[]> {
  return new Promise((res, reject) => {
    let curUrl: string = "";
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

        const intQuandl: clStock[] = new Array();

        werte.forEach((row: Iextrading) => {
          const erg: clStock = new clStock();
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

export function getLatestShareInfoExtreme(): Promise<clStock> {
  return new Promise((res, reject) => {
    wb.urlGet(urlDelayedQuote).then((data) => {
      const jsData = JSON.parse(data);
      const erg: clStock = new clStock();
      erg.date = moment(jsData.delayedPriceTime)   // moment(jsData.delayedPriceTime, X);
      erg.open = jsData.delayedPrice;
      erg.high = jsData.high;
      erg.low = jsData.low;

      res(erg);
    });
  });
}

interface Ierg {
  datum: string
  price: number
}
export function getLatestSharePriceExtreme(): Promise<Ierg> {
  let intProm: Promise<Ierg>
  intProm = new Promise<Ierg> ( (resolve, reject) => {
      getLatestShareInfoExtreme()
      .then ( iq => {
        const intErg: Ierg = {datum: "", price: 0}
        intErg.datum = iq.date.toISOString()
        intErg.price = iq.open
        resolve (intErg)
      })
      .catch ( err => reject(err))
  })
  return intProm
}
