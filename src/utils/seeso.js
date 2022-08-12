import "regenerator-runtime/runtime";
import EasySeeSo from "seeso/easy-seeso";
import * as dotenv from "dotenv";
dotenv.config();

const LICENSE_KEY = process.env.LICENSE_KEY;
const savedSettings = JSON.parse(localStorage.getItem("seeso_settings")) || {};
const SETTINGS = {
  monitorSize: 13,
  faceDistance: 30,
  cameraPosition: "top",
  ...savedSettings,
};

export async function initiateSeeso(onGaze, calibrationData) {
  const seeSo = new EasySeeSo();
  await seeSo.init(
    LICENSE_KEY,
    // callback when init succeeded.
    () => {
      seeSo.setMonitorSize(Number(SETTINGS.monitorSize));
      seeSo.setFaceDistance(Number(SETTINGS.faceDistance));
      seeSo.setCameraPosition(
        window.outerWidth / 2,
        SETTINGS.cameraPosition == "top"
      );
      const trackerDot = createDot();
      seeSo.startTracking((gazeInfo) => {
        updateDot(trackerDot, gazeInfo);
        onGaze(gazeInfo);
      }, onDebug);
    },
    // callback when init failed.
    () => console.log("callback when init failed")
  );
  seeSo.setCalibrationData(calibrationData);
  return seeSo;
}

function createDot() {
  const dotEl = document.createElement("div");
  dotEl.classList.add("dot");
  document.body.appendChild(dotEl);
  return dotEl;
}

function updateDot(dot, gazeInfo) {
  dot.style.setProperty("--top", (gazeInfo.y / window.innerHeight) * 100);
  dot.style.setProperty("--left", (gazeInfo.x / window.innerWidth) * 100);
}

function onDebug() {
  // debug callback
}


