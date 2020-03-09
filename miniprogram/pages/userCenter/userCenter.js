
const app = getApp()

Page({
  data: {
    fileID: '',
    cloudPath: '',
    imagePath: '',
    showManage: false,
  },
  onContact: function(e) {
    console.log(e)
  },
  myFavor: function() {
    wx.navigateTo({
      url: '/pages/favor/favor'
    })
  },
  goManage: function() {
    wx.navigateTo({
      url: '/pages/manage/manage'
    })
  },
  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '个人中心'
    })
    this.setData({
      showManage: app.globalData.isAdmin
    })
  }
})