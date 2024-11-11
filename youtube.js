let time_slider = 0;
let time_duration = 0;
const back_url = 'https://youtu.be/';

setInterval(() => {
    time_slider++
}, 1000);

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

    let params_obj = new URL(document.location).searchParams;
    if (params_obj.get("v")) {
        let video_id_now_ob = String(params_obj.get("v"));
        if (document.querySelectorAll('.ytp-ad-player-overlay-layout').length > 0) {
            await worker_cache_clear().then(() => {
                if (time_duration === time_slider) {
                    location.replace(back_url + video_id_now_ob + '?t=' + (time_duration - 3) + 's');
                } else if (time_duration > time_slider && time_slider > 0) {
                    location.replace(back_url + video_id_now_ob + '?t=' + time_slider + 's');
                } else {
                    location.reload();
                }
            })
        } else {
            if (params_obj.get("t") && time_slider !== Number(params_obj.get("t").replace('s', ''))) {
                time_slider = Number(params_obj.get("t").replace('s', ''));
            }
            let tmp_duration = '';
            let tmp_current = '';
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
    let css_off_ytp_do_skip = localStorage.getItem('css_off_ytp_do_skip');
    if (css_off_ytp_do_skip === 'off') {
        chrome.runtime.sendMessage('off')
    } else {
        chrome.runtime.sendMessage('on')
    }
})
