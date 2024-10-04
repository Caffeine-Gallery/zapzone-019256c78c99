export const idlFactory = ({ IDL }) => {
  const Result_1 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Time = IDL.Int;
  const ChargingSession = IDL.Record({
    'id' : IDL.Text,
    'startTime' : Time,
    'endTime' : IDL.Opt(Time),
    'userId' : IDL.Principal,
    'stationId' : IDL.Text,
    'energyConsumed' : IDL.Opt(IDL.Float64),
  });
  const ChargingStation = IDL.Record({
    'id' : IDL.Text,
    'name' : IDL.Text,
    'available' : IDL.Bool,
    'location' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Float64, 'err' : IDL.Text });
  return IDL.Service({
    'addChargingStation' : IDL.Func([IDL.Text, IDL.Text], [Result_1], []),
    'getChargingHistory' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(ChargingSession)],
        ['query'],
      ),
    'getChargingStations' : IDL.Func([], [IDL.Vec(ChargingStation)], ['query']),
    'startChargingSession' : IDL.Func([IDL.Text], [Result_1], []),
    'stopChargingSession' : IDL.Func([IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
