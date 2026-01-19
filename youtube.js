let time_slider = 0;
let time_duration = 0;
const back_url = 'https://youtu.be/';
let ytp_do_skip = {
    'video_id': '',
    'time_slider': 0,
    'time_duration': 0,
    'css_off': 'off'
}
let ytp_do_skip_st = {};
let tmp = {};
let params_obj = {};
let isReloading = false; // リロード中フラグ

// 履歴保持用のキュー（最大5秒分）
let historyQueue = [];
try {
    historyQueue = JSON.parse(sessionStorage.getItem('ytp_history_queue') || '[]');
} catch (e) {
    console.warn('Failed to parse historyQueue from sessionStorage:', e);
}

// 拡張機能のコンテキストが有効かチェックする関数
const isContextValid = () => {
    return !!(chrome.runtime && chrome.runtime.id);
};

// フルスクリーンフラグの初期化
const restoreFullscreen = async () => {
    if (!isContextValid()) return;
    // iframe内（広告プレーヤーなど）では実行しない
    if (window.self !== window.top) {
        console.log('Skipping fullscreen restoration in iframe.');
        return;
    }
    
    // 状態監視自体は両方行うが、復元リクエスト（ytp_os_fullscreen_request）は
    // 元が YTPフルスクリーンであっても「リロード時にはOSフルスクリーンとして復帰」するために
    // 保存時に集約する。
    const data = await chrome.storage.local.get(['ytp_fullscreen_request', 'ytp_os_fullscreen_request']);
    // YTPまたはOSいずれかがフルスクリーンなら、OSフルスクリーンとして復元を試みる
    const isOsFullscreenSaved = data.ytp_os_fullscreen_request === 'true' || data.ytp_fullscreen_request === 'true';
    const isFullscreenSaved = data.ytp_fullscreen_request === 'true'; // YTPの状態（ログ用など）

    if (isOsFullscreenSaved) {
        console.log('OS Fullscreen restoration requested. (Original YTP:', isFullscreenSaved, ')');
        
        // ユーザーイベントを待たずに background 経由でウィンドウをフルスクリーン化
        const immediateWindowRestore = () => {
            console.log('Attempting immediate window fullscreen restoration via background script...');
            try {
                chrome.runtime.sendMessage({ type: 'SET_WINDOW_FULLSCREEN', fullscreen: true });
            } catch (e) {
                console.error('Failed to send SET_WINDOW_FULLSCREEN message:', e);
            }
        };
        immediateWindowRestore();

        // 自動試行：OSフルスクリーン（要素レベル）の復元を試みる
        const immediateRestore = async () => {
            try {
                // 自動試行での requestFullscreen はブラウザに拒否される可能性が高いが、
                // リロード直後かつ前ページのユーザー操作が有効な場合に備えて一応実行
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen().catch(e => {
                        console.log('Immediate requestFullscreen failed (expected):', e.message);
                    });
                }
            } catch (e) {
                // Ignore
            }
        };
        immediateRestore();

        const tryRestore = () => {
            if (tryRestore._isRunning) return false;
            tryRestore._isRunning = true;
            try {
                // OSレベルのフルスクリーン（ウィンドウ含む）をチェック
                const isOsFs = !!document.fullscreenElement;
                
                // background 側がウィンドウをフルスクリーンにしている可能性もあるため、
                // 厳密には document.fullscreenElement 以外も考慮したいが、
                // JS側から取れる確実な復元完了の指標はこれ。
                
                if (isOsFs) {
                    console.log('OS Fullscreen state detected.');
                    console.log('Target fullscreen state restored.');
                    removeListeners();
                    return true;
                }
                return false; 
            } finally {
                tryRestore._isRunning = false;
            }
        };

        // 状態監視
        let attempts = 0;
        const interval = setInterval(() => {
            if (tryRestore() || attempts > 60) {
                clearInterval(interval);
            }
            attempts++;
        }, 1000);

        const oneTimeRestore = async (event) => {
            if (event && event._isYtpDoSkip) return;
            
            // 複数のイベントが同時に発生する場合のガード
            if (oneTimeRestore._isProcessing) return;
            
            // ユーザー操作イベントの場合に requestFullscreen を試みる
            if (!(event.type === 'pointerdown' || event.type === 'click' || event.type === 'mousedown' || event.type === 'keydown')) {
                return;
            }

            console.log('User event detected:', event.type, '. Attempting OS fullscreen restoration.');
            oneTimeRestore._isProcessing = true;

            try {
                // ウィンドウ全体のフルスクリーンをまず要求 (OSレベル)
                if (isOsFullscreenSaved && !document.fullscreenElement) {
                    console.log('Requesting window fullscreen via background script...');
                    chrome.runtime.sendMessage({ type: 'SET_WINDOW_FULLSCREEN', fullscreen: true });
                    await new Promise(r => setTimeout(r, 200));
                }

                // すでにフルスクリーンなら requestFullscreen は呼ばない
                if (!document.fullscreenElement) {
                    console.log('Attempting requestFullscreen on documentElement');
                    try {
                        await document.documentElement.requestFullscreen();
                        console.log('OS Fullscreen restored via documentElement');
                    } catch (e) {
                        console.warn('documentElement.requestFullscreen failed:', e.message);
                        
                        // フォールバック：プレーヤー要素で試す
                        const player = document.querySelector('#movie_player');
                        if (player && !document.fullscreenElement) {
                            console.log('Attempting requestFullscreen on #movie_player');
                            try {
                                await player.requestFullscreen();
                                console.log('OS Fullscreen restored via #movie_player');
                            } catch (e2) {
                                console.warn('#movie_player.requestFullscreen failed:', e2.message);
                            }
                        }
                    }
                }
                
                // YouTubeプレーヤーレベルのフルスクリーン復元は行わない方針のため、
                // ボタンクリック処理は削除済み。

                // 状態が確定するのを待つ
                await new Promise(r => setTimeout(r, 500));
                if (tryRestore()) {
                    removeListeners();
                }
            } finally {
                oneTimeRestore._isProcessing = false;
            }
        };

        function removeListeners() {
            console.log('Removing fullscreen restoration listeners.');
            document.removeEventListener('click', oneTimeRestore, { capture: true });
            document.removeEventListener('keydown', oneTimeRestore, { capture: true });
            document.removeEventListener('mousedown', oneTimeRestore, { capture: true });
            document.removeEventListener('pointerdown', oneTimeRestore, { capture: true });
            window.removeEventListener('click', oneTimeRestore, { capture: true });
            window.removeEventListener('mousedown', oneTimeRestore, { capture: true });
            
            const player = document.querySelector('#movie_player');
            if (player) {
                player.removeEventListener('click', oneTimeRestore, { capture: true });
                player.removeEventListener('mousedown', oneTimeRestore, { capture: true });
                player.removeEventListener('pointerdown', oneTimeRestore, { capture: true });
            }
            if (typeof playerObserver !== 'undefined') {
                playerObserver.disconnect();
            }
        }

        document.addEventListener('click', oneTimeRestore, { capture: true, passive: false });
        document.addEventListener('keydown', oneTimeRestore, { capture: true, passive: false });
        document.addEventListener('mousedown', oneTimeRestore, { capture: true, passive: false });
        document.addEventListener('pointerdown', oneTimeRestore, { capture: true, passive: false });
        window.addEventListener('click', oneTimeRestore, { capture: true, passive: false });
        window.addEventListener('mousedown', oneTimeRestore, { capture: true, passive: false });

        // YouTubeプレーヤー上でのイベントも確実に拾うために追加
        const setupPlayerListeners = () => {
            const player = document.querySelector('#movie_player');
            if (player) {
                player.addEventListener('click', oneTimeRestore, { capture: true, passive: false });
                player.addEventListener('mousedown', oneTimeRestore, { capture: true, passive: false });
                player.addEventListener('pointerdown', oneTimeRestore, { capture: true, passive: false });
                return true;
            }
            return false;
        };

        let playerObserver;
        if (!setupPlayerListeners()) {
            playerObserver = new MutationObserver(() => {
                if (setupPlayerListeners()) {
                    playerObserver.disconnect();
                }
            });
            playerObserver.observe(document.documentElement, { childList: true, subtree: true });
        }

        // 60秒後にリスナーを削除（もっと長く待つ）
        setTimeout(() => {
            console.log('Fullscreen restoration timeout reached.');
            removeListeners();
        }, 60000);
    } else {
        console.log('No fullscreen restoration requested.');
    }
};
restoreFullscreen();

// フルスクリーン状態の監視
let lastFsUpdateTime = 0;
const updateFullscreenStorage = () => {
    return new Promise((resolve) => {
        if (!isContextValid()) return resolve();
        if (window.self !== window.top) return resolve(); // メインウィンドウのみ更新
        
        // OSレベルのフルスクリーン状態を判定
        // document.fullscreenElement に加え、ブラウザウィンドウが最大化（フルスクリーン）されているかも考慮したいが、
        // JSからは直接ウィンドウ状態を正確に取れないため、backgroundに問い合わせるか、
        // 少なくとも現在のfullscreenElementの状態は保存する。
        const isOsFullscreen = !!document.fullscreenElement;
        const player = document.querySelector('#movie_player');
        const isYtpFullscreen = player ? player.classList.contains('ytp-fullscreen') : false;
        
        console.log('Updating fullscreen storage. OS:', isOsFullscreen, 'YTP:', isYtpFullscreen);
        
        // Windowの状態も取得して保存するようにする（拡張機能のAPIが必要）
        try {
            chrome.runtime.sendMessage({type: 'GET_WINDOW_STATE'}, (response) => {
                const isWindowFullscreen = response && response.state === 'fullscreen';
                const effectiveOsFullscreen = isOsFullscreen || isWindowFullscreen;
                
                try {
                    chrome.storage.local.set({
                        'ytp_fullscreen_request': isYtpFullscreen ? 'true' : 'false',
                        'ytp_os_fullscreen_request': effectiveOsFullscreen ? 'true' : 'false'
                    }, () => {
                        lastFsUpdateTime = Date.now();
                        resolve();
                    });
                } catch (e) {
                    console.error('Failed to set storage:', e);
                    resolve();
                }
            });
        } catch (e) {
            console.error('Failed to send GET_WINDOW_STATE message:', e);
            // メッセージ送信に失敗した場合でも、取得できている範囲で保存する
            chrome.storage.local.set({
                'ytp_fullscreen_request': isYtpFullscreen ? 'true' : 'false',
                'ytp_os_fullscreen_request': isOsFullscreen ? 'true' : 'false'
            }, () => {
                lastFsUpdateTime = Date.now();
                resolve();
            });
        }
    });
};

document.addEventListener('fullscreenchange', updateFullscreenStorage);

// YouTube固有のフルスクリーンクラスを監視
const fsInterval = setInterval(() => {
    if (!isContextValid()) {
        clearInterval(fsInterval);
        return;
    }
    // 直近にイベントで更新されたばかりならスキップ（競合防止）
    if (Date.now() - lastFsUpdateTime < 3000) return;

    const player = document.querySelector('#movie_player');
    if (player) {
        const isOsFullscreen = !!document.fullscreenElement;
        const isYtpFullscreen = player.classList.contains('ytp-fullscreen');
        
        // 保存されている値と異なる場合のみ更新する
        try {
            chrome.storage.local.get(['ytp_fullscreen_request', 'ytp_os_fullscreen_request'], (data) => {
                if (chrome.runtime.lastError) return;
                const savedYtp = data.ytp_fullscreen_request === 'true';
                const savedOs = data.ytp_os_fullscreen_request === 'true';
                
                if (isYtpFullscreen !== savedYtp || isOsFullscreen !== savedOs) {
                    updateFullscreenStorage();
                }
            });
        } catch (e) {
            clearInterval(fsInterval);
        }
    }
}, 2000);

// 履歴保持用の監視
const historyInterval = setInterval(() => {
    if (!isContextValid()) {
        clearInterval(historyInterval);
        return;
    }
    if (window.self !== window.top) return;
    const video = document.querySelector('video');
    const params = new URL(document.location).searchParams;
    const vId = params.get("v");

    if (video && vId && !document.querySelector('.ytp-ad-player-overlay-layout') && !document.querySelector('.ad-interrupting')) {
        const currentTime = Math.floor(video.currentTime);
        const duration = Math.floor(video.duration);

        if (duration > 0) {
            historyQueue.push({
                v: vId,
                t: currentTime,
                d: duration,
                ts: Date.now()
            });
            // 直近5秒分保持
            if (historyQueue.length > 5) {
                historyQueue.shift();
            }
            try {
                sessionStorage.setItem('ytp_history_queue', JSON.stringify(historyQueue));
            } catch (e) {
                console.error('Failed to save history to sessionStorage:', e);
            }
        }
    }
}, 1000);

// 動画終端でのリロード復元チェック
const checkEndRestoration = () => {
    if (window.self !== window.top) return;
    const params = new URL(document.location).searchParams;
    const vId = params.get("v");
    const tParam = params.get("t");

    // 再生位置指定がない、または0秒の場合
    if (vId && (!tParam || tParam === '0' || tParam === '0s')) {
        let history = [];
        try {
            history = JSON.parse(sessionStorage.getItem('ytp_history_queue') || '[]');
        } catch (e) {
            console.warn('Failed to parse historyQueue in checkEndRestoration:', e);
        }
        
        // snapshotの検索：現在の動画IDと一致し、終端（残り15秒以内）に近い最新のものを探す
        const snapshot = [...history].reverse().find(s => s.v === vId && s.t > (s.d - 15));

        if (snapshot && snapshot.v === vId) {
            // 履歴が動画終端付近（終端から15秒以内）かつ、現在の再生位置が0付近の場合
            const video = document.querySelector('video');
            if (video && video.currentTime < 5 && snapshot.t > (snapshot.d - 15)) {
                if (isReloading) return;
                
                // すでにこの動画で復元を実行したかチェック
                const restoredVId = sessionStorage.getItem('ytp_last_end_restored_v');
                if (restoredVId === vId) {
                    console.log('Already restored end for this video, skipping to avoid loop.');
                    return;
                }

                isReloading = true;
                console.log('Restoring from end-of-video reload');
                // リロード前にフルスクリーン状態を保存
                updateFullscreenStorage().then(() => {
                    console.log('Saved fullscreen state before end-of-video reload. Reloading now.');
                    sessionStorage.setItem('ytp_last_end_restored_v', vId);
                    location.replace(back_url + vId + '?t=' + (snapshot.d - 2) + 's');
                });
            }
        }
    }
};

// 初回実行
setTimeout(checkEndRestoration, 2000);


const worker_cache_clear = async () => {
    await navigator.serviceWorker.getRegistrations().then((registrations) => {
        // 登録されているworkerを全て削除する
        for (let registration of registrations) {
            registration.unregister().then(r => null);
        }
    });
    await caches.keys().then((keys) => {
        // キャッシュストレージを全て削除する
        keys.forEach((cacheName) => {
            if (cacheName) {
                caches.delete(cacheName).then(r => null);
            }
        });
    });
}

const observer1 = new MutationObserver(async (b) => {
    if (window.self !== window.top) return;
    params_obj = new URL(document.location).searchParams;
    ytp_do_skip_st = JSON.parse(localStorage.getItem('ytp_do_skip')) || ytp_do_skip;
    
    if (params_obj.get("v")) {
        if (params_obj.get("v") !== ytp_do_skip_st.video_id) {
            tmp = {...ytp_do_skip_st, 'video_id': params_obj.get("v"), 'time_slider': 0};
            localStorage.setItem('ytp_do_skip', JSON.stringify(tmp));
            ytp_do_skip_st = JSON.parse(localStorage.getItem('ytp_do_skip'));
        }

        if (document.querySelectorAll('.ytp-ad-player-overlay-layout').length > 0 || document.querySelector('.ad-interrupting')) {
            if (isReloading) return; // すでにリロード中の場合は何もしない
            isReloading = true;

            // リロード前にフルスクリーン状態を保存
            updateFullscreenStorage().then(async () => {
                console.log('Saved fullscreen state before ad-reload. Proceeding with cache clear and reload.');

                await worker_cache_clear().then(() => {
                    // 広告検知時のリロード
                    // 履歴がある場合はそれを使う
                    let history = [];
                    try {
                        history = JSON.parse(sessionStorage.getItem('ytp_history_queue') || '[]');
                    } catch (e) {
                        console.warn('Failed to parse historyQueue in observer1:', e);
                    }
                    const snapshot = history[history.length - 1];
                    
                    let targetUrl = '';
                    if (snapshot && snapshot.v === params_obj.get("v") && snapshot.t >= 0) {
                        if (snapshot.t >= snapshot.d - 1) {
                             targetUrl = back_url + snapshot.v + '?t=' + (snapshot.d - 2) + 's';
                        } else {
                             targetUrl = back_url + snapshot.v + '?t=' + snapshot.t + 's';
                        }
                    }

                    if (targetUrl) {
                        console.log('Ad detected. Redirecting to: ' + targetUrl);
                        location.replace(targetUrl);
                    } else {
                        console.log('Ad detected. Reloading...');
                        location.reload();
                    }
                })
            });
        } else {
            // 通常再生時の情報更新
            let tmp_duration = '';
            const durationElem = document.querySelectorAll('.ytp-time-duration')[0];
            if (durationElem) {
                tmp_duration = durationElem.innerText;
                let duration_obj = tmp_duration.split(':')
                switch (duration_obj.length) {
                    case 2:
                        time_duration = (Number(duration_obj[0]) * 60) + Number(duration_obj[1]);
                        break;
                    case 3:
                        time_duration = (Number(duration_obj[0]) * 60 * 60) + (Number(duration_obj[1]) * 60) + Number(duration_obj[2]);
                        break;
                }
            }

            let tmp_current = '';
            const currentElem = document.querySelectorAll('.ytp-time-current')[0];
            if (currentElem) {
                tmp_current = currentElem.innerText;
                let current_obj = tmp_current.split(':');
                switch (current_obj.length) {
                    case 2:
                        time_slider = (Number(current_obj[0]) * 60) + Number(current_obj[1]);
                        break;
                    case 3:
                        time_slider = (Number(current_obj[0]) * 60 * 60) + (Number(current_obj[1]) * 60) + Number(current_obj[2]);
                        break;
                }
            }

            tmp = {...ytp_do_skip_st, 'time_slider': time_slider, 'time_duration': time_duration};
            localStorage.setItem('ytp_do_skip', JSON.stringify(tmp));
        }
    } else {
        tmp = {...ytp_do_skip_st, 'video_id': '', 'time_slider': 0, 'time_duration': 0};
        localStorage.setItem('ytp_do_skip', JSON.stringify(tmp));
    }
})

observer1.observe(document.getElementsByTagName('body')[0], {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'className']
});

