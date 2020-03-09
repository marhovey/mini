//index.js
const app = getApp()

Page({
  data: {
    manageList: [],
    pageNum: 0,
    pageSize: 20,
    totalCnt: 0,
    favors: [],
    type: '0',
    loading: false
  },
  getManageList: async function() {
    const { pageNum, pageSize, totalCnt, favors } = this.data
    const currPage = pageNum + 1
    if(totalCnt > pageNum*pageSize || pageNum === 0) {
      const db = wx.cloud.database()
      const total = await db.collection('list').count()
      const newTotal = total.total
      wx.showLoading({})
      let self = this
      db.collection('list').where({
        type: self.data.type
      }).skip(pageNum * pageSize).limit(pageSize).get({
        success: function(res) {
          // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
          wx.hideLoading({})
          // for(let i in res.data){
          //   let ind = favors.findIndex(
          //     item =>
          //       item.favorItemId === res.data[i]['_id']
          //   )
          //   res.data[i].favor = (ind !== -1)
          // }
          for(let i in res.data){
            res.data[i].saleCnt = res.data[i].cnt * 1 + res.data[i].view * 1
          }
          self.setData({
            manageList: res.data,
            totalCnt: newTotal,
            pageNum: currPage,
            loading: false
          })
        }
      })
    }
  },
  onReachBottom: function() {
    if(this.data.loading) return false
    this.setData({
      loading: true
    })
    this.getManageList()
  },
  // onRefresh: function() {
  //   if(this.data.loading) return false
  //   this.setData({
  //     pageNum: 0,
  //     loading: true
  //   })
  //   this.getManageList()
  // },
  tapIcon: () => {

  },
  changeTab: function(e) {
    const {name} = e.currentTarget.dataset
    this.setData({
      type: name,
      pageNum: 0
    })
    this.getManageList()
  },
  handleManage: function(e) {
    const {name} = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/detail/detail?id=${name}`
    })
  },
  addFavor: function(e) {
    const {name, index} = e.currentTarget.dataset
    const db = wx.cloud.database()
    let {manageList} = this.data
    const item = this.data.manageList[index]
    const self = this
    if(item.favor){
      db.collection('favors').where({
        favorItemId: name
      }).remove({
        success: function(res) {
          wx.showToast({
            title: '操作成功',
          })
          item.favor = false
          manageList.splice(index, 1, item)
          self.setData({
            manageList: manageList
          })
          console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '操作失败'
          })
          console.error('[数据库] [新增记录] 失败：', err)
        }
      })
    } else {
      db.collection('favors').add({
        data: {
          favorItemId: name
        },
        success: res => {
          // 在返回结果中会包含新创建的记录的 _id
          wx.showToast({
            title: '操作成功',
          })
          item.favor = true
          manageList.splice(index, 1, item)
          self.setData({
            manageList: manageList
          })
          console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '操作失败'
          })
          console.error('[数据库] [新增记录] 失败：', err)
        }
      })
    }
  },
  getFavors: async function() {
    const db = wx.cloud.database()
    const favorTotal = await db.collection('favors').count()
    const batchTimes = Math.ceil(favorTotal.total / 20)
    const tasks = []
    if(favorTotal.total > 0) {
      for (let i = 0; i < batchTimes; i++) {
        const promise = db.collection('favors').skip(i * 20).limit(20).get()
        tasks.push(promise)
      }
      // 等待所有
      return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          data: acc.data.concat(cur.data),
          errMsg: acc.errMsg,
        }
      })      
    } else {
      return []
    }
  },
  onLoad: function() {
    // const favors = await this.getFavors()
    // this.setData({favors: favors.data})
    wx.setNavigationBarTitle({
      title: '全部商品'
    })
  },
  onShow: function() {
    this.setData({
      pageNum: 0,
      loading: true
    })
    this.getManageList()
  }
})