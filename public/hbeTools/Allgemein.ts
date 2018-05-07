import moment from "moment";
import { Moment, Duration } from "moment";

let startTime: Moment;
let lastTime: Moment;

export function setStartTime(start: Moment) {
  startTime = start;
}

import * as fs from 'fs'
////////////////////////////////////////////////////
/**
 * readTextFile read data from file
 * @param  string   filepath   Path to file on hard drive
 * @return string              String with file data
 */
export function readTextFile(filepath: string): string {  
  // fs.readFile(filepath, 'utf8',   (err: NodeJS.ErrnoException, data: Buffer) =>  {
  //   if (err) {
  //     return console.log("ErrNo: " + err.errno + " - " + err.message ) ;
  //   }
  //   console.log(data);
  //   return (data)
  // })
  const data = fs.readFileSync ( filepath, "utf8") 
  return data
}

import convert from 'xml-js'
export function XML_TO_JSON(xmlAsString: string): any { 
  return  JSON.parse( convert.xml2json (xmlAsString,  {compact: true, spaces : 4}) )
}

export function logElapsedTime(jetzt: Moment, text: string) {
  if (!startTime) startTime = jetzt;
  if (!lastTime) lastTime = jetzt;
  const elapsed: Duration = moment.duration(jetzt.diff(startTime));
  console.log(
    "Elapsed -" +
      text +
      ":" +
      elapsed.asMilliseconds() +
      " -last: " +
      moment.duration(jetzt.diff(lastTime))
  );
  lastTime = jetzt;
}
