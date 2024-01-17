import React from "react";
import ReactDOM from "react-dom/client";
import Danmaku from "./Danmaku";
import "./ccl-base.css";

function injectDanmakuDOM() {
    // Prevent multiple injection
    if (document.getElementById("danmaku-container-injecting")) {
        console.log("Danmaku DOM already injected")
        return;
    }
    const danmakuContainerInjecting = document.createElement("div");
    danmakuContainerInjecting.id = "danmaku-container-injecting";
    document.body.appendChild(danmakuContainerInjecting);

    console.log("Injecting danmaku DOM");
    // Recreate danmaku container
    let danmakuDOM = document.getElementById("danmaku-container");
    if (danmakuDOM) {
        // Reset danmakus
        window.resetDanmakus();
        danmakuContainerInjecting.remove();
        console.log("Called Danmaku container reset");
    } else {
        danmakuDOM = document.createElement("div");
        danmakuDOM.id = "danmaku-container";
        // danmakuDOM.style.position = "absolute";
        console.log("Danmaku container created");

        // Wait for YouTube video player to load
        const checkExist = setInterval(function () {
            let videoPlayer = document.getElementsByTagName("video")[0];
            let movie_player = document.getElementById('movie_player');
            if (videoPlayer && movie_player) {
                console.log("Video loaded");
                let width = movie_player.offsetWidth || 640;
                let height = movie_player.offsetHeight || 360;
                console.log("Video dimensions: " + width + "x" + height);
                clearInterval(checkExist);
                danmakuDOM.classList.add("m20");
                danmakuDOM.classList.add("abp");
                danmakuDOM.style.cssText = [
                    `width: ${width}px;`,
                    `height: ${height}px;`,
                    `left: 0;`,
                    `top: 0;`,
                ].join(" ");
                videoPlayer.parentElement.insertBefore(danmakuDOM, videoPlayer.nextSibling);
                const danmakuRoot = ReactDOM.createRoot(danmakuDOM);
                danmakuRoot.render(
                    <>
                        <Danmaku />
                    </>
                );
                danmakuContainerInjecting.remove();
                console.log("Danmaku container rendered");
            }
        }, 100); // check every 100ms
    }
};

function handleBackgroundMessage(request, sender, sendResponse) {
    if (request.type === 'youtubeid') {
        console.log("Message received, injecting danmaku DOM");
        injectDanmakuDOM();
    }
}

// Register listener for messages from background script
function DanmakuHelper() {
    chrome.runtime.onMessage.addListener(handleBackgroundMessage);
}

export default DanmakuHelper;