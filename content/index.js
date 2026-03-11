// 动态样式注入和管理
(function() {
    const STYLE_ID = 'bimple-dynamic-style';
    
    // 各功能对应的 CSS 规则
    const cssRules = {
        // 首页 - 隐藏推荐内容
        hideFeed: `
            .bili-feed4 > :not(.bili-header),
            .bili-header > :not(.bili-header__bar, .bili-header__banner),
            .left-entry {
                display: none !important;
            }
        `,
        // 首页/搜索页 - 隐藏搜索热点
        hideTrending: `
            .center-search-container .trending,
            .trending {
                display: none !important;
            }
        `,
        // 视频页 - 隐藏顶部 Header
        hideHeader: `
            #biliMainHeader {
                display: none !important;
            }
        `,
        // 视频页 - 隐藏侧边推荐
        hideSidebarRec: `
            .right-container-inner > :not(:first-child, :has(#multi_page)),
            #multi_page ~ * {
                display: none !important;
            }
        `,
        // 视频页 - 隐藏评论区
        hideComments: `
            .left-container-under-player > :not(:first-child) {
                display: none !important;
            }
        `,
        // 视频页 - 隐藏播放完成推荐
        hideEndingRec: `
            .bpx-player-ending-related {
                display: none !important;
            }
        `
    };
    
    // 应用设置到样式
    function applyStyles(settings) {
        let styleEl = document.getElementById(STYLE_ID);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = STYLE_ID;
            document.head.appendChild(styleEl);
        }
        
        let css = '';
        for (const [key, rule] of Object.entries(cssRules)) {
            if (settings[key]) {
                css += rule + '\n';
            }
        }
        styleEl.textContent = css;
    }
    
    // 清除搜索框占位符
    function applyPlaceholderSetting(enabled) {
        if (!enabled) return;
        
        const targetNode = document.getElementsByClassName("nav-search-input")[0];
        if (!targetNode) return;
        
        // 立即清除
        targetNode.setAttribute("placeholder", "");
        
        // 监听并防止恢复
        const observer = new MutationObserver((mutationList) => {
            for (const mutation of mutationList) {
                if (mutation.type === "attributes" && mutation.attributeName === "placeholder") {
                    const currentPlaceholder = targetNode.getAttribute("placeholder");
                    if (currentPlaceholder !== "") {
                        targetNode.setAttribute("placeholder", "");
                    }
                }
            }
        });
        
        observer.observe(targetNode, { attributes: true });
    }
    
    // 加载并应用设置
    async function init() {
        const defaultSettings = {
            hideFeed: true,
            hideTrending: true,
            clearPlaceholder: true,
            hideHeader: true,
            hideSidebarRec: true,
            hideComments: true,
            hideEndingRec: true
        };
        
        const settings = await chrome.storage.sync.get(defaultSettings);
        applyStyles(settings);
        applyPlaceholderSetting(settings.clearPlaceholder);
    }
    
    // 监听设置更新
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'settingsUpdated') {
            init();
        }
    });
    
    // 初始化
    init();
})();
