import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Danmaku from './danmaku';

// Create side panel root element
const rootElement = document.createElement("div");
rootElement.id = 'danmaku-kakashi-root';
const globalStyles = document.createElement("style");
globalStyles.innerHTML = `
  #${rootElement.id} {
    max-height: 600px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    margin-bottom: 10px;
  }
`;
document.head.appendChild(globalStyles);
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Wait for YouTube to load and insert root element
const checkExist = setInterval(function() {
  if (document.getElementById("secondary-inner")) {
    clearInterval(checkExist);// Find YouTube side bar and insert root element
    const youtubeSideBar = document.getElementById("secondary-inner");
    console.log(youtubeSideBar);
    youtubeSideBar.prepend(rootElement);
  }
}, 100); // check every 100ms

// Create danmaku container
let danmakuDOM = document.getElementById("danmaku-container");
if (danmakuDOM) {
  danmakuDOM.remove();
}
danmakuDOM = document.createElement("div");
danmakuDOM.id = "danmaku-container";
danmakuDOM.style.position = "absolute";
const danmakuRoot = ReactDOM.createRoot(danmakuDOM);
danmakuRoot.render(
  <>
    <Danmaku />
  </>
);
console.log("Danmaku container created");

// Wait for YouTube video player to load
const checkExist2 = setInterval(function() {
  let videoPlayer = document.getElementsByTagName("video")[0];
  if (videoPlayer) {
    console.log("Video loaded");
    clearInterval(checkExist2);
    danmakuDOM.style.cssText = [
      `width: ${videoPlayer.style.width || 640};`,
      `height: ${videoPlayer.style.height || 360};`,
      `left: ${videoPlayer.style.left || 0};`,
      `top: ${videoPlayer.style.top || 0};`,
      `z-index: 0;`,
      `background-color: #00000000;`,
      `pointer-events: none;`
    ].join(" ");
    videoPlayer.parentElement.appendChild(danmakuDOM);
  }
}, 100); // check every 100ms

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
