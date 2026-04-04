// 尽早注入策略：document_start 时机执行
(function() {
    const STYLE_ID = 'bimple-early-style';
    
    // 硬编码默认值（与 background.js 保持一致）
    const DEFAULT_SETTINGS = {
        hideFeed: true,
        hideTrending: true,
        clearPlaceholder: true,
        hideHeader: true,
        hideSidebarRec: true,
        hideComments: true,
        hideEndingRec: true
    };
    
    // ===== 阶段 1: 立即隐藏（同步执行，最小延迟）=====
    function createStyleElement() {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        return style;
    }
    
    function injectToHead(style) {
        if (document.head) {
            document.head.appendChild(style);
            return true;
        }
        return false;
    }
    
    // 根据设置生成 CSS（立即隐藏所有应隐藏的元素）
    function generateHideCSS(settings) {
        const selectors = [];
        
        if (settings.hideFeed) {
            selectors.push(
                '.bili-feed4 > :not(.bili-header)',
                '.bili-header > :not(.bili-header__bar, .bili-header__banner)',
                '.left-entry'
            );
        }
        if (settings.hideTrending) {
            selectors.push('.center-search-container .trending', '.trending');
        }
        if (settings.hideHeader) {
            selectors.push('#biliMainHeader');
        }
        if (settings.hideSidebarRec) {
            selectors.push(
                '.right-container-inner > :not(:first-child):not(:has(.video-pod))',
                '.right-container-inner > :not(:first-child) > :not(.video-pod)',
                '.recommend-list-container'
            );
        }
        if (settings.hideComments) {
            selectors.push('#commentapp');
        }
        if (settings.hideEndingRec) {
            selectors.push('.bpx-player-ending-related');
        }
        
        if (selectors.length === 0) return '';
        
        // 使用 content-visibility 优化性能，visibility 防止闪烁
        return selectors.join(',\n') + ` {
            content-visibility: hidden !important;
            visibility: hidden !important;
        }`;
    }
    
    // 立即使用默认设置注入（确保零延迟）
    const earlyStyle = createStyleElement();
    earlyStyle.textContent = generateHideCSS(DEFAULT_SETTINGS);
    
    if (!injectToHead(earlyStyle)) {
        // head 还不存在，监听 documentElement
        const observer = new MutationObserver((_, obs) => {
            if (document.head) {
                document.head.appendChild(earlyStyle);
                obs.disconnect();
            }
        });
        observer.observe(document.documentElement, { childList: true });
    }
    
    // ===== 阶段 2: 异步读取用户设置并精细调整 =====
    
    // 生成最终 CSS（display:none 更高效）
    function generateFinalCSS(settings) {
        const hideSelectors = [];
        const showSelectors = [];
        
        // 首页
        const feedSelectors = [
            '.bili-feed4 > :not(.bili-header)',
            '.bili-header > :not(.bili-header__bar, .bili-header__banner)',
            '.left-entry'
        ];
        const trendingSelectors = ['.center-search-container .trending', '.trending'];
        
        // 视频页
        const headerSelectors = ['#biliMainHeader'];
        const sidebarSelectors = [
            '.right-container-inner > :not(:first-child):not(:has(.video-pod))',
            '.right-container-inner > :not(:first-child) > :not(.video-pod)',
            '.recommend-list-container'
        ];
        const commentSelectors = ['#commentapp'];
        const endingSelectors = ['.bpx-player-ending-related'];
        
        // 分类处理
        if (settings.hideFeed) hideSelectors.push(...feedSelectors);
        else showSelectors.push(...feedSelectors);
        
        if (settings.hideTrending) hideSelectors.push(...trendingSelectors);
        else showSelectors.push(...trendingSelectors);
        
        if (settings.hideHeader) hideSelectors.push(...headerSelectors);
        else showSelectors.push(...headerSelectors);
        
        if (settings.hideSidebarRec) hideSelectors.push(...sidebarSelectors);
        else showSelectors.push(...sidebarSelectors);
        
        if (settings.hideComments) hideSelectors.push(...commentSelectors);
        else showSelectors.push(...commentSelectors);
        
        if (settings.hideEndingRec) hideSelectors.push(...endingSelectors);
        else showSelectors.push(...endingSelectors);
        
        let css = '';
        
        // 需要显示的：恢复 visibility
        if (showSelectors.length > 0) {
            css += showSelectors.join(',\n') + ` {
                content-visibility: visible !important;
                visibility: visible !important;
            }\n`;
        }
        
        // 需要隐藏的：使用 display:none（更高效）
        if (hideSelectors.length > 0) {
            css += hideSelectors.join(',\n') + ` {
                display: none !important;
            }`;
        }
        
        return css;
    }
    
    // 应用最终样式
    function applyFinalStyles(settings) {
        const styleEl = document.getElementById(STYLE_ID);
        if (styleEl) {
            styleEl.textContent = generateFinalCSS(settings);
        }
    }
    
    // 清除搜索框占位符
    function applyPlaceholderSetting(enabled) {
        if (!enabled) return;
        
        const clearPlaceholder = () => {
            const input = document.querySelector('.nav-search-input');
            if (!input) return;
            
            // 立即清除
            input.setAttribute('placeholder', '');
            
            // 监听变化
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.attributeName === 'placeholder' && input.placeholder !== '') {
                        input.setAttribute('placeholder', '');
                    }
                });
            });
            observer.observe(input, { attributes: true });
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', clearPlaceholder);
        } else {
            clearPlaceholder();
        }
    }
    
    // 初始化：读取存储并调整
    async function init() {
        try {
            const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
            applyFinalStyles(settings);
            applyPlaceholderSetting(settings.clearPlaceholder);
        } catch (e) {
            // 保持默认隐藏状态
            console.error('bimple: failed to load settings', e);
        }
    }
    
    // 监听设置更新
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'settingsUpdated') {
            init();
        }
    });
    
    // 启动
    init();
})();
