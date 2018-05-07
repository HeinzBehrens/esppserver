# Zusammenfassung
ein paar URLs, die vielleicht noch gebraucht werden
// Ein paar URLS
// ===============================================================================================================
const urlGoogleUsdEur: string = "https://www.google.de/search?q=USD+EUR";

// Alternative: https://fixer.io/product
//              https://openexchangerates.org/signup/free
//              http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml
const urlCurrencyLayer: string =
  "http://apilayer.net/api/live?access_key=afda54b6cae48d88ab5356230377791e&currencies=EUR&source=USD&format=1";

Request: http://openexchangerates.org/latest.json

const urlFinanzenNet: string = "https://www.finanzen.net/waehrungsrechner/euro_us-dollar";

const urlQuandl: string = "https://www.quandl.com/api/v3/datasets/WIKI/EXTR/data.json?api_key=kFxarCK6JySrhT-BLJna";


# aktuelle Exchange-Rate von urlCurrencyLayer holen
function getCurrentConversion_USD_to_EUR(): Promise<number> {
  return new Promise((res, reject) => {
    wb
      .urlGet(urlCurrencyLayer)
      .then((erg: string) => {
        const Kurs = JSON.parse(erg).quotes.USDEUR;
        res(Kurs);
      })
      .catch(reason => reject(reason));
  });
}
