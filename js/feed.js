/**
 * feed.js
 * feed相关逻辑
*/

let feedShow = false;
/**
 * 左侧菜单添加BlockTracker按钮
*/
function pushNav(nav) {
    if (!nav) return;
    if (nav.querySelector('#navAlert')) return;

    let navAlert = document.createElement('div');
    navAlert.setAttribute('id', 'navAlert');
    navAlert.setAttribute('class', 'g-nav-alert');

    navAlert.innerHTML =
    `<div class="nav-inner">
        <img class="discord-img" src="${IMG_URL['associated']}">
        <div class="nav-alert-text">BlockTracker</div>
    </div>`

    nav.appendChild(navAlert)
    navAlertClick();
}

/**
 * 点击BlockTracker按钮后，替换原来的home按钮，
 * 解决feed展示后，home按钮失效问题，替换后，home按钮会重新加载页面
*/
function navReplaceHome() {
    let nav = document.querySelector(`nav[aria-label="Primary"]`) || document.querySelector(`nav[aria-label="主要"]`);
    if (!nav) return;
    if (nav.querySelector('#navHome')) return;
    let homeDom = nav.querySelector('a[href="/home"]');

    let navHome = document.createElement('div');
    navHome.setAttribute('id', 'navHome');
    navHome.setAttribute('class', 'g-nav-alert');

    navHome.innerHTML =
    `<div class="nav-inner">
        <svg viewBox="0 0 24 24" aria-hidden="true" class="discord-img"><g><path d="M22.46 7.57L12.357 2.115c-.223-.12-.49-.12-.713 0L1.543 7.57c-.364.197-.5.652-.303 1.017.135.25.394.393.66.393.12 0 .243-.03.356-.09l.815-.44L4.7 19.963c.214 1.215 1.308 2.062 2.658 2.062h9.282c1.352 0 2.445-.848 2.663-2.087l1.626-11.49.818.442c.364.193.82.06 1.017-.304.196-.363.06-.818-.304-1.016zm-4.638 12.133c-.107.606-.703.822-1.18.822H7.36c-.48 0-1.075-.216-1.178-.798L4.48 7.69 12 3.628l7.522 4.06-1.7 12.015z"></path><path d="M8.22 12.184c0 2.084 1.695 3.78 3.78 3.78s3.78-1.696 3.78-3.78-1.695-3.78-3.78-3.78-3.78 1.696-3.78 3.78zm6.06 0c0 1.258-1.022 2.28-2.28 2.28s-2.28-1.022-2.28-2.28 1.022-2.28 2.28-2.28 2.28 1.022 2.28 2.28z"></path></g></svg>
        <div class="nav-alert-text">Home</div>
    </div>`

    nav.replaceChild(navHome, homeDom);

    navHome.addEventListener('click', () => {
        document.body.classList.remove('body-no-alert');
        window.location.href = 'https://twitter.com/home';
    })
}

/**
 * 为菜单添加的BlockTracker按钮添加点击事件
 * 点击后，模拟点击home按钮，显示feed列表，替换home按钮，添加feed相关事件
*/
function navAlertClick() {
    let navAlert = document.querySelector('#navAlert');
    if (!navAlert) { return; }
    navAlert.addEventListener('click', () => {
        document.body.classList.add('body-no-alert');
        navAlert.querySelector('.nav-inner')?.classList.add('nav-inner-active');
        if (document.querySelector('a[href="/home"]')) {
            document.querySelector('a[href="/home"]').click();
            alertFeed();
            navReplaceHome();
            feedShow = true;
            alertFeedEvent();
        }
    })

}

/**
 * 创建feed列表节点，替换掉中间的区域
*/
function alertFeed() {
    let mainDom = document.querySelector('div[data-testid="primaryColumn"]');
    if (!mainDom) return;
    let mainDomParentNode = mainDom.parentNode;
    if(!mainDomParentNode) return;
    
    let alertFeedDom = document.createElement('div');
    alertFeedDom.setAttribute('id', 'alertFeedDom');
    alertFeedDom.setAttribute('class', 'g-alert-feed');

    // let feedItemsPop =
    // `<div class="g-items-pop-mask-feed" style="display:none;">
    //     <div class="g-items-pop-feed" id="itemsPopFeed">
    //         <div class="m-inner"></div>
    //     </div>
    //     <div class="m-close"></div>
    // </div>`

    alertFeedDom.innerHTML =
    `<div class="feed-model-title">BlockTracker${sponsoredString()}</div>
    <div class="alert-feed-wrapper">
        ${alertFeedDomInnerHTML()}
    </div>`

    mainDomParentNode.replaceChild(alertFeedDom, mainDom);
    window.scrollTo(0, 0);
}

/**
 * 循环feed数组，调用创建alert节点函数
*/
function alertFeedDomInnerHTML() {
    let html = ``;
    if (!cacheFeed || cacheFeed.length == 0) { 
        return html;
    };
    for (let i = 0; i < cacheFeed.length; i++) {
        let feed = cacheFeed[i];
        let feedDom = alertFeedItem(feed, i);
        html += feedDom;
    }
    return html;
}

/**
 * 创建feed的每条alert的节点
*/
function alertFeedItem(alert, feedIndex) {
    const alertDomRender = () => {
        if(!alert) {
            return ''
        }

        let imgLoading = chrome.runtime.getURL("img/bigLoading.gif");
        let avatarDefault = `<img src="${imgLoading}">`
        let avatarRequest = `<img src="${alert.avatar}">`

        let dom =
        `<div class="g-feed-item">
            <div class="m-avatar">
                <div class="m-avatar-inner">
                    <div class="m-img-wrapper feed-avatar-href" data-href="https://twitter.com/${alert.handle}">
                        ${alert.avatar ? avatarRequest : avatarDefault}
                    </div>
                </div>
            </div>
            <div class="feed-content">
                <h3>
                    <a class="u-handle" href="https://twitter.com/${alert.handle}" target="_blank">${alert.handle}</a>
                    <span class="u-follow ${alert.recommend_reason.indexOf('Followers') == -1 ? 'u-color-follow' : ''} ${alert.recommend_reason.indexOf('Return') == -1 ? 'u-color-return' : ''}">${alert.recommend_reason}</span>
                </h3>
                ${summaryItem(alert, feedIndex)}
                <div class="m-timeline-time">
                    <span class="m-text-gray"><b>${timestampToDate(alert.time).soFar}</b></span>
                </div>
            </div>
        </div>`
        return dom;
    }

    // <div class="m-timeline-time">
    //     <span>${timestampToDate(alert.time).date}</span>
    //     <span class="m-text-gray"><b>${timestampToDate(alert.time).soFar}</b></span>
    // </div>

    const summaryItem = (item, feedIndex) => {
        let priceShow = item.price
        let pricePoint = `${item.price}`.split('.')[1]
        if(pricePoint && pricePoint.length > 4) {
            priceShow = item.price.toFixed(4)
        }

        const actionImgUrl = {
            'opensea_buy': IMG_URL['inbox-tray'],
            'opensea_sell': IMG_URL['outbox-tray'],
            'mint': IMG_URL['pick'],
        }

        // let price = `&nbsp;at&nbsp;<b>${priceShow}&nbsp;ETH&nbsp;</b>&nbsp;via&nbsp;<b class="u-text-blue">Opensea</b>`
        let imgLoading = chrome.runtime.getURL("img/bigLoading.gif");
        let price = `&nbsp;at&nbsp;<b>${priceShow}&nbsp;ETH</b>`
        let list = item.token_list;
        let tokenList = '';
        let imgList = '';
        let dataTokenList = [];
        if (!list || list.length == 0) {
            tokenList = ''
        } else if (list.length == 1) {
            tokenList =
            `<span class="u-item u-item-alert" data-item-id="${list[0].id}">#${lengthString(list[0].id)} </span>`
            imgList =
            `<img class="m-user-avatar" src="${list[0].image_thumbnail_url || imgLoading}" alt="">`
            dataTokenList = JSON.parse(JSON.stringify(list))
        } else if (list.length == 2) {
            tokenList =
            `<span class="u-item u-item-alert" data-item-id="${list[0].id}">#${lengthString(list[0].id)}</span>
            &nbsp;and&nbsp;<span class="u-item u-item-alert" data-item-id="${list[1].id}">#${lengthString(list[1].id)}</span>`
            imgList =
            `<img class="m-user-avatar" src="${list[0].image_thumbnail_url || imgLoading}" alt="">
            <img class="m-user-avatar" src="${list[1].image_thumbnail_url || imgLoading}" alt="">`
            dataTokenList = JSON.parse(JSON.stringify(list))
        } else {
            tokenList =
            `<span class="u-item u-item-alert" data-item-id="${list[0].id}">#${lengthString(list[0].id)}</span>
            &nbsp;and&nbsp;other&nbsp;<span class="u-items" data-items-list='${JSON.stringify(list)}'>${list.length-1}&nbsp;items</span>`
            imgList =
            `<img class="m-user-avatar" src="${list[0].image_thumbnail_url || imgLoading}" alt="">`
            dataTokenList = JSON.parse(JSON.stringify([list[0], list[1]]))
        }


        let itemDom =
        `<div class="feed-summary-item" 
            id="feed_${feedIndex}" 
            data-summary-tid="${item.tid}" 
            data-twitter-handle="${item.handle}" 
            data-token-address=${item.token_address} 
            data-token-list=${JSON.stringify(dataTokenList)}>
            <div class="feed-summary-item-content">
                <img class="m-img m-img-noborder" src="${actionImgUrl[item.action]}">
                ${ACTION_ENUM[item.action]}&nbsp;
                ${tokenList}
                &nbsp;of&nbsp;
                <img class="m-project-avatar" src="${item.image_url || IMG_URL['hourglass']}" alt="">
                <b class="u-project-tag feed-project-name">${isNotUndefined(item.token_name) || item.project_name}</b>
                ${item.action == 'mint' ? '' : price}.
            </div>
            <div class="m-items-img-list">
                ${imgList}
            </div>
        </div>`
        return itemDom;
    }

    return alertDomRender();
}

/**
 * feed列表中事件，跳转项目和item地址
*/
function alertFeedEvent() {

    let feedAvatarList = document.querySelectorAll('.g-feed-item .feed-avatar-href');
    for (let i = 0; i < feedAvatarList.length; i++) {
        feedAvatarList[i].addEventListener('click', function(e) {
            let avatarHref = feedAvatarList[i]?.getAttribute('data-href');
            if (avatarHref) {
                window.open(avatarHref);
            }
        });
    }

    // 跳转项目
    let feedProjectList = document.querySelectorAll('.feed-project-name');
    for (let i = 0; i < feedProjectList.length; i++) {
        feedProjectList[i].addEventListener('click', function(e) {
            let projectName = feedProjectList[i].innerHTML;
            let slug = feedProjectList[i]?.getAttribute('data-slug');
            if (slug && slug != 'undefined' && slug != 'null') {
                window.open('https://opensea.io/collection/'+slug);
            } else {
                // if (projectName && projectName != 'undefined') {
                //     window.open('https://opensea.io/collection/'+projectName.replace(/\s+/g, "-").replace(/---/g, "-").toLowerCase());
                // }
            }
        });
    }

    let mTimelineItem = document.getElementsByClassName('feed-summary-item');
    for (let i = 0; i < mTimelineItem.length; i++) {
        let timeLineItem = mTimelineItem[i];
        let token_address = timeLineItem.getAttribute('data-token-address');
        let itemList = timeLineItem.getElementsByClassName('u-item');
        for (let j = 0; j < itemList.length; j++) {
            itemList[j].addEventListener('click', function(e) {
                let id = itemList[j].getAttribute('data-item-id');
                window.open(`https://opensea.io/assets/${token_address}/${id}`);
            });
        }

        let items = timeLineItem.querySelector('.u-items');
        items && items.addEventListener('click', function(e) {
            let itemsData = JSON.parse(items.getAttribute('data-items-list'));
            pushDomItemsPopFeed(token_address, itemsData);
        });
    }

    summaryLoadEventFeed();
    summaryScollFeed();
}

/**
 * feed创建items节点并展示
*/
function pushDomItemsPopFeed(token_address, itemsList) {
    let popMaskDom = document.createElement('div');
    popMaskDom.setAttribute('class', 'g-items-pop-mask-feed');
    popMaskDom.innerHTML =
    `<div class="g-items-pop-feed" id="itemsPopFeed">
        <div class="m-inner"></div>
    </div>
    <div class="m-close"><img src="${IMG_URL['alertCloseIcon']}" alt=""></div>`

    let itemsDom = ''
    itemsList.forEach(element => {
        itemsDom +=
        `<div class="m-items-item"
            id="items-${element.id}"
            data-token-address="${token_address}"
            data-item-id="${element.id}"
        >
            <img class="m-user-avatar" src="${element.image_thumbnail_url || IMG_URL['hourglass']}" alt="">
            &nbsp;<span>#${lengthString(element.id)}</span>
        </div>`
    });

    popMaskDom.getElementsByClassName('m-inner')[0].innerHTML =
    `<div class='inner-scoll'>
        ${itemsDom}
    </div>`;

    document.body.appendChild(popMaskDom);

    const itemsPopMask = document.getElementById('itemsPopFeed').parentNode;
    const itemsPopMaskClose = itemsPopMask.getElementsByClassName('m-close')[0];
    itemsPopMaskClose.addEventListener('click', function(e) {
        itemsPopMask.remove();
    });

    itemsEventHomePage(popMaskDom);
    itemsLoadEventFeed();
    itemsScollFeed();
}

// item 滚动 懒加载
function itemsScollFeed() {
    let itemsPopScoll = document.querySelector('#itemsPopFeed .inner-scoll');
    if(!itemsPopScoll) return;
    itemsPopScoll.onscroll = () => {
        itemsScollEventFeed();
    }
}

// item 滚动时，请求数据
function itemsScollEventFeed() {
    let itemsPopScoll = document.querySelector('#itemsPopFeed .inner-scoll');
    if (!itemsPopScoll) return;
    let domList = itemsPopScoll.querySelectorAll('.m-items-item');
    for (let i = 0; i < domList.length; i++) {
        let domItem = domList[i];
        if (domList[i].offsetTop - itemsPopScoll.scrollTop - itemsPopScoll.clientHeight < 20) {
            itemsLazyLoadFeed(domItem);
        }
    }
}

// item 初始不滚动时，请求数据
function itemsLoadEventFeed() {
    let domList = document.querySelectorAll('#itemsPopFeed .m-items-item');
    if (domList.length == 0) {
        return;
    }
    let max = 0;
    if (domList.length >= 6) {
        max = 5
    } else (
        max = domList.length - 1
    )
    for (let i = 0; i <= max; i++) {
        let domItem = domList[i];
        itemsLazyLoadFeed(domItem);
    }
}

// summary 滚动 懒加载
function summaryScollFeed() {
    let alertFeedDom = document.getElementById('alertFeedDom');
    if(!alertFeedDom) return;
    document.onscroll = () => {
        summaryScollEventFeed();
    }
}

// 滚动时，请求数据
function summaryScollEventFeed() {
    let scrollTopDom = document.body.querySelector('div>div');
    if (!scrollTopDom) return;
    let domList = document.querySelectorAll('#alertFeedDom .feed-summary-item');
    if (!domList || domList.length == 0) return;
    for (let i = 0; i < domList.length; i++) {
        let domItem = domList[i];
        if (domList[i].offsetTop - window.scrollY <= window.screen.height) {
            summaryLazyLoadFeed(domItem);
        }
    }
}

// 初始不滚动时，请求数据
function summaryLoadEventFeed() {
    let domList = document.querySelectorAll('#alertFeedDom .feed-summary-item');
    if (!domList || domList.length == 0) return;
    let domIndex = 0;
    while (domList[domIndex] && (domList[domIndex].offsetTop < window.screen.height)) {
        summaryLazyLoadFeed(domList[domIndex]);
        domIndex++;
    }
}