/* コンテキストメニューがクリックされた時の処理 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case "css_status":
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: css_switch,
            });
            break;
    }
})

// コンテキストメニュー初期化用の関数
const updateContextMenus = async (st) => {
    await chrome.contextMenus.create({
        id: "css_status",
        title: st === 'on' ? chrome.i18n.getMessage('MenuON') : chrome.i18n.getMessage('MenuOFF'),
        contexts: ['all'],
    });
};

const getCurrentTab = async () => {
    let queryOptions = {active: true, lastFocusedWindow: true};
    return await chrome.tabs.query(queryOptions);
}


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    let [tab] = await getCurrentTab()
    if (tab.url?.startsWith("chrome://") === false) {
        if (String(request) === 'on') {
            await chrome.contextMenus.removeAll();
            await updateContextMenus('on');
            await chrome.scripting.insertCSS({
                target: {tabId: tab.id, allFrames: true},
                files: ['adHide.css'],
            })
        } else {
            await chrome.contextMenus.removeAll();
            await updateContextMenus('off');
            await chrome.scripting.removeCSS({
                target: {tabId: tab.id, allFrames: true},
                files: ['adHide.css'],
            })
        }
    }
});




const css_switch = async () => {

    let ytp_do_skip = {
        'video_id': '',
        'time_slider': 0,
        'time_duration': 0,
        'css_off': 'off'
    }

    let ytp_do_skip_st = JSON.parse(localStorage.getItem('ytp_do_skip'));

    if (!ytp_do_skip_st) {
        localStorage.setItem('ytp_do_skip', JSON.stringify(ytp_do_skip));
        ytp_do_skip_st = ytp_do_skip;
    }
    if (ytp_do_skip_st.css_off !== 'on') {
        let tmp = {...ytp_do_skip_st, 'css_off': 'on'};
        localStorage.setItem('ytp_do_skip', JSON.stringify(tmp));
        chrome.runtime.sendMessage('on')
    } else {
        let tmp = {...ytp_do_skip_st, 'css_off': 'off'};
        localStorage.setItem('ytp_do_skip', JSON.stringify(tmp));
        chrome.runtime.sendMessage('off')
    }
}

chrome.runtime.onInstalled.addListener(async () => {
    await updateContextMenus()
});