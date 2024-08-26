let observer1 = new MutationObserver((m) => {
    let current_time_span = document.getElementsByClassName("ytp-time-current");
    let duration_span = document.getElementsByClassName("ytp-time-duration");
    let current_time= current_time_span[0].innerText
    let duration= current_time_span[0].innerText
    let back_url = localStorage.getItem('yeees_callback_url')
    if (back_url && duration_span !== duration) {
        localStorage.removeItem('yeees_callback_url')
        location.href = back_url
    } else if (duration_span !== duration) {
        m.forEach((r) => {
            if (r.target.className === "ytp-skip-ad-button") {
                let tmp = document.getElementsByClassName("ytp-skip-ad-button");
                if (tmp.length > 0) {
                    localStorage.setItem('yeees_callback_url', location.href + '?t=' + current_time);
                    location.href = "https://www.youtube.com/shorts"
                }
            }
        })
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