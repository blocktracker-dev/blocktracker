/**
 * pushDom.js
 * twitter弹窗中，添加节点
*/

// 弹窗左侧高度，为了右侧高度和左侧一致
let leftHeight = 0;

/**
 *  清除弹窗添加的节点
 * 左侧添加的节点为 div#appendLeftDivDom
 * 右侧添加的节点为 div#appendDivDom
*/
function clearDom() {
    if(document.getElementById('appendLeftDivDom')) {
        document.getElementById('appendLeftDivDom').remove();
    }
    if(document.getElementById('appendDivDom')) {
        document.getElementById('appendDivDom').remove();
    }
}

/**
 * 获取数据后，为弹窗添加新节点，展示数据
 * 左侧为项目信息，右侧为alert和summary
*/
function pushDom(info, cacheId) {
    if (pushDomLock) return;
    pushDomLock = true;
    clearDom();

    let { profile, summary, alert } = info;
    let popWrapper = getPopDom();

    let divLeftDom = document.createElement('div');
    divLeftDom.setAttribute('id', 'appendLeftDivDom');
    divLeftDom.setAttribute('class', 'g-left-append');

    // 左侧的的节点
    if ( profile.address ) {
        // 项目收益率
        let profile_rate = profile.nft_profit_rate
        let rateDom =
        `<div class="${profile_rate >= 0 ? 'm-rate' : 'm-rate m-rate-red'}">
            <span style="color: #fff;">${profile_rate >= 0 ? '+' : '-'}${(profile_rate * 100 + '').split('.')[0]}%</span>
            <img class="m-gp" src="${profile_rate >= 0 ? IMG_URL['chart-increasing'] : IMG_URL['chart-decreasing']}" alt="">
        </div>`

        divLeftDom.innerHTML =
        `<div class='m-inner'>
            <div class="m-address-project">
                <div class="m-address" id="goToEtherscan" data-address=${profile.address}>
                    <img class="m-icon" src="https://resources-fww.oss-cn-zhangjiakou.aliyuncs.com/nl/addressIcon.png" alt="">
                    <span class="m-content">${profile.address.substring(0, 10)}</span>
                </div>
                <div class="m-project" id="goToOpensea" data-address=${profile.address}>
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
                        <p>The recently mostly bought by value are from <span id="projectName" data-project-name=${profile.project_name} data-slug=${profile.slug} style="cursor:pointer;">${profile.project_name}</span><img class="m-img" src="${IMG_URL['fire']}" alt=""></p>
                    </li>`
                }
            </ul>
        </div>`
    }

    // 添加右侧节点
    let divDom = document.createElement('div');
    divDom.setAttribute('id', 'appendDivDom');
    divDom.setAttribute('class', 'g-layers-append');

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
        `<div class="m-timeline-item"
            id="summary_${summaryIndex}"
            data-cache-id="${cacheId}"
            data-id="${item.id}"
            data-summary-tid="${item.tid}"
            data-summary-id="summary_${summaryIndex}"
            data-token-address=${item.token_address}
            data-token-list=${JSON.stringify(dataTokenList)}
        >
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
            <div class="m-timeline-time" style="margin-right: 20px;">
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
    `<div class='m-inner' id="appendDivDomInner">
        ${
            alertDomRender() ?
            `<h3><img src="${IMG_URL['alertIcon']}" alt="">Alert</h3>
            ${alertDomRender()}`
            : ''
        }
        ${
            timelineDom ?
            `<h3><img src="${IMG_URL['summaryIcon']}" alt="">Summary</h3>
            <div class="m-timeline-wrapper" id="summaryWrapper">
                ${timelineDom}
            </div>`
            : ''
        }
        ${
            (!alertDomRender() && !timelineDom) ?
            `<div class="m-right-empty" id="rightEmpty">
                <img src="${IMG_URL['noData']}" alt="">
                <h2>No data yet</h2>
            </div>`
            : ''
        }
    </div>`

    // 关闭loading
    toggleLoading(true);

    let positionDom = getPosition(popWrapper);
    let popContentLeftDom;
    if (positionDom) {
        popContentLeftDom = positionDom.querySelector('div:first-child>div:first-child>div:first-child>div:first-child>div:first-child>div:first-child>div:first-child>div:first-child');
    }

    if(profile.address && popContentLeftDom) {
        popContentLeftDom.appendChild(divLeftDom);
        leftHeight = popContentLeftDom.offsetHeight + 60;
        addEvent('left');
    }

    let popContentDom;
    if (positionDom) {
        popContentDom = positionDom.querySelector('div:first-child>div:first-child>div:first-child>div:first-child>div:first-child>div:first-child>div:first-child');
    }

    if((alert || summary) && popContentDom) {
        divDom.style = `height:${leftHeight}px;`;
        popContentDom.appendChild(divDom);
        popContentDom.classList.add("g-pop-dom");
        popContentDom.style = 'width:670px;padding:20px 0 30px;display:flex;flex-direction: row;postion:relative;';
        popContentDom.querySelector('div').style = 'width:300px;'
        // 没有数据时，站位图no data
        let rightEmpty = document.getElementById('rightEmpty');
        if (rightEmpty) {
            rightEmpty.style = `height:${leftHeight-20}px;`;
        }

        // 弹窗内添加items展示的节点，之后items节点直接添加到这个节点
        let popMaskDom = document.createElement('div');
        popMaskDom.setAttribute('class', 'g-items-pop-mask');
        popMaskDom.innerHTML =
        `<div class="g-items-pop" id="itemsPop">
            <div class="m-inner"></div>
        </div>
        <div class="m-close"><img src="${IMG_URL['alertCloseIcon']}" alt=""></div>`
        popContentDom.appendChild(popMaskDom);

        // 弹窗右上角添加discord图标
        if(!document.getElementById('handleDiscord')) {
            let operationDom = document.createElement('div');
            operationDom.setAttribute('id', 'handleDiscord');
            operationDom.setAttribute('class', 'g-operation-discord');
            operationDom.innerHTML =
            `<img class="operation-img" src="${IMG_URL['discordIcon']}">`
            popContentDom.appendChild(operationDom);
        }

        // 弹窗右下角 sponsored
        if(!popContentDom.querySelector('.g-sponsored')) {
            insertSponsored(popContentDom);
            const gSponsored = document.querySelector('.g-pop-dom .g-sponsored');
            gSponsored.addEventListener('click', e => {
                window.open('https://maonft.com/');
            })
        }

        const itemsPopMaskDom = document.getElementById('itemsPop').parentNode;
        itemsPopMaskDom.style = `width:670px;height:${leftHeight+40}px;display:none;`;

        addEvent('right');
    }

    pushDomLock = false;
}