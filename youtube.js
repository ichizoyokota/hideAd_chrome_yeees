let time_slider = 0
let time_duration = 0
let video_id_now_ob = ''
let video_id_old = ''

let tmp_duration = ''
let tmp_current = ''



setInterval(() => {
    time_slider++
}, 1000);


let observer1 = new MutationObserver((m) => {

    let params_ob = new URL(document.location).searchParams;

    if (params_ob.get("v")) {
        video_id_now_ob = params_ob.get("v");
        if (video_id_old !== video_id_now_ob) {
            video_id_old = video_id_now_ob
            time_slider = 0
        }
        if (params_ob.get("t")) {
            if (time_slider < Number(params_ob.get("t").replace('s', '')) - 5) {
                time_slider = Number(params_ob.get("t").replace('s', '')) - 5;
            }
        }
    }

    let back_url = 'https://www.youtube.com/watch?v=';

    if (document.querySelectorAll('.ytp-skip-ad').length > 0) {
        if (time_duration !== time_slider || tmp_duration !== tmp_current) {
            setTimeout(() => {
                if (time_slider > 2) {
                    location.replace(back_url + video_id_now_ob + '&t=' + time_slider + 's')
                } else {
                    location.replace(back_url + video_id_now_ob)
                }
            }, 500)
        }
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
});

let target = document.getElementsByTagName('body');

if (target[0] !== undefined) {
    observer1.observe(target[0], {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'className']
    });
}