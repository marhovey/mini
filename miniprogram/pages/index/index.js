//index.js
const app = getApp()

Page({
  data: {
    manageList: [],
    recommendInfo: {}
  },
  getManageList: function() {
    const db = wx.cloud.database()
    const total = db.collection('list').count()
    let self = this
    db.collection('list').where({
      selection: true
    }).orderBy('tWhen', 'desc').limit(2).get({
      success: function(res) {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        console.log(res.data)
        self.setData({
          manageList: res.data
        })
      }
    })
  },
  getRecommendInfo: function() {
    const db = wx.cloud.database()
    const total = db.collection('list').count()
    let self = this
    db.collection('list').where({
      recommend: true
    }).orderBy('tWhen', 'desc').limit(1).get({
      success: function(res) {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        console.log('recommend',res.data)
        res.data[0].saleCnt = res.data[0].cnt * 1 + res.data[0].view * 1
        self.setData({
          recommendInfo: res.data[0]
        })
      }
    })
  },
  iconTap: function(){

  },
  onShareAppMessage: function() {
    return {
      title: '首页'
    }
  },
  handleManage: function(e) {
    const {name} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/detail/detail?id=${name}`
    })
  },
  onLoad: function() {
    this.getManageList()
    this.getRecommendInfo()
    wx.setNavigationBarTitle({
      title: '首页'
    })
  }
})