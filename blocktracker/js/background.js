/**
 * background.js
 * 后台，用来请求接口
 */

const resultError = {
    code: 500,
    data: {}
};

const baseUrl = 'http://api.np-cloud.com';

/**
 * 获取所有存储的twitter用户
 */
function getUserList() {
    return fetch(
        `${baseUrl}/user_list`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }
    ).then(response => response.json())
}

/**
    推荐列表
**/
function getRecommendList(header, data) {
    return fetch(
        `${baseUrl}/recommend`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...header,
            },
            body: JSON.stringify(data)
        }
    ).then(response => response.json())
}

/**
    获取用户feed数据
**/
function getFeedList(header) {
    return fetch(
        `${baseUrl}/feed`, // http://api.np-cloud.com/feed  ${baseUrl}/feed
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...header,
            }
        }
    ).then(response => response.json())
}

/**
 * 请求summary数据
 data: {
    twitter_id : ParisHilton
    user_id : ?
 }
**/
function getSummary(data) {
    return fetch(
        `${baseUrl}/summary`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...data
            }
        }
    ).then(response => response.json())
}

/**
 * 请求alert数据
 data: {
    twitter_id : ParisHilton
    user_id : ?
 }
**/
function getAlert(data) {
    return fetch(
        `${baseUrl}/alert`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...data
            }
        }
    ).then(response => response.json())
}

/**
 * 请求项目信息
 data: {
    twitter_id : ParisHilton
    user_id : ?
 }
**/
function getProfile(data) {
    return fetch(
        `${baseUrl}/profile`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...data
            }
        }
    ).then(response => response.json())
}

/**
 * 请求项目数据，获取项目名称和图片地址
 **/
function getProfileProject(token) {
    return fetch(
        `https://api.opensea.io/api/v1/asset_contract/${token}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }
    ).then(response => response.json())
}

/**
 * 请求item数据，获取item名称和图片地址
 */
function getProfileProjectSingle(token, id) {
    return fetch(
        `https://api.opensea.io/api/v1/asset/${token}/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }
    ).then(response => response.json())
}

/**
 * 利用promise造成休眠
 * ms:休眠毫秒数
 */
function sleep(ms) {
    return new Promise(function(resolve, reject) {
        setTimeout(resolve, ms)
    })
}

/**
 * 获取所有用户的数据，返回结果为用户账号的数组
 */
async function asyncAllUserList(sendResponse) {
    let allUserRes = { data: [] }
    try {
        allUserRes = await getUserList();
    } catch (error) {
        console.log('allUserRes-error', error)
    }

    let resultTemp = {
        code: 200,
        data: allUserRes.data,
    }
    sendResponse(resultTemp);
}

/**
 * 请求feed数据
 */
async function asyncFeedList(msg, sendResponse) {
    let { header } = msg;
    let feedRes = { data: [] }
    try {
        feedRes = await getFeedList(header);
    } catch (error) {
        console.log('feedRes-error', error)
    }

    let resultTemp = {
        code: 200,
        data: feedRes.data,
    }
    sendResponse(resultTemp);
}

/**
 * 请求推荐数据
 */
async function asyncRecommendList(msg, sendResponse) {
    let { header, data } = msg;
    let recommendRes = { data: [] }
    try {
        recommendRes = await getRecommendList(header, data);
    } catch (error) {
        console.log('recommendRes-error', error)
    }
    let recommendList = recommendRes.data;
    // if (recommendList && recommendList.length == 0) {
    //     recommendList = ['line_art_nfts','BillyM2k'];
    // }

    let recommend = []

    for (let i = 0; i < recommendList.length; i++) {
        let tId = recommendList[i];
        let item = {
            tId: tId,
            profile: { nft_most_holding: 'none' }
        };
        let profileRes = {}
        try {
            profileRes = await getProfile({
                twitter_id: tId,
                user_id: header.user_id,
            })
        } catch (error) {
            console.log('asyncRequest-profileRes-error', error);
        }
        if (profileRes.error_no == 0 && profileRes.data) {
            item.profile = profileRes.data;
        }
        recommend.push(item);
    }

    let resultTemp = {
        code: 200,
        data: recommend,
    }
    sendResponse(resultTemp);
}

/**
 * 请求推荐的弹窗信息
 */
async function asyncRecommendAlert(msg, sendResponse) {
    let item = msg.cacheRecommend;
    let profileRes = {}
    try {
        profileRes = await getProfile({
            twitter_id: item.tId,
            user_id: '',
        })
    } catch (error) {
        console.log('asyncRequest-profileRes-error', error);
    }
    if (profileRes.error_no == 0 && profileRes.data) {
        item.profile = profileRes.data;
        if (item.profile.nft_most_holding != 'none') {
            let profileProjectRes = {};
            try {
                profileProjectRes = await getProfileProject(item.profile.nft_most_holding);
            } catch (error) {
                console.log('asyncRequest-profileProjectRes-error', error);
            }
            item.profile.image_url = profileProjectRes.image_url;
            item.profile.project_name = profileProjectRes.name;
            item.profile.slug = profileProjectRes.collection ? .slug;
        }
    }

    let summaryRes = { data: { action_list: [] } }
    try {
        summaryRes = await getSummary({
            twitter_id: item.tId,
            user_id: '',
            page_index: 0,
        })
    } catch (error) {
        console.log('summaryRes-error', error);
    }
    if (summaryRes.error_no == 0 && summaryRes.data && summaryRes.data.action_list) {
        item.summary = summaryRes.data.action_list;
        item.summary.forEach(sItem => {
            sItem.tid = item.tId;
        })
    } else {
        item.summary = [];
    }

    let alertRes = { data: { alert_action: [] } }
    try {
        alertRes = await getAlert({
            twitter_id: item.tId,
            user_id: '',
        })
    } catch (error) {
        console.log('alertRes-error', error);
    }
    if (alertRes.error_no == 0 && alertRes.data && alertRes.data.alert_action) {
        item.alert = alertRes.data.alert_action;
    } else {
        item.alert = [];
    }

    if (item.alert && item.alert.length > 0) {
        let alertItem = item.alert[0];
        let profileProjectRes = {};
        try {
            profileProjectRes = await getProfileProject(alertItem.token_address);
        } catch (error) {
            console.log('profileProjectRes-error', error);
        }
        alertItem.image_url = profileProjectRes.image_url;
        alertItem.project_name = profileProjectRes.name;
        alertItem.slug = profileProjectRes.collection ? .slug;


        let tokenList = alertItem.token_list;
        // if (tokenList.length > 2) {
        //     tokenList = tokenList.splice(0, 1);
        // } else if (tokenList.length == 2) {
        //     tokenList = tokenList.splice(0, 2);
        // }
        await asyncTokenList(alertItem.token_address, tokenList);
    }

    item['hasData'] = 'succsee';

    let resultTemp = {
        code: 200,
        data: item,
    }

    sendResponse(resultTemp);
}

/**
 * alert和summary中显示的items，请求他们的图片信息，最多显示两个
 */
async function asyncTokenList(token, tokenList) {
    let tList = [];
    if (tokenList.length == 1 || tokenList.length > 2) {
        tList = [tokenList[0]];
    } else if (tokenList.length == 2) {
        tList = [tokenList[0], tokenList[1]];
    }
    for (let i = 0; i < tList.length; i++) {
        let profileProjectSingleRes = { image_thumbnail_url: '' };
        try {
            profileProjectSingleRes = await getProfileProjectSingle(token, tList[i].id);
        } catch (error) {
            console.log('profileProjectSingleRes-error', error);
        }
        let profileProjectSingleResErrorLoop = 0;
        while (profileProjectSingleRes && profileProjectSingleRes.detail == 'Request was throttled.' && profileProjectSingleResErrorLoop <= 3) { // 请求频繁
            await sleep(500);
            try {
                profileProjectSingleRes = await getProfileProjectSingle(token, tList[i].id);
            } catch (error) {
                console.log('while-profileProjectSingleRes-error', error);
            }
            profileProjectSingleResErrorLoop++;
        }
        profileProjectSingleResErrorLoop = 0;

        tList[i].image_thumbnail_url = profileProjectSingleRes.image_thumbnail_url;
    }
}

/**
 * 弹窗信息请求，请求getProfile => 请求summary => 请求项目信息 => 请求items信息
 */
async function asyncRequest(msg, sendResponse) {
    const { twitter_id, user_id, page_index } = msg;
    let data = { profile: { nft_most_holding: 'none' } }

    let profileRes = {}
    try {
        profileRes = await getProfile({
            twitter_id: twitter_id,
            user_id: user_id,
        })
    } catch (error) {
        console.log('asyncRequest-profileRes-error', error);
    }
    if (profileRes.error_no == 0 && profileRes.data) {
        data.profile = profileRes.data;
        if (data.profile.nft_most_holding != 'none') {
            let profileProjectRes = {};
            try {
                profileProjectRes = await getProfileProject(data.profile.nft_most_holding);
            } catch (error) {
                console.log('asyncRequest-profileProjectRes-error', error);
            }
            data.profile.image_url = profileProjectRes.image_url;
            data.profile.project_name = profileProjectRes.name;
            data.profile.slug = profileProjectRes.collection ? .slug;
        }
    } else {
        sendResponse(resultError)
        return;
    }

    let summaryRes = { data: { action_list: [] } }
    try {
        summaryRes = await getSummary({
            twitter_id: twitter_id,
            user_id: user_id,
            page_index: page_index,
        })
    } catch (error) {
        console.log('summaryRes-error', error);
    }
    if (summaryRes.error_no == 0 && summaryRes.data && summaryRes.data.action_list) {
        data.summary = summaryRes.data.action_list;
        data.summary.forEach(sItem => {
            sItem.tid = twitter_id;
        })
    } else {
        data.summary = [];
    }

    let alertRes = { data: { alert_action: [] } }
    try {
        alertRes = await getAlert({
            twitter_id: twitter_id,
            user_id: user_id,
        })
    } catch (error) {
        console.log('alertRes-error', error);
    }
    if (alertRes.error_no == 0 && alertRes.data && alertRes.data.alert_action) {
        data.alert = alertRes.data.alert_action;
    } else {
        data.alert = [];
    }

    if (data.alert && data.alert.length > 0) {
        let alertItem = data.alert[0];
        let profileProjectRes = {};
        try {
            profileProjectRes = await getProfileProject(alertItem.token_address);
        } catch (error) {
            console.log('profileProjectRes-error', error);
        }
        alertItem.image_url = profileProjectRes.image_url;
        alertItem.project_name = profileProjectRes.name;
        alertItem.slug = profileProjectRes.collection ? .slug;

        let tokenList = alertItem.token_list;
        // if (tokenList.length > 2) {
        //     tokenList = tokenList.splice(0, 2);
        // }
        await asyncTokenList(alertItem.token_address, tokenList);
    }

    let resultTemp = {
        code: 200,
        data: data
    }
    sendResponse(resultTemp);
}

/**
 * 创建一个新数组对象，该数组会存放需要请求的summary信息，
 * 触发push方法后，循环执行数组中的数据，并且从前到后减少数组长度
 */
let newPrototype = Object.create(Array.prototype);
newPrototype['push'] = function(...args) {
    if (!loopSummaryIng) {
        loopSummary(args[0]);
    }
    return Array.prototype['push'].call(this, ...args);
};

/**
 * 创建一个新数组对象，该数组会存放需要请求的items信息，
 * 触发push方法后，循环执行数组中的数据，并且从前到后减少数组长度
 */
let itemsPrototype = Object.create(Array.prototype);
itemsPrototype['push'] = function(...args) {
    if (!loopItemsIng) {
        loopItems(args[0]);
    }
    return Array.prototype['push'].call(this, ...args);
};

let loopSummaryIng = false;
/**
 * 循环执行数组summaryScollRequestQueue中的数据，并且从前到后减少数组长度
 * firstItem 解决只添加了一条信息，没有触发请求的问题
 */
async function loopSummary(firstItem) {
    loopSummaryIng = true;
    if (firstItem) {
        let queneItem = firstItem;

        let result = {
            cacheId: queneItem.cacheId,
            tid: queneItem.tid,
            domId: queneItem.domId,
        }
        let profileProjectRes = {};
        try {
            profileProjectRes = await getProfileProject(queneItem.token_address);
        } catch (error) {}

        let profileProjectResErrorLoop = 0;
        while (profileProjectRes && profileProjectRes.detail == 'Request was throttled.' && profileProjectResErrorLoop <= 3) { // 请求频繁
            await sleep(500);
            try {
                profileProjectRes = await getProfileProject(queneItem.token_address);
            } catch (error) {}
            profileProjectResErrorLoop++;
        }
        profileProjectResErrorLoop = 0;

        result.image_url = profileProjectRes.image_url;
        result.project_name = profileProjectRes.name;
        result.slug = profileProjectRes.collection ? .slug;
        result.tokenList = queneItem.tokenList;
        await asyncTokenList(queneItem.token_address, result.tokenList);
        let resultTemp = {
            code: 200,
            data: result
        }
        queneItem.sendResponse(resultTemp);
        loopSummary();
    }
    while (summaryScollRequestQueue.length != 0) {
        let queneItem = summaryScollRequestQueue.shift();

        let result = {
            cacheId: queneItem.cacheId,
            tid: queneItem.tid,
            domId: queneItem.domId,
        }
        let profileProjectRes = {};
        try {
            profileProjectRes = await getProfileProject(queneItem.token_address);
        } catch (error) {}

        let profileProjectResErrorLoop = 0;
        while (profileProjectRes && profileProjectRes.detail == 'Request was throttled.' && profileProjectResErrorLoop <= 3) { // 请求频繁
            await sleep(500);
            try {
                profileProjectRes = await getProfileProject(queneItem.token_address);
            } catch (error) {}
            profileProjectResErrorLoop++;
        }
        profileProjectResErrorLoop = 0;

        // 项目图片信息
        result.image_url = profileProjectRes.image_url;
        // 项目名称
        result.project_name = profileProjectRes.name;
        result.slug = profileProjectRes.collection ? .slug;
        result.tokenList = queneItem.tokenList;

        await asyncTokenList(queneItem.token_address, result.tokenList);

        let resultTemp = {
            code: 200,
            data: result
        }
        queneItem.sendResponse(resultTemp);
        loopSummary();
    }
    loopSummaryIng = false;
}

// 滚动请求队列
// 需要监测的数组，绑定新的原型就可以了
let summaryScollRequestQueue = new Array();
summaryScollRequestQueue.__proto__ = newPrototype;

function summaryQuene(msg, sendResponse) {
    // 清除队列
    if (msg.clearQueue) {
        summaryScollRequestQueue = new Array();
        summaryScollRequestQueue.__proto__ = newPrototype;
        let resultTemp = {
            code: 200,
            data: []
        }
        sendResponse(resultTemp);
        return;
    }

    let queneItem = {
            cacheId: msg.data.cacheId,
            tid: msg.data.tid,
            token_address: msg.data.token_address,
            tokenList: JSON.parse(JSON.stringify(msg.data.tokenList)),
            domId: msg.domId,
            sendResponse: sendResponse, // 保存当前回掉函数
        }
        // 当前需要请求数据，push进队列
    summaryScollRequestQueue.push(queneItem);
}

let loopItemsIng = false;
async function loopItems(firstItem) {
    loopItemsIng = true;
    if (firstItem) {
        let queneItem = firstItem;
        let { token, item_id } = queneItem;

        let result = {
            domId: queneItem.domId,
        }
        let profileProjectSingleRes = { image_thumbnail_url: '' };
        try {
            profileProjectSingleRes = await getProfileProjectSingle(token, item_id);
        } catch (error) {
            console.log('profileProjectSingleRes-error', error);
        }
        let profileProjectSingleResErrorLoop = 0;
        while (profileProjectSingleRes && profileProjectSingleRes.detail == 'Request was throttled.' && profileProjectSingleResErrorLoop <= 3) { // 请求频繁
            await sleep(500);
            try {
                profileProjectSingleRes = await getProfileProjectSingle(token, item_id);
            } catch (error) {
                console.log('while-profileProjectSingleRes-error', error);
            }
            profileProjectSingleResErrorLoop++;
        }
        profileProjectSingleResErrorLoop = 0;

        result.image_thumbnail_url = profileProjectSingleRes.image_thumbnail_url;
        let resultTemp = {
            code: 200,
            data: result
        }
        queneItem.sendResponse(resultTemp);
        loopItems();
    }
    while (itemsScollRequestQueue.length != 0) {
        let queneItem = itemsScollRequestQueue.shift();
        let { token, item_id } = queneItem;

        let result = {
            domId: queneItem.domId,
        }
        let profileProjectSingleRes = { image_thumbnail_url: '' };
        try {
            profileProjectSingleRes = await getProfileProjectSingle(token, item_id);
        } catch (error) {
            console.log('profileProjectSingleRes-error', error);
        }
        let profileProjectSingleResErrorLoop = 0;
        while (profileProjectSingleRes && profileProjectSingleRes.detail == 'Request was throttled.' && profileProjectSingleResErrorLoop <= 3) { // 请求频繁
            await sleep(500);
            try {
                profileProjectSingleRes = await getProfileProjectSingle(token, item_id);
            } catch (error) {
                console.log('while-profileProjectSingleRes-error', error);
            }
            profileProjectSingleResErrorLoop++;
        }
        profileProjectSingleResErrorLoop = 0;

        result.image_thumbnail_url = profileProjectSingleRes.image_thumbnail_url;
        let resultTemp = {
            code: 200,
            data: result
        }
        queneItem.sendResponse(resultTemp);
        loopItems();
    }
    loopItemsIng = false;
}

// 滚动请求队列
// 需要监测的数组，绑定新的原型就可以了
let itemsScollRequestQueue = new Array();
itemsScollRequestQueue.__proto__ = itemsPrototype;

function itemsQuene(msg, sendResponse) {
    // 清除队列
    if (msg.clearQueue) {
        itemsScollRequestQueue = new Array();
        itemsScollRequestQueue.__proto__ = itemsPrototype;
        let resultTemp = {
            code: 200,
            data: []
        }
        sendResponse(resultTemp);
        return;
    }

    let queneItem = {
            token: msg.data.token,
            item_id: msg.data.item_id,
            domId: msg.domId,
            sendResponse: sendResponse, // 保存当前回掉函数
        }
        // 当前需要请求数据，push进队列
    itemsScollRequestQueue.push(queneItem);
}

// 监听来自content.js的消息
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.messageType == 'allUserList') {
        asyncAllUserList(sendResponse);
    } else if (msg.messageType == 'init') {
        asyncRequest(msg, sendResponse);
    } else if (msg.messageType == 'summary' || msg.messageType == 'clearSummary') {
        summaryQuene(msg, sendResponse);
    } else if (msg.messageType == 'items' || msg.messageType == 'clearItems') {
        itemsQuene(msg, sendResponse);
    } else if (msg.messageType == 'recommend') {
        asyncRecommendList(msg, sendResponse);
    } else if (msg.messageType == 'feed') {
        asyncFeedList(msg, sendResponse);
    } else if (msg.messageType == 'recommendAlert') {
        asyncRecommendAlert(msg, sendResponse);
    }

    return true;
})