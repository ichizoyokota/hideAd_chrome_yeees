let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutationRecord) => {
        if (mutationRecord.target.className === "ytp-ad-skip-button-container") {
            let tmp = document.getElementsByClassName("ytp-ad-skip-button-container");
            if (tmp.length > 0) {
                tmp[0].click();
            }
        }
    })
});

let target = document.getElementsByTagName('body');


if (target.length > 0) {
    observer.observe(target[0], {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'className']
    });
}
