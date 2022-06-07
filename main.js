let styleTag = document.createElement("style");
document.head.appendChild( styleTag );

let setVal =
    [
        'div [id^="ssp_ydn_"] {display : none !important}',
        '.ytp-ad-text-overlay {display : none !important}',
        '.ytp-ad-image-overlay {display : none !important}',
        'div#TBP {display : none !important}',
        'div [id^="yads"] {display : none !important}',
        'div [id^="ssp_ydn"] {display : none !important}',
        '.adsbygoogle {display : none !important}',
        'div [id^="google_ads_"] {display : none !important}',
        'div [id^="player-ads"] {display : none !important}',
        'div [id^="sparkles-container"] {display : none !important}',
        'div [id^="ob-dynamic"] {display : none !important}',
        'a [class^="_popIn_recommend_article_ad"] {display : none !important}',
        'div [id^="STREAMAD"] {display : none !important}',
        '.ats-overlay-bottom-wrapper-rendered {display: none !important}',
        'div [class^="yads_ad_pc_feed"] {display: none !important}',
        'div [data-testid="placementTracking"] {display: none !important}'
        ]

setVal.forEach((item,index) => styleTag.sheet.insertRule ( item, index ));
