import React from "react";
import ReactDOM from "react-dom";
import {BilibiliFormat, CommentManager, CommentProvider} from "./CommentCoreLibrary";

class Danmaku extends React.Component {
    resetDanmakus = () => {
        this.commentManager.clear();
        this.commentProvider.destroy();
        this.initCCL();
        console.log("Danmakus reset");
    }

    initCCL = () => {
        // Set up comment manager
        const danmakuCanvas = document.getElementById("danmaku-canvas");
        this.commentManager = new CommentManager(danmakuCanvas);
        this.commentManager.init();
        this.commentManager.options.global.opacity = 0.8;
        this.commentManager.options.global.scale = 1.3;
        this.commentManager.options.scroll.opacity = 0.8;
        this.commentManager.options.scroll.scale = 1.3;
        this.commentManager.start();

        console.log("Comment manager initialized");

        this.initCommentProvider();
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

    createVideoListeners = () => {
        const videoPlayer = document.getElementsByTagName("video")[0];
        videoPlayer.addEventListener("play", () => {
            console.log("Video play");
            this.commentManager.start();
        });
        videoPlayer.addEventListener("pause", () => {
            console.log("Video pause");
            this.commentManager.stop();
        });
        videoPlayer.addEventListener("seeking", () => {
            console.log("Video seeking");
            this.commentManager.clear();
            this.commentManager.time(videoPlayer.currentTime * 1000);
        });
        videoPlayer.addEventListener("timeupdate", () => {
            console.log("Video timeupdate");
            let movie_player = document.getElementById('movie_player');
            if (movie_player) {
                // Ignore timeupdate events when ads are playing
                if (movie_player.classList.contains("ad-interrupting")) {
                    return;
                }
            }
            this.commentManager.time(videoPlayer.currentTime * 1000);
        });
        if (!this.mutationObserver) {
            console.log("Creating mutation observer");
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

    constructor(props) {
        super(props);
        this.commentManager = null;
        this.commentProvider = null;
        this.mutationObserver = null;
    }

    componentDidMount() {
        const danmakuCanvas = document.getElementById("danmaku-canvas");
        console.log("Creating comment manager");

        this.initCCL();
        this.createVideoListeners();
        this.resizeDanmakuCanvas();

        // Set up window methods
        window.resetDanmakus = this.resetDanmakus;
        window.addDanmakuSource = this.addDanmakuSource;
        window.toggleDanmakuVisibility = this.toggleDanmakuVisibility;
        console.log("Danmaku component mounted");
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
            <div id="danmaku-canvas" className={`container`} />
        );
    }
}

export default Danmaku;
