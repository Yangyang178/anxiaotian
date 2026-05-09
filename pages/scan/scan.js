const { parseIngredientList } = require('../../utils/search')
const { addScanHistory } = require('../../utils/storage')

const ocrPlugin = requirePlugin('ocr-plugin')

Page({
  data: {
    inputText: '',
    result: null,
    isAnalyzing: false,
    hasResult: false,
    isOcrLoading: false
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
      sourceType: ['camera', 'album'],
      sizeType: ['compressed'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath
        that.recognizeText(tempFilePath)
      }
    })
  },

  onChooseImage() {
    const that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['compressed'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath
        that.recognizeText(tempFilePath)
      }
    })
  },

  recognizeText(imagePath) {
    const that = this
    this.setData({ isOcrLoading: true })
    wx.showToast({ title: '识别中...', icon: 'loading', duration: 10000 })

    if (ocrPlugin && ocrPlugin.ocr) {
      ocrPlugin.ocr({
        type: 'photo',
        filePath: imagePath,
        success(res) {
          wx.hideToast()
          const text = that.extractTextFromOcrResult(res)
          if (text) {
            that.setData({ inputText: text, isOcrLoading: false })
            that.onAnalyze()
          } else {
            that.setData({ isOcrLoading: false })
            wx.showToast({ title: '未识别到文字，请手动输入', icon: 'none' })
          }
        },
        fail(err) {
          wx.hideToast()
          that.setData({ isOcrLoading: false })
          that.fallbackOcr(imagePath)
        }
      })
    } else {
      this.fallbackOcr(imagePath)
    }
  },

  fallbackOcr(imagePath) {
    const that = this
    wx.cloud.callFunction({
      name: 'ocr',
      data: { image: imagePath },
      success(res) {
        if (res.result && res.result.text) {
          that.setData({ inputText: res.result.text })
          that.onAnalyze()
        } else {
          wx.showToast({ title: '未识别到文字，请手动输入', icon: 'none' })
        }
      },
      fail() {
        wx.showToast({ title: '请手动输入配料表', icon: 'none', duration: 2000 })
      }
    })
    this.setData({ isOcrLoading: false })
  },

  extractTextFromOcrResult(res) {
    if (!res) return ''
    if (typeof res === 'string') return res
    if (res.result && typeof res.result === 'string') return res.result
    if (res.items && Array.isArray(res.items)) {
      return res.items.map(item => {
        if (typeof item === 'string') return item
        if (item.text) return item.text
        if (item.content) return item.content
        return ''
      }).filter(Boolean).join('')
    }
    if (res.data && typeof res.data === 'string') return res.data
    if (res.words_result && Array.isArray(res.words_result)) {
      return res.words_result.map(w => w.words || '').join('')
    }
    return ''
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