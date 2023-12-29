chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    console.log(urlParameters);
    const videoId = urlParameters.get('v');

    console.log('YouTube Video URL Detected:', videoId);
    chrome.tabs.sendMessage(tabId, {
      type: 'youtubeid',
      vid: videoId,
    }, function (response) {
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
          'Referer': 'no-referer'
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
      console.log("Search Text: ", request.query);
      const str = encodeURI(request.query);
      fetch('https://api.bilibili.com/x/web-interface/wbi/search/all/v2?keyword=' + str,
        {
          method: 'GET',
          credentials: 'include'
        })
        .then(response => response.json())
        .then(response => {
          console.log("Response: ", response);
          sendResponse({videosResult: response});
        })
        .catch(error => {
          console.error('Error fetching thumbnail:', error)
          sendResponse({error: "Failed to fetch data"});
        });
      return true;
    }
  }
);



// // Test fetch
// fetch('https://api.bilibili.com/x/web-interface/wbi/search/all/v2?keyword=', {method: 'GET', credentials: 'include'})
// .then(response => response.json())
// .then(data => console.log(data))
// .catch(error => console.error('Error fetching thumbnail:', error));

// const str = encodeURI("")
// fetch('https://api.bilibili.com/x/web-interface/wbi/search/all/v2?keyword='+str, 
// {
//     method: 'GET',
//     credentials: 'include'
// })
// .then(response => console.log(response.json()))
// .then(data => console.log(data))
// .catch(error => console.error('Error fetching thumbnail:', error));
