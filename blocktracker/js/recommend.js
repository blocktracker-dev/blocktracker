/**
 * recommend.js
 * 推荐相关业务
*/

/**
 * 获取twitter的猜你喜欢后，在该节点中，添加推荐模块
*/
function pushWhoToFollow(whoToFollow, recommend) {
  if(!whoToFollow || !recommend || recommend.length == 0) return;
  if(document.querySelector('.g-recommend')) return;

  let whoToFollowAppendDom = document.createElement("aside");
  whoToFollowAppendDom.setAttribute("aria-label", "Who to follow");
  whoToFollowAppendDom.setAttribute("role", "complementary");
  whoToFollowAppendDom.setAttribute("class", "g-recommend");

  let listDom = '';
  for (let i = 0; i < recommend.length; i++) {
    let {tId, profile} = recommend[i];
    let rateDom = '';
    // 添加项目收益标识
    if(profile && profile.nft_profit_rate && profile.nft_profit_rate != 'undefined' && profile.nft_profit_rate != 'null') {
      let profile_rate = profile.nft_profit_rate;
      rateDom =
      `<div class="g-profile-rate">
        <div class="${profile_rate >= 0 ? 'm-rate' : 'm-rate m-rate-red'}">
          <span style="color: #fff;">${profile_rate >= 0 ? '+' : '-'}${(profile_rate * 100 + '').split('.')[0]}%</span>
          <img class="m-gp" src="${profile_rate >= 0 ? IMG_URL['chart-increasing'] : IMG_URL['chart-decreasing']}" alt="">
        </div>
      </div>`
    }
    
    listDom +=
    `<div class="m-list-item">
      <div class="m-avatar">
        <div class="m-avatar-inner">
          <img src="https://unavatar.io/twitter/${tId}">
        </div>
        ${rateDom}
      </div>
      <div class="m-info">
        <div class="m-recommend-href" data-recommend="${tId}">${tId}</div>
        <p>@${tId}</p>
      </div>
      <a class="twitter-follow-button m-follow-button" href="https://twitter.com/${tId}" target="_blank">Follow</a>
    </div>`
  }

  whoToFollowAppendDom.innerHTML =
  `<h2>
    <img src="${IMG_URL['spouting-whale-border']}" alt="">
    Whales
  </h2>
  <div class="m-wrapper">
    ${listDom}
  </div>`;

  let divDom = document.createElement("div");
  // 如果是暗夜模式
  // divDom.setAttribute("style", "height:14px;background:#fff;");
  whoToFollow.parentNode.style = 'border: 0;'

  divDom.classList.add('divDomClass');
  whoToFollow.parentNode.classList.add('whoToFollowParentNode');

  whoToFollow.parentNode.appendChild(divDom);
  whoToFollow.parentNode.appendChild(whoToFollowAppendDom);
  // 在div#layers同父节点下，添加推荐的弹窗节点
  if(document.querySelector('#layers') && document.querySelector('#layers').parentNode && !document.querySelector('#recommendPop')) {
    let recommendPopWrapperDom = document.createElement('div');
    recommendPopWrapperDom.setAttribute('id', 'recommendPop');
    recommendPopWrapperDom.setAttribute('class', 'recommend-pop');
    recommendPopWrapperDom.setAttribute('style', 'display: none;');
    document.querySelector('#layers').parentNode.appendChild(recommendPopWrapperDom)
  }
  handleToRecommend(whoToFollowAppendDom);

  // 添加新节点后，修复样式
  let asides = whoToFollow.parentNode.querySelectorAll('aside');
  if(asides && asides.length > 0) {
    for (let i = 0; i < asides.length; i++) {
      asides[i].classList.add('asidesClass');
      asides[i].style = "border-radius: 16px;"
      // asides[i].style = "background: rgb(247, 249, 249);border-radius: 16px;"
    }
  }
}

// 请求推荐的弹窗数据
async function ajaxRecommendAlert(cacheRecommend, cb) {
  let msg = {
    messageType: 'recommendAlert',
    cacheRecommend: cacheRecommend,
  }
  if (cacheRecommend['hasData'] && cacheRecommend['hasData'] == 'ing') {
    await sleep(500);
    ajaxRecommendAlert(cacheRecommend, cb);
  } else if (cacheRecommend['hasData'] && cacheRecommend['hasData'] == 'succsee') {
    clearRecommendPopLoading();
    if (recommendPopTimer) {
      pushRecommendPop(cacheRecommend);
      cb();
    }
  } else {
    // 通过后台跨域请求数据
    try {
      cacheRecommend['hasData'] == 'ing'
      chrome.runtime.sendMessage(msg, res => {
          if(res.code === 200) {
              cacheRecommend = res.data;
              clearRecommendPopLoading();
              if (recommendPopTimer) {
                pushRecommendPop(cacheRecommend);
                cb();
              }
          }
      });
  } catch (error) {}
  }

}

let recommendPopLock = false;
let recommendPopTimer = null;
// 为推荐的模块添加点击跳转到twitter主页事件
function handleToRecommend(whoToFollowAppendDom) {
  let recommendHref = whoToFollowAppendDom.querySelectorAll('.m-recommend-href');
  for (let i = 0; i < recommendHref.length; i++) {
    recommendHref[i].addEventListener('click', () => {
      let href = recommendHref[i].getAttribute('data-recommend');
      window.open(`https://twitter.com/${href}`);
    });
  }

  // hoverRecommendPop();
}
/**
 * 为推荐的列表，添加hover，展示弹窗事件，暂未使用
*/
function hoverRecommendPop(whoToFollowAppendDom) {
  let recommendAvatar = whoToFollowAppendDom.querySelectorAll('.m-avatar .m-avatar-inner');
  for (let j = 0; j < recommendAvatar.length; j++) {
    recommendAvatar[j].onmouseenter = () => {
      recommendPopTimer = setTimeout(() => {
        pushRecommendPopLoading();
        ajaxRecommendAlert(cacheRecommend[j], () => {
          document.querySelector('#recommendPopDom').onmouseenter = () => {
            recommendPopLock = true;
          }
          document.querySelector('#recommendPopDom').onmouseleave = () => {
            if (recommendPopTimer) {
              recommendPopTimer = clearTimeout(recommendPopTimer);
            }
            recommendPopLock = false;
            clearRecommendPop(cacheRecommend[j])
          }
        });
      }, 400)
    },
    recommendAvatar[j].onmouseleave = () => {
      if (recommendPopTimer) {
        recommendPopTimer = clearTimeout(recommendPopTimer);
      }
      if(recommendPopLock) return;
      setTimeout(() => {
        if(recommendPopLock) return;
        clearRecommendPopLoading();
        clearRecommendPop(cacheRecommend[j])
      }, 400);
    }
  }
}

