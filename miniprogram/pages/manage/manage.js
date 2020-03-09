//index.js
const app = getApp()

Page({
  data: {
    manageList: [],
    pageNum: 0,
    pageSize: 20,
    totalCnt: 0
  },
  getManageList: async function() {
    const { pageNum, pageSize, totalCnt, manageList } = this.data
    const currPage = pageNum + 1
    if(totalCnt > pageNum*pageSize || pageNum === 0) {
      const db = wx.cloud.database()
      const total = await db.collection('list').count()
      const newTotal = total.total
      let self = this
      wx.showLoading({})
      db.collection('list').skip(pageNum * pageSize).limit(pageSize).get({
        success: function(res) {
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          console.log(res.data)
          for(let i in res.data){
            res.data[i].saleCnt = res.data[i].cnt * 1 + res.data[i].view * 1
          }
          wx.hideLoading({})
          self.setData({
            manageList: manageList.concat(res.data),
            totalCnt: newTotal,
            pageNum: currPage
          })
        }
      })
    }
  },
  onReachBottom: function() {
    this.getManageList()
  },
  handleManage: function(e) {
    const {name} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/newGood/newGood?id=${name}`
    })
  },
  deleteItem: function(e) {
    const {index, name} = e.currentTarget.dataset
    const { manageList } = this.data
    const item = this.data.manageList[index]
    const db = wx.cloud.database()
    let self = this
    const imgList = item.banner.concat(item.desc)
    db.collection('list').doc(name).remove({
      success: function(res) {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        console.log(res.data)
        wx.showToast({
          icon: 'none',
          title: '操作成功'
        })
        wx.cloud.deleteFile({
          fileList: imgList,
          success: res => {
            // handle success
            console.log(res.fileList)
          },
          fail: err => {
            console.error(err)
            wx.showToast({
              icon: 'none',
              title: '操作失败'
            })
          }
        })
        manageList.splice(index, 1)
        self.setData({
          manageList: manageList
        })
      },
      fail: err => {
        console.error(err)
        wx.showToast({
          icon: 'none',
          title: '操作失败'
        })
      }
    })
  },
  addItem: function() {
    wx.navigateTo({
      url: '/pages/newGood/newGood'
    })
  },
  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '管理中心'
    })
  },
  onShow: function() {
    this.setData({
      pageNum: 0,
      manageList: []
    })
    this.getManageList()
  }
})