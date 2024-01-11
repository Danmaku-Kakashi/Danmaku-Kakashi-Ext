import React from "react";
import ReactDOM from "react-dom/client";
import Danmaku from "./Danmaku";

function injectDanmakuDOM() {
    // Prevent multiple injection
    if (document.getElementById("danmaku-container-injecting")) {
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
        console.log("Called Danmaku container reset");
    } else {
        danmakuDOM = document.createElement("div");
        danmakuDOM.id = "danmaku-container";
        // danmakuDOM.style.position = "absolute";
        console.log("Danmaku container created");

        // Wait for YouTube video player to load
        const checkExist = setInterval(function () {
            let videoPlayer = document.getElementsByTagName("video")[0];
            if (videoPlayer) {
                console.log("Video loaded");
                clearInterval(checkExist);
                danmakuDOM.classList.add("m20");
                danmakuDOM.classList.add("abp");
                danmakuDOM.style.cssText = [
                    `width: ${videoPlayer.style.width || 640};`,
                    `height: ${videoPlayer.style.height || 360};`,
                    `left: ${videoPlayer.style.left || 0};`,
                    `top: ${videoPlayer.style.top || 0};`,
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