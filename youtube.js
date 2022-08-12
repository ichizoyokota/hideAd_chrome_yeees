let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutationRecord) => {
        if (mutationRecord.target.className === "ytp-ad-skip-button-container") {
            let tmp = document.getElementsByClassName("ytp-ad-skip-button-container");
            if (tmp.length > 0) {
                tmp[0].click();
            }
        }

        console.log("mutationRecord.target['body'].childNodes[3].childNodes[1]");
        console.log(mutationRecord.target)


    })
    console.log('mutations');
    console.log(mutations);
});

let yimg = document.querySelectorAll('div');

console.log('yimg');
console.log(yimg);


// 'background: url("https://im.c.yimg.jp'


let target = document.getElementsByTagName('body');


if (target.length > 0) {
    observer.observe(target[0], {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'className']
    });
}
