import {useState, useEffect} from 'react'
import { useTranslation } from 'react-i18next';
import { useAccessToken } from './AccessTokenContext';
import './content/App.css';
import * as React from 'react';
import Button from '@mui/material/Button';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import IconButton from '@mui/material/IconButton';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CustomizedInputBase from './content/searchBar.js';
import Modal from './content/Modal.js';
import VideoBox from './content/VideoBox.js';
import UserInfo from './content/UserInfo.js';
import appendDanmakuControl from './content/DamakuPanel.js';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = React.useState(i18n.language);
  // const { t } = useTranslation();
  const { accessToken, setAccessToken } = useAccessToken();

  const Logo = chrome.runtime.getURL("icons/logo.png");
  const LogoIcon = chrome.runtime.getURL("icons/logoicon.png");

  const [searchMatchVideos, setSearchMatchVideos] = useState([]);
  const [showMainControls, setShowMainControls] = useState(true);
  const [searchError, setSearchError] = useState(false);
  const handleSearchTrigger = (searchInput) => {
    setShowMainControls(false);
    chrome.runtime.sendMessage({ type: 'SEARCH', query: encodeURI(searchInput) }, (response) => {
      if (response.error) {
        console.error('Error:', response.error);
        // check the error message, if it is not logged in, then set search error to true
        if (response.error === 'Not logged in') {
          setSearchError(true);
        }
        return;
      }
      const searchMatch = response.videosResult.data.result.find(section => section.result_type === "video").data;
      // check if the numbers of video is 0 then check user login status
      // if (searchMatch.length === 20) {
      //   console.log('No match found');
      //   checkLogin().then((isLoggedIn) => {
      //     if (!isLoggedIn) {
      //       console.log('User is not logged in2');
      //       setSearchError(true);
      //     }
      //   });
      //   return;
      // }
      searchMatch.forEach((video) => {
        if (video.pic.startsWith('//'))
          video.pic = video.pic.replace('//', 'https://');
      });
      searchMatch.forEach((video) => {
        video.title = video.title.replace(/<em class="keyword">([\s\S]*?)<\/em>/g, '$1');
      });
      setSearchMatchVideos(searchMatch); //Get Search Result list
      setSearchError(false); // Reset search error
      // setSearchError(true); // for testing
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
        // console.log('Danmaku URL:', danmakuUrl);  // return danmaku url
        window.addDanmakuSource(danmakuUrl);
        // console.log("Tried to send Danmaku Source to player.");
      });
      setIsModalOpen(false);  // close popup page model
    }
  };

  
  const uploadVideo = (video) => {
    let VideoData = {};
    //check if video contain the arcrank key
    let cur_video = video;
    // console.log('Video:', cur_video);
    // console.log('accessTokens:', accessToken);
    const updateVideoData = new Promise((resolve, reject) => {
      if ('cover' in video) {
        // console.log('Video contains view key');
        VideoData = {
          ...cur_video,
          youtubeid: youtubeUrl,
        };
        resolve(VideoData);
      } else {
        // console.log('Video does not contain view key');
        chrome.runtime.sendMessage({ type: 'UPDATE_BEST_MATCH', bvid: video.bvid }, (response) => {
          if (response.error) {
            console.error('Error:', response.error);
            reject(response.error);
            return;
          }
          cur_video = response;
          if (cur_video.video.pic.startsWith('//'))
            cur_video.video.pic = cur_video.video.pic.replace('//', 'https://');
          // console.log('Video best:', cur_video);
          VideoData = {
            ...cur_video.video,
            youtubeid: youtubeUrl,
            access: accessToken,
    };
          
          // console.log('VideoData best:', VideoData);
          resolve(VideoData);
        });
      }
    });

    updateVideoData.then(VideoData => {
      // console.log('VideoData:', VideoData);
      fetch(process.env.REACT_APP_API_BASE_URL + '/create/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && {'Authorization': accessToken}), // Add access token to headers if it exists
      },
        body: JSON.stringify(VideoData),
      })
      .then(response => response.json())
      .then(data => {console.log(data)})
      .catch((error) => console.error('Error:', error));
    });
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
    let intervalId = null;
    if (youtubeUrl){
      const url = process.env.REACT_APP_API_BASE_URL + `/api/videos/?youtubeid=${youtubeUrl}`;
      newVideo();
      fetch(url)  // Django API
        .then(response => response.json())
        .then(data => {
          data.sort((a, b) => b.numused - a.numused); // sort by numused
          setBestMatchVideos(data);  // return videolist
        })
        .catch(error => console.error('Error:', error));
    }
    if (youtubeUrl){
      intervalId = setInterval(() => {
        const titleElement = document.querySelector('yt-formatted-string.style-scope.ytd-watch-metadata');
        if (titleElement) {
          const title = titleElement.innerText || titleElement.textContent; // Use innerText or textContent based on which is available
          clearInterval(intervalId); // Clear the interval once the title is found
          
          chrome.runtime.sendMessage({ type: 'SEARCH', query: title}, (response) => {
            if (response.error) {
              console.error('Error:', response.error);
              return;
            }
            const searchMatch1 = response.videosResult.data.result.find(section => section.result_type === "video").data;
            // check if video's danmaku number is 0 or not, if so, delete it from the list
            const searchMatch = searchMatch1.filter(video => video.danmaku !== 0);
            searchMatch.forEach((video) => {
              if (video.pic.startsWith('//'))
                video.pic = video.pic.replace('//', 'https://');
            });
            searchMatch.forEach((video) => {
              video.title = video.title.replace(/<em class="keyword">([\s\S]*?)<\/em>/g, '$1');
            });
            setPossibleMatchVideos(searchMatch); //Get Search Result list
          });
        }
      }, 1000); // Check every 1000 milliseconds (1 second)
    }

    // const handlePossibleMatch = (youtubeUrl) => {
    //   chrome.runtime.sendMessage({ type: 'SEARCH', query: youtubeUrl.vid }, (response) => {
    //     if (response.error) {
    //       console.error('Error:', response.error);
    //       return;
    //     }
    //     const searchMatch1 = response.videosResult.data.result.find(section => section.result_type === "video").data;
    //     // check if video's danmaku number is 0 or not, if so, delete it from the list
    //     const searchMatch = searchMatch1.filter(video => video.danmaku !== 0);
    //     searchMatch.forEach((video) => {
    //       if (video.pic.startsWith('//'))
    //         video.pic = video.pic.replace('//', 'https://');
    //     });
    //     searchMatch.forEach((video) => {
    //       video.title = video.title.replace(/<em class="keyword">([\s\S]*?)<\/em>/g, '$1');
    //     });
    //     setPossibleMatchVideos(searchMatch); //Get Search Result list
    //   });
    // };

    const handleNewUrl = (message, sender, sendResponse) => {
      setShowMainControls(true); // when new url, return to main controls
      if (message.type === 'youtubeid') {
          if (message.vid === youtubeUrl) {
            return;
          }
          // get lang from message and update i18n
          let lang = message.lang;
          // console.log('Received Language1:', lang);
          // check if lang is not start with zh, then change it to en
          if (lang.startsWith('zh')) {
            lang = 'zh';
          } else {
            lang = 'en';
          }
          i18n.changeLanguage(lang);
          setLang(lang);

          setYoutubeUrl(message.vid); // Update new YouTube URL
          console.log('Received YouTube URL:', message.vid);
          var response_text = message.vid + ' received by React';
          sendResponse({text: response_text});
          return true;
      }
    };
  
      // Add Chrome message listener
    chrome.runtime.onMessage.addListener(handleNewUrl);
    // chrome.runtime.onMessage.addListener(handlePossibleMatch);
  
      // Clean up Chrome message listener
    return () => {
        clearInterval(intervalId);
        chrome.runtime.onMessage.removeListener(handleNewUrl);
        // chrome.runtime.onMessage.removeListener(handlePossibleMatch);
    };

  }, [youtubeUrl]);
   
  const newVideo = async() => {
    const DanmuControl = document.getElementsByClassName("DanmuControl")[0];

    if (!DanmuControl) {
      const DanmuBtn = document.createElement("img");
      DanmuBtn.src = LogoIcon;
      DanmuBtn.className = "ytp-button DanmuControl";
      DanmuBtn.id = "DanmakuControlBtn";
      DanmuBtn.title = "Hover to open danmaku control panel";
      DanmuBtn.style.transition = "all 0.5s ease-out";
      DanmuBtn.style.cursor = "pointer";
  
      const checkExist = setInterval(function() {
        const youtubeRightControls = document.getElementsByClassName("ytp-right-controls")[0];
        if (youtubeRightControls) {
          clearInterval(checkExist);
          
          // create danmaku control panel and append to youtubeRightControls
          const DanmuPanel = appendDanmakuControl(youtubeRightControls, DanmuBtn);

          DanmuBtn.addEventListener("click", OpenDanmakuControlHandler);
  
          // setup hover event
          DanmuBtn.addEventListener("mouseenter", () => {
            DanmuPanel.style.display = "block"; 
          });
          DanmuBtn.addEventListener("mouseleave", () => {
            DanmuPanel.style.display = "none";
          });

          DanmuPanel.addEventListener("mouseenter", () => {
            DanmuPanel.style.display = "block";
          });
          DanmuPanel.addEventListener("mouseleave", () => {
            DanmuPanel.style.display = "none";
          });
  
        }
      }, 100); // check every 100ms
    }
  };

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

  const [bestMatchVideoExpanded, setBestMatchVideoExpanded] = useState(true);
  const handleBestMatchVideoExpand = () => {
    setBestMatchVideoExpanded(!bestMatchVideoExpanded);
  };
  
  const [possibleMatchVideoExpanded, setPossibleMatchVideoExpanded] = useState(true);
  const handlePossibleMatchVideoExpand = () => {
    setPossibleMatchVideoExpanded(!possibleMatchVideoExpanded);
  };

  return (
    <ThemeProvider theme={darkTheme}>
    <div>
      <Button variant="contained" onClick={handleLogoClick} style={{width:'100%', borderRadius:'18px', 
      backgroundColor:'#0e0e0e', border: '2px solid #BF360C', display: isPopupOpen? 'none' : 'block' }}>
      <a style={{ textDecoration: 'none', color: '#f1f1f1', textTransform: 'none', fontSize: '14px'}}>
      {t('▼ Open Danmaku Selection Panel ▼')}
      </a> 
      </Button>
      <div id="DanMuPopup" className="DanMuPageBody dm-preload" style={{ display: isPopupOpen ? 'block' : 'none' }}>
          <UserInfo />
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
                    &lt;&lt; {t('Return to Match Video')}
                    </a> 
                  </Button>
                </div>

                <div id="mainControls" style={{ display: "block" }}>
                  <h1 className="dmHeader">{t('Search Results')}</h1>
                  {searchMatchVideos.length > 0 ? (
                    searchMatchVideos.map((video, index) => (
                      <VideoBox key={index} {...video} onClick={() => handleVideoClick(video)} />
                    ))
                  ) : (
                    // check if search error, if so, show error message
                    searchError ? (
                      // Display error message with a link to login
                      <p className='Unfoundtext'>
                        {t('Bilibili Not Login')} 
                        <a href="https://www.bilibili.com" target="_blank" rel="noopener noreferrer">
                          {t('Bilibili Login')}
                        </a>
                      </p>
                    ) : (
                      <p className='Unfoundtext'>{t('No match found :(')}</p>
                    )
                  )}
                </div>
              </div>
            ) : (

              <div> 
                {bestMatchVideoExpanded ? (
                  <div id="mainControls" style={{ display: "block" }}>
                    <h1 className="dmHeader">{t('Best matches (Used by other Users)')}</h1>
                    <a onClick={handleBestMatchVideoExpand} 
                    style={{ textDecoration: 'none', color: '#f1f1f1', textTransform: 'none', fontSize: '10px', position: 'relative', left: '90%', top: '-24px'}}>
                    {t('Hide')}
                    </a>
                    {bestMatchVideos.length > 0 ? (
                      bestMatchVideos.map((video, index) => (
                        <VideoBox key={index} {...video} onClick={() => handleVideoClick(video)} />
                      ))
                    ) : (
                      <p className='Unfoundtext'>{t('No match found :(')}</p>
                    )}
                  </div>
                ) : (
                  <Button variant="contained" onClick={handleBestMatchVideoExpand} style={{width:'96%', marginBottom: '1%',
                    backgroundColor:'#0e0e0e', border: '2px solid #B61A2B'}}>
                    <a style={{ textDecoration: 'none', color: '#f1f1f1', textTransform: 'none', fontSize: '14px'}}>
                    {t('Best Show')}
                    </a> 
                  </Button>
                )}

                {possibleMatchVideoExpanded ? (
                  <div id="mainControls" style={{ display: "block" }}>
                    <h1 className="dmHeader">{t('Possible matches')}</h1>
                    <a onClick={handlePossibleMatchVideoExpand} 
                    style={{ textDecoration: 'none', color: '#f1f1f1', textTransform: 'none', fontSize: '10px', position: 'relative', left: '90%', top: '-24px'}}>
                    {t('Hide')}
                    </a>
                    {possibleMatchVideos.length > 0 ? (
                      possibleMatchVideos.map((video, index) => (
                        <VideoBox key={index} {...video} onClick={() => handleVideoClick(video)} />
                      ))
                    ) : (
                      <p className='Unfoundtext'>{t('No match found :(')}</p>
                    )}
                  </div>
                ) : (
                  <Button variant="contained" onClick={handlePossibleMatchVideoExpand} style={{width:'96%', marginTop: '1%',
                    backgroundColor:'#0e0e0e', border: '2px solid #B61A2B'}}>
                    <a style={{ textDecoration: 'none', color: '#f1f1f1', textTransform: 'none', fontSize: '14px'}}>
                    {t('Possible Show')}
                    </a> 
                  </Button>
                )}
              </div>
            )}
    </div>
  </div>
  </ThemeProvider>
  );
}

export default App;
