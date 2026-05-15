App({
  onLaunch() {
    wx.showShareMenu({ withShareTicket: true })

    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function(res) {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(function() {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success(res) {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
        updateManager.onUpdateFailed(function() {
          wx.showModal({
            title: '更新提示',
            content: '新版本下载失败，请删除当前小程序后重新搜索打开',
            showCancel: false
          })
        })
      }
    })
  },
  globalData: {
    selectedTab: 0,
    pendingCategory: '',
    pendingSafetyLevel: ''
  }
})