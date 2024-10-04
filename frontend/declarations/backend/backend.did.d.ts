import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ChargingSession {
  'id' : string,
  'startTime' : Time,
  'endTime' : [] | [Time],
  'userId' : Principal,
  'stationId' : string,
  'energyConsumed' : [] | [number],
}
export interface ChargingStation {
  'id' : string,
  'isSupercharger' : boolean,
  'name' : string,
  'available' : boolean,
  'location' : string,
}
export type Result = { 'ok' : number } |
  { 'err' : string };
export type Result_1 = { 'ok' : string } |
  { 'err' : string };
export type Time = bigint;
export interface _SERVICE {
  'addChargingStation' : ActorMethod<[string, string], Result_1>,
  'fetchTeslaSuperchargers' : ActorMethod<[], Result_1>,
  'getChargingHistory' : ActorMethod<[Principal], Array<ChargingSession>>,
  'getChargingStations' : ActorMethod<[], Array<ChargingStation>>,
  'startChargingSession' : ActorMethod<[string], Result_1>,
  'stopChargingSession' : ActorMethod<[string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
