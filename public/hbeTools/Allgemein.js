"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
let startTime;
let lastTime;
function setStartTime(start) {
    startTime = start;
}
exports.setStartTime = setStartTime;
const fs = __importStar(require("fs"));
////////////////////////////////////////////////////
/**
 * readTextFile read data from file
 * @param  string   filepath   Path to file on hard drive
 * @return string              String with file data
 */
function readTextFile(filepath) {
    // fs.readFile(filepath, 'utf8',   (err: NodeJS.ErrnoException, data: Buffer) =>  {
    //   if (err) {
    //     return console.log("ErrNo: " + err.errno + " - " + err.message ) ;
    //   }
    //   console.log(data);
    //   return (data)
    // })
    const data = fs.readFileSync(filepath, "utf8");
    return data;
}
exports.readTextFile = readTextFile;
const xml_js_1 = __importDefault(require("xml-js"));
function XML_TO_JSON(xmlAsString) {
    return JSON.parse(xml_js_1.default.xml2json(xmlAsString, { compact: true, spaces: 4 }));
}
exports.XML_TO_JSON = XML_TO_JSON;
function logElapsedTime(jetzt, text) {
    if (!startTime)
        startTime = jetzt;
    if (!lastTime)
        lastTime = jetzt;
    const elapsed = moment_1.default.duration(jetzt.diff(startTime));
    console.log("Elapsed -" +
        text +
        ":" +
        elapsed.asMilliseconds() +
        " -last: " +
        moment_1.default.duration(jetzt.diff(lastTime)));
    lastTime = jetzt;
}
exports.logElapsedTime = logElapsedTime;
//# sourceMappingURL=Allgemein.js.map