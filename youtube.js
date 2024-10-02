let time_slider = 0
let time_duration = 0
let video_id_now_ob = ''
let video_id_old = ''

let tmp_duration = ''
let tmp_current = ''

const back_url = 'https://www.youtube.com/watch?v=';

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

const observer1 = new MutationObserver(async (m) => {

    let params_ob = new URL(document.location).searchParams;

    if (params_ob.get("v")) {
        video_id_now_ob = params_ob.get("v");
        if (params_ob.get("t")) {
            time_slider = Number(params_ob.get("t").replace('s', ''));
        }

        if (document.querySelectorAll('.ytp-skip-ad').length > 0
            || document.querySelectorAll('.ytp-preview-ad').length > 0) {
            await worker_cache_clear().then(() => {
                if (time_duration === time_slider) {
                    location.replace(back_url + video_id_now_ob + '&t=' + (time_slider - 1) + 's')
                } else if (time_duration > time_slider) {
                    location.replace(back_url + video_id_now_ob + '&t=' + (time_slider + 1) + 's')
                }
            })
        }

        if (document.querySelectorAll('.ytp-time-duration').length > 0) {
            tmp_duration = document.querySelectorAll('.ytp-time-duration')[0].innerText
            let duration_obj = tmp_duration.split(':')
            switch (duration_obj.length) {
                case 2:
                    time_duration = (Number(duration_obj[0]) * 60) + Number(duration_obj[1])
                    break;
                case 3:
                    time_duration = (Number(duration_obj[0]) * 60 * 60) + (Number(duration_obj[1]) * 60) + Number(duration_obj[2])
                    break;
            }
        }

        if (document.querySelectorAll('.ytp-time-current').length > 0) {
            tmp_current = document.querySelectorAll('.ytp-time-current')[0].innerText
            let current_obj = tmp_current.split(':')
            switch (current_obj.length) {
                case 2:
                    time_slider = (Number(current_obj[0]) * 60) + Number(current_obj[1])
                    break;
                case 3:
                    time_slider = (Number(current_obj[0]) * 60 * 60) + (Number(current_obj[1]) * 60) + Number(current_obj[2])
                    break;
            }
        }
    }

});

observer1.observe(document.getElementsByTagName('body')[0], {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'className']
});