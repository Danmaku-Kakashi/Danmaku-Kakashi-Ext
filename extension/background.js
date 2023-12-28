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
        }, function(response){
            console.log("Got it from React ", response.text);
        });
    }
});