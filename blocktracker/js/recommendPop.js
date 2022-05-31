/**
 * recommendPop.js
 * 推荐模块添加弹窗节点，暂未使用
*/

/**
 * 清除推荐的弹窗节点
*/
function clearRecommendPop() {
    if(document.getElementById('recommendPopDom')) {
        document.getElementById('recommendPopDom').remove();
        document.querySelector('#recommendPop').setAttribute('style', 'display:none;')
    }
}

/**
 * 清除推荐的弹窗loading节点
*/
function clearRecommendPopLoading() {
    if (document.getElementById('recommendPopLoading')) {
        document.getElementById('recommendPopLoading').remove();
    }
}

/**
 * 推荐的弹窗添加loading节点
*/
function pushRecommendPopLoading() {
    clearRecommendPopLoading();
    let recommendPopLoading = document.createElement('div');
    recommendPopLoading.setAttribute('id', 'recommendPopLoading');
    recommendPopLoading.setAttribute('class', 'recommend-loading g-append-loading');
    recommendPopLoading.style = `height:400px;`;
    recommendPopLoading.innerHTML =
    `<div class="sk-circle">
        <div class="sk-circle1 sk-child"></div>
        <div class="sk-circle2 sk-child"></div>
        <div class="sk-circle3 sk-child"></div>
        <div class="sk-circle4 sk-child"></div>
        <div class="sk-circle5 sk-child"></div>
        <div class="sk-circle6 sk-child"></div>
        <div class="sk-circle7 sk-child"></div>
        <div class="sk-circle8 sk-child"></div>
        <div class="sk-circle9 sk-child"></div>
        <div class="sk-circle10 sk-child"></div>
        <div class="sk-circle11 sk-child"></div>
        <div class="sk-circle12 sk-child"></div>
    </div>`;

    if(document.querySelector(`.g-recommend`) && !document.querySelector('#recommendPop div')) {
        let position = getElemPos(document.querySelector('.g-recommend'), true);
        document.querySelector('#recommendPop').setAttribute('style', `display:block;top:${position.top}px;left:${position.x-400}px;`);
        document.querySelector('#recommendPop').appendChild(recommendPopLoading);
    }

}

let pushRecommendLock = false;
/**
 * 添加推荐模块的弹窗节点
*/
function pushRecommendPop(recommend) {
    if (pushRecommendLock) return;
    pushRecommendLock = true;
    clearRecommendPop();
    
    let { profile, summary, alert } = recommend;

    let divLeftDom = document.createElement('div');
    divLeftDom.setAttribute('id', 'appendLeftDivDomRecommend');
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
                <div class="m-address" id="goToEtherscanRecommend" data-address=${profile.address}>
                    <img class="m-icon" src="https://resources-fww.oss-cn-zhangjiakou.aliyuncs.com/nl/addressIcon.png" alt="">
                    <span class="m-content">${profile.address.substring(0, 10)}</span>
                </div>
                <div class="m-project" id="goToOpenseaRecommend" data-address=${profile.address}>
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
                        <p>The recently mostly bought by value are from <span id="projectNameRecommend" data-project-name=${profile.project_name} data-slug=${profile.slug} style="cursor:pointer;">${profile.project_name}</span><img class="m-img" src="${IMG_URL['fire']}" alt=""></p>
                    </li>`
                }
            </ul>
        </div>`
    }

    let divDom = document.createElement('div');
    divDom.setAttribute('id', 'appendDivRecommendDom');
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
        let dataTokenList = []
        if (!list || list.length == 0) {
            tokenList = ''
        } else if (list.length == 1) {
            tokenList =
            `<img class="m-user-avatar" src="${list[0].image_thumbnail_url || IMG_URL['hourglass']}" alt="">
            <span class="u-item" data-item-id="${list[0].id}">#${lengthString(list[0].id)} </span>`
            dataTokenList = JSON.parse(JSON.stringify(list))
        } else if (list.length == 2) {
            tokenList =
            `<img class="m-user-avatar" src="${list[0].image_thumbnail_url || IMG_URL['hourglass']}" alt="">
            <span class="u-item" data-item-id="${list[0].id}">#${lengthString(list[0].id)}</span>
            &nbsp;and&nbsp;<img class="m-user-avatar" src="${list[1].image_thumbnail_url || IMG_URL['hourglass']}" alt="">
            &nbsp;<span class="u-item" data-item-id="${list[1].id}">#${lengthString(list[1].id)}</span>`
            dataTokenList = JSON.parse(JSON.stringify(list))
        } else {
            tokenList =
            `<img class="m-user-avatar" src="${list[0].image_thumbnail_url || IMG_URL['hourglass']}" alt="">
            <span class="u-item" data-item-id="${list[0].id}">#${lengthString(list[0].id)}</span>
            &nbsp;and&nbsp;other&nbsp;<span class="u-items" data-items-list='${JSON.stringify(list)}'>${list.length-1}&nbsp;items</span>`
            dataTokenList = JSON.parse(JSON.stringify([list[0], list[1]]))
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
    `<div class='m-inner' id="appendDivDomInnerRecommend">
        ${
            alertDomRender() ?
            `<h3><img src="${IMG_URL['alertIcon']}" alt="">Alert</h3>
            ${alertDomRender()}`
            : ''
        }
        ${
            timelineDom ?
            `<h3><img src="${IMG_URL['summaryIcon']}" alt="">Summary</h3>
            <div class="m-timeline-wrapper" id="summaryWrapperRecommend">
                ${timelineDom}
            </div>`
            : ''
        }
        ${
            (!alertDomRender() && !timelineDom) ?
            `<div class="m-right-empty" id="rightEmptyRecommend">
                <img src="${IMG_URL['noData']}" alt="">
                <h2>No data yet</h2>
            </div>`
            : ''
        }
    </div>`

    // 弹窗下半部高度为300px
    divDom.style = 'height: 300px;'

    let recommendPopDom = document.createElement('div');
    recommendPopDom.setAttribute('id', 'recommendPopDom');
    recommendPopDom.setAttribute('class', 'g-home-page-append');
    recommendPopDom.appendChild(divLeftDom);
    recommendPopDom.appendChild(divDom);

    if(document.querySelector(`.g-recommend`) && !document.querySelector('#recommendPop div')) {
        let position = getElemPos(document.querySelector('.g-recommend'), true);
        document.querySelector('#recommendPop').setAttribute('style', `display:block;top:${position.top}px;left:${position.x-400}px;`);
        document.querySelector('#recommendPop').appendChild(recommendPopDom);

        leftAddEventRecommend();
        rightAddEventRecommend();
        summaryLoadEventRecommend();
        summaryScollRecommend();
    }

    pushRecommendLock = false;
}

