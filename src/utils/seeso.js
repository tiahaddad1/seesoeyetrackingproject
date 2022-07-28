import 'regenerator-runtime/runtime';
import EasySeeSo from 'seeso/easy-seeso';
import * as dotenv from 'dotenv';
dotenv.config();

const LICENCE_KEY = process.env.LICENCE_KEY || 'YOUR LICENCE KEY';
const savedSettings = JSON.parse(localStorage.getItem('seeso_settings')) || {};
const SETTINGS = {
    monitorSize: 21,
    faceDistance: 40,
    cameraPosition: 'top',
    ...savedSettings,
};

export async function initiateSeeso(onGaze) {
    const seeSo = new EasySeeSo();

    await seeSo.init(
        LICENCE_KEY,
        // callback when init succeeded.
        () => {
            seeSo.setMonitorSize(Number(SETTINGS.monitorSize));
            seeSo.setFaceDistance(Number(SETTINGS.faceDistance));
            seeSo.setCameraPosition(window.outerWidth / 2, SETTINGS.cameraPosition == 'top');
            seeSo.startTracking(gazeInfo => {
                createDot(gazeInfo);
                onGaze(gazeInfo);
            }, onDebug);
        },
        // callback when init failed.
        () => console.log('callback when init failed')
    );
}

function createDot(gazeInfo) {
    const dotEl = document.createElement('div');
    dotEl.classList.add('dot');
    dotEl.setProperty('--top', gazeInfo.y);
    dotEl.setProperty('--left', gazeInfo.x);
    document.body.appendChild(dotEl);
}

function onDebug() {
    // debug callback
}
