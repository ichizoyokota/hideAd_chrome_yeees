
let observer1 = new MutationObserver((m) => {

    let back_url_2 = localStorage.getItem('back_url_2')

    if (localStorage.getItem('yeees_callback_return_flag') === 'true'
        && back_url_2.includes('https://www.youtube.com/watch?v=')
        ) {
        localStorage.setItem('yeees_callback_return_flag', 'false')
        location.assign(back_url_2)
    }

    if (document.querySelectorAll('.ytp-skip-ad').length > 0) {
        if (location.href.includes('https://www.youtube.com/watch?v=')) {
            localStorage.setItem('back_url_2', location.href);
            localStorage.setItem('yeees_callback_return_flag', 'true')
            setTimeout(()=> {
                location.assign('https://www.youtube.com/shorts')
            }, 3000)
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