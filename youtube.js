let observer1 = new MutationObserver((m) => {
    let duration_span = document.getElementsByClassName("ytp-time-duration");
    let duration = duration_span[0] ? duration_span[0].innerText : undefined;
    let current_time_span = document.getElementsByClassName("ytp-time-current");
    let current_time = current_time_span[0] ? current_time_span[0].innerText : undefined;
    let back_url = localStorage.getItem('yeees_callback_url');
    let yeees_callback_return_flag = localStorage.getItem('yeees_callback_return_flag');
    localStorage.setItem('yeees_callback_url', location.href + '?t=' + current_time);

    if (back_url !== null && yeees_callback_return_flag === 'true') {
        localStorage.setItem('yeees_callback_return_flag', 'false');
        localStorage.removeItem('yeees_callback_url')
        location.href = back_url
    }

    m.forEach((r) => {
        if (r.target.className === "ytp-skip-ad-button") {
            let tmp = document.getElementsByClassName("ytp-skip-ad-button");
            if (tmp.length > 0) {
                localStorage.setItem('yeees_callback_return_flag', 'true');
                location.href = "https://www.youtube.com/shorts"
            }
        }
    })

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