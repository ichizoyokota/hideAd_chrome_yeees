let observer1 = new MutationObserver((m) => {
    m.forEach((r) => {
        if (r.target.className === "ytp-ad-skip-button-container ytp-ad-skip-button-container-detached") {
            let tmp = document.getElementsByClassName("ytp-ad-skip-button-container ytp-ad-skip-button-container-detached");
            if (tmp.length > 0) {
                // console.log(tmp[0])
                tmp[0].click();
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

