import { backend } from 'declarations/backend';
import { AuthClient } from '@dfinity/auth-client';

let authClient;
let principal;

async function init() {
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
        principal = authClient.getIdentity().getPrincipal();
        updateUI();
    } else {
        await login();
    }
}

async function login() {
    await authClient.login({
        identityProvider: "https://identity.ic0.app/#authorize",
        onSuccess: async () => {
            principal = authClient.getIdentity().getPrincipal();
            updateUI();
        },
    });
}

async function updateUI() {
    await updateStationList();
    await updateChargingHistory();
}

async function updateStationList() {
    const stations = await backend.getChargingStations();
    const stationList = document.getElementById('station-list');
    stationList.innerHTML = '';
    stations.forEach(station => {
        const li = document.createElement('li');
        li.textContent = `${station.name} (${station.location}) - ${station.available ? 'Available' : 'In Use'} ${station.isSupercharger ? '- Tesla Supercharger' : ''}`;
        if (station.available) {
            const startButton = document.createElement('button');
            startButton.textContent = 'Start Charging';
            startButton.onclick = () => startCharging(station.id);
            li.appendChild(startButton);
        }
        stationList.appendChild(li);
    });
}

async function updateChargingHistory() {
    const history = await backend.getChargingHistory(principal);
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    history.forEach(session => {
        const li = document.createElement('li');
        const startTime = new Date(Number(session.startTime) / 1000000).toLocaleString();
        const endTime = session.endTime ? new Date(Number(session.endTime[0]) / 1000000).toLocaleString() : 'In progress';
        const energy = session.energyConsumed ? `${session.energyConsumed[0].toFixed(2)} kWh` : 'N/A';
        li.textContent = `Station: ${session.stationId}, Start: ${startTime}, End: ${endTime}, Energy: ${energy}`;
        if (!session.endTime) {
            const stopButton = document.createElement('button');
            stopButton.textContent = 'Stop Charging';
            stopButton.onclick = () => stopCharging(session.id);
            li.appendChild(stopButton);
        }
        historyList.appendChild(li);
    });
}

async function addStation(event) {
    event.preventDefault();
    const name = document.getElementById('station-name').value;
    const location = document.getElementById('station-location').value;
    const result = await backend.addChargingStation(name, location);
    if ('ok' in result) {
        alert('Charging station added successfully');
        updateStationList();
    } else {
        alert(`Error: ${result.err}`);
    }
}

async function startCharging(stationId) {
    const result = await backend.startChargingSession(stationId);
    if ('ok' in result) {
        alert('Charging session started');
        updateUI();
    } else {
        alert(`Error: ${result.err}`);
    }
}

async function stopCharging(sessionId) {
    const result = await backend.stopChargingSession(sessionId);
    if ('ok' in result) {
        alert(`Charging session ended. Energy consumed: ${result.ok.toFixed(2)} kWh`);
        updateUI();
    } else {
        alert(`Error: ${result.err}`);
    }
}

async function fetchTeslaSuperchargers() {
    const result = await backend.fetchTeslaSuperchargers();
    if ('ok' in result) {
        alert('Tesla Superchargers fetched successfully');
        updateStationList();
    } else {
        alert(`Error: ${result.err}`);
    }
}

document.getElementById('add-station-form').addEventListener('submit', addStation);
document.getElementById('fetch-superchargers-btn').addEventListener('click', fetchTeslaSuperchargers);

init();
