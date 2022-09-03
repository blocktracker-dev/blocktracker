/**
 * homePage.js
 * 个人主页相关业务
*/

/**
 * 删除个人主页的头部展示的信息节点
*/
function clearDomHomePage() {
    if(document.getElementById('appendHomePageDom')) {
        document.getElementById('appendHomePageDom').remove();
    }
}

let pushDomHomePageLock = false;
/**
 * 个人主页头部创建节点
*/
function pushDomHomePage(tid) {
    if (pushDomHomePageLock) return;
    pushDomHomePageLock = true;
    clearDomHomePage();
    
    let { profile, summary, alert } = cache[tid];

    let divLeftDom = document.createElement('div');
    divLeftDom.setAttribute('id', 'appendLeftDivDomHomePage');
    divLeftDom.setAttribute('class', 'g-left-append');

    if ( profile.address ) {
        let profile_rate = profile.nft_profit_rate
        let rateDom =
        `<div class="${profile_rate >= 0 ? 'm-rate' : 'm-rate m-rate-red'}">
            <span style="color: #fff;">${profile_rate >= 0 ? '+' : '-'}${(profile_rate * 100 + '').split('.')[0]}%</span>
            <img class="m-gp" src="${profile_rate >= 0 ? IMG_URL['chart-increasing'] : IMG_URL['chart-decreasing']}" alt="">
        </div>`

        divLeftDom.innerHTML =
        `<div class='m-inner'>
            <div class="m-address-project">
                <div class="m-address" id="goToEtherscanHomePage" data-address=${profile.address}>
                    <img class="m-icon" src="https://resources-fww.oss-cn-zhangjiakou.aliyuncs.com/nl/addressIcon.png" alt="">
                    <span class="m-content">${profile.address.substring(0, 10)}</span>
                </div>
                <div class="m-project" id="goToOpenseaHomePage" data-address=${profile.address}>
                    <img class="m-icon" src="https://resources-fww.oss-cn-zhangjiakou.aliyuncs.com/nl/projectIcon.png" alt="">
                    <span class="m-content">Opensea</span>
                </div>
            </div>
            <ul>
                <li class="g-rate-show-tip">
                    <p><span>Composite NFT Profit rate</span> ${rateDom}<div class="g-rate-tip">(Gains from sale + estimated value of holdings) divided by cost of purchases</div></p>
                </li>
                <li>
                    <p>Total NFT Holding Value: <span>&nbsp;${profile.nft_holding_value.toFixed(1)} ETH</span><img class="m-img" src="${IMG_URL['money-bag']}" alt=""></p>
                </li>
                ${
                    profile.nft_most_holding == 'none'
                    ? '' :
                    `<li>
                        <p>The recently mostly bought by value are from <span id="projectNameHomePage" data-project-name=${profile.project_name} data-slug=${profile.slug} style="cursor:pointer;">${profile.project_name}</span><img class="m-img" src="${IMG_URL['fire']}" alt=""></p>
                    </li>`
                }
            </ul>
        </div>`
    }

    let divDom = document.createElement('div');
    divDom.setAttribute('id', 'appendDivHomePageDom');
    divDom.setAttribute('class', 'g-layers-append');

    const ACTION_ENUM = {
        'opensea_buy': 'Bought',
        'opensea_sell': 'Sold',
        'mint': 'Minted',
    }

    const summaryItem = (item, isAlert, summaryIndex) => {
        let priceShow = item.price
        let pricePoint = `${item.price}`.split('.')[1]
        if(pricePoint && pricePoint.length > 4) {
            priceShow = item.price.toFixed(4)
        }
        
        let img = `<img class="m-img m-img-noborder" src="${IMG_URL['spouting-whale']}" alt="">`
        let price = `&nbsp;at&nbsp;<b>${priceShow}&nbsp;ETH&nbsp;</b>&nbsp;via&nbsp;<span>Opensea</span>`
        let list = item.token_list;
        let tokenList = '';
        let dataTokenList = JSON.parse(JSON.stringify(list));
        if (!list || list.length == 0) {
            tokenList = ''
        } else if (list.length == 1) {
            tokenList =
            `<img class="m-user-avatar" src="${list[0].image_thumbnail_url || IMG_URL['hourglass']}" alt="">
            <span class="u-item" data-item-id="${list[0].id}">#${lengthString(list[0].id)} </span>`
        } else if (list.length == 2) {
            tokenList =
            `<img class="m-user-avatar" src="${list[0].image_thumbnail_url || IMG_URL['hourglass']}" alt="">
            <span class="u-item" data-item-id="${list[0].id}">#${lengthString(list[0].id)}</span>
            &nbsp;and&nbsp;<img class="m-user-avatar" src="${list[1].image_thumbnail_url || IMG_URL['hourglass']}" alt="">
            &nbsp;<span class="u-item" data-item-id="${list[1].id}">#${lengthString(list[1].id)}</span>`
        } else {
            tokenList =
            `<img class="m-user-avatar" src="${list[0].image_thumbnail_url || IMG_URL['hourglass']}" alt="">
            <span class="u-item" data-item-id="${list[0].id}">#${lengthString(list[0].id)}</span>
            &nbsp;and&nbsp;other&nbsp;<span class="u-items" data-items-list='${JSON.stringify(list)}'>${list.length-1}&nbsp;items</span>`
        }

        let itemDom =
        `<div class="m-timeline-item" id="summary_home_${summaryIndex}" data-summary-tid="${item.tid}" data-summary-id="summary_home_${summaryIndex}" data-token-address=${item.token_address} data-token-list=${JSON.stringify(dataTokenList)}>
            ${isAlert ? img : ''}
            ${ACTION_ENUM[item.action]}
            <img class="m-project-avatar" src="${item.image_url || IMG_URL['hourglass']}" alt="">
            <b class="u-project-tag summary-project-name">${isNotUndefined(item.token_name) || item.project_name}</b>
            ${tokenList}
            ${item.action == 'mint' ? '' : price}.
        </div>`
        return itemDom;
    }

    const alertDomRender = () => {
        if(!alert || alert.length == 0) {
            return ''
        }
        let dom =
        `<div class="m-alert">
            <div class="m-timeline-time" style="margin-right:20px;">
                <p style="color:#666;">${timestampToDate(alert[0].time).date}</p>
                <p>${timestampToDate(alert[0].time).soFar}</p>
            </div>
            ${summaryItem(alert[0], true)}
        </div>`
        return dom;
    }

    let timelineDom = '';
    if (summary && summary.length > 0) {
        for (let y = 0; y < summary.length; y++) {
            let current = summary[y]
            const imgUrl = {
                'opensea_buy': IMG_URL['inbox-tray'],
                'opensea_sell': IMG_URL['outbox-tray'],
                'mint': IMG_URL['pick'],
            }
            timelineDom +=
            `<div class="m-timeline">
                <div class="m-timeline-time">
                    <p style="${y == 0 && 'color: #666;' }">${timestampToDate(current.time).date}</p>
                    <p>${timestampToDate(current.time).soFar}</p>
                </div>
                <div class="m-timeline-line">
                    <img src="${imgUrl[current.action]}">
                </div>
                ${summaryItem(current, false, y)}
            </div>`
        }
    }

    divDom.innerHTML =
    `<div class='m-inner' id="appendDivDomInnerHomePage">
        ${
            alertDomRender() ?
            `<h3><img src="${IMG_URL['alertIcon']}" alt="">Alert</h3>
            ${alertDomRender()}`
            : ''
        }
        ${
            timelineDom ?
            `<h3><img src="${IMG_URL['summaryIcon']}" alt="">Summary</h3>
            <div class="m-timeline-wrapper" id="summaryWrapperHomePage">
                ${timelineDom}
            </div>`
            : ''
        }
        ${
            (!alertDomRender() && !timelineDom) ?
            `<div class="m-right-empty" id="rightEmptyHomePage">
                <img src="${IMG_URL['noData']}" alt="">
                <h2>No data yet</h2>
            </div>`
            : ''
        }
    </div>`

    let switchDom = document.createElement('div');
    switchDom.setAttribute('id', 'switchDom');
    switchDom.setAttribute('class', 'g-switch-append');
    
    switchDom.innerHTML =
    `<img style="display:none;" src="${IMG_URL['shrinkage']}" alt="">
    <img src="${IMG_URL['unfold']}" alt="">`

    let popMaskDom = document.createElement('div');
    popMaskDom.setAttribute('class', 'g-items-pop-mask-homePage');
    popMaskDom.setAttribute('style', 'display:none;');
    popMaskDom.innerHTML =
    `<div class="g-items-pop-homePage" id="itemsPopHomePage">
        <div class="m-inner"></div>
    </div>
    <div class="m-close"><img src="${IMG_URL['alertCloseIcon']}" alt=""></div>`

    divDom.style = 'display: none;height: 200px;'

    let appendHomePageDom = document.createElement('div');
    appendHomePageDom.setAttribute('id', 'appendHomePageDom');
    appendHomePageDom.setAttribute('class', 'g-home-page-append');
    appendHomePageDom.appendChild(divLeftDom);
    appendHomePageDom.appendChild(divDom);
    appendHomePageDom.appendChild(switchDom);
    appendHomePageDom.appendChild(popMaskDom);

    let headerPhoto = document.querySelector(`a[href="/${tid}/header_photo"]`);
    let headerWrapper = document.querySelector(`main[role="main"] div[class="css-1dbjc4n r-1bimlpy"]`);
    let target = headerPhoto || headerWrapper;
    if(target) {
        target.parentNode.appendChild(appendHomePageDom);
    }

    homePageSwitch();
    leftAddEventHomePage();
    rightAddEventHomePage();
    showItemsPopHomePage();
    summaryLoadEventHomePage();
    summaryScollHomePage();
    pushDomHomePageLock = false;
}

/**
 * items添加点击创建items节点事件
*/
function showItemsPopHomePage() {
    let mTimelineItem = document.querySelectorAll('#appendHomePageDom .m-timeline-item');
    for (let i = 0; i < mTimelineItem.length; i++) {
        let timeLineItem = mTimelineItem[i];
        let token_address = timeLineItem.getAttribute('data-token-address');
        let itemsList = timeLineItem.getElementsByClassName('u-items');
        for (let j = 0; j < itemsList.length; j++) {
            let target = itemsList[j];
            target.addEventListener('click', function(e) {
                let itemsListData = JSON.parse(target.getAttribute('data-items-list'));
                pushDomItemsPopHomePage(token_address, itemsListData);
            });
        }
    }
    const itemsPopMask = document.getElementById('itemsPopHomePage').parentNode;
    // 关闭按钮添加关闭items隐藏事件
    const itemsPopMaskClose = itemsPopMask.getElementsByClassName('m-close')[0];
    itemsPopMaskClose.addEventListener('click', function(e) {
        itemsPopMask.style = `display:none;`;
    });
}

/**
 * 创建items节点
*/
function pushDomItemsPopHomePage(token_address, itemsList) {
    let itemsPopDom = document.getElementById('itemsPopHomePage');
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

    itemsPopDom.getElementsByClassName('m-inner')[0].innerHTML =
    `<div class='inner-scoll'>
        ${itemsDom}
    </div>`;

    itemsPopDom.parentNode.style = `display:block;`;

    itemsEventHomePage(itemsPopDom);
    itemsLoadEventHomePage();
    itemsScollHomePage();

}

// item 点击事件 home,feed都可以用
function itemsEventHomePage(itemsPopDom) {
    let itemsTargetList = itemsPopDom.getElementsByClassName('m-items-item');
    for (let i = 0; i < itemsTargetList.length; i++) {
        let itemDom = itemsTargetList[i];
        itemDom && itemDom.querySelector('span').addEventListener('click', function(e) {
            let id = itemDom.getAttribute('data-item-id');
            let token_address = itemDom.getAttribute('data-token-address');
            id && token_address && window.open(`https://opensea.io/assets/${token_address}/${id}`);
        });
    }
}

// item 滚动 懒加载
function itemsScollHomePage() {
    let itemsPopScoll = document.querySelector('#itemsPopHomePage .inner-scoll');
    if(!itemsPopScoll) return;
    itemsPopScoll.onscroll = () => {
        itemsScollEventHomePage();
    }
}

// item 滚动时，请求数据
function itemsScollEventHomePage() {
    let itemsPopScoll = document.querySelector('#itemsPopHomePage .inner-scoll');
    if (!itemsPopScoll) return;
    let domList = itemsPopScoll.querySelectorAll('.m-items-item');
    for (let i = 0; i < domList.length; i++) {
        let domItem = domList[i];
        if (domList[i].offsetTop - itemsPopScoll.scrollTop - itemsPopScoll.clientHeight < 20) {
            itemsLazyLoadHomePage(domItem);
        }
    }
}

// item 初始不滚动时，请求数据
function itemsLoadEventHomePage() {
    let domList = document.querySelectorAll('#itemsPopHomePage .m-items-item');
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
        itemsLazyLoadHomePage(domItem);
    }
}

