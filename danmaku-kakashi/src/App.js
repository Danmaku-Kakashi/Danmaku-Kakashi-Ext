import {useState, useEffect} from 'react'
import './App.css';
import * as React from 'react';
import Button from '@mui/material/Button';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Spinner from '@mui/material/CircularProgress';


export function CustomizedInputBase({onSearchTrigger}) {
  const [searchTerm, setSearchTerm] = useState(''); // Track contant of search box
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value); // Update searchTerm value
  };
  const handleSearch = () => {
    onSearchTrigger(searchTerm); // Call the prop function
    setSearchTerm(''); // Reset the input field
  };
  const handleKeyPress = (event) => { // Handle Enter key press
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };
  return (
    <div className="topsearch">
      <Paper component="form" sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search..."
          inputProps={{ 'aria-label': 'search...' }}
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyPress}
        />
        <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </Paper>
    </div>
  );
}


function VideoBox({ title, author, danmaku, duration, arcurl, pic, onClick }) {
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

function Modal({ show, onClose, children, arcurl, onLoadDanmakus, pic, title}) {
  const [thumb, setThumbnail] = useState('');
  if (!show) {
    return null;
  }
  chrome.runtime.sendMessage({ type: 'GET_THUMBNAIL', url: pic }, (response) => {
    setThumbnail(response.thumbnail);
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <IconButton 
        color="inherit"
        style={{position: 'relative', bottom: 20, left: 60, zIndex: 9999, margin: 0, padding: 0,}}
        onClick={onClose} className="modal-close-button">
          <CloseRoundedIcon />
        </IconButton>
        <div className="popupThumbnail">
          {thumb === '' ? <Spinner /> :
            <img src={thumb} alt={title} />
          }
          <p className='popuptitle'>{title}</p>
        </div>
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
  const LogoIcon = chrome.runtime.getURL("icons/logoicon.png");

  const possibleMatchVideos = [
    //...
  ];

  const [searchMatchVideos, setSearchMatchVideos] = useState([]);
  const [showMainControls, setShowMainControls] = useState(true);
  const handleSearchTrigger = (searchInput) => {
    setShowMainControls(false);
    chrome.runtime.sendMessage({ type: 'SEARCH', query: searchInput }, (response) => {
      if (response.error) {
        console.error('Error:', response.error);
        return;
      }
      const searchMatch = response.videosResult.data.result.find(section => section.result_type === "video").data;
      searchMatch.forEach((video) => {
        if (video.pic.startsWith('//'))
          video.pic = video.pic.replace('//', 'https://');
      });
      searchMatch.forEach((video) => {
        video.title = video.title.replace(/<em class="keyword">([\s\S]*?)<\/em>/g, '$1');
      });
      setSearchMatchVideos(searchMatch); //Get Search Result list
    });
  };
  const showVideoBox = () => {
    setShowMainControls(true); // return to popup page
  };

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
      newVideo();
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
        // observer.disconnect();
    };

  }, [youtubeUrl]);
   
  const newVideo = async() => {
    const DanmuControl = document.getElementsByClassName("DanmuControl")[0];

    if (!DanmuControl) {
      const DanmuBtn = document.createElement("img");
      DanmuBtn.src = LogoIcon;
      DanmuBtn.className = "ytp-button " + "DanmuControl" ;
      DanmuBtn.title = "Click to open danmaku conrol panel";
      
      const youtubeLeftControls = document.getElementsByClassName("ytp-right-controls")[0];
      // const youtubePlayer = document.getElementsByClassName('video-stream')[0];
      youtubeLeftControls.prepend(DanmuBtn);
      DanmuBtn.addEventListener("click", OpenDanmakuControlHandler);
    }
  }

  const OpenDanmakuControlHandler = async() => {}

  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const handleCloseIconClick = () => {
    setIsPopupOpen(false); // close popup page
  };

  const handleLogoClick = () => {
    setIsPopupOpen(true); // return to popup page
  };


  return (
    <div>
    {!isPopupOpen ? (
      <img src={LogoIcon} alt="DamMuname" width="30" height="30" onClick={handleLogoClick} />
    ) : (
      <div id="DanMuPopup" className="DanMuPageBody dm-preload"v>
          <IconButton color="inherit" onClick={handleCloseIconClick}
          style={{position: 'absolute', top: 5, right: 5, zIndex: 1, margin: 0, padding: 0}}>
            <CloseRoundedIcon style={{fontSize: 24}}/>
          </IconButton>

            <header id="dmPopupLogo" className="dmPopupLogo">
                <img src={Logo} alt="DamMuname" width="140" height="80" />
            </header>

            {/* Search bar */}
            <CustomizedInputBase onSearchTrigger={handleSearchTrigger}/>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} 
            arcurl={selectedVideo ? selectedVideo.arcurl : ''} onLoadDanmakus={handleLoadDanmakusClick} 
            pic = {selectedVideo ? selectedVideo.pic : ''} title={selectedVideo ? selectedVideo.title : ''}>
              {selectedVideo && (
                <div>
                  
                </div>
              )}
            </Modal>

            {!showMainControls ? (
              <div>
                <Button variant="contained" color="error" style={{marginRight: '58%'}}>
                  <a target="_blank" rel="noopener noreferrer" onClick={showVideoBox}
                  style={{ textDecoration: 'none', color: 'inherit', textTransform: 'none'}}>
                  &lt;&lt; Return to Match Video
                  </a> 
                </Button>

                <div id="mainControls" style={{ display: "block" }}>
                  <h1 className="dmHeader">Search Result</h1>
                  {searchMatchVideos.length > 0 ? (
                    searchMatchVideos.map((video, index) => (
                      <VideoBox key={index} {...video} onClick={() => handleVideoClick(video)} />
                    ))
                  ) : (
                    <p className='Unfoundtext'>No match found :(</p>
                  )}
                </div>
              </div>
            ) : (

              <div>
                <div id="mainControls" style={{ display: "block" }}>
                  <h1 className="dmHeader">Best match (User)</h1>
                  {bestMatchVideos.length > 0 ? (
                    bestMatchVideos.map((video, index) => (
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
                      <VideoBox key={index} {...video} onClick={() => handleVideoClick(video)} />
                    ))
                  ) : (
                    <p className='Unfoundtext'>No match found :(</p>
                  )}
                </div>
              </div>
            )}
    </div>
    )}
  </div>
  );
}

export default App;
