import React from "react";
import {BilibiliFormat, CommentManager, CommentProvider} from "./CommentCoreLibrary";

const defaultSettings = { "maxDanmakuAmount": 100, "opacity": 100, "fontSize": 100, "speed": 50 };

class Danmaku extends React.Component {
    settings = defaultSettings;
    offset = 0;

    resetDanmakus = () => {
        this.commentManager.clear();
        this.commentProvider.destroy();
        this.initCCL();
        console.log("Danmakus reset");
    }

    getSetting(key) {
        const result = this.settings.danmakuSettings[key] || defaultSettings[key];
        if (key === "maxDanmakuAmount") {
            return this.translateMaxDanmakuAmount(result);
        }
        return result;
    }

    initCCL = () => {
        console.log("Initializing CCL");

        console.log("Settings: ", this.settings);

        // Set up comment manager
        const danmakuCanvas = document.getElementById("danmaku-canvas");
        console.log("Creating comment manager, canvas:", danmakuCanvas);
        this.commentManager = new CommentManager(danmakuCanvas);
        this.commentManager.init();
        this.setCCLSettings();
        console.log("Comment manager options", this.commentManager.options);

        this.commentManager.start();

        console.log("Comment manager initialized");

        this.initCommentProvider();
    }

    setCCLSettings = () => {
        this.commentManager.options.global.opacity = this.getSetting("opacity") / 100;
        this.commentManager.options.global.scale = 1.3 * ((100 - this.getSetting("speed")) / 50);
        this.commentManager.options.global.fontScale = this.getSetting("fontSize") / 100;
        this.commentManager.options.scroll.opacity = this.getSetting("opacity") / 100;
        this.commentManager.options.scroll.scale = 1.3 * ((100 - this.getSetting("speed")) / 50);
        this.commentManager.options.scroll.fontScale = this.getSetting("fontSize") / 100;
        this.commentManager.options.limit = this.getSetting("maxDanmakuAmount");
    }

    initCommentProvider = () => {
        // Set up comment provider
        this.commentProvider = new CommentProvider();
        this.commentProvider.addParser(new BilibiliFormat.XMLParser(), CommentProvider.SOURCE_XML);
        this.commentProvider.addTarget(this.commentManager);
        this.commentProvider.load().then(() => {
            console.log("Comment provider loaded");
        }).catch((err) => {
            console.error(err);
            console.log("Comment provider failed to load");
        });
    }

    registerSettingsListener = () => {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            for (let key in changes) {
                if (key === "danmakuSettings") {
                    console.log("Danmaku settings changed: ", changes[key].newValue);
                    this.settings[key] = changes[key].newValue;
                    this.setCCLSettings();
                }
            }
        });
    }

    createVideoListeners = () => {
        const videoPlayer = document.getElementsByTagName("video")[0];
        videoPlayer.addEventListener("play", () => {
            // console.log("Video play");
            this.commentManager.start();
        });
        videoPlayer.addEventListener("pause", () => {
            // console.log("Video pause");
            this.commentManager.stop();
        });
        videoPlayer.addEventListener("seeking", () => {
            // console.log("Video seeking");
            this.commentManager.clear();
            this.commentManager.time(videoPlayer.currentTime * 1000 + this.offset * 1000);
        });
        videoPlayer.addEventListener("timeupdate", () => {
            // console.log("Video timeupdate");
            let movie_player = document.getElementById('movie_player');
            if (movie_player) {
                // Ignore timeupdate events when ads are playing
                if (movie_player.classList.contains("ad-interrupting")) {
                    return;
                }
            }
            this.commentManager.time(videoPlayer.currentTime * 1000 + this.offset * 1000);
        });
        if (!this.mutationObserver) {
            // console.log("Creating mutation observer");
            this.mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    this.resizeDanmakuCanvas();
                });
            });
            this.mutationObserver.observe(videoPlayer, {attributes: true, attributeFilter: ["style"]});
        }
    }

    resizeDanmakuCanvas = () => {
        var danmakuCanvas = document.getElementById("danmaku-canvas");
        var danmakuContainer = document.getElementById("danmaku-container");
        var videoContainer = document.getElementById("movie_player");
        if (!danmakuCanvas || !videoContainer) {
            console.log("Danmaku canvas or video container not found");
            return;
        }

        var defWidth = 1280;
        var defHeight = 720;
        var width = parseInt(videoContainer.offsetWidth, 10);
        var height = parseInt(videoContainer.offsetHeight, 10);

        var scale = Math.sqrt(Math.min(width / defWidth, height / defHeight));
        var relWidth = Math.floor(width / scale);
        var relHeight = Math.floor(height / scale);

        console.log("New dimensions: " + width + "x" + height);

        danmakuContainer.style.width = width + "px";
        danmakuContainer.style.height = height + "px";

        this.commentManager.stage.style.width = relWidth + "px";
        this.commentManager.stage.style.height = relHeight + "px";
        this.commentManager.stage.style.transform = "scale(" + scale + ")";
        this.commentManager.stage.style.webkitFontSmoothing = "subpixel-antialiased";   // Set webkit font smoothing for better text rendering

        this.commentManager.setBounds(relWidth, relHeight);
    }

    addDanmakuSource = (source) => {
        console.log("Adding danmaku source", source);
        chrome.runtime.sendMessage({type: "DOWNLOAD_DANMAKU", url: source}, (response) => {
            console.log("Response: ", response);
            this.commentManager.stop();
            this.commentManager.time(0);
            this.commentProvider.addStaticSource(CommentProvider.XMLProvider('GET', response.danmakuxml), CommentProvider.SOURCE_XML);

            this.commentProvider.load().then(() => {
                console.log("Comment provider loaded");
                this.commentManager.start();
            }).catch((err) => {
                console.error("Comment provider failed to load", err);
            });
        });
    }

    toggleDanmakuVisibility = () => {
        const danmakuContainer = document.getElementById("danmaku-container");
        if (danmakuContainer) {
            if (danmakuContainer.classList.contains("hideDanmakus")) {
                danmakuContainer.classList.remove("hideDanmakus");
                return true;
            } else {
                danmakuContainer.classList.add("hideDanmakus");
                return false;
            }
        }
    }

    translateMaxDanmakuAmount = (value) => {
        if (value == 5) {
            return -1;
        } else if (value == 4) {
            return 100;
        } else if (value == 3) {  
            return 50;
        } else if (value == 2) {
            return 10;
        } else if (value == 1) {
            return 5;
        }
    }

    constructor(props) {
        super(props);
        this.commentManager = null;
        this.commentProvider = null;
        this.mutationObserver = null;
    }

    async componentDidMount() {
        this.settings = await chrome.storage.sync.get("danmakuSettings") || defaultSettings;
        this.registerSettingsListener();

        this.initCCL();
        this.createVideoListeners();
        this.resizeDanmakuCanvas();

        // Set up window methods
        window.resetDanmakus = this.resetDanmakus;
        window.addDanmakuSource = this.addDanmakuSource;
        window.toggleDanmakuVisibility = this.toggleDanmakuVisibility;
        console.log("Danmaku component mounted");

        // Add listener for offset changes
        const offsetElement = document.getElementById("danmaku-offset");
        const offsetObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                this.offset = parseInt(offsetElement.textContent, 10);
                console.log("Offset changed: ", this.offset);
            });
        });
        offsetObserver.observe(offsetElement, {childList: true});
    }

    componentDidUpdate() {
        console.log("Danmaku component updated");
    }

    componentWillUnmount() {
        this.commentManager.stop();
    }

    render() {
        console.log("Danmaku render");

        return (
            <>
                <div id="danmaku-canvas" className={`container`} />
                <div id="danmaku-offset" style={{display: "none"}} />
            </>
        );
    }
}

export default Danmaku;
