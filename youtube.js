localStorage.setItem('back_url_1', location.href);
if (!localStorage.getItem('back_url_1'))  {
    localStorage.setItem('back_url_2', location.href);
}

let observer1 = new MutationObserver((m) => {

    if (localStorage.getItem('yeees_callback_return_flag') === 'true'
        && location.href === "https://www.youtube.com/shorts"
        && localStorage.getItem('back_url_2') !== "https://www.youtube.com/shorts") {
        localStorage.setItem('yeees_callback_return_flag', 'false')
        history.back()
    }

    m.forEach((r) => {
        if (r.target.className === "ytp-skip-ad-button") {
            localStorage.setItem('back_url_2', localStorage.getItem('back_url_1'));
            localStorage.setItem('back_url_1', location.href);
            let tmp = document.getElementsByClassName("ytp-skip-ad-button");
            if (tmp.length > 0) {
                localStorage.setItem('yeees_callback_return_flag', 'true');
                if (localStorage.getItem('back_url_2') !== 'https://www.youtube.com/'
                    || localStorage.getItem('back_url_2') !== 'https://www.youtube.com/shorts') {
                    location.href = "https://www.youtube.com/shorts"
                }
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