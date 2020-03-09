const app = getApp()

Page({
  data: {
    goodInfo: {
      banner: []
    }
  },
  getFormData: function(id) {
    const db = wx.cloud.database()
    let self = this
    db.collection('list').doc(id).get({
      success: function(res) {
        // res.data 包含该记录的数据
        res.data.saleCnt = res.data.cnt * 1 + res.data.view * 1
        self.setData({
          goodInfo: res.data
        })
        self.updateView(id)
      }
    })
  },
  previewImg: function(e) {
    const {name} = e.currentTarget.dataset
    wx.previewImage({
      current: name, // 当前显示图片的http链接
      urls: this.data.goodInfo.banner // 需要预览的图片http链接列表
    })
  },
  goHome: function() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  updateView: function(id) {
    const db = wx.cloud.database()
    let self = this
    console.log(self.data.goodInfo.view)
    db.collection('list').doc(id).update({
      data: {
        view: self.data.goodInfo.view * 1 + 1 || 1
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },
  onShareAppMessage: function() {
    return {
      title: `${this.data.goodInfo['title']}`
    }
  },
  onLoad: function(options) {
    this.getFormData(options.id)
    wx.setNavigationBarTitle({
      title: '商品详情'
    })
  }
})