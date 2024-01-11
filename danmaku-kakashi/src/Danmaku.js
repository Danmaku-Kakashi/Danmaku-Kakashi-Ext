import React from "react";
import ReactDOM from "react-dom";
import { BilibiliFormat, CommentManager, CommentProvider } from "./CommentCoreLibrary";

class Danmaku extends React.Component {
    resetDanmakus = () => {
        this.commentManager.clear();
        console.log("Danmakus reset");
    }

    initCCL = () => {
        // Set up comment manager
        const danmakuCanvas = document.getElementById("danmaku-canvas");
        this.commentManager = new CommentManager(danmakuCanvas);
        this.commentManager.init();
        this.commentManager.options.global.opacity = 0.8;
        this.commentManager.options.global.scale = 1.2;
        this.commentManager.options.scroll.opacity = 0.8;
        this.commentManager.options.scroll.scale = 1.2;
        this.commentManager.start();

        console.log("Comment manager initialized");

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
            this.commentManager.seek(videoPlayer.currentTime * 1000);
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
            this.commentManager.time(Math.floor(videoPlayer.currentTime * 1000));
        });
        if (!this.mutationObserver) {
            console.log("Creating mutation observer");
            this.mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    this.resizeDanmakuCanvas();
                });
            });
            this.mutationObserver.observe(videoPlayer, { attributes: true, attributeFilter: ["style"] });
        }
    }

    resizeDanmakuCanvas = () => {
        const danmakuCanvas = document.getElementById("danmaku-canvas");
        const videoPlayer = document.getElementsByTagName("video")[0];
        if (!danmakuCanvas || !videoPlayer) {
            console.log("Danmaku canvas or video player not found");
            return;
        }

        console.log("Resizing danmaku canvas");

        this.commentManager.stage.style.width = videoPlayer.style.width;
        this.commentManager.stage.style.height = videoPlayer.style.height;

        danmakuCanvas.style.width = videoPlayer.style.width;
        danmakuCanvas.style.height = videoPlayer.style.height;
        danmakuCanvas.style.left = videoPlayer.style.left;
        danmakuCanvas.style.top = videoPlayer.style.top;

        var width = parseInt(videoPlayer.style.width, 10);
        var height = parseInt(videoPlayer.style.height, 10);
        this.commentManager.setBounds(width, height);
    }

    addDanmakuSource = (source) => {
        source = "http://localhost:8080/danmaku.xml"
        console.log("Adding danmaku source", source);
        this.commentProvider.addParser(new BilibiliFormat.XMLParser(), CommentProvider.SOURCE_XML);
        this.commentProvider.addStaticSource(CommentProvider.XMLProvider('GET', source), CommentProvider.SOURCE_XML);
        // this.commentProvider.addTarget(this.commentManager);
        // this.commentManager.init();

        this.commentProvider.load().then(() => {
            console.log("Comment provider loaded");
        }).catch((err) => {
            console.error(err);
            console.log("Comment provider failed to load");
        });
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
