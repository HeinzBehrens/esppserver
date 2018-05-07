const moment = require("moment-holiday");
import { Moment } from 'moment';

// Records sollen in CRUD verarbeitet werden können
// hier erfolgt die Abbildung von Records als Klassen
// 
// habe hierfür ein Interface bereitgestellt, das im Wesentlichen eine Funktion einfordert
//
// ==> notInDb: hierbei handelt es sich um Felder, die evtl. in der Klasse existieren, aber
//              nicht in der SQL-Datenbank. Diese Felder werden anhand ihres Namens gekennzeichnet

interface IBaseClass {
  /**
   * @description notInDb wird von CRUD aufgerufen, um die Existenz des Feldes in der Datenbank zu prüfen...
   * @param fieldname : Name des Feldes, für das geprüft wird, ob es in die Datentabelle existiert 
   */
   createdAt: Moment
   updatedAt: Moment 
   notInDb(fieldname: string): boolean
  //   {
  //  switch (fieldname):boolean {
  //    case: "xxx":
  //    case: "yyy": return true
  //    default: return false 
  //   }
  // }
}

// Beispiel einer Klasse
// export class testclass implements IBaseClass {
//  public ndxIndexName: number -1  // dieses Feld muss als ERSTES existieren...
//                                  // kein anderes Feld darf mit ndx... starten
//  weitere Pflichtfelder: createdAt, updatedAt als Moment!!!!!!
//  =============================================================
//  public xxx : type 
//  constructor () {}
//  notInDb(fieldname: string): boolean {}
// }

export class clStock implements IBaseClass {
  public ndxStock: number = -1
  public date: Moment;
  public open: number = 0;
  public high: number = 0;
  public low: number = 0;
  public close: number = 0;
  public volume: number = 0;
  public exDividend: number = 0;
  public splitRatio: number = 0;
  public adjOpen: number = 0;
  public adjHigh: number = 0;
  public adjLow: number = 0;
  public adjClose: number = 0;
  public adjVolume: number = 0;
  public exchangeUSDEUR: number = 0
  public createdAt: Moment;
  public updatedAt: Moment; 

  constructor() {
    this.date = moment()
    this.createdAt = moment()
    this.updatedAt = moment()
  }

   public notInDb(fieldname: string): boolean {
    return false
  }
}

export enum eActionAktie {
  EuroEingang = "EuroEingang",
  EuroAusgang = "EuroAusgang",
  EuroInAktie = "EuroInAktie",
  AktieInEuro = "AktieInEuro",
  None = "none"

}

export class clAktie implements IBaseClass {
  public ndxAktie: number = -1
  public createdAt: Moment
  public updatedAt: Moment
  public date: Moment
  public USD: number = 0
  public EUR: number = 0
  public EXTR: number = 0
  public GewVerl: number = 0
  public capital_involved: number = 0
  public exchangeUSDEUR: number = 0
  public kursEXTR: number = 0
  public action: string = "" // eActionAktie

  constructor() {
    this.date = moment()
    this.updatedAt = moment()
    this.createdAt = moment()
  }

  public notInDb ( fieldname: string ): boolean {
    return false 
  }
}