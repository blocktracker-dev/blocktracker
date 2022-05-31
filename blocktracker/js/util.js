/**
 * 插入loading，取消loading
 * close 传true时，为清除loading
*/
function toggleLoading(close) {
  const loadingDom = document.querySelector(".g-append-loading");
  let popWrapper = getPopDom();
  if (!popWrapper) return;
  let positionDom = getPosition(popWrapper);
  if (!positionDom) return;
  let popContentDom = positionDom.querySelector('div:first-child>div:first-child>div:first-child>div:first-child>div:first-child>div:first-child>div:first-child');
  if (!popContentDom) return;
  let leftHeight = 200;
  let popContentLeftDom = positionDom.querySelector('div:first-child>div:first-child>div:first-child>div:first-child>div:first-child>div:first-child>div:first-child>div:first-child');
  if (popContentLeftDom) {
    leftHeight = popContentLeftDom.offsetHeight;
  }
  if (close) {
    if (loadingDom) {
      loadingDom.remove();
      if (popContentDom) {
        popContentDom.style = "";
      }
    }
    return;
  }
  if (!loadingDom) {
    let loading = document.createElement("div");
    loading.setAttribute("class", "g-append-loading");
    loading.style = `height:${leftHeight}px;`;
    loading.innerHTML = `<div class="sk-circle">
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
    if (popContentDom) {
      popContentDom.appendChild(loading);
      popContentDom.style = "width:600px;padding:10px 0;display:flex;flex-direction: row;";
      popContentDom.querySelector("div").style = "width:300px;";
    }
  }
}

// 时间戳转date
function timestampToDate(time) {
  if (!time) {
    return { date: "--", soFar: "--" };
  }
  let dateTemp = new Date(time * 1000);
  let month = dateTemp.getMonth() + 1;
  let day = dateTemp.getDate();
  let date = `${month > 10 ? month : "0" + month}-${day}`;
  let soFar = dateDiff(dateTemp, null);
  return {
    date: date,
    soFar: soFar
  };
}

/**
 * 计算时间差
*/
function dateDiff(hisTime, nowTime) {
  if (!arguments.length) return "";

  var arg = arguments,
    now = arg[1] ? arg[1] : new Date().getTime(),
    diffValue = now - hisTime.getTime(),
    result = "",
    minute = 1000 * 60,
    hour = minute * 60,
    day = hour * 24,
    halfamonth = day * 15,
    month = day * 30,
    year = month * 12,
    _year = diffValue / year,
    _month = diffValue / month,
    _week = diffValue / (7 * day),
    _day = diffValue / day,
    _hour = diffValue / hour,
    _min = diffValue / minute;
  // else if (_month >= 1) result = parseInt(_month) + "m ago";
  // else if (_week >= 1) result = parseInt(_week) + "w ago";
  if (_year >= 1) result = parseInt(_year) + "y ago";
  else if (_day >= 1) result = parseInt(_day) + "d ago";
  else if (_hour >= 1) result = parseInt(_hour) + "h ago";
  else result = parseInt(_min) + "min ago";
  return result;
}

/**
 * 截取字符串长度，默认长度超过6拼接...
*/
function lengthString(str, num = 6) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

/**
 * 利用promise 造成休眠
 * ms 为休眠毫秒
*/
function sleep(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, ms);
  });
}

/**
 * 获取节点到顶部的距离
*/
function getElemPos(obj, noTop) {
  var iTop = 0;
  if(!noTop) {
    iTop = getTranslateY(obj);
  }
  var pos = { top: 0, left: 0 };
  if (obj.offsetParent) {
    while (obj.offsetParent) {
      pos.top += obj.offsetTop;
      pos.left += obj.offsetLeft;
      obj = obj.offsetParent;
    }
  } else if (obj.x) {
    pos.left += obj.x;
  } else if (obj.x) {
    pos.top += obj.y;
  }

  return { x: pos.left, y: pos.top, top: pos.top + iTop };
}

/**
 * 创建8位随机数，模拟id，为节点做标识
*/
function createRandom() {
    const codeArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  let length = 8;
  let code = "";
  for (let i = 0; i < length; i++) {
    let randomI = Math.floor(Math.random() * 36);
    code += codeArr[randomI];
  }
  return code;
}

/**
 * 主页中，列表节点定位使用了translate,该方法为这种节点获取到定点距离
*/
function getTranslateY(dom) {
  var iTop = 0;
  let compare = false;
  do {
    let style = dom.getAttribute("style");
    if (style && style.indexOf("transform: translateY(") != -1) {
      let a = style.split("transform: translateY(")[1];
      if (a) {
        let b = a.split("px)")[0];
        if (b) {
          iTop = Number(b);
          compare = true;
        }
      }
    }
    dom = dom.parentNode;
  } while (!compare && dom && dom.parentNode);
  return iTop;
}

/**
 * 判断字符串是否为空
*/
function isNotUndefined(str) {
    if(!str || str.toLowerCase() == 'undefined' || str.toLowerCase() == 'null') {
      return ''
    } else {
      return str;
    }
}
