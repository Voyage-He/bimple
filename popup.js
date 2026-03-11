// 默认设置
const defaultSettings = {
    hideFeed: true,
    hideTrending: true,
    clearPlaceholder: true,
    hideHeader: true,
    hideSidebarRec: true,
    hideComments: true,
    hideEndingRec: true
};

// 从 storage 加载设置
document.addEventListener('DOMContentLoaded', async () => {
    const result = await chrome.storage.sync.get(defaultSettings);
    
    // 应用设置到开关
    document.getElementById('hideFeed').checked = result.hideFeed;
    document.getElementById('hideTrending').checked = result.hideTrending;
    document.getElementById('clearPlaceholder').checked = result.clearPlaceholder;
    document.getElementById('hideHeader').checked = result.hideHeader;
    document.getElementById('hideSidebarRec').checked = result.hideSidebarRec;
    document.getElementById('hideComments').checked = result.hideComments;
    document.getElementById('hideEndingRec').checked = result.hideEndingRec;
});

// 保存设置
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', async () => {
        const settings = {
            hideFeed: document.getElementById('hideFeed').checked,
            hideTrending: document.getElementById('hideTrending').checked,
            clearPlaceholder: document.getElementById('clearPlaceholder').checked,
            hideHeader: document.getElementById('hideHeader').checked,
            hideSidebarRec: document.getElementById('hideSidebarRec').checked,
            hideComments: document.getElementById('hideComments').checked,
            hideEndingRec: document.getElementById('hideEndingRec').checked
        };
        
        await chrome.storage.sync.set(settings);
        
        // 通知当前标签页刷新样式
        const tabs = await chrome.tabs.query({url: 'https://*.bilibili.com/*'});
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {action: 'settingsUpdated'}).catch(() => {
                // 忽略未响应的标签页错误
            });
        });
    });
});
