let observer1 = new MutationObserver((m) => {

    // target
    //     :
    //     button#skip-button:3.ytp-skip-ad-button

    let bu = document.querySelectorAll('.ytp-skip-ad-button')
    if (bu[0]) {
        bu[0].click()
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