// 初始化默认设置
chrome.runtime.onInstalled.addListener(() => {
    const defaultSettings = {
        hideFeed: true,
        hideTrending: true,
        clearPlaceholder: true,
        hideHeader: true,
        hideSidebarRec: true,
        hideComments: true,
        hideEndingRec: true
    };
    
    chrome.storage.sync.get(defaultSettings, (result) => {
        // 合并默认值和已有设置
        chrome.storage.sync.set({...defaultSettings, ...result});
    });
});
