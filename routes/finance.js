"use strict";
// var express = require('express');
// var router = express.Router();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const router = express.Router();
const moment = require("moment-holiday");
// import * as moment from 'moment-holiday'
require("moment/locale/de");
const getCurrencyIZB_1 = require("../public/hbetools/getCurrencyIZB");
const getExtremeSharePrice_1 = require("../public/hbetools/getExtremeSharePrice");
let fullErg = {};
/**
 * @param
 */
function test() {
    return new Promise((resolve, reject) => {
        const resultat = getCurrencyIZB_1.getExchangeRate()
            .then((erg) => {
            const Datum = moment(erg.datumAsIso);
            fullErg = { USD: erg };
        })
            .then(() => {
            getExtremeSharePrice_1.getLatestSharePriceExtreme()
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
router.get("/testReadFile", (req, res, next) => {
    // updateExchangeRatesInDb();
    console.log("vor 90D");
    getCurrencyIZB_1.getExchangeRateLast90Days().then((val) => {
        console.log("Anz in testreadfile: " + val.length);
        return val;
    });
    console.log("nach 90D");
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
//# sourceMappingURL=finance.js.map