// try {
//     chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//       // 检查 URL 是否已更改且包含 YouTube 视频
//       if (changeInfo.url && changeInfo.url.includes('youtube.com/watch?v=')) {
//         console.log('YouTube Video URL Detected:', changeInfo.url);
  
//         // 发送 URL 到 React 应用
//         chrome.runtime.sendMessage({ type: 'NEW_YOUTUBE_URL', url: changeInfo.url });
//       }
//     });
//   } catch (e) {
//     console.error('Error in background script:', e);
//   }

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