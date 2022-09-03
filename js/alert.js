/**
 * alert.js
 * home主页部分左侧alert
*/

/**
 * 请求当前用户的alert数据
*/
async function ajaxAlert(tid, searchDomItem) {
    if(!tid) return;
    if(!searchDomItem) return;

    // 请求地址和参数
    let msg = {
        messageType: 'init',
        twitter_id: tid,
        user_id: '',
        page_index: 0,
    }
    if(cache[tid] && cache[tid] === 'none') {
        return;
    } else if (cache[tid] == 'ing') {
        await sleep(500);
        ajaxAlert(tid, searchDomItem);
    } else if (cache[tid]) {
        pushAlertDom(searchDomItem, cache[tid]);
        return;
    }
}

/**
 * 在home页面创建并添加alert节点
*/
function pushAlertDom (fDom, info) {
    let {alert} = info;
    if(!alert || alert.length == 0) return;
    if(fDom.getAttribute('data-has-alert') == '1') return;
    let main = document.querySelector('main[role="main"]');
    if (!main) return;

    // 创建alert部分节点
    const alertDomRender = () => {
        if(!alert || alert.length == 0) {
            return ''
        }

        let dom =
        `<div class="m-alert">
            <div class="m-timeline-time" style="margin-right: 16px;">
                <p style="color:#666;">${timestampToDate(alert[0].time).date}</p>
                <p class="m-text-gray">${timestampToDate(alert[0].time).soFar}</p>
            </div>
            ${summaryItem(alert[0], true)}
        </div>`
        return dom;
    }

     // 创建交易历史一条数据的节点
    const summaryItem = (item) => {
        let priceShow = item.price
        let pricePoint = `${item.price}`.split('.')[1]
        if(pricePoint && pricePoint.length > 4) {
            priceShow = item.price.toFixed(4)
        }

        let price = `&nbsp;at&nbsp;<b>${priceShow}&nbsp;ETH&nbsp;</b>&nbsp;via&nbsp;<b class="u-text-blue">Opensea</b>`
        let list = item.token_list;
        let tokenList = '';
        let dataTokenList = JSON.parse(JSON.stringify(list));
        if (!list || list.length == 0) {
            tokenList = ''
        } else if (list.length == 1) {
            tokenList =
            `<img class="m-user-avatar" src="${list[0].image_thumbnail_url || IMG_URL['hourglass']}" alt="">
            <span class="u-item u-item-alert" data-item-id="${list[0].id}">#${lengthString(list[0].id)} </span>`
        } else if (list.length == 2) {
            tokenList =
            `<img class="m-user-avatar" src="${list[0].image_thumbnail_url || IMG_URL['hourglass']}" alt="">
            <span class="u-item u-item-alert" data-item-id="${list[0].id}">#${lengthString(list[0].id)}</span>
            &nbsp;and&nbsp;<img class="m-user-avatar" src="${list[1].image_thumbnail_url || IMG_URL['hourglass']}" alt="">
            &nbsp;<span class="u-item u-item-alert" data-item-id="${list[1].id}">#${lengthString(list[1].id)}</span>`
        } else {
            tokenList =
            `<img class="m-user-avatar" src="${list[0].image_thumbnail_url || IMG_URL['hourglass']}" alt="">
            <span class="u-item u-item-alert" data-item-id="${list[0].id}">#${lengthString(list[0].id)}</span>
            &nbsp;and&nbsp;other&nbsp;<span class="u-items" data-items-list='${JSON.stringify(list)}'>${list.length-1}&nbsp;items</span>`
        }

        let itemDom =
        `<div class="m-alert-timeline-item" data-summary-tid="${item.tid}" data-token-address=${item.token_address} data-token-list=${JSON.stringify(dataTokenList)}>
            <div>
                <img class="m-img m-img-noborder" src="${IMG_URL['spouting-whale-border']}" alt="">
                ${ACTION_ENUM[item.action]}
                <img class="m-project-avatar" src="${item.image_url || IMG_URL['hourglass']}" alt="">
                <b class="u-project-tag alert-summary-project-name">${isNotUndefined(item.token_name) || item.project_name}</b>
            </div>
            <div>
                ${tokenList}
                ${item.action == 'mint' ? '' : price}.
            </div>
        </div>`
        return itemDom;
    }

    const alert_id = `alert_${createRandom()}`;
    let divDom = document.createElement('div');
    divDom.setAttribute('id', alert_id);
    divDom.setAttribute('class', 'g-alert-pop');

    let innerStyle = `background: linear-gradient(0deg, rgba(3, 15, 27, 0.9), rgba(23, 86, 145, 0.9)), url(${alert[0].image_url});`
    divDom.innerHTML =
    `<div class="g-alert-pop-inner" style="${innerStyle}">
        <h3><img src="${IMG_URL['alertBorderIcon']}" alt="">Alert</h3>
        ${alertDomRender()}
        <div class="m-close"><img src="${IMG_URL['alertCloseIcon']}" alt=""></div>
    </div>`

    main.appendChild(divDom);
    main.setAttribute('style', 'z-index: 3');
    fDom.setAttribute('data-has-alert', '1');
    fDom.setAttribute('data-alert-id', alert_id);

    let postion = getElemPos(fDom);
    divDom.setAttribute('style',`position: absolute;left: -300px; top: ${postion.top}px;z-index: 4;`);
    handleCloseAlert(divDom);
    handleAlertHref(divDom);
    window.addEventListener('scroll', () => {
        if(fDom) {
            let postion = getElemPos(fDom);
            if(postion.top - document.documentElement.scrollTop <= 100) {
                divDom.setAttribute('style',`display: none`);
            } else {
                divDom.setAttribute('style',`position: absolute;left: -300px; top: ${postion.top}px;z-index: 4;`);
            }
        }
    })
}

/**
 * 关闭alert
*/
function handleCloseAlert(alert) {
    let close = alert.querySelector('.m-close');
    close.addEventListener('click', () => {
        alert.remove();
    })
}

/**
 * 移除所有的alert
*/
function removeAllAlert() {
    let alertList = document.querySelectorAll(`div[id^="alert_"]`);
    for (let i = 0; i < alertList.length; i++) {
        alertList[i] && alertList[i].remove();
    }
    let fDomList = document.querySelectorAll(`div[data-has-alert="1"]`);
    for (let j = 0; j < fDomList.length; j++) {
        if (fDomList[j]) {
            fDomList[j].setAttribute('data-has-alert','0');
            fDomList[j].setAttribute('data-alert-id','');
        }
    }
    let rateList = document.querySelectorAll('.g-profile-rate');
    for (let y = 0; y < rateList.length; y++) {
        rateList[y] && rateList[y].remove();
    }
}

/**
 * alert的跳转方法
*/
function handleAlertHref(alert) {
    // 为项目添加跳转
    let summaryProjectName = alert.querySelector('.alert-summary-project-name');
    summaryProjectName.addEventListener('click', () => {
        let projectName = summaryProjectName?.innerHTML;
        let slug = summaryProjectName?.getAttribute('data-slug');
        if (slug && slug != 'undefined' && slug != 'null') {
            window.open('https://opensea.io/collection/'+slug);
        } else {
            // if (projectName && projectName != 'undefined') {
            //     window.open('https://opensea.io/collection/'+projectName.replace(/\s+/g, "-").replace(/---/g, "-").toLowerCase());
            // }
        }
    })

    let timeLineItem = alert.querySelector('.m-alert-timeline-item');
    let token_address = timeLineItem.getAttribute('data-token-address');
    let itemList = alert.querySelectorAll('.u-item-alert');
    for (let j = 0; j < itemList.length; j++) {
        itemList[j].addEventListener('click', () => {
            let id = itemList[j].getAttribute('data-item-id');
            window.open(`https://opensea.io/assets/${token_address}/${id}`);
        });
    }

}

/**
 * 为searchDomItem节点添加项目收益率标识
 */
async function profileRate(tid, searchDomItem) {
    if(!tid) return;
    if(!searchDomItem || !searchDomItem.parentNode) return;
    if(searchDomItem.parentNode.querySelector('.g-profile-rate')) return;

    // 请求地址和参数
    let msg = {
        messageType: 'init',
        twitter_id: tid,
        user_id: '',
        page_index: 0,
    }
    if(cache[tid] && cache[tid] === 'none') {
        return;
    } else if (cache[tid] == 'ing') {
        await sleep(500);
        profileRate(tid, searchDomItem);
    } else if (cache[tid]) {
        let {profile} = cache[tid];
        if(!profile) return;
        let profile_rate = profile.nft_profit_rate;

        let divDom = document.createElement('div');
        divDom.setAttribute('class', 'g-profile-rate');
        divDom.innerHTML =
        `<div class="${profile_rate >= 0 ? 'm-rate' : 'm-rate m-rate-red'}">
            <span style="color: #fff;">${profile_rate >= 0 ? '+' : '-'}${(profile_rate * 100 + '').split('.')[0]}%</span>
            <img class="m-gp" src="${profile_rate >= 0 ? IMG_URL['chart-increasing'] : IMG_URL['chart-decreasing']}" alt="">
        </div>`
        searchDomItem.parentNode.appendChild(divDom);
        return;
    }
}

