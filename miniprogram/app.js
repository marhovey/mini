//app.js
App({
  onLaunch: function () {
    this.globalData = {
      isAdmin: false
    }
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
      wx.showLoading({})
      this.getOpenId()
    }
  },
  getOpenId: function() {
    // 调用云函数
    let self = this
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        self.globalData.openid = res.result.openid
        self.checkAdmin(res.result.openid)
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  checkAdmin: function(openid) {
    const db = wx.cloud.database()
    let self = this
    db.collection('admin').where({
      _openid: openid
    })
    .get({
      success: function(res) {
        // res.data 是包含以上定义的两条记录的数组
        console.log(res.data)
        if(res.data.length){
          self.globalData.isAdmin = true
        }
        wx.hideLoading({})
      }
    })
  }
})
