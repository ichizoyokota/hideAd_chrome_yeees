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

const observer1 = new MutationObserver(async () => {
    params_obj = new URL(document.location).searchParams;
    ytp_do_skip_st = JSON.parse(localStorage.getItem('ytp_do_skip'));
    if (params_obj !== null && params_obj.video_id !== ytp_do_skip_st.video_id) {
        let tmp = {...ytp_do_skip_st, 'video_id':params_obj.get("v"),  'time_slider': 0};
        localStorage.setItem('ytp_do_skip', JSON.stringify(tmp));
    }

    if (params_obj.get("v")) {
        if (document.querySelectorAll('.ytp-ad-player-overlay-layout').length > 0) {
            await worker_cache_clear().then(() => {
                if (ytp_do_skip_st.time_duration === ytp_do_skip_st.time_slider) {
                    location.replace(back_url + params_obj.video_id + '?t=' + (ytp_do_skip_st.time_duration-3) + 's');
                } else if (ytp_do_skip_st.time_slider > 3) {
                    location.replace(back_url + params_obj.video_id + '?t=' + (ytp_do_skip_st.time_slider-2) + 's');
                } else {
                    location.reload();
                }
            })
        } else {
            ytp_do_skip_st = JSON.parse(localStorage.getItem('ytp_do_skip'));
            if (params_obj.get("t") && time_slider !== Number(params_obj.get("t").replace('s', ''))) {
                time_slider = Number(params_obj.get("t").replace('s', ''));
            }
            let tmp_duration = '';
            tmp_duration = document.querySelectorAll('.ytp-time-duration')[0].innerText
            let duration_obj = tmp_duration.split(':')
            switch (duration_obj.length) {
                case 2:
                    time_duration = (Number(duration_obj[0]) * 60) + Number(duration_obj[1]);
                    break;
                case 3:
                    time_duration = (Number(duration_obj[0]) * 60 * 60) + (Number(duration_obj[1]) * 60) + Number(duration_obj[2]);
                    break;
            }
            let tmp_current = '';
            tmp_current = document.querySelectorAll('.ytp-time-current')[0].innerText;
            let current_obj = tmp_current.split(':');
            switch (current_obj.length) {
                case 2:
                    time_slider = (Number(current_obj[0]) * 60) + Number(current_obj[1]);
                    break;
                case 3:
                    time_slider = (Number(current_obj[0]) * 60 * 60) + (Number(current_obj[1]) * 60) + Number(current_obj[2]);
                    break;
            }
            let time_slider_st = Number(ytp_do_skip_st.time_slider);
            if (time_slider_st !== time_slider && time_slider > 30) {
                tmp = {...ytp_do_skip_st,'time_slider':time_slider};
                localStorage.setItem('ytp_do_skip', JSON.stringify(tmp));
            }
            let time_duration_st = Number(ytp_do_skip_st.time_duration);
            if (time_duration_st !== time_duration) {
                tmp = {...ytp_do_skip_st, 'time_duration': time_duration};
                localStorage.setItem('ytp_do_skip', JSON.stringify(tmp));
            } else {
                time_duration = time_duration_st;
            }
        }
    }
})

observer1.observe(document.getElementsByTagName('body')[0], {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'className']
});


window.addEventListener("load", () => {
    ytp_do_skip_st = JSON.parse(localStorage.getItem('ytp_do_skip'));
    if (!ytp_do_skip_st.css_off || ytp_do_skip_st.css_off === 'off') {
        chrome.runtime.sendMessage('off')
    } else {
        chrome.runtime.sendMessage('on')
    }

    let params_obj_top = new URL(document.location).searchParams;
    if (params_obj_top.get("v")) {
        setInterval(() => {
            time_slider++
        }, 1000);
    } else {
        time_slider = 0;
    }
})
