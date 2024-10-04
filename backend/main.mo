import Bool "mo:base/Bool";
import Char "mo:base/Char";
import Hash "mo:base/Hash";
import Int "mo:base/Int";

import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor ChargeMeUp {
    type ChargingStation = {
        id: Text;
        name: Text;
        location: Text;
        available: Bool;
    };

    type ChargingSession = {
        id: Text;
        stationId: Text;
        userId: Principal;
        startTime: Time.Time;
        endTime: ?Time.Time;
        energyConsumed: ?Float;
    };

    stable var stationEntries : [(Text, ChargingStation)] = [];
    stable var sessionEntries : [(Text, ChargingSession)] = [];

    let stations = HashMap.fromIter<Text, ChargingStation>(stationEntries.vals(), 10, Text.equal, Text.hash);
    let sessions = HashMap.fromIter<Text, ChargingSession>(sessionEntries.vals(), 10, Text.equal, Text.hash);

    public shared(msg) func addChargingStation(name: Text, location: Text) : async Result.Result<Text, Text> {
        let id = Text.concat(name, location);
        let station : ChargingStation = {
            id;
            name;
            location;
            available = true;
        };
        stations.put(id, station);
        #ok("Charging station added successfully")
    };

    public query func getChargingStations() : async [ChargingStation] {
        Iter.toArray(stations.vals())
    };

    public shared(msg) func startChargingSession(stationId: Text) : async Result.Result<Text, Text> {
        switch (stations.get(stationId)) {
            case (null) {
                #err("Charging station not found")
            };
            case (?station) {
                if (not station.available) {
                    #err("Charging station is not available")
                } else {
                    let sessionId = Text.concat(stationId, Principal.toText(msg.caller));
                    let session : ChargingSession = {
                        id = sessionId;
                        stationId = stationId;
                        userId = msg.caller;
                        startTime = Time.now();
                        endTime = null;
                        energyConsumed = null;
                    };
                    sessions.put(sessionId, session);
                    stations.put(stationId, {station with available = false});
                    #ok(sessionId)
                }
            };
        }
    };

    public shared(msg) func stopChargingSession(sessionId: Text) : async Result.Result<Float, Text> {
        switch (sessions.get(sessionId)) {
            case (null) {
                #err("Charging session not found")
            };
            case (?session) {
                if (Option.isSome(session.endTime)) {
                    #err("Charging session already ended")
                } else {
                    let endTime = Time.now();
                    let duration = Float.fromInt(endTime - session.startTime) / 1_000_000_000;
                    let energyConsumed = duration * 10.0; // Assuming 10 kWh per hour
                    let updatedSession : ChargingSession = {
                        session with
                        endTime = ?endTime;
                        energyConsumed = ?energyConsumed;
                    };
                    sessions.put(sessionId, updatedSession);
                    stations.put(session.stationId, {
                        Option.unwrap(stations.get(session.stationId)) with
                        available = true
                    });
                    #ok(energyConsumed)
                }
            };
        }
    };

    public query func getChargingHistory(userId: Principal) : async [ChargingSession] {
        Iter.toArray(Iter.filter(sessions.vals(), func (session: ChargingSession) : Bool {
            session.userId == userId
        }))
    };

    system func preupgrade() {
        stationEntries := Iter.toArray(stations.entries());
        sessionEntries := Iter.toArray(sessions.entries());
    };

    system func postupgrade() {
        stationEntries := [];
        sessionEntries := [];
    };
}
