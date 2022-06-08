let styleTag = document.createElement("style");
document.head.appendChild(styleTag);

let setVal =
    ".ytp-ad-text-overlay," +
    ".ytp-ad-image-overlay," +
    "div#TBP," +
    "div [id^=\"yads\"]," +
    "div [id^=\"ssp_ydn\"]," +
    ".adsbygoogle," +
    "div [id^=\"google_ads_\"]," +
    "div [id^=\"player-ads\"]," +
    "div [id^=\"sparkles-container\"]," +
    "div [id^=\"ob-dynamic\"]," +
    "a [class^=\"_popIn_recommend_article_ad\"]," +
    "div [id^=\"STREAMAD\"]," +
    ".ats-overlay-bottom-wrapper-rendered," +
    "div [class^=\"yads_ad_pc_feed\"] {" +
    " display: none !important;" +
    "}"

styleTag.sheet.insertRule(setVal, 0);


let observer = new MutationObserver(() => {
    /** DOMの変化が起こった時の処理 */
    console.log('DOMが変化しました');
    console.log(ytp_ad_skip_button_container);
})

/** 監視時のオプション */
const config = {
    attributes: true,
    childList: true,
    characterData: true
};


let ytp_ad_skip_button_container = document.getElementsByClassName('ytp-ad-skip-button-container');

console.log('ytp_ad_skip_button_container');
console.log(ytp_ad_skip_button_container);


/** 要素の変化監視をスタート */
if (ytp_ad_skip_button_container.length > 0) {
    observer.observe(ytp_ad_skip_button_container[0], config);
}

// if (ytp_ad_skip_button.length > 0 ) {
//         ytp_ad_skip_button[0].button.click();
// }

