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
    let css_off_ytp_do_skip = localStorage.getItem('css_off_ytp_do_skip');
    if (css_off_ytp_do_skip !== 'on') {
        localStorage.setItem('css_off_ytp_do_skip', 'on')
        chrome.runtime.sendMessage('on')
    } else {
        localStorage.setItem('css_off_ytp_do_skip', 'off')
        chrome.runtime.sendMessage('off')
    }
}

chrome.runtime.onInstalled.addListener(async () => {
    await updateContextMenus()
});