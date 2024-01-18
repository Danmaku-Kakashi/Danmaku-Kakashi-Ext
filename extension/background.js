chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const videoId = urlParameters.get('v');

    console.log('YouTube Video URL Detected:', videoId);
    chrome.tabs.sendMessage(tabId, {
      type: 'youtubeid',
      vid: videoId,
    }, function (response) {
      if (response)
        console.log("Got it from React ", response.text);
    });
  }
});

// Download thumbnail image and send to React
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.type === 'GET_THUMBNAIL') {
      fetch(request.url, {
        method: 'GET',
        headers: {
          'Referer': ''
        }
      })
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = function () {
            // Send the base64 encoded image
            sendResponse({thumbnail: reader.result});
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => console.error('Error fetching thumbnail:', error));
      return true; // Indicates that the response will be sent asynchronously
    }

    // Get Search Text from content search by bilibili api and send back result
    if (request.type === 'SEARCH') {
      console.log("Request: ", request);
      
      fetch('https://api.bilibili.com/x/web-interface/wbi/search/all/v2?keyword=' + request.query,
        {
          method: 'GET',
          credentials: 'include'
        })
        .then(response => response.json())
        .then(response => {    if (request.type === 'DOWNLOAD_DANMAKU') {
          console.log("Got danmaku download request: ", request);
          fetch(request.url, {
            method: 'GET',
            headers: {
              'Referer': 'no-referer'
            }
          })
            .then(response => response.blob())
            .then(blob => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = function () {
                // Send the dataurl encoded danmaku xml
                sendResponse({danmakuxml: reader.result});
              };
            })
            .catch(error => console.error('Error downloading danmaku:', error));
          return true; // Indicates that the response will be sent asynchronously
        }
          console.log("Response: ", response);
          sendResponse({videosResult: response});
        })
        .catch(error => {
          console.error('Error fetching thumbnail:', error)
          sendResponse({error: "Failed to fetch data"});
        });
      return true;
    }

    if (request.type === 'GET_VIDEO_DANMAKU') {
      console.log("Request: ", request);
      console.log("https://api.bilibili.com/x/player/pagelist?bvid=", request.bvid);
      fetch('https://api.bilibili.com/x/player/pagelist?bvid=' + request.bvid,
        {
          method: 'GET',
          credentials: 'include'
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data && data.data && data.data.length > 0) {
              return data.data[0].cid; 
          }
          throw new Error('No data found');
        })
        .then(cid => {
          console.log("Response3: ", cid);
          sendResponse({videocid: cid});
        })
        .catch(error => {
          console.error('Error fetching cid:', error)
          sendResponse({error: "Failed to fetch data"});
        });
      return true;
    }

    if (request.type === 'DOWNLOAD_DANMAKU') {
      console.log("Got danmaku download request: ", request);
      fetch(request.url, {
        method: 'GET',
        headers: {
          'Referer': 'no-referer'
        }
      })
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = function () {
            // Send the dataurl encoded danmaku xml
            sendResponse({danmakuxml: reader.result});
          };
        })
        .catch(error => console.error('Error downloading danmaku:', error));
      return true; // Indicates that the response will be sent asynchronously
    }

    if (request.type === 'FETCH_GENERAL') {
      console.log("Fetch Request: ", request);
      fetch(request.url, 
        {
          method: request.method,
          credentials: 'include',
          headers: request.headers
        })
        .then(response => response.json())
        .then(response => {
          console.log("Fetch Response: ", response);
          sendResponse({result: response});
        })
        .catch(error => {
          console.error('Error fetching data:', error)
          sendResponse({error: "Failed to fetch data"});
        });
      return true;
    }
  }
);
