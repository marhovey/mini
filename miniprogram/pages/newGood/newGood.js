const app = getApp()

Page({
  data: {
    formList: [
      {
        label: '商品标题',
        key: 'title',
        type: ''
      },
      // {
      //   label: '商品价格',
      //   key: 'price',
      //   type: 'digit'
      // },
      {
        label: '商品销量',
        key: 'cnt',
        type: ''
      },
      {
        label: '商品分类',
        key: 'type',
        type: 'selector',
        options: ['洋酒', '白酒']
      },
      {
        label: '是否推荐',
        type: 'switch',
        key: 'recommend'
      },
      {
        label: '是否精选',
        type: 'switch',
        key: 'selection'
      },
      {
        label: '文字描述',
        type: 'textarea',
        key: 'descWords'
      },
      {
        label: '商品图片',
        key: 'banner',
        type: 'upload',
        maxLength: 5
      },
      {
        label: '商品描述',
        key: 'desc',
        type: 'upload',
        maxLength: 1
      }
    ],
    formData: {},
    disabled: false
  },
  handleChangeValue: function(e) {
    const {name} = e.currentTarget.dataset
    this.setData({
      formData: {
        ...this.data.formData,
        [name]: e.detail.value
      }
    })
  },
  uploadImg: function(e) {
    var name = e.currentTarget.dataset.name
    var list = this.data.formData[name] || []
    var self = this
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'img-' + new Date().getTime() + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            wx.showToast({
              icon: 'none',
              title: '上传成功',
            })
            list.push(res.fileID)
            self.setData({
              formData: {
                ...self.data.formData,
                [name]: list
              }
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  deleteImg: function(e) {
    const { index, name } = e.currentTarget.dataset
    let list = this.data.formData[name]
    const fileID = list[index]
    let self = this
    wx.cloud.deleteFile({
      fileList: [fileID],
      success: res => {
        wx.showToast({
          icon: 'none',
          title: '删除成功',
        })
        list.splice(index, 1)
        self.setData({
          formData: {
            ...self.data.formData,
            [name]: list
          }
        })
      },
      fail: e => {
        wx.showToast({
          icon: 'none',
          title: '删除失败',
        })
      }
    })
  },
  saveGood: function() {
    let self = this
    const {_id} = this.data.formData
    if(_id){
      this.updateItem(_id)
    } else {
      this.addItem()
    }
  },
  addItem: function() {
    const db = wx.cloud.database()
    let self = this
    db.collection('list').add({
      data: {
        selection: false,
        recommend: false,
        ...self.data.formData,
        view: 0,
        tWhen: new Date().getTime()
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        wx.showToast({
          title: '操作成功',
        })
        wx.navigateBack({
          delta: 1
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
  },
  updateItem: function(id) {
    const db = wx.cloud.database()
    let self = this
    db.collection('list').doc(id).update({
      data: {
        ...self.data.formData,
        _id: undefined,
        _openid: undefined,
        view: undefined
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        wx.showToast({
          title: '操作成功',
        })
        wx.navigateBack({
          delta: 1
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
  },
  getFormData: function(id) {
    const db = wx.cloud.database()
    let self = this
    db.collection('list').doc(id).get({
      success: function(res) {
        // res.data 包含该记录的数据
        self.setData({
          formData: res.data
        })
      }
    })
  },
  onLoad: function(options) {
    if(options.id){
      this.getFormData(options.id)
    }
    wx.setNavigationBarTitle({
      title: '商品详情'
    })
  }
})