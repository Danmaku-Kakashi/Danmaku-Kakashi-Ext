import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const rootElement = document.createElement("div");
rootElement.id = 'danmaku-kakashi-root';

const globalStyles = document.createElement("style");
globalStyles.innerHTML = `
  #${rootElement.id} {
    max-height: 600px;
  }
`;
document.head.appendChild(globalStyles);

// Wait for YouTube to load
const checkExist = setInterval(function() {
  if (document.getElementById("secondary-inner")) {
    console.log("Exists!");
    clearInterval(checkExist);// Find YouTube side bar and insert root element
    const youtubeSideBar = document.getElementById("secondary-inner");
    console.log(youtubeSideBar);
    youtubeSideBar.prepend(rootElement);
    
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}, 100); // check every 100ms

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
