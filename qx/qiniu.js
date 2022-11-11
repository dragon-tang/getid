/**
 *
 * 使用方法：打开启牛果园小程序，等待数秒即可。
 *
 * BoxJs: https://raw.githubusercontent.com/chiupam/surge/main/boxjs/chiupam.boxjs.json
 *
 * hostname: qaf.feierlaiedu.com
 *
 * type: http-request
 * regex: ^https?://qaf\.feierlaiedu\.com/knowledge-app-farm\api\v1/clock\getClockDetail
 * script-path: https://raw.githubusercontent.com/dragon-tang/getid/main/qx/qiniu.js
 * requires-body: 1 | true
 *
 * =============== Surge ===============
 * 获取启牛Token = type=http-request, pattern=^https?://qaf\.feierlaiedu\.com/knowledge-app-farm\api\v1/clock\getClockDetail, requires-body=1, max-size=-1, script-path=https://raw.githubusercontent.com/dragon-tang/getid/main/qx/qiniu.js, script-update-interval=0, timeout=10
 *
 * =============== Loon ===============
 * http-request ^https?://qaf\.feierlaiedu\.com/knowledge-app-farm\api\v1/clock\getClockDetail script-path=https://raw.githubusercontent.com/dragon-tang/getid/main/qx/qiniu.js, requires-body=true, timeout=10, tag=获取启牛Token
 *
 * =============== Quan X ===============
 * ^https?://qaf\.feierlaiedu\.com/knowledge-app-farm\api\v1/clock\getClockDetail url script-request-header https://raw.githubusercontent.com/dragon-tang/getid/main/qx/qiniu.js
 *
 */

const $ = Env();
const user_id = $.read("TG_USER_ID") || arg().split(`&`)[0];
const bot_token = $.read("TG_BOT_TOKEN") || `` + arg().split(`&`)[1];
if (typeof $request !== "undefined") start();

function arg() {
  try {
    return $argument.match(/api=(.*)/)[1];
  } catch {
    return `none&none`;
  }
}

async function start() {
  token = $request.headers.token;
  pin = "eyJ0";
  token = pin + cookie.match(/(eyJ0[^;]*)/)[1] + ";";
  if (user_id && user_id != `none` && bot_token) {
    await tgNotify(token);
    $.write("undefined", "token");
  } else {
    $.notice("前往boxjs中查询，或查看脚本运行日志！", "http://boxjs.net");
    $.write(token, "token");
  }
}
$.done();

function tgNotify(text) {
  $.log(text);
  return new Promise((resolve) => {
    const options = {
      url: `https://api.telegram.org/bot${bot_token}/sendMessage`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `chat_id=${user_id}&text=${text}&disable_web_page_preview=true`,
      timeout: 30000,
    };
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          $.log("Telegram Bot发送通知调用API失败！！");
          $.log(err);
        } else {
          data = JSON.parse(data);
          if (data.ok) {
            $.notice("Telegram Bot发送通知消息完成", token, "");
          } else {
            $.notice(
              "Telegram Bot发送通知消息失败！",
              "前往boxjs中查询，或查看脚本运行日志！",
              "http://boxjs.net"
            );
          }
        }
      } catch (e) {
        $.log(e);
        $.log(resp);
      } finally {
        resolve();
      }
    });
  });
}

function Env() {
  LN = typeof $loon != "undefined";
  SG = typeof $httpClient != "undefined" && !LN;
  QX = typeof $task != "undefined";
  read = (key) => {
    if (LN || SG) return $persistentStore.read(key);
    if (QX) return $prefs.valueForKey(key);
  };
  write = (key, val) => {
    if (LN || SG) return $persistentStore.write(key, val);
    if (QX) return $prefs.setValueForKey(key, val);
  };
  notice = (title, subtitle, message, url) => {
    if (LN) $notification.post(title, subtitle, message, url);
    if (SG) $notification.post(title, subtitle, message, { url: url });
    if (QX) $notify(title, subtitle, message, { "open-url": url });
  };
  get = (url, cb) => {
    if (LN || SG) {
      $httpClient.get(url, cb);
    }
    if (QX) {
      url.method = "GET";
      $task.fetch(url).then((resp) => cb(null, {}, resp.body));
    }
  };
  post = (url, cb) => {
    if (LN || SG) {
      $httpClient.post(url, cb);
    }
    if (QX) {
      url.method = "POST";
      $task.fetch(url).then((resp) => cb(null, {}, resp.body));
    }
  };
  put = (url, cb) => {
    if (LN || SG) {
      $httpClient.put(url, cb);
    }
    if (QX) {
      url.method = "PUT";
      $task.fetch(url).then((resp) => cb(null, {}, resp.body));
    }
  };
  log = (message) => console.log(message);
  done = (value = {}) => {
    $done(value);
  };
  return { LN, SG, QX, read, write, notice, get, post, put, log, done };
}
