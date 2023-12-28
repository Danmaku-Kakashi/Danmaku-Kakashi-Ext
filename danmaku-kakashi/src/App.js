import {useState, useEffect} from 'react'
import './App.css';
import * as React from 'react';
import Button from '@mui/material/Button';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import IconButton from '@mui/material/IconButton';


function VideoBox({ title, author, danmaku, duration, arcurl, pic, onClick }) {
  return (
    <a className="dmVideoLink" onClick={onClick}>
      <div className="dmVideoItem">
        <div className="dmVideoThumbnail">
          <img src={pic} alt={title}/>
          <span className="dmVideoDuration">{duration}</span>
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

function Modal({ show, onClose, children, arcurl, onLoadDanmakus }) {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <IconButton 
        color="inherit"
        style={{position: 'relative', bottom: 20, left: 65, zIndex: 9999, margin: 0, padding: 0,}}
        onClick={onClose} className="modal-close-button">
          <CloseRoundedIcon />
        </IconButton>
        {children}
        <Button 
        style={{position: 'relative', bottom: 15, textTransform: 'none',}}
        variant="contained" color="error" onClick={onLoadDanmakus}>
          Load Danmakus
        </Button>
        <Button variant="contained" color="error">
          <a href={arcurl} target="_blank" rel="noopener noreferrer" 
          style={{ textDecoration: 'none', color: 'inherit', textTransform: 'none'}}>
          Open on BiliBili
          </a> 
        </Button>
      </div>
    </div>
  );
}

function App() {
  const Logo = chrome.runtime.getURL("icons/logo.png");
  const SearchIcon = chrome.runtime.getURL("icons/search.png");

  const possibleMatchVideos = [
    //...
  ];

  const handleLoadDanmakusClick = () => {
    if (selectedVideo) {
      uploadVideo(selectedVideo);
      setIsModalOpen(false);  // close popup page model
    }
  };

  const uploadVideo = (video) => {
    const VideoData = {
      ...video,
      youtubeid: youtubeUrl,  
    };
    fetch('http://127.0.0.1:8000/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(VideoData),
    })
    .then(response => response.json())
    .then(data => {console.log(data)})
    .catch((error) => console.error('Error:', error));
  }

  function TopNav() {
    const [searchTerm, setSearchTerm] = useState(''); // Track contant of search box
    const handleSearchChange = (event) => {
      setSearchTerm(event.target.value); // Update searchTerm value
    };
  
    const handleSearchSubmit = () => {
      console.log('Searching for:', searchTerm); // Add search logic 
      // Update result or API call
    };
  
    return (
      <div className="topnav">
        <input 
          type="text" 
          placeholder="Search.." 
          value={searchTerm} 
          onChange={handleSearchChange} 
        />
        <button 
          id="dmSearchButton" 
          title="Search" 
          className="dmSearchButton"
          onClick={handleSearchSubmit}
        >
          <img src={SearchIcon} width="12" height="12" alt="Search icon" />
        </button>
      </div>
    );
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleVideoClick = video => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const [bestMatchVideos, setBestMatchVideos] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  useEffect(() => {
    if (youtubeUrl){
      const url = `http://127.0.0.1:8000/api/videos/?youtubeid=${youtubeUrl}`;

      fetch(url)  // Django API
        .then(response => response.json())
        .then(data => {
          setBestMatchVideos(data);  // return videolist
        })
        .catch(error => console.error('Error:', error));
    }

      const handleNewUrl = (message, sender, sendResponse) => {
        if (message.type === 'youtubeid') {
          setYoutubeUrl(message.vid); // Update new YouTube URL
          console.log('Received YouTube URL:', message.vid);
          var response_text = message.vid + ' received by React';
          sendResponse({text: response_text});
          return true;
        }
      };
  
      // Add Chrome message listener
    chrome.runtime.onMessage.addListener(handleNewUrl);
  
      // Clean up Chrome message listener
    return () => {
        chrome.runtime.onMessage.removeListener(handleNewUrl);
    };
  }, [youtubeUrl]); 

  return (
    <div id="DanMuPopup" className="DanMuPageBody dm-preload">
{/* 
      <button id="dmCloseButton" title="Close Popup" className="dmCloseButton">
          <img src="/ICON/close.png" width="15" height="15" alt="Close icon"/>
      </button> */}

      <IconButton 
        color="inherit"
        style={{position: 'relative', top: 5, left: 100, zIndex: 1, margin: 0, padding: 0,}}>
          <CloseRoundedIcon />
      </IconButton>

      <header id="dmPopupLogo" className="dmPopupLogo">
          {/* <img src="/ICON/LOGO.png" alt="DamMu" width="40" height="40" /> */}
          <img src={Logo} alt="DamMuname" width="140" height="80" />
      </header>

      <TopNav />

      {/* {youtubeUrl && <div>Current YouTube URL: {youtubeUrl}</div>} */}

      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} 
      arcurl={selectedVideo ? selectedVideo.arcurl : ''} onLoadDanmakus={handleLoadDanmakusClick}>
        {selectedVideo && (
          <div>
            <div className="popupThumbnail">
              <img src={selectedVideo.pic} alt={selectedVideo.title}/>
              <p className='popuptitle'>{selectedVideo.title}</p>
            </div>
          </div>
        )}
      </Modal>

      <div id="mainControls" style={{ display: "block" }}>
        <h1 className="dmHeader">Best match (User)</h1>
        {bestMatchVideos.length > 0 ? (
          bestMatchVideos.map((video, index) => (
            //uploadVideos
            // <VideoBox key={index} {...video} onClick={() => uploadVideo(video)} />
            <VideoBox key={index} {...video} onClick={() => handleVideoClick(video)} />
          ))
        ) : (
          <p className='Unfoundtext'>No match found :(</p>
        )}
      </div>

      <div id="mainControls" style={{ display: "block" }}>
        <h1 className="dmHeader">Possible match</h1>
        {possibleMatchVideos.length > 0 ? (
          possibleMatchVideos.map((video, index) => (
            // <VideoBox key={index} {...video} onClick={() => uploadVideo(video)} />
            <VideoBox key={index} {...video} onClick={() => handleVideoClick(video)} />
          ))
        ) : (
          <p className='Unfoundtext'>No match found :(</p>
        )}
      </div>

    </div>

  );
}

export default App;
