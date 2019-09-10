/*
Ref : https://leancloud.cn/docs/rest_api.html
*/
const LeanCloud_URL_PREFIX = 'https://api.leancloud.cn/1.1/';
exports.LeanCloud_APP_ID = 'HRYpYqLTygyfRlsN8I3KEhkw-gzGzoHsz';
exports.LeanCloud_APP_KEY = '5two7AvBo3gjnH3hpYSyBW35';

//---------------------------------
// Request
//---------------------------------
module.exports.showFail = function(content) {
  wx.showToast({
    title: content + '//(ㄒoㄒ)/',
    icon: 'none',
    duration: 3000
  })
}

var request = exports.request = function (options) {
  wx.showLoading({
    title: '加载中',
  });
  wx.request({
    url: LeanCloud_URL_PREFIX + options.url,
    data: options.data,
    header: {
      'X-LC-Id': exports.LeanCloud_APP_ID,
      'X-LC-Key': exports.LeanCloud_APP_KEY,
      'content-type': 'application/json; charset=utf-8'
    },
    method: options.method || 'GET',
    success: function (res) {
      options.success && options.success(res.data);
      wx.hideLoading();
    },
    fail: function (error) {
      console.log(error);
      this.showFail('调用失败');
      wx.hideLoading();
      options.fail && options.fail(error);
    },
    complete: function () {
      wx.hideLoading();
    }
  });
};