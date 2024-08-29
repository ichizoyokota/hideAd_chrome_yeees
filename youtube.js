if (location.href === 'https://www.youtube.com'
    && !location.href.includes('https://www.youtube.com/shorts')) {
    localStorage.setItem('back_url_1', location.href);
}


let observer1 = new MutationObserver(() => {

    let back_url_1 = localStorage.getItem('back_url_1')
    let back_url_2 = localStorage.getItem('back_url_2')

    if (localStorage.getItem('yeees_callback_return_flag') === 'true'
        && location.href.includes('https://www.youtube.com/shorts')
        && !back_url_2.includes('https://www.youtube.com/shorts')) {
        localStorage.setItem('yeees_callback_return_flag', 'false')
        history.back()
    }

    let tmp = document.getElementsByClassName('ytp-skip-ad');
    if (tmp.length > 0) {
        if (location.href !== 'https://www.youtube.com'
            && !location.href.includes('https://www.youtube.com/shorts')) {
            localStorage.setItem('back_url_1', location.href);
            localStorage.setItem('back_url_2', back_url_1);
        }
        localStorage.setItem('yeees_callback_return_flag', 'true');
        location.href = 'https://www.youtube.com/shorts'
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