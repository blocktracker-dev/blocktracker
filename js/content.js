
// 页面用户信息，当前需要请求的twitter用户信息
let pageInfo = {};

// 数据缓存对象，用来缓存请求过的twitter用户数据
let cache = {};
let pushDomLock = false;

// 给头像做标识的样式
const BG_COLOR = "background: conic-gradient(at 50%, #4499CC, #6666AA, #FFDDCC, #4499CC);border-radius:9999px;"

// summary 状态
const ACTION_ENUM = {
    'opensea_buy': 'Bought',
    'opensea_sell': 'Sold',
    'mint': 'Minted',
}

// 静态资源图片url统一管理
const IMG_URL = {
    'inbox-tray': 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/inbox-tray_1f4e5.png',
    'outbox-tray': 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/outbox-tray_1f4e4.png',
    'pick': 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/322/pick_26cf-fe0f.png',
    'chart-increasing': 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/chart-increasing_1f4c8.png',
    'chart-decreasing': 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/chart-decreasing_1f4c9.png',
    'spouting-whale': 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/322/spouting-whale_1f433.png',
    'spouting-whale-border': chrome.runtime.getURL("img/spouting-whale-border.jpg"),
    'fire': 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/fire_1f525.png',
    'money-bag': 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/money-bag_1f4b0.png',
    'alertIcon': chrome.runtime.getURL("img/alertIcon.png"),
    'alertBorderIcon': chrome.runtime.getURL("img/alertBorderIcon.jpg"),
    'summaryIcon': chrome.runtime.getURL("img/summaryIcon.png"),
    'addressIcon': chrome.runtime.getURL("img/addressIcon.png"),
    'projectIcon': chrome.runtime.getURL("img/projectIcon.png"),
    'warningIcon': chrome.runtime.getURL("img/warning.png"),
    'loadingIcon': chrome.runtime.getURL("img/loading.gif"),
    'projectOwner': chrome.runtime.getURL("img/projectOwner.jpg"),
    'hourglass': chrome.runtime.getURL("img/hourglass.png"),
    'shrinkage': chrome.runtime.getURL("img/shrinkage.png"),
    'unfold': chrome.runtime.getURL("img/unfold.png"),
    'noData': chrome.runtime.getURL("img/noData.jpg"),
    'alertCloseIcon': chrome.runtime.getURL("img/alertCloseIcon.jpg"),
    'operationIcon': chrome.runtime.getURL("img/operationIcon.png"),
    'discordIcon': chrome.runtime.getURL("img/discordIcon.jpg"),
    'associated': chrome.runtime.getURL("img/associated.jpg"),
    'maodao': chrome.runtime.getURL("img/maodao.jpg"),
}

/**
 * twitter 用户头像的弹窗信息，会放到 div#layers中
 * 判断 div#layers 中是否生成了子节点，判断弹窗是否渲染
 * 有弹窗出现时，返回弹窗节点 div#layers，否则返回返回falseÍ
*/
function getPopDom() {
    let popWrapper = document.getElementById('layers');
    if(popWrapper && popWrapper.childNodes.length >= 2) {
        return popWrapper
    }
    return false;
}

/**
 * twitter用户头像弹窗中，有一个定位的div节点
 * 判断某dom种，是否有定位节点，含有定位节点时，返回定位节点，没有时，返回false
*/
function getPosition(popWrapper) {
    if(!popWrapper) {
        return false;
    }
    // 定位情况比较多，所以，需要判断div的style属性以 不同定位开头的情况
    let positionDom = popWrapper.querySelector(`div[style^="bottom"]`) || popWrapper.querySelector(`div[style^="top"]`) || popWrapper.querySelector(`div[style^="left"]`) || popWrapper.querySelector(`div[style^="right"]`);
    return positionDom;
}

/**
 * 获取twitter用户头像弹窗的信息，获取插件使用者的登录账号和弹窗用户的账号
*/
function getPageInfo() {
    let popWrapperDom = getPopDom();
    let positionDom = getPosition(popWrapperDom);
    if (!popWrapperDom || !positionDom) {
        return false;
    }
    let tid = '';
    if(positionDom.querySelector('a[role=link]') && positionDom.querySelector('a[role=link]').getAttribute('href')) {
        tid = positionDom.querySelector('a[role=link]').getAttribute('href').split('/')[1];
    }
    let uids = ''
    if(document.querySelector('div[aria-label^="Account"]') && Array.from(document.querySelector('div[aria-label^="Account"]').querySelectorAll('span'))) {
        uids = Array.from(document.querySelector('div[aria-label^="Account"]').querySelectorAll('span')).find(el => el.textContent.includes('@'))
    }
    if(document.querySelector('div[aria-label^="账号菜单"]') && Array.from(document.querySelector('div[aria-label^="账号菜单"]').querySelectorAll('span'))) {
        uids = Array.from(document.querySelector('div[aria-label^="账号菜单"]').querySelectorAll('span')).find(el => el.textContent.includes('@'))
    }
    pageInfo.tid = tid;
    pageInfo.uid = uids ? uids.innerHTML.split('@')[1] : '';
    return true;
}

/**
 * 弹窗信息请求
*/
async function ajaxData() {
    // 请求地址和参数
    let msg = {
        messageType: 'init',
        twitter_id: pageInfo.tid, // ParisHilton  pageInfo.tid
        user_id: pageInfo.uid,
        page_index: 0,
    }
    if(cache[pageInfo.tid] && cache[pageInfo.tid] === 'none') {
        //请求后发现没有该数据，关闭loading
        toggleLoading(true);
        return;
    } else if (cache[pageInfo.tid] == 'ing') {
        //请求后发现该数据正在请求中，休眠500毫秒后，递归回调ajaxData()                                                                                                                                                                                                                                                                          
        await sleep(500);
        ajaxData();
    } else if (cache[pageInfo.tid]) {
        // 如果缓存中有该数据，关闭后台summary请求，将数据渲染到弹窗中
        try {
            let msg = {
                messageType: 'clearSummary',
                clearQueue: '1'
            }
            chrome.runtime.sendMessage(msg, () => {
                pushDom(cache[pageInfo.tid], pageInfo.tid);
                return;
            });
        } catch (error) {
            pushDom(cache[pageInfo.tid], pageInfo.tid);
            return;
        }
    } else {
        // 如果缓存没有记录过，则是新的数据，需要请求接口
        try {
            chrome.runtime.sendMessage(msg, res => {
                if(res.code === 200) {
                    cache[pageInfo.tid] = res.data;
                    pushDom(res.data, pageInfo.tid);
                } else if(res.code == 500) {
                    toggleLoading(true);
                    return;
                }
            });
        } catch (error) {}
    }
}

let timer; // loopUserCellList 定时器
/**
 * home推荐 列表中，用户的一条信息的dom为 div[data-testid="UserCell"]
 * 定时循环查看，直到UserCell出现，获取所有home推荐节点，对用户头像标识
*/
function loopUserCellList() {
    timer = setTimeout(() => {
        let UserCellList = document.querySelectorAll(`div[data-testid="UserCell"]`);
        // 出现home推荐列表时，处理dom
        if (UserCellList && UserCellList.length > 0) {
            clearTimeout(timer);
            // 对后台保存过的数据的用户进行标识
            marksLoggedUsers(UserCellList);
            // 滚动时，重新获取dom进行标识
            handleScroll();
        } else {
            // 递归
            loopUserCellList();
        }
    }, 800)
}

/**
 * 页面滚动时，重新获取home推荐列表，为头像做标识
*/
function handleScroll() {
    window.addEventListener('scroll', () => {
        let UserCellList = document.querySelectorAll(`div[data-testid="UserCell"]`);
        if(UserCellList && UserCellList.length > 0) {
            marksLoggedUsers(UserCellList);
        }
    })
}

let personalPageTimer = null;
/**
 * 判断当前页面为twitter个人主页，为主页的顶部头像添加标识
 * 并请求接口，获取当前主页用户的交易信息
 * 普通用户和nft头像用户，识别不一样
*/
function personalPage() {
    removePersonal();
    let url = location.href;
    const id = url.replace('https://twitter.com/','').split('/')[0];
    const personPhoto = document.querySelector(`a[href="/${id}/photo"]`) || document.querySelector(`a[href="/${id}/nft"]`);

    if (!personPhoto) {
        personalPageTimer = setTimeout(() => {
            personalPage();
        }, 500);
    } else {
        clearTimeout(personalPageTimer);
        personalPageTimer = null;

        if (followedIdList.indexOf(id) != -1) {
            const personPhoto = document.querySelector(`a[href="/${id}/photo"]`) || document.querySelector(`a[href="/${id}/nft"]`);
            personPhoto.parentNode.style.padding = '8px';
            personPhoto.parentNode.parentNode.style = BG_COLOR;
            ajaxHomePage(id);
        } else {
            personPhoto.parentNode.style.padding = '0';
        }
    }
}

/**
 * 如果主页有交易信息，删除掉，防止多次append dom节点
*/
function removePersonal() {
    let appendHomePageDom = document.querySelector(`#appendHomePageDom`);
    appendHomePageDom && appendHomePageDom.remove();
}

/**
 * 获取当前主页的用户信息，和home推荐列表的请求逻辑一样
*/
async function ajaxHomePage(tid) {
    if(!tid) return;
    if(document.querySelector('#appendHomePageDom')) {
        document.querySelector('#appendHomePageDom').remove();
    }

    // 请求地址和参数
    let msg = {
        messageType: 'init',
        twitter_id: tid, // ParisHilton  pageInfo.tid
        user_id: '',
        page_index: 0,
    }
    if(cache[tid] && cache[tid] === 'none') {
        return;
    } else if (cache[tid] == 'ing') {
        await sleep(500);
        ajaxHomePage();
    } else if (cache[tid]) {
        pushDomHomePage(tid);
        return;
    } else {
        // 通过后台跨域请求数据
        try {
            chrome.runtime.sendMessage(msg, function(res) {
                if(res.code === 200) {
                    cache[tid] = res.data;
                    pushDomHomePage(tid);
                }
            });
        } catch (error) {}
    }
}


let timerInner; // loopTimeline 定时器
/**
 * 和home推荐列表逻辑基本一样，
 * 主要是timeline的dom结构和推荐列表有所区别
*/
function loopTimeline() {
    timerInner = setTimeout(() => {
        let timelineList = [...document.querySelectorAll(`div[aria-label^="Timeline"]>div>div`), ...document.querySelectorAll(`div[aria-label^="时间线"]>div>div`)];
        let avatarWrapperList = [...document.querySelectorAll(`div[aria-label^="Timeline"] div[class="css-1dbjc4n r-1awozwy r-1hwvwag r-18kxxzh r-1b7u577"]`), ...document.querySelectorAll(`div[aria-label^="时间线"] div[class="css-1dbjc4n r-1awozwy r-1hwvwag r-18kxxzh r-1b7u577"]`)];
        // avatarWrapperList一开始渲染时，用户头像dom有可能为空,
        // 所以要判断timeline出现并且头像dom也出现，才对头像做标识
        if (timelineList && timelineList.length > 0 && avatarWrapperList && avatarWrapperList.length > 0) {
            clearTimeout(timerInner);
            marksLoggedUsers(timelineList);
            handleScrollTimeline();
        } else {
            loopTimeline();
        }
    }, 800)
}
/**
 * 页面滚动时，重新获取timeline列表，对
*/
function handleScrollTimeline() {
    window.addEventListener('scroll', () => {
        let timelineList = [...document.querySelectorAll(`div[aria-label^="Timeline"]>div>div`), ...document.querySelectorAll(`div[aria-label^="时间线"]>div>div`)];
        if(timelineList && timelineList.length > 0) {
            marksLoggedUsers(timelineList);
        }
    })
}

let whoToFollowTimer = null;
/**
 * 因为我们的推荐模块，dom结构依赖猜你喜欢，所以
 * 当前页面出现了的猜你喜欢模块，我们再去请求推荐接口，并对猜你喜欢模块头像标识
*/
function loopWhoToFollow(userId) {
    whoToFollowTimer = setTimeout(() => {
        let whoToFollow = document.querySelector(`aside[aria-label^="Who to follow"]`) || document.querySelector(`aside[aria-label^="推荐关注"]`);
        let UserCellList;
        if(whoToFollow) {
            UserCellList = whoToFollow.querySelectorAll(`div[data-testid="UserCell"]`);
        }
        if (whoToFollow && UserCellList) {
            clearTimeout(whoToFollowTimer);
            ajaxRecommend(whoToFollow, userId);
            marksLoggedUsers(UserCellList);
        } else {
            loopWhoToFollow(userId);
        }
    }, 500)
}

let userIdTimer = null;
/**
 * 定时监听插件使用者用户登录情况，
 * 通过左下角当前登录人dom，获取当前登录人信息
 * 获取信息后，判断菜单模块是否渲染和触发loopWhoToFollow()
*/
function loopUserId() {
    userIdTimer = setTimeout(() => {
        let user = 
        document.querySelector(`div[aria-label^="Account"] div[dir="ltr"]>span[class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0"]`) 
        || document.querySelector(`div[aria-label^="账号菜单"] div[dir="ltr"]>span[class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0"]`);
        if (user && (user.innerHTML.indexOf('@') != -1)) {
            clearTimeout(userIdTimer);
            let userId = user.innerHTML.replace('@','');
            loopWhoToFollow(userId);
            loopNav(userId);
        } else {
            loopUserId();
        }
    }, 500)
}


// 对推荐数据进行缓存
let cacheRecommend = []
/**
 * 请求推荐数据
*/
function ajaxRecommend(whoToFollow, uid) {
    if(!uid) return;

    // 请求地址和参数
    let msg = {
        messageType: 'recommend',
        header: {
            user_id: uid,
        },
        data: {
            follow_list: [],
            rec_cnt: 10,
        }
    }
    // 通过后台跨域请求数据
    try {
        chrome.runtime.sendMessage(msg, (res) => {
            let recommend = res.data;
            cacheRecommend = recommend;
            pushWhoToFollow(whoToFollow, recommend);
        });
    } catch (error) {}
}

let navTimer = null;
/**
 * 定时判断当前页面菜单出现后，请求feed数据
*/
function loopNav(uid) {
    navTimer = setTimeout(() => {
        let nav = document.querySelector(`nav[aria-label="Primary"]`) || document.querySelector(`nav[aria-label="主要"]`);
        if (nav) {
            navTimer = clearTimeout(navTimer);
            ajaxFeed(uid, nav);
        } else {
            loopNav();
        }
    }, 800)
}

// 缓存feed
let cacheFeed = [];
/**
 * 请求feed数据，
 * 如果缓存中有数据，直接使用缓存数据，
 * 如果缓存没有，请求数据
*/
function ajaxFeed(uid, nav) {
    if (!uid) return;
    // 请求地址和参数
    let msg = {
        messageType: 'feed',
        header: {
            user_id: uid,
        }
    }
    if (cacheFeed && cacheFeed.length > 0) {
        pushNav(nav);
    } else {
        // 通过后台跨域请求数据
        try {
            chrome.runtime.sendMessage(msg, (res) => {
                if (res && res.data && res.data.length > 0) {
                    cacheFeed = res.data;
                    pushNav(nav);
                }
            });
        } catch (error) {}
    }
}

/**
 * 对twitter头像进行标识，分不同的情况识别dom结构
*/
function marksLoggedUsers(domList) {
    for (let i = 0; i < domList.length; i++) {
        let domItem = domList[i];

        let showAlert = true;
        // 默认为timeline和home页面的头像父节点
        let searchDom = domItem.querySelectorAll(`div[class="css-1dbjc4n r-1awozwy r-1hwvwag r-18kxxzh r-1b7u577"]`);
        // 我的关注页面
        if(window.location.href.indexOf('/follow') != -1) {
            searchDom = domItem.querySelectorAll(`div[class="css-1dbjc4n r-1hwvwag r-18kxxzh r-1h0z5md r-1b7u577"]`);
            showAlert = false;
        }
        // 某个用户关注页面
        if(window.location.href.indexOf('?user_id=') != -1) {
            searchDom = domItem.querySelectorAll(`div[class="css-1dbjc4n r-1hwvwag r-18kxxzh r-1h0z5md r-1b7u577"]`);
            showAlert = false;
        }
        // twitter推荐模块
        if(domItem.parentNode && domItem.parentNode.parentNode && domItem.parentNode.parentNode.getAttribute('aria-label') == 'Who to follow') {
            searchDom = domItem.querySelectorAll(`div[class="css-1dbjc4n r-1hwvwag r-18kxxzh r-1777fci r-1b7u577"]`);
            showAlert = false;
        }
        if(domItem.parentNode && domItem.parentNode.parentNode && domItem.parentNode.parentNode.getAttribute('aria-label') == '推荐关注') {
            searchDom = domItem.querySelectorAll(`div[class="css-1dbjc4n r-1hwvwag r-18kxxzh r-1777fci r-1b7u577"]`);
            showAlert = false;
        }
        searchDom.forEach(searchDomItem => {
            let aLink = searchDomItem.querySelectorAll(`a[href^="/"]`);
            aLink.forEach(element => {
                let idTemp = element.getAttribute('href').split('/')[1];
                if (element.querySelector('img') && followedIdList.indexOf(idTemp) != -1) {
                    element.parentNode.parentNode.style = 'margin:2.6px;background-color:#fff;border:1.4px solid #fff;border-radius:9999px;width:calc(100% - 8px);height:calc(100% - 8px);';
                    element.parentNode.parentNode.parentNode.style = BG_COLOR;
                    // 预加载数据
                    masksCache(idTemp);
                    // 如果是home页面，请求alert数据
                    if (showAlert && (window.location.href.indexOf('://twitter.com/home') != -1)) {
                        ajaxAlert(idTemp, searchDomItem);
                    }
                    // 如果是推荐模块，请求收益率数据
                    if(domItem.parentNode && domItem.parentNode.parentNode && domItem.parentNode.parentNode.getAttribute('aria-label') == 'Who to follow') {
                        profileRate(idTemp, searchDomItem);
                    }
                    if(domItem.parentNode && domItem.parentNode.parentNode && domItem.parentNode.parentNode.getAttribute('aria-label') == '推荐关注') {
                        profileRate(idTemp, searchDomItem);
                    }
                }
            });
        })
    }
}

/**
 * 由于鼠标移到用户头像是，再请求数据，用户需要等待，
 * 所以，提前会判断twitter是否为followedIdList我们我们关注的数据，
 * 如果是我们存在的数据，请求数据，保存到缓存对象里面
*/
function masksCache(idTemp) {

    // 请求地址和参数
    let msg = {
        messageType: 'init',
        twitter_id: idTemp, // ParisHilton  pageInfo.tid
        user_id: pageInfo.uid,
        page_index: 0,
    }

    // 判断缓存数据是否有，或者请求中
    if (cache[idTemp]) { // 有数据和请求中，都不再请求
        return;
    } else {
        cache[idTemp] = 'ing';
    }
    // 通过后台跨域请求数据
    try {
        chrome.runtime.sendMessage(msg, res => {
            if(res.code === 200) {
                cache[idTemp] = res.data;
            } else if(res.code === 500) {
                cache[idTemp] = 'none';
            }
        });
    } catch (error) {}
}

/**
 * items初始加载时，请求items数据
*/
function itemsLazyLoad(domItem) {
    // 判断数据有没有请求过
    if(domItem.getAttribute('data-requested')) return;

    let data = {};
    let domId = domItem.getAttribute('id');
    data.token = domItem.getAttribute('data-token-address');
    data.item_id = domItem.getAttribute('data-item-id');
    // 请求地址和参数
    let msg = {
        messageType: 'items',
        data: data,
        domId: domId
    }
    domItem.setAttribute('data-requested', '1');
    // 通过后台跨域请求数据
    try {
        chrome.runtime.sendMessage(msg, function(res) {
            if(res && res.code === 200) {
                itemsLazyLoadCallBack(res.data);
            }
        });
    } catch (error) {}

}

/**
 * items请求数据返回时，items图片渲染到页面上
*/
function itemsLazyLoadCallBack(data) {
    let itemDom = document.getElementById(data.domId);
    if(!itemDom) return;
    if(data.image_thumbnail_url && data.image_thumbnail_url != 'null' && data.image_thumbnail_url != 'undefined') {
        itemDom.querySelector('.m-user-avatar').setAttribute('src', data.image_thumbnail_url);
    }
    return;
}

/**
 * 个人主页的交易信息，items初始加载时，请求项目和items数据，渲染项目，items的图片和项目名称
*/
function itemsLazyLoadHomePage(domItem) {
    if(domItem.getAttribute('data-requested')) return;

    let data = {};
    let domId = domItem.getAttribute('id');
    data.token = domItem.getAttribute('data-token-address');
    data.item_id = domItem.getAttribute('data-item-id');
    // 请求地址和参数
    let msg = {
        messageType: 'items',
        data: data,
        domId: domId
    }
    domItem.setAttribute('data-requested', '1');
    // 通过后台跨域请求数据
    try {
        chrome.runtime.sendMessage(msg, function(res) {
            if(res && res.code === 200) {
                itemsLazyLoadCallBackHomePage(res.data);
            }
        });
    } catch (error) {}

}


/**
 * 个人主页的交易信息，items请求数据返回时，items图片渲染到页面上
*/
function itemsLazyLoadCallBackHomePage(data) {
    let itemDom = document.getElementById(data.domId);
    if(!itemDom) return;
    if(data.image_thumbnail_url && data.image_thumbnail_url != 'null' && data.image_thumbnail_url != 'undefined') {
        itemDom.querySelector('.m-user-avatar').setAttribute('src', data.image_thumbnail_url);
    }
    return;
}

/**
 * feed，items初始加载时，请求项目和items数据，渲染项目，items的图片和项目名称
*/
function itemsLazyLoadFeed(domItem) {
    if(domItem.getAttribute('data-requested')) return;

    let data = {};
    let domId = domItem.getAttribute('id');
    data.token = domItem.getAttribute('data-token-address');
    data.item_id = domItem.getAttribute('data-item-id');
    // 请求地址和参数
    let msg = {
        messageType: 'items',
        data: data,
        domId: domId
    }
    domItem.setAttribute('data-requested', '1');
    // 通过后台跨域请求数据
    try {
        chrome.runtime.sendMessage(msg, function(res) {
            if(res && res.code === 200) {
                itemsLazyLoadCallBackFeed(res.data);
            }
        });
    } catch (error) {}

}


/**
 * feed，items请求数据返回时，items图片渲染到页面上
*/
function itemsLazyLoadCallBackFeed(data) {
    let itemDom = document.getElementById(data.domId);
    if(!itemDom) return;
    if(data.image_thumbnail_url && data.image_thumbnail_url != 'null' && data.image_thumbnail_url != 'undefined') {
        itemDom.querySelector('.m-user-avatar').setAttribute('src', data.image_thumbnail_url);
    }
    return;
}

/**
 * 弹窗中的summary，初始加载时，
 * 请求项目数据和summary展示的item数据
*/
function summaryLazyLoad(domItem) {
    if(domItem.getAttribute('data-requested')) return;

    let data = {};
    let domId = domItem.getAttribute('data-summary-id');
    data.cacheId = domItem.getAttribute('data-cache-id');
    data.tid = domItem.getAttribute('data-token-tid');
    data.token_address = domItem.getAttribute('data-token-address');
    data.tokenList = JSON.parse(domItem.getAttribute('data-token-list'));
    // 请求地址和参数
    let msg = {
        messageType: 'summary',
        data: data,
        domId: domId
    }
    
    domItem.setAttribute('data-requested', '1');

    let summary = cache[data.cacheId].summary;
    let currentSummary = summary.filter(item => {
        return item.id == domItem.getAttribute('data-id');
    })[0]
    if(currentSummary && currentSummary.image_url) {
        let data = {
            cacheId: msg.data.cacheId,
            tid: msg.data.tid,
            token_address: msg.data.token_address,
            domId: domId,
            image_url: currentSummary.image_url,
            project_name: currentSummary.project_name,
            slug: currentSummary.slug,
            tokenList: currentSummary.tokenList,
        }
        summaryLazyLoadCallBack(data, true);
        return;
    } else {
        // 通过后台跨域请求数据
        try {
            chrome.runtime.sendMessage(msg, function(res) {
                if(res && res.code === 200) {
                    summaryLazyLoadCallBack(res.data);
                }
            });
        } catch (error) {}
    }

}

/**
 * 弹窗中的summary，请求数据返回时，项目名称，项目图片，summary 图片渲染到页面上
 * 由于弹窗中的信息使用比较频繁，所以，项目和items信息也会放到缓存里
*/
function summaryLazyLoadCallBack(data, hasCache) {
    let summaryItemDom = document.getElementById(data.domId);
    if(!summaryItemDom) {
        return;
    }
    if(data.image_url && data.image_url != 'null') {
        summaryItemDom.querySelector('.m-project-avatar').setAttribute('src', data.image_url);
    }
    if (summaryItemDom.querySelector('.summary-project-name').innerHTML.toLocaleLowerCase().trim() == 'undefined') {
        summaryItemDom.querySelector('.summary-project-name').innerHTML = data.project_name;
    }

    summaryItemDom.querySelector('.summary-project-name').setAttribute('data-slug', data.slug);
    
    let imgUserAvatar = summaryItemDom.querySelectorAll('.m-user-avatar');
    for (let i = 0; i < imgUserAvatar.length; i++) {
        if (data.tokenList && data.tokenList[i] && data.tokenList[i].image_thumbnail_url && data.tokenList[i].image_thumbnail_url != 'undefined') {
            imgUserAvatar[i].setAttribute('src', data.tokenList[i].image_thumbnail_url);
        }
    }
    if (hasCache) return;
    let summary = cache[data.cacheId].summary;
    let currentSummary = summary.filter(item => {
        return item.id == summaryItemDom.getAttribute('data-id');
    })[0]
    if(currentSummary) {
        currentSummary.image_url = data.image_url;
        currentSummary.project_name = data.project_name;
        currentSummary.slug = data.slug;
        for (let j = 0; j < imgUserAvatar.length; j++) {
            currentSummary.token_list[j].image_thumbnail_url = data.tokenList[j].image_thumbnail_url
        }
    }
    return;
}

/**
 * 个人主页的summary，初始加载时，
 * 请求项目数据和summary展示的item数据
*/
function summaryLazyLoadHomePage(domItem) {
    if(domItem.getAttribute('data-requested')) return;

    let data = {};
    let domId = domItem.getAttribute('data-summary-id');
    data.tid = domItem.getAttribute('data-token-tid');
    data.token_address = domItem.getAttribute('data-token-address');
    data.tokenList = JSON.parse(domItem.getAttribute('data-token-list'));
    // 请求地址和参数
    let msg = {
        messageType: 'summary',
        data: data,
        domId: domId
    }
    
    domItem.setAttribute('data-requested', '1');

    // 通过后台跨域请求数据
    try {
        chrome.runtime.sendMessage(msg, function(res) {
            if(res.code === 200) {
                summaryLazyLoadCallBackHomePage(res.data);
            }
        });
    } catch (error) {}
    
}

/**
 * 个人主页中的summary，请求数据返回时，项目名称，项目图片，summary 图片渲染到页面上
*/
function summaryLazyLoadCallBackHomePage(data) {
    if(!document.getElementById(data.domId)) {
        return;
    }
    if(data.image_url && data.image_url != 'null') {
        document.getElementById(data.domId).querySelector('.m-project-avatar').setAttribute('src', data.image_url);
    }
    if (document.getElementById(data.domId).querySelector('.summary-project-name').innerHTML.toLocaleLowerCase().trim() == 'undefined') {
        document.getElementById(data.domId).querySelector('.summary-project-name').innerHTML = data.project_name;
    }
    document.getElementById(data.domId).querySelector('.summary-project-name').setAttribute('data-slug', data.slug);
    let imgUserAvatar = document.getElementById(data.domId).querySelectorAll('.m-user-avatar');
    for (let i = 0; i < imgUserAvatar.length; i++) {
        if (data.tokenList[i].image_thumbnail_url && data.tokenList[i].image_thumbnail_url != 'undefined') {
            imgUserAvatar[i].setAttribute('src', data.tokenList[i].image_thumbnail_url);
        }
    }
}

/**
 * 推荐的summary，初始加载时，
 * 请求项目数据和summary展示的item数据
*/
function summaryLazyLoadRecommend(domItem) {
    if(domItem.getAttribute('data-requested')) return;

    let data = {};
    let domId = domItem.getAttribute('data-summary-id');
    data.tid = domItem.getAttribute('data-token-tid');
    data.token_address = domItem.getAttribute('data-token-address');
    data.tokenList = JSON.parse(domItem.getAttribute('data-token-list'));
    // 请求地址和参数
    let msg = {
        messageType: 'summary',
        data: data,
        domId: domId
    }
    
    domItem.setAttribute('data-requested', '1');

    // 通过后台跨域请求数据
    try {
        chrome.runtime.sendMessage(msg, function(res) {
            if(res.code === 200) {
                summaryLazyLoadCallBackRecommend(res.data);
            }
        });
    } catch (error) {}
    
}

/**
 * 推荐中的summary，请求数据返回时，项目名称，项目图片，summary 图片渲染到页面上
*/
function summaryLazyLoadCallBackRecommend(data) {
    if(!document.getElementById(data.domId)) {
        return;
    }
    if(data.image_url && data.image_url != 'null') {
        document.getElementById(data.domId).querySelector('.m-project-avatar').setAttribute('src', data.image_url);
    }
    if (document.getElementById(data.domId).querySelector('.summary-project-name').innerHTML.toLocaleLowerCase().trim() == 'undefined') {
        document.getElementById(data.domId).querySelector('.summary-project-name').innerHTML = data.project_name;
    }
    document.getElementById(data.domId).querySelector('.summary-project-name').setAttribute('data-slug', data.slug);
    let imgUserAvatar = document.getElementById(data.domId).querySelectorAll('.m-user-avatar');
    for (let i = 0; i < imgUserAvatar.length; i++) {
        if (data.tokenList[i].image_thumbnail_url && data.tokenList[i].image_thumbnail_url != 'undefined') {
            imgUserAvatar[i].setAttribute('src', data.tokenList[i].image_thumbnail_url);
        }
    }
}

/**
 * feed的summary，初始加载时，
 * 请求项目数据和summary展示的item数据
*/
function summaryLazyLoadFeed(domItem) {
    if(domItem.getAttribute('data-requested')) return;

    let data = {};
    let domId = domItem.getAttribute('id');
    data.tid = domItem.getAttribute('data-token-tid');
    data.twitter_handle = domItem.getAttribute('data-twitter-handle');
    data.token_address = domItem.getAttribute('data-token-address');
    data.tokenList = JSON.parse(domItem.getAttribute('data-token-list'));
    // 请求地址和参数
    let msg = {
        messageType: 'summary',
        data: data,
        domId: domId
    }
    
    domItem.setAttribute('data-requested', '1');

    // 通过后台跨域请求数据
    try {
        chrome.runtime.sendMessage(msg, function(res) {
            if(res.code === 200) {
                summaryLazyLoadCallBackFeed(res.data);
            } else {
                domItem.setAttribute('data-requested', '');
            }
        });
    } catch (error) {}
    
}

/**
 * feed中的summary，请求数据返回时，项目名称，项目图片，summary 图片渲染到页面上
*/
function summaryLazyLoadCallBackFeed(data) {
    if(!document.getElementById(data.domId)) {
        return;
    }
    if(data.twitter_avatar && data.twitter_avatar != 'null') {
        document.getElementById(data.domId).parentNode.parentNode.querySelector('.feed-avatar-href img').setAttribute('src', data.twitter_avatar);
    }
    if(data.image_url && data.image_url != 'null') {
        document.getElementById(data.domId).querySelector('.m-project-avatar').setAttribute('src', data.image_url);
    }
    if (document.getElementById(data.domId).querySelector('.feed-project-name').innerHTML.toLocaleLowerCase().trim() == 'undefined') {
        document.getElementById(data.domId).querySelector('.feed-project-name').innerHTML = data.project_name;
    }
    document.getElementById(data.domId).querySelector('.feed-project-name').setAttribute('data-slug', data.slug);
    let imgUserAvatar = document.getElementById(data.domId).querySelectorAll('.m-user-avatar');
    for (let i = 0; i < imgUserAvatar.length; i++) {
        if (data.tokenList[i].image_thumbnail_url && data.tokenList[i].image_thumbnail_url != 'undefined') {
            imgUserAvatar[i].setAttribute('src', data.tokenList[i].image_thumbnail_url);
        }
    }
}

let timerUrl;
let currentUrl = ''; // 记录当前url
// 路由改变，重制操作
/**
 * 定时监听路由变化，路由改变时，
*/
function reset() {
    timerUrl = setInterval(function() {
        var url = window.location.href;
        if (currentUrl != '' && currentUrl != url) {
            clearTimeout(timer);
            clearTimeout(timerInner);
            removeAllAlert();
            personalPage();
            loopUserCellList();
            loopUserId();
            loopTimeline();
        }
        if(currentUrl != url) {
            currentUrl = url;
        }
        // 判断不是home的时候，清除alert展示
        if (url.indexOf('/home') == -1) {
            document.querySelector('#navAlert .nav-inner')?.setAttribute('style', '');
            feedShow = false;
        }
        // 判断是home，并且feed展示的的时候，清除alert
        if (url.indexOf('/home') != -1 && feedShow) {
            let alertPopList = document.querySelectorAll('.g-alert-pop');
            for (let i = 0; i < alertPopList.length; i++) {
                alertPopList[i].remove();
            }
        }
    }, 500)
}

// 我们已有数据
let followedIdList = [];
/**
 * 获取我们已有数据，获取数据后，再做页面的业务
*/
function initPageFollow() {
    // 请求地址和参数
    let msg = {
        messageType: 'allUserList',
    }
    // 通过后台跨域请求数据
    try {
        chrome.runtime.sendMessage(msg, (res) => {
            followedIdList = res.data;
            personalPage();
            loopUserCellList();
            loopUserId();
            loopTimeline();
            reset();
        });
    } catch (error) {}
}

// 执行initPageFollow
initPageFollow();
// 窗口改变，如果没有发现推荐模块，再次执行loopUserId方法
window.onresize = () => {
    if (!document.querySelector('.g-recommend')) {
        loopUserId();
    }
}

// 当弹窗渲染出来后，执行业务
function readPosition(positionDom) {
    let appendDivDom = document.getElementById('appendDivDom');
    if (positionDom && !appendDivDom) {
        if(!this.getPageInfo()) {
            return;
        };
        if(followedIdList.indexOf(pageInfo.tid) == -1) {
            return;
        };
        popAvatar(positionDom, pageInfo.tid);
        toggleLoading();
        ajaxData();
    } else {
        return;
    }
}

// 弹窗头像标志
function popAvatar(positionDom, tid) {
    if(!positionDom) return;
    let personPhoto = positionDom.querySelector(`a[href="/${tid}"]`);
    personPhoto.parentNode.style.padding = '4px';
    personPhoto.parentNode.parentNode.style = BG_COLOR;
}

let timeP;
// 定时循环监听弹窗出现
function loopP() {
    timeP = setInterval(() => {
        let layers = document.querySelector('#layers');
        if (layers && !!getPosition(layers)) {
            readPosition(getPosition(layers));
        }
    }, 800)
}

loopP();

/**
 * 监听暗夜模式,重新加载
*/
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    loopUserId();
})

