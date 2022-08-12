import { initiateSeeso } from "../utils/seeso";
import formatCurrency from "../utils/formatCurrency";

const productsContainer = document.querySelector(".products");
const scrollRight = document.getElementById("scroll-right");
const scrollLeft = document.getElementById("scroll-left");
const scrollDown = document.getElementById("scroll-down");
const scrollUp = document.getElementById("scroll-up");
const playBtn = document.getElementById("record-btn");
const pauseBtn = document.getElementById("pause-btn");
const downloadBtn = document.getElementById("download-btn");
const button1 = document.getElementById("b1");
const button2 = document.getElementById("b2");
const button3 = document.getElementById("b3");
const rightCorner = document.querySelector(".recording");
const layoutNum = document.body.dataset.layoutId;
let sessionID;
let dot;
let temp;
const connections = [];
const downloadPathing = document.getElementById("download-graph");

const buttons = [
  scrollUp,
  scrollDown,
  playBtn,
  pauseBtn,
  downloadBtn,
  scrollLeft,
  scrollRight,
  button1,
  button2,
  button3,
  downloadPathing,
];
let areas = [];
let firstChild;
let firstChildIL;

function parseCalibrationDataInQueryString() {
  const href = window.location.href;
  const decodedURI = decodeURI(href);
  const queryString = decodedURI.split("?")[1];
  if (!queryString) return undefined;
  const jsonString = queryString.slice(
    "calibrationData=".length,
    queryString.length
  );
  return jsonString;
}

(async () => {
  const response = await fetch("https://dummyjson.com/products/?limit=5");
  const products = await response.json();

  products.products.forEach((product, i) => {
    const productEl = document.createElement("div");
    productEl.classList.add("item-card", "area");
    productEl.id = "product" + (i + 1);
    productEl.innerHTML = `<div>
                <p class="item-name"><b>${product.title}</b></p>
                <p class="item-description">${product.description}</p>
            </div>
            <img crossorigin="anonymous" src="${product.thumbnail}" />
            <div class="rating">${"&#9733;".repeat(
              Math.round(product.rating)
            )}</div>`;
    productsContainer.appendChild(productEl);
  });
  areas = [...document.querySelectorAll(".item-card.area")];
  firstChild = document.querySelector(".item-card:first-child");
  firstChildIL = firstChild.getBoundingClientRect().left;
  await initiateSeeso(onGaze, parseCalibrationDataInQueryString());
  dot = document.querySelector(".dot");
})();
function onGaze(gazeInfo) {
  getCoord(gazeInfo);
}

function scrollR() {
  const lastChild = document.querySelector(".item-card:last-child");
  const lastChildR = lastChild.getBoundingClientRect().right;
  if (lastChildR < window.innerWidth) {
    return;
  }
  const x = productsContainer.style.getPropertyValue("--x-offset") || 0;
  productsContainer.style.setProperty("--x-offset", parseInt(x) - 20);
}
function scrollL() {
  const firstChildL = firstChild.getBoundingClientRect().left;
  if (firstChildL >= firstChildIL) {
    return;
  }
  const x = productsContainer.style.getPropertyValue("--x-offset") || 0;
  productsContainer.style.setProperty("--x-offset", parseInt(x) + 20);
}

function scrollD() {
  window.scrollBy(0, 100);
}

function scrollU() {
  window.scrollBy(0, -100);
}
let isRecording = false;
const tasks = ["b1", "b3", "product2", "product4"]; //4 tasks
const data = [];
const gData = [];
let taskC = 0;
function getCoord(gazeInfo) {
  [...buttons, ...areas].forEach(function (b) {
    if (!b) return;
    if (isColliding(dot.getBoundingClientRect(), b.getBoundingClientRect())) {
      if (temp === b) return;
      temp = b;
      switch (b.id) {
        case "scroll-up":
          scrollU();
          break;
        case "scroll-down":
          scrollD();
          break;
        case "scroll-right":
          scrollR();
          break;
        case "scroll-left":
          scrollL();
          break;
        case "record-btn":
          startTimer();
          break;
        case "pause-btn":
          endTimer();
          break;
        case "download-btn":
          downloadCSV();
          break;
        case "download-graph":
          canvasDownload();
        default:
          (() => {
            document.querySelectorAll(".button").forEach(function (button) {
              button.classList.remove("hover");
            });
            if (b.classList.contains("button")) {
              b.classList.add("hover");
            }
            if (!isRecording) return;
            let gazeData;
            if (taskC < tasks.length) {
              gazeData = {
                gazePathID: "GP" + taskC,
                timestamp: formatTime(Date.now()),
                gazePoint: gazeInfo.x + " and " + gazeInfo.y,
              };
              gData.push(gazeData);
              drawLine(gazeInfo.x, gazeInfo.y);
            }
            if (tasks[taskC] == b.id) {
              connections.push({ x: gazeInfo.x, y: gazeInfo.y });
              taskC++;
              const eT = Date.now();
              const duration = (eT - timer) / 1000;
              const rowData = {
                sessionID,
                taskID: "T" + taskC,
                layoutID: layoutNum,
                item: b.id,
                startTime: formatTime(timer),
                endTime: formatTime(eT),
                duration,
                gazePathID: gazeData.gazePathID,
              };
              data.push(rowData);
              timer = eT;
            }
          })();
          break;
      }
    }
  });
}
function isColliding(rect1, rect2) {
  return !(
    rect1.top > rect2.bottom ||
    rect1.right < rect2.left ||
    rect1.bottom < rect2.top ||
    rect1.left > rect2.right
  );
}

function downloadCSV() {
  if (!data.length || !gData.length) return;
  let csvTitle =
    "SessionID,TaskID,LayoutID,Item/Area,StartTime(H:M:S:MS),EndTime(H:M:S:MS),Duration(s),GazePathID\n";
  let gazePathTitle = "GazePathID,Timestamp,GazePoint (x and y)\n";

  data.forEach(function (row) {
    const rows = Object.values(row).map((entry) => entry);
    csvTitle += rows.join(",") + "\n";
  });

  gData.forEach(function (row) {
    const rows = Object.values(row).map((entry) => entry);
    gazePathTitle += rows.join(",") + "\n";
  });
  let dataCsv = document.createElement("a");
  dataCsv.href =
    "data:text/csv;charset=utf-8," +
    encodeURI(csvTitle + "\n") +
    encodeURI(gazePathTitle);
  dataCsv.target = "_blank";

  let d = new Date();

  dataCsv.download = `Recording Data '${d.toLocaleString()}'.csv`;
  dataCsv.click();
}

let timer;
function startTimer() {
  downloadPathing.style.display = "none";
  taskC = 0;
  if (isRecording) return;
  sessionID = JSON.parse(localStorage.getItem("sessionID") || 0);
  sessionID += 1;
  timer = Date.now();
  isRecording = true;
  rightCorner.classList.remove("stop");
  rightCorner.classList.add("start");
}

function endTimer() {
  if (!isRecording) return;
  localStorage.setItem("sessionID", JSON.stringify(sessionID));
  isRecording = false;

  if (rightCorner.classList.contains("start")) {
    rightCorner.classList.remove("start");
    rightCorner.classList.add("stop");
  }
  drawLine(
    pauseBtn.getBoundingClientRect().x,
    pauseBtn.getBoundingClientRect().y
  );
  ctx.stroke();
  ctx.closePath();
  tasks.forEach(function (t) {
    ctx.beginPath();
    ctx.fillStyle = "purple";
    const element = document.getElementById(t).getBoundingClientRect();
    ctx.arc(element.x, element.y, 7, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  });
  connections.forEach(function (c) {
    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.arc(c.x, c.y, 5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  });
  downloadPathing.style.display = "block";
}

function formatTime(time) {
  const d = new Date(time);
  const mseconds = d.getMilliseconds();
  const seconds = d.getSeconds();
  const minutes = d.getMinutes();
  const hours = d.getHours();
  return `${hours}:${minutes}:${seconds}:${mseconds}`;
}

const canvas = document.getElementById("canvas-drawing");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.beginPath();
ctx.strokeStyle = "blue";
ctx.lineWidth = 4;
ctx.moveTo(
  playBtn.getBoundingClientRect().x,
  playBtn.getBoundingClientRect().y
);

function canvasDownload() {
  const url = canvas.toDataURL("image/png");
  console.log(url);
  downloadPathing.href = url;
  downloadPathing.download =
    "pathing_graph_session " + localStorage.getItem("sessionID");
  downloadPathing.click();
}

function drawLine(x, y) {
  ctx.lineTo(x, y);
}
