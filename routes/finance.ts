// var express = require('express');
// var router = express.Router();

import * as express from "express";
const router = express.Router();

import { Moment } from "moment";
const moment: any = require("moment-holiday");
// import * as moment from 'moment-holiday'

import "moment/locale/de";
import { getExchangeRate, getExchangeRateLast90Days, IDatExchg } from "../public/hbetools/getCurrencyIZB";
import {
  getLatestShareInfoExtreme,
  getSharePriceExtremeMonate,
  eZeitraum,
  getLatestSharePriceExtreme
} from "../public/hbetools/getExtremeSharePrice";

import { readTextFile, XML_TO_JSON } from "../public/hbeTools/Allgemein";
let fullErg: {} = {};
/**
 * @param
 */
function test(): Promise<object> {
  return new Promise<object>((resolve, reject) => {
    const resultat = getExchangeRate()
      .then((erg: IDatExchg) => {
        const Datum: Moment = moment(erg.datumAsIso);
        fullErg = { USD: erg };
      })
      .then(() => {
        getLatestSharePriceExtreme()
          .then(rec => {
            fullErg = Object.assign(fullErg, { EXTR: rec });
          })
          .then(() => {
            console.log("Alles: " + JSON.stringify(fullErg));
            resolve(fullErg);
          });
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}
import {
  // getWhere,
  // convertJsonToClass,
  // updateRecord
} from "../public/hbeTools/crud";

router.get("/testReadFile", (req, res, next) => {
  // updateExchangeRatesInDb();
  console.log ( "vor 90D")
  getExchangeRateLast90Days().then ( 
    ( val: IDatExchg[]) => {
      console.log ("Anz in testreadfile: " + val.length)
      return val}
  )
  console.log ("nach 90D")
  res.send("wahrscheinlich erfolgreich");
});

// HBE: diese Funktion noch mal kontrollieren... brauche ich sie überhaupt?
/* GET home page. */
router.get("/shareUSDinfo", (req, res, next) => {
  // res.render('index', { title: 'Express' });
  console.log("in router.get.shareUSDinfo 01a");
  test()
    .then(erg => {
      console.log("in router.get.shareUSDinfo 02");
      console.log("in router.get: " + JSON.stringify(erg));
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(erg));
    })
    .catch(reason => {
      console.log("Error in router.get.shareUSDinfo:" + reason);
      res.send("Fehler");
    });
});

module.exports = router;
