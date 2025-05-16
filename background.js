/* コンテキストメニューがクリックされた時の処理 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "css_status") {
        await css_switch(tab);
    }
});


// コンテキストメニュー初期化用の関数
const updateContextMenus = async (st) => {
    // 既存のメニューを削除
    await chrome.contextMenus.removeAll();

    // 新しいメニューを作成
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
    if (tab && tab.url !== undefined && tab.url.startsWith("chrome://") === false) {
        if (String(request) === 'on') {
            await chrome.contextMenus.removeAll();
            await updateContextMenus('on');
            await chrome.scripting.insertCSS({
                target: {tabId: tab.id, allFrames: true},
                files: ['adHide.css'],
            });
        } else {
            await chrome.contextMenus.removeAll();
            await updateContextMenus('off');
            await chrome.scripting.removeCSS({
                target: {tabId: tab.id, allFrames: true},
                files: ['adHide.css'],
            });
        }
    }
});


// CSSの有効・無効を切り替える関数
const css_switch = async (tab) => {
    let ytp_do_skip_css_st = await getStorageData('ytp_do_skip_css');

    if (!ytp_do_skip_css_st) {
        ytp_do_skip_css_st = {
            'css_off': 'off'
        };
    }

    // 状態を切り替える
    if (ytp_do_skip_css_st.css_off === 'off') {
        ytp_do_skip_css_st.css_off = 'on';
        await chrome.scripting.insertCSS({
            target: {tabId: tab.id, allFrames: true},
            files: ['adHide.css'],
        });
    } else {
        ytp_do_skip_css_st.css_off = 'off';
        await chrome.scripting.removeCSS({
            target: {tabId: tab.id, allFrames: true},
            files: ['adHide.css'],
        });
    }

    // 変更後の値を保存
    await setStorageData('ytp_do_skip_css', ytp_do_skip_css_st);

    // メニューを更新
    await updateContextMenus(ytp_do_skip_css_st.css_off);
};

const getStorageData = async (key) => {
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
            resolve(result[key]);
        });
    });
};

const setStorageData = async (key, value) => {
    return new Promise((resolve) => {
        chrome.storage.local.set({[key]: value}, () => {
            resolve();
        });
    });
};

chrome.runtime.onInstalled.addListener(async () => {
    let ytp_do_skip_css = {
        'css_off': 'on' // デフォルトでCSSを有効にする
    };

    let ytp_do_skip_css_st = await getStorageData('ytp_do_skip_css');
    if (!ytp_do_skip_css_st) {
        await setStorageData('ytp_do_skip_css', ytp_do_skip_css);
        ytp_do_skip_css_st = ytp_do_skip_css;
    }

    // メニューを更新
    await updateContextMenus(ytp_do_skip_css_st.css_off);

    // 現在のタブにCSSを適用
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (ytp_do_skip_css_st.css_off === 'on' && tab && tab.url && !tab.url.startsWith("chrome://")) {
        await chrome.scripting.insertCSS({
            target: {tabId: tab.id, allFrames: true},
            files: ['adHide.css'],
        });
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    if (changeInfo.status === 'complete' && tab && tab.url && tab.url.includes('youtube.com')) {
        let ytp_do_skip_css_st = await getStorageData('ytp_do_skip_css');
        if (!ytp_do_skip_css_st) {
            ytp_do_skip_css_st = {
                'css_off': 'on' // デフォルトでCSSを有効にする
            };
            await setStorageData('ytp_do_skip_css', ytp_do_skip_css_st);
        }

        if (ytp_do_skip_css_st.css_off === 'on' && !tab.url.startsWith("chrome://")) {
            await chrome.scripting.insertCSS({
                target: {tabId: tab.id, allFrames: true},
                files: ['adHide.css'],
            });
        }
    }
});