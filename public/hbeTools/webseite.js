"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const https = __importStar(require("https"));
/** urlGet
 * @description urlGet - holt eine Webseite als String
 * @param url : http(s)-url
 * @returns Promise<string>: Die Webseite als Textstring
 */
function urlGet(url) {
    return new Promise((res, reject) => {
        const myhttp = url.toLowerCase().startsWith("https") ? https : http;
        const clreq = myhttp
            .get(url, (resp) => {
            let data = "";
            resp.on("data", (chunk) => (data += chunk));
            resp.on("close", () => console.log("close in urlGet erreicht"));
            resp.on("end", () => {
                // console.log("end in urlGet erreicht");
                res(data);
            });
            resp.on("readable", () => {
                // console.log("readable on res erreicht");
            });
            resp.on("error", (err) => {
                console.log("Fehler in res: " + err.name + " - " + err.message);
                reject(err);
            });
        })
            .on("close", () => {
            // console.log("close erreicht")
        })
            .on("drain", () => console.log("drain erreicht"))
            .on("error", (err) => {
            console.log("Fehler: " + err.name + " - " + err.message);
            reject(err);
        })
            // .on("finish", () => console.log("finish erreicht"))
            .on("pipe", (src) => {
            console.log("pipe... und keine Ahnung, was das ist...");
        })
            .on("unpipe", (src) => {
            console.log("unpipe... und keine Ahnung, was das ist...");
        });
    });
}
exports.urlGet = urlGet;
//# sourceMappingURL=webseite.js.map