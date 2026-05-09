const { parseIngredientList } = require('../../utils/search')
const { addScanHistory } = require('../../utils/storage')

Page({
  data: {
    inputText: '',
    result: null,
    isAnalyzing: false,
    hasResult: false
  },

  onShow() {
  },

  onInputChange(e) {
    this.setData({ inputText: e.detail.value })
  },

  onPaste() {
    const that = this
    wx.getClipboardData({
      success(res) {
        that.setData({ inputText: res.data })
        wx.showToast({ title: '已粘贴', icon: 'none' })
      }
    })
  },

  onTakePhoto() {
    const that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success() {
        wx.showToast({ title: '图片识别功能开发中，请手动输入', icon: 'none' })
      }
    })
  },

  onAnalyze() {
    const { inputText } = this.data
    if (!inputText.trim()) {
      wx.showToast({ title: '请输入配料表内容', icon: 'none' })
      return
    }
    this.setData({ isAnalyzing: true })
    const result = parseIngredientList(inputText)
    addScanHistory(inputText, result)
    this.setData({ result, hasResult: true, isAnalyzing: false })
  },

  onReset() {
    this.setData({ inputText: '', result: null, hasResult: false })
  },

  onTapAdditive(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})