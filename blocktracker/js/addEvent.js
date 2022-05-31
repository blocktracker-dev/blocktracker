// addEvent.js: 为页面添加事件

// 为页面弹窗添加事件
function addEvent(module) {
    switch (module) {
        case 'left':
            leftAddEvent();
            break;
        case 'right':
            rightAddEvent();
            break;
    }
}

/**
 * 弹窗左边部分的事件
*/
function leftAddEvent() {
    // 为项目添加跳转
    document.getElementById('goToEtherscan') && document.getElementById('goToEtherscan').addEventListener('click', function(e) {
        let address = document.getElementById('goToEtherscan').getAttribute('data-address');
        window.open('https://etherscan.io/address/'+address);
    });
    document.getElementById('goToOpensea') && document.getElementById('goToOpensea').addEventListener('click', function(e) {
        let address = document.getElementById('goToOpensea').getAttribute('data-address');
        window.open('https://opensea.io/'+address);
    });
    
    // 为项目添加跳转
    document.getElementById('projectName') && document.getElementById('projectName').addEventListener('click', function(e) {
        let dataProjectName = document.getElementById('projectName').getAttribute('data-project-name');
        let slug = document.getElementById('projectName').getAttribute('data-slug');
        if (slug && slug != 'undefined' && slug != 'null') {
            window.open('https://opensea.io/collection/'+slug);
        } else {
            // if (dataProjectName && dataProjectName != 'undefined') {
            //     window.open('https://opensea.io/collection/'+dataProjectName.replace(/\s+/g, "-").replace(/---/g, "-").toLowerCase());
            // }
        }
    });
}

/**
 * 弹窗右边部分的事件（alert和summary）
*/
function rightAddEvent() {
    // 为项目添加跳转
    let summaryProjectName = document.getElementsByClassName('summary-project-name');
    for (let i = 0; i < summaryProjectName.length; i++) {
        summaryProjectName[i].addEventListener('click', function(e) {
            let projectName = summaryProjectName[i]?.innerHTML;
            let slug = summaryProjectName[i]?.getAttribute('data-slug');
            if (slug && slug != 'undefined' && slug != 'null') {
                window.open('https://opensea.io/collection/'+slug);
            } else {
                // if (projectName && projectName != 'undefined') {
                //     window.open('https://opensea.io/collection/'+projectName.replace(/\s+/g, "-").replace(/---/g, "-").toLowerCase());
                // }
            }
        });
    }

    let mTimelineItem = document.getElementsByClassName('m-timeline-item');
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
    }

    let handleDiscord = document.getElementById('handleDiscord');
    if (handleDiscord) {
        handleDiscord.addEventListener('click', () => {
            window.open(`https://discord.gg/6yqK2Dqft4`);
        })
    }

    showItemsPop();
    summaryLoadEvent();
    summaryScoll();

}

/**
 * 弹窗部分，显示items弹窗
*/
function showItemsPop() {
    let mTimelineItem = document.getElementsByClassName('m-timeline-item');
    for (let i = 0; i < mTimelineItem.length; i++) {
        let timeLineItem = mTimelineItem[i];
        let token_address = timeLineItem.getAttribute('data-token-address');
        let itemsList = timeLineItem.getElementsByClassName('u-items');
        for (let j = 0; j < itemsList.length; j++) {
            let target = itemsList[j];
            target.addEventListener('click', function(e) {
                let itemsListData = JSON.parse(target.getAttribute('data-items-list'));

                let popWrapper = getPopDom();
                let positionDom = getPosition(popWrapper);
                if(positionDom) {
                    pushDomItemsPop(token_address, itemsListData, leftHeight+40);
                }
            });
        }
    }
    const itemsPopMask = document.getElementById('itemsPop').parentNode;
    const itemsPopMaskClose = itemsPopMask.getElementsByClassName('m-close')[0];
    itemsPopMaskClose.addEventListener('click', function(e) {
        itemsPopMask.style = `width:670px;height:${leftHeight+40}px;display:none;`;
    });
}

// 创建items 的dom，并添加到div#itemsPop中
function pushDomItemsPop(token_address, itemsList, itemsDomHeight) {
    let itemsPopDom = document.getElementById('itemsPop');
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

    itemsPopDom.parentNode.style = `width:670px;height:${itemsDomHeight}px;display:block;`;

    itemsEvent(itemsPopDom);
    itemsLoadEvent();
    itemsScoll();

}

// item 点击事件，跳转item地址
function itemsEvent(itemsPopDom) {
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
function itemsScoll() {
    let itemsPopScoll = document.querySelector('#itemsPop .inner-scoll');
    if(!itemsPopScoll) return;
    itemsPopScoll.onscroll = () => {
        itemsScollEvent();
    }
}

// item 滚动时，请求数据
function itemsScollEvent() {
    let itemsPopScoll = document.querySelector('#itemsPop .inner-scoll');
    if (!itemsPopScoll) return;
    let domList = itemsPopScoll.querySelectorAll('.m-items-item');
    for (let i = 0; i < domList.length; i++) {
        let domItem = domList[i];
        if (domList[i].offsetTop - itemsPopScoll.scrollTop - itemsPopScoll.clientHeight < 20) {
            itemsLazyLoad(domItem);
        }
    }
}

// item 初始不滚动时，请求数据
function itemsLoadEvent() {
    let domList = document.querySelectorAll('#itemsPop .m-items-item');
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
        itemsLazyLoad(domItem);
    }
}

// summary 滚动 懒加载
function summaryScoll() {
    let appendDivDom = document.getElementById('appendDivDom');
    if(!appendDivDom) return;
    appendDivDom.onscroll = () => {
        summaryScollEvent();
    }
}

// 滚动时，请求数据
function summaryScollEvent() {
    let appendDivDom = document.getElementById('appendDivDom');
    if(!appendDivDom) return;
    let appendDivDomInner = document.getElementById('appendDivDomInner');
    if(!appendDivDomInner) return;
    let summaryWrapper = document.getElementById('summaryWrapper');
    if(!summaryWrapper) return;

    let domList = summaryWrapper.querySelectorAll('.m-timeline-item');
    for (let i = 0; i < domList.length; i++) {
        let domItem = domList[i];
        if (domList[i].offsetTop - appendDivDom.scrollTop - appendDivDom.clientHeight < 100) {
            summaryLazyLoad(domItem);
        }
    }
}

// 初始不滚动时，请求数据
function summaryLoadEvent() {
    let appendDivDom = document.getElementById('appendDivDom');
    if(!appendDivDom) return;
    let appendDivDomInner = document.getElementById('appendDivDomInner');
    if(!appendDivDomInner) return;
    let summaryWrapper = document.getElementById('summaryWrapper');
    if(!summaryWrapper) return;

    let domList = summaryWrapper.querySelectorAll('.m-timeline-item');
    for (let i = 0; i < domList.length; i++) {
        let domItem = domList[i];
        summaryLazyLoad(domItem);
    }
}

/**
 * 个人主页模块点击切换大小按钮，展示和隐藏 alert和summary部分
*/
function homePageSwitch() {
    let appendDivHomePageDom = document.getElementById('appendDivHomePageDom');
    let switchDom = document.getElementById('switchDom');
    let switchIcon = switchDom.querySelectorAll('img');

    switchDom.addEventListener('click', e => {
        if (switchIcon[0].style.display == 'none') {
            switchIcon[0].style.display = 'block';
            switchIcon[1].style.display = 'none';
            appendDivHomePageDom.style = 'display: block;height: 200px;';
        } else {
            switchIcon[0].style.display = 'none';
            switchIcon[1].style.display = 'block';
            appendDivHomePageDom.style = 'display: none;height: 200px;';
            let itemsPopMask = document.getElementById('itemsPopHomePage').parentNode;
            if(itemsPopMask) {
                itemsPopMask.style = 'display:none;'
            }
        }
    });
}

/**
 * 个人主页项目简介部分事件
*/
function leftAddEventHomePage() {
    // 为项目添加跳转
    document.getElementById('goToEtherscanHomePage') && document.getElementById('goToEtherscanHomePage').addEventListener('click', function(e) {
        let address = document.getElementById('goToEtherscanHomePage').getAttribute('data-address');
        window.open('https://etherscan.io/address/'+address);
    });
    document.getElementById('goToOpenseaHomePage') && document.getElementById('goToOpenseaHomePage').addEventListener('click', function(e) {
        let address = document.getElementById('goToOpenseaHomePage').getAttribute('data-address');
        window.open('https://opensea.io/'+address);
    });
    
    // 为项目添加跳转
    document.getElementById('projectNameHomePage') && document.getElementById('projectNameHomePage').addEventListener('click', function(e) {
        let dataProjectName = document.getElementById('projectNameHomePage').getAttribute('data-project-name');
        let slug = document.getElementById('projectNameHomePage').getAttribute('data-slug');
        if (slug && slug != 'undefined' && slug != 'null') {
            window.open('https://opensea.io/collection/'+slug);
        } else {
            // if (dataProjectName && dataProjectName != 'undefined') {
            //     window.open('https://opensea.io/collection/'+dataProjectName.replace(/\s+/g, "-").replace(/---/g, "-").toLowerCase());
            // }
        }
    });
}

/**
 * 个人主页项目alert和summary部分事件
*/
function rightAddEventHomePage() {
    // 为项目添加跳转
    let summaryProjectName = document.getElementsByClassName('summary-project-name');
    for (let i = 0; i < summaryProjectName.length; i++) {
        summaryProjectName[i].addEventListener('click', function(e) {
            let projectName = summaryProjectName[i]?.innerHTML;
            let slug = summaryProjectName[i]?.getAttribute('data-slug');
            if (slug && slug != 'undefined' && slug != 'null') {
                window.open('https://opensea.io/collection/'+slug);
            } else {
                // if (projectName && projectName != 'undefined') {
                //     window.open('https://opensea.io/collection/'+projectName.replace(/\s+/g, "-").replace(/---/g, "-").toLowerCase());
                // }
            }
        });
    }

    let mTimelineItem = document.getElementsByClassName('m-timeline-item');
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
    }
}

// 个人主页部分，summary 滚动 懒加载
function summaryScollHomePage() {
    let appendDivHomePageDom = document.getElementById('appendDivHomePageDom');
    if(!appendDivHomePageDom) return;
    appendDivHomePageDom.onscroll = () => {
        summaryScollEventHomePage();
    }
}

// 个人主页部分，滚动时，请求数据
function summaryScollEventHomePage() {
    let appendDivHomePageDom = document.getElementById('appendDivHomePageDom');
    if(!appendDivHomePageDom) return;
    let appendDivDomInnerHomePage = document.getElementById('appendDivDomInnerHomePage');
    if(!appendDivDomInnerHomePage) return;
    let summaryWrapperHomePage = document.getElementById('summaryWrapperHomePage');
    if(!summaryWrapperHomePage) return;

    let domList = summaryWrapperHomePage.querySelectorAll('.m-timeline-item');
    for (let i = 0; i < domList.length; i++) {
        let domItem = domList[i];
        if (domList[i].offsetTop - appendDivHomePageDom.scrollTop - appendDivHomePageDom.clientHeight < 100) {
            summaryLazyLoadHomePage(domItem);
        }
    }
}

// 个人主页，summary初始不滚动时，请求数据
function summaryLoadEventHomePage() {
    let appendDivHomePageDom = document.getElementById('appendDivHomePageDom');
    if(!appendDivHomePageDom) return;
    let appendDivDomInnerHomePage = document.getElementById('appendDivDomInnerHomePage');
    if(!appendDivDomInnerHomePage) return;
    let summaryWrapperHomePage = document.getElementById('summaryWrapperHomePage');
    if(!summaryWrapperHomePage) return;

    let domList = summaryWrapperHomePage.querySelectorAll('.m-timeline-item');
    if (domList.length == 0) {
        return;
    } else if (domList.length == 1) {
        summaryLazyLoadHomePage(domList[0]);
        return;
    }
    let max = 1;
    if(domList.length >= 3) {
        max = 2
    } else if(domList.length == 2) {
        max = 1
    }
    for (let i = 0; i <= max; i++) {
        let domItem = domList[i];
        summaryLazyLoadHomePage(domItem);
    }
}

// 推荐模块，项目部分添加事件
function leftAddEventRecommend() {
    // 为项目添加跳转
    document.getElementById('goToEtherscanRecommend') && document.getElementById('goToEtherscanRecommend').addEventListener('click', function(e) {
        let address = document.getElementById('goToEtherscanRecommend').getAttribute('data-address');
        window.open('https://etherscan.io/address/'+address);
    });
    document.getElementById('goToOpenseaRecommend') && document.getElementById('goToOpenseaRecommend').addEventListener('click', function(e) {
        let address = document.getElementById('goToOpenseaRecommend').getAttribute('data-address');
        window.open('https://opensea.io/'+address);
    });

    // 为项目添加跳转
    document.getElementById('projectNameRecommend') && document.getElementById('projectNameRecommend').addEventListener('click', function(e) {
        let dataProjectName = document.getElementById('projectNameRecommend').getAttribute('data-project-name');
        let slug = document.getElementById('projectNameRecommend').getAttribute('data-slug');
        if (slug && slug != 'undefined' && slug != 'null') {
            window.open('https://opensea.io/collection/'+slug);
        } else {
            // if (dataProjectName && dataProjectName != 'undefined') {
            //     window.open('https://opensea.io/collection/'+dataProjectName.replace(/\s+/g, "-").replace(/---/g, "-").toLowerCase());
            // }
        }
    });
}

// 推荐模块，alert和summary部分添加事件
function rightAddEventRecommend() {
    // 为项目添加跳转
    let summaryProjectName = document.getElementsByClassName('summary-project-name');
    for (let i = 0; i < summaryProjectName.length; i++) {
        summaryProjectName[i].addEventListener('click', function(e) {
            let projectName = summaryProjectName[i]?.innerHTML;
            let slug = summaryProjectName[i]?.getAttribute('data-slug');
            if (slug && slug != 'undefined' && slug != 'null') {
                window.open('https://opensea.io/collection/'+slug);
            } else {
                // if (projectName && projectName != 'undefined') {
                //     window.open('https://opensea.io/collection/'+projectName.replace(/\s+/g, "-").replace(/---/g, "-").toLowerCase());
                // }
            }
        });
    }

    let mTimelineItem = document.getElementsByClassName('m-timeline-item');
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
    }
}

// 推荐模块，summary 滚动 懒加载
function summaryScollRecommend() {
    let appendDivRecommendDom = document.getElementById('appendDivRecommendDom');
    if(!appendDivRecommendDom) return;
    appendDivRecommendDom.onscroll = () => {
        summaryScollEventRecommend();
    }
}

// 推荐模块，summary滚动时，请求数据
function summaryScollEventRecommend() {
    let appendDivRecommendDom = document.getElementById('appendDivRecommendDom');
    if(!appendDivRecommendDom) return;
    let appendDivDomInnerRecommend = document.getElementById('appendDivDomInnerRecommend');
    if(!appendDivDomInnerRecommend) return;
    let summaryWrapperRecommend = document.getElementById('summaryWrapperRecommend');
    if(!summaryWrapperRecommend) return;

    let domList = summaryWrapperRecommend.querySelectorAll('.m-timeline-item');
    for (let i = 0; i < domList.length; i++) {
        let domItem = domList[i];
        if (domList[i].offsetTop - appendDivRecommendDom.scrollTop - appendDivRecommendDom.clientHeight < 100) {
            summaryLazyLoadRecommend(domItem);
        }
    }
}

// 推荐模块，summary初始不滚动时，请求数据
function summaryLoadEventRecommend() {
    let appendDivRecommendDom = document.getElementById('appendDivRecommendDom');
    if(!appendDivRecommendDom) return;
    let appendDivDomInnerRecommend = document.getElementById('appendDivDomInnerRecommend');
    if(!appendDivDomInnerRecommend) return;
    let summaryWrapperRecommend = document.getElementById('summaryWrapperRecommend');
    if(!summaryWrapperRecommend) return;

    let domList = summaryWrapperRecommend.querySelectorAll('.m-timeline-item');
    for (let i = 0; i < 1; i++) {
        let domItem = domList[i];
        summaryLazyLoadRecommend(domItem);
    }
}