// component/WxLogin/WxLogin.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showModal: {
      type: Boolean,
      value: false,
      observer(newval, oldval) {
        var that = this;
        console.log(newval)
        console.log(oldval)
        that.setData({
          showModal: newval
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showModal: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGetUserInfo: function(e) {
      var that = this;
      if (e.detail.userInfo) {
        // 点击了确认按钮
        that.hideModal();
      }
    },
    hideModal: function () {
      var that = this;
      that.setData({
        showModal: false
      });
    },
  }
})
