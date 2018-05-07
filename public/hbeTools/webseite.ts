import * as http from "http";
import * as https from "https";
import { Readable } from "stream";

/** urlGet
 * @description urlGet - holt eine Webseite als String
 * @param url : http(s)-url
 * @returns Promise<string>: Die Webseite als Textstring
 */
export function urlGet(url: string): Promise<string> {
  return new Promise((res, reject) => {
    const myhttp: any  = url.toLowerCase().startsWith("https") ? https : http
    const clreq: http.ClientRequest = myhttp
      .get(url, (resp: http.IncomingMessage) => {
        let data: any = "";

        resp.on("data", (chunk) => (data += chunk));
        resp.on("close", () => console.log("close in urlGet erreicht"));

        resp.on("end", () => {
          // console.log("end in urlGet erreicht");
          res(data);
        });
        resp.on("readable", () => {
          // console.log("readable on res erreicht");
        });
        resp.on("error", (err: Error) => {
          console.log("Fehler in res: " + err.name + " - " + err.message);
          reject(err);
        });
      })
      .on("close", () => {
        // console.log("close erreicht")
      })
      .on("drain", () => console.log("drain erreicht"))
      .on("error", (err: Error) => {
        console.log("Fehler: " + err.name + " - " + err.message);
        reject(err);
      })
      // .on("finish", () => console.log("finish erreicht"))
      .on("pipe", (src: Readable) => {
        console.log("pipe... und keine Ahnung, was das ist...");
      })
      .on("unpipe", (src: Readable) => {
        console.log("unpipe... und keine Ahnung, was das ist...");
      });
  });
}
