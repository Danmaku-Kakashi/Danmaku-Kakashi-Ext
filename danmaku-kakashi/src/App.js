import {useState, useEffect} from 'react'
import './content/App.css';
import * as React from 'react';
import Button from '@mui/material/Button';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import IconButton from '@mui/material/IconButton';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CustomizedInputBase from './content/searchBar.js';
import Modal from './content/Modal.js';
import VideoBox from './content/VideoBox.js';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const Logo = chrome.runtime.getURL("icons/logo.png");
  const LogoIcon = chrome.runtime.getURL("icons/logoicon.png");

  const [searchMatchVideos, setSearchMatchVideos] = useState([]);
  const [showMainControls, setShowMainControls] = useState(true);
  const handleSearchTrigger = (searchInput) => {
    setShowMainControls(false);
    chrome.runtime.sendMessage({ type: 'SEARCH', query: encodeURI(searchInput) }, (response) => {
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
      chrome.runtime.sendMessage({ type: 'GET_VIDEO_DANMAKU', bvid: selectedVideo.bvid }, (response) => {
        if (response.error) {
          console.error('Error:', response.error);
          return;
        }
        const cid = response.videocid;
        const danmakuUrl = `https://comment.bilibili.com/${cid}.xml`;
        console.log('Danmaku URL:', danmakuUrl);  // return danmaku url
        window.addDanmakuSource(danmakuUrl);
        console.log("Tried to send Danmaku Source to player.");
      });
      setIsModalOpen(false);  // close popup page model
    }
  };

  const uploadVideo = (video) => {
    const VideoData = {
      ...video,
      youtubeid: youtubeUrl,  
    };
    fetch('http://127.0.0.1:8000/create/video', {
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
  const [possibleMatchVideos, setPossibleMatchVideos] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  useEffect(() => {
    if (youtubeUrl){
      const url = `http://127.0.0.1:8000/api/videos/?youtubeid=${youtubeUrl}`;
      newVideo();
      fetch(url)  // Django API
        .then(response => response.json())
        .then(data => {
          data.sort((a, b) => b.numused - a.numused); // sort by numused
          setBestMatchVideos(data);  // return videolist
        })
        .catch(error => console.error('Error:', error));
    }
    const handlePossibleMatch = (youtubeUrl) => {
      chrome.runtime.sendMessage({ type: 'SEARCH', query: youtubeUrl.vid }, (response) => {
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
        setPossibleMatchVideos(searchMatch); //Get Search Result list
      });
    };

    const handleNewUrl = (message, sender, sendResponse) => {
      setShowMainControls(true); // when new url, return to main controls
      if (message.type === 'youtubeid') {
          if (message.vid === youtubeUrl) {
            return;
          }
          setYoutubeUrl(message.vid); // Update new YouTube URL
          console.log('Received YouTube URL:', message.vid);
          var response_text = message.vid + ' received by React';
          sendResponse({text: response_text});
          return true;
      }
    };
  
      // Add Chrome message listener
    chrome.runtime.onMessage.addListener(handleNewUrl);
    chrome.runtime.onMessage.addListener(handlePossibleMatch);
  
      // Clean up Chrome message listener
    return () => {
        chrome.runtime.onMessage.removeListener(handleNewUrl);
        chrome.runtime.onMessage.removeListener(handlePossibleMatch);
    };

  }, [youtubeUrl]);
   
  const newVideo = async() => {
    const DanmuControl = document.getElementsByClassName("DanmuControl")[0];

    if (!DanmuControl) {
      const DanmuBtn = document.createElement("img");
      DanmuBtn.src = LogoIcon;
      DanmuBtn.className = "ytp-button " + "DanmuControl" ;
      DanmuBtn.id = "DanmakuControlBtn";
      DanmuBtn.title = "Click to open danmaku conrol panel";
      DanmuBtn.style.transition = "all 0.5s ease-out";
      
      // Wait for YouTube player elements to load and insert DanmuBtn
      const checkExist = setInterval(function() {
        var youtubeRightControls = document.getElementsByClassName("ytp-right-controls")[0];
        if (youtubeRightControls) {
          clearInterval(checkExist);
          youtubeRightControls.prepend(DanmuBtn);
          DanmuBtn.addEventListener("click", OpenDanmakuControlHandler);
        }
      }, 100); // check every 100ms
    }
  }

  const OpenDanmakuControlHandler = async() => {
    var result = window.toggleDanmakuVisibility();
    console.log("Danmaku Visibility: ", result);
    if (result) {
      document.getElementById("DanmakuControlBtn").classList.remove("makeGray");
    } else {
      document.getElementById("DanmakuControlBtn").classList.add("makeGray");
    }
  }

  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const handleCloseIconClick = () => {
    var rootElement = document.getElementById('danmaku-kakashi-root');
    rootElement.style.height = '40px';
    rootElement.style.maxHeight = '40px';
    rootElement.offsetHeight; // Trigger a reflow to enable transition
    setIsPopupOpen(false); // close popup page
  };

  const handleLogoClick = () => {
    var rootElement = document.getElementById('danmaku-kakashi-root');
    setIsPopupOpen(true); // return to popup page
    rootElement.style.height = '600px';
    rootElement.style.maxHeight = '600px';
  };

  return (
    <ThemeProvider theme={darkTheme}>
    <div>
    {!isPopupOpen ? (
      <Button variant="contained" onClick={handleLogoClick} style={{width:'100%', borderRadius:'18px', 
      backgroundColor:'#0e0e0e', border: '2px solid #B61A2B'}}>
      <a style={{ textDecoration: 'none', color: '#f1f1f1', textTransform: 'none', fontSize: '14px'}}>
      ▼ Open Danmaku Selection Panel ▼
      </a> 
      </Button>
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
                <div style={{textAlign: 'left', margin: '8px'}}>
                  <Button variant="contained" color="error">
                    <a target="_blank" rel="noopener noreferrer" onClick={showVideoBox}
                    style={{ textDecoration: 'none', color: 'inherit', textTransform: 'none' }}>
                    &lt;&lt; Return to Match Video
                    </a> 
                  </Button>
                </div>

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
                  <h1 className="dmHeader">Best matches (User)</h1>
                  {bestMatchVideos.length > 0 ? (
                    bestMatchVideos.map((video, index) => (
                      <VideoBox key={index} {...video} onClick={() => handleVideoClick(video)} />
                    ))
                  ) : (
                    <p className='Unfoundtext'>No match found :(</p>
                  )}
                </div>

                <div id="mainControls" style={{ display: "block" }}>
                  <h1 className="dmHeader">Possible matches</h1>
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
  </ThemeProvider>
  );
}

export default App;
