const { searchAdditives, getById } = require('../../utils/search')

const SAFETY_COLORS = {
  safe: { bg: '#F6FFED', text: '#52C41A', dot: '#52C41A' },
  warning: { bg: '#FFFBE6', text: '#D48806', dot: '#FAAD14' },
  danger: { bg: '#FFF2F0', text: '#FF4D4F', dot: '#FF4D4F' }
}

Page({
  data: {
    keyword: '',
    searchResults: [],
    selectedItems: [],
    showSearch: true,
    maxSelect: 4
  },

  onShareAppMessage() {
    const { selectedItems } = this.data
    const names = selectedItems.map(i => i.name).join(' vs ')
    return {
      title: `食安查 · 添加剂对比：${names}`,
      path: '/pages/compare/compare'
    }
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ keyword })
    if (keyword.length === 0) {
      this.setData({ searchResults: [] })
      return
    }
    const results = searchAdditives(keyword)
    this.setData({ searchResults: results })
  },

  onClearSearch() {
    this.setData({ keyword: '', searchResults: [] })
  },

  onSelectAdditive(e) {
    const { id } = e.currentTarget.dataset
    const { selectedItems } = this.data
    if (selectedItems.some(item => item.id === id)) {
      wx.showToast({ title: '已添加', icon: 'none' })
      return
    }
    if (selectedItems.length >= this.data.maxSelect) {
      wx.showToast({ title: '最多对比4种', icon: 'none' })
      return
    }
    const item = getById(id)
    if (item) {
      selectedItems.push(item)
      this.setData({ selectedItems, keyword: '', searchResults: [] })
    }
  },

  onRemoveItem(e) {
    const { index } = e.currentTarget.dataset
    const { selectedItems } = this.data
    selectedItems.splice(index, 1)
    this.setData({ selectedItems })
  },

  onStartCompare() {
    if (this.data.selectedItems.length < 2) {
      wx.showToast({ title: '请至少选择2种', icon: 'none' })
      return
    }
    this.setData({ showSearch: false })
  },

  onReset() {
    this.setData({ selectedItems: [], showSearch: true, keyword: '', searchResults: [] })
  },

  onTapAdditive(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  async onShareResult() {
    const { selectedItems } = this.data
    if (!selectedItems.length) return

    try {
      const query = wx.createSelectorQuery()
      query.select('#shareCanvas')
      const res = await new Promise((resolve, reject) => {
        query.fields({ node: true, size: true }).exec((r) => {
          if (r && r[0] && r[0].node) {
            resolve(r[0])
          } else {
            reject(new Error('canvas not found'))
          }
        })
      })

      const canvas = res.node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getWindowInfo().pixelRatio
      const cw = 600
      const ch = 800
      canvas.width = cw * dpr
      canvas.height = ch * dpr
      ctx.scale(dpr, dpr)

      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, cw, ch)

      ctx.fillStyle = '#333333'
      ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('食安查 · 添加剂对比', cw / 2, 60)

      ctx.strokeStyle = '#F0F0F0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(40, 85)
      ctx.lineTo(cw - 40, 85)
      ctx.stroke()

      const labels = ['安全等级', '编码', '功能分类', '国标状态', '欧盟状态', '美国状态', '摄入量', '常见食品', '特殊提醒']
      const keys = ['safetyLevel', 'code', 'category', 'gbStatus', 'euStatus', 'usStatus', 'adi', 'commonFoods', 'warning']
      const colCount = selectedItems.length
      const labelW = 120
      const colW = (cw - labelW - 60) / colCount
      const startX = 30
      const startY = 110
      const rowH = 55

      ctx.fillStyle = '#FAFAFA'
      ctx.fillRect(startX, startY, cw - 60, rowH)

      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#999999'
      ctx.fillText('对比项', startX + labelW / 2, startY + 34)

      selectedItems.forEach((item, i) => {
        const cx = startX + labelW + colW * i + colW / 2
        const sc = SAFETY_COLORS[item.safetyClass] || SAFETY_COLORS.safe
        ctx.fillStyle = sc.text
        ctx.fillText(item.name, cx, startY + 34)
      })

      labels.forEach((label, rowIdx) => {
        const y = startY + rowH * (rowIdx + 1)

        if (rowIdx % 2 === 0) {
          ctx.fillStyle = '#FAFAFA'
          ctx.fillRect(startX, y, cw - 60, rowH)
        }

        ctx.strokeStyle = '#F5F5F5'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(startX, y)
        ctx.lineTo(cw - 30, y)
        ctx.stroke()

        ctx.font = '16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#999999'
        ctx.fillText(label, startX + labelW / 2, y + 34)

        selectedItems.forEach((item, i) => {
          const cx = startX + labelW + colW * i + colW / 2
          const key = keys[rowIdx]
          let val = item[key] || '无'
          if (key === 'warning' && !val) val = '无'

          if (key === 'safetyLevel') {
            const sc = SAFETY_COLORS[item.safetyClass] || SAFETY_COLORS.safe
            const tw = ctx.measureText(val).width + 16
            ctx.fillStyle = sc.bg
            const rx = cx - tw / 2
            const ry = y + 14
            ctx.beginPath()
            ctx.moveTo(rx + 8, ry)
            ctx.lineTo(rx + tw - 8, ry)
            ctx.quadraticCurveTo(rx + tw, ry, rx + tw, ry + 8)
            ctx.lineTo(rx + tw, ry + 22)
            ctx.quadraticCurveTo(rx + tw, ry + 30, rx + tw - 8, ry + 30)
            ctx.lineTo(rx + 8, ry + 30)
            ctx.quadraticCurveTo(rx, ry + 30, rx, ry + 22)
            ctx.lineTo(rx, ry + 8)
            ctx.quadraticCurveTo(rx, ry, rx + 8, ry)
            ctx.closePath()
            ctx.fill()
            ctx.fillStyle = sc.text
          } else if (key === 'warning' && item.warning) {
            ctx.fillStyle = '#FF4D4F'
          } else {
            ctx.fillStyle = '#333333'
          }

          ctx.font = '15px sans-serif'
          ctx.fillText(val, cx, y + 34)
        })
      })

      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#BBBBBB'
      ctx.fillText('⚠️ 查询结果仅供信息参考，不构成消费建议', cw / 2, ch - 30)

      await new Promise((resolve) => {
        setTimeout(resolve, 300)
      })

      const tempRes = await new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          canvas,
          success: resolve,
          fail: reject
        })
      })

      const actionRes = await new Promise((resolve) => {
        wx.showActionSheet({
          itemList: ['保存到相册', '发送给好友'],
          success: resolve,
          fail: () => resolve(null)
        })
      })

      if (!actionRes) return

      if (actionRes.tapIndex === 0) {
        const authRes = await new Promise((resolve) => {
          wx.getSetting({
            success: resolve
          })
        })
        if (!authRes.authSetting['scope.writePhotosAlbum']) {
          const grantRes = await new Promise((resolve) => {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success: resolve,
              fail: resolve
            })
          })
          if (!grantRes.errMsg || grantRes.errMsg.indexOf('ok') === -1) {
            wx.showModal({
              title: '提示',
              content: '需要您授权保存图片到相册',
              confirmText: '去授权',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting()
                }
              }
            })
            return
          }
        }
        await new Promise((resolve, reject) => {
          wx.saveImageToPhotosAlbum({
            filePath: tempRes.tempFilePath,
            success: resolve,
            fail: reject
          })
        })
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      } else if (actionRes.tapIndex === 1) {
        wx.shareFileMessage({
          filePath: tempRes.tempFilePath,
          fileName: '食安查对比结果.png',
          fail: () => {
            wx.showToast({ title: '分享失败，请重试', icon: 'none' })
          }
        })
      }
    } catch (err) {
      console.error('share error', err)
      wx.showModal({
        title: '分享提示',
        content: '图片生成失败，是否通过小程序卡片分享给好友？',
        confirmText: '分享',
        success: (modalRes) => {
          if (modalRes.confirm) {
            wx.showShareMenu({
              withShareTicket: true,
              menus: ['shareAppMessage', 'shareTimeline']
            })
          }
        }
      })
    }
  }
})
