import React from 'react';
import ReactDOM from 'react-dom/client';
import './content/index.css';
import App from './App';
import DanmakuHelper from './danmaku/DanmakuHelper';
import { LanguageProvider } from './i18n/LanguageContext';
import './i18n/i18n';

// Create side panel root element
const rootElement = document.createElement("div");
rootElement.id = 'danmaku-kakashi-root';
const globalStyles = document.createElement("style");
globalStyles.innerHTML = `
  #${rootElement.id} {
    height: 600px;
    max-height: 600px;
    width: 100%;
    max-width: 100%;
    border-radius: 12px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    margin-bottom: 10px;
  }
`;
document.head.appendChild(globalStyles);
const root = ReactDOM.createRoot(rootElement);
root.render(
  <>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </>
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

// Run DanmakuHelper
DanmakuHelper();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
