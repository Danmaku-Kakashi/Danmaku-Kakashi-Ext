import React from "react"
import {useState, useEffect} from 'react'
import './App.css';
import Spinner from '@mui/material/CircularProgress';

const VideoBox = ({ title, author, danmaku, duration, arcurl, pic, onClick }) => {
    const [thumbnail, setThumbnail] = useState('');
    // Download the thumbnail image in background.js and pass it to React
    useEffect(() => {
      chrome.runtime.sendMessage({ type: 'GET_THUMBNAIL', url: pic }, (response) => {
        setThumbnail(response.thumbnail);
      });
    }, [pic]);
  
    const truncatedDuration = duration.replace(/^0(?:0:0?)?/, '');
  
    return (
      <a className="dmVideoLink" onClick={onClick}>
        <div className="dmVideoItem">
          <div className="dmVideoThumbnail">
            {thumbnail === '' ? <Spinner /> :
              <img src={thumbnail} alt={title} />
            }
            <span className="dmVideoDuration">{truncatedDuration}</span>
          </div>
          <div className="dmVideoDetails">
            <h2 className="dmVideoTitle">{title}</h2>
            <p className="dmVideoAuthor">{author}</p>
            <p className="dmVideoViews">{danmaku + " Danmakus"}</p>
          </div>
        </div>
      </a>
    );
  }

export default VideoBox;