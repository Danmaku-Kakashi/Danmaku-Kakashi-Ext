import React from "react";
import ReactDOM from "react-dom";
import { CommentManager } from "./CommentCoreLibrary";

class Danmaku extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: [],
            width: 0,
            height: 0,
        };
        this.commentManager = null;
    }

    componentDidMount() {
        const danmakuCanvas = document.getElementById("danmaku-canvas");
        this.setState({
            width: danmakuCanvas.width,
            height: danmakuCanvas.height,
        });
        console.log("Creating comment manager");
        this.commentManager = new CommentManager(danmakuCanvas);
        this.commentManager.init();
        this.commentManager.start();
        this.commentManager.setBounds(0, 0, this.state.width, this.state.height);
        
        // Insert a comment into the playlist
        var someDanmakuAObj = {
            "mode":1,
            "text":"Hello CommentCoreLibrary",
            "stime":1000,
            "size":30,
            "color":0xff0000
        };
        this.commentManager.insert(someDanmakuAObj);

        // Show a comment immediately
        // This ignores stime
        this.commentManager.send(someDanmakuAObj);
    }

    componentDidUpdate() {
        this.commentManager.setBounds(0, 0, this.state.width, this.state.height);
    }

    render() {
        console.log("Danmaku render");
        return (
            <div id="danmaku-canvas"
                width={this.state.width}
                height={this.state.height}
                comments={this.state.comments}
            />
        );
    }
}

export default Danmaku;
