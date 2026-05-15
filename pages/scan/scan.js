const { parseIngredientList } = require('../../utils/search')
const { addScanHistory } = require('../../utils/storage')

Page({
  data: {
    inputText: '',
    result: null,
    isAnalyzing: false,
    hasResult: false,
    isOcrLoading: false
  },

  onLoad() {},
  onShow() {},

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

    try {
      if (!wx.serviceMarket || !wx.serviceMarket.invokeService) {
        throw new Error('serviceMarket not available')
      }

      var ocrData = { ocr_type: 8 }

      if (wx.serviceMarket.CDN) {
        ocrData.img_url = new wx.serviceMarket.CDN({
          type: 'filePath',
          filePath: imagePath
        })
        ocrData.data_type = 3
      } else {
        var fileManager = wx.getFileSystemManager()
        var base64 = fileManager.readFileSync(imagePath, 'base64')
        ocrData.img_data = 'data:image/jpeg;base64,' + base64
        ocrData.data_type = 2
      }

      wx.serviceMarket.invokeService({
        service: 'wx79ac3de8be320b71',
        api: 'OcrAllInOne',
        data: ocrData
      }).then(function(res) {
        wx.hideToast()
        var text = that.extractTextFromOcrResult(res)
        if (text) {
          that.setData({ inputText: text, isOcrLoading: false })
          that.onAnalyze()
        } else {
          that.setData({ isOcrLoading: false })
          wx.showToast({ title: '未识别到文字，请手动输入', icon: 'none' })
        }
      }).catch(function(err) {
        wx.hideToast()
        that.setData({ isOcrLoading: false })
        wx.showModal({
          title: 'OCR识别失败',
          content: '请确认已在微信服务市场开通OCR服务（每天免费100次）。开通路径：微信公众平台 → 设置 → 第三方设置 → 插件管理 → 添加"OCR支持"插件，并在服务市场购买免费额度。您也可以手动输入配料表文字。',
          showCancel: false,
          confirmText: '知道了'
        })
      })
    } catch(e) {
      wx.hideToast()
      this.setData({ isOcrLoading: false })
      wx.showModal({
        title: 'OCR不可用',
        content: '当前环境不支持OCR识别。请在微信服务市场开通OCR服务后重试。您也可以手动输入配料表文字进行解析。',
        showCancel: false,
        confirmText: '知道了'
      })
    }
  },

  extractTextFromOcrResult(res) {
    if (!res) return ''
    try {
      var data = res.data || res
      if (typeof data === 'string') {
        try { data = JSON.parse(data) } catch(e) { return data }
      }
      if (data.ocr_comm_res && data.ocr_comm_res.items && Array.isArray(data.ocr_comm_res.items)) {
        return data.ocr_comm_res.items.map(function(item) {
          return item.text || ''
        }).filter(Boolean).join('')
      }
      if (data.items && Array.isArray(data.items)) {
        return data.items.map(function(item) {
          if (typeof item === 'string') return item
          return item.text || item.content || item.words || ''
        }).filter(Boolean).join('')
      }
      if (data.ocr_res) {
        var ocrRes = data.ocr_res
        if (ocrRes.items && Array.isArray(ocrRes.items)) {
          return ocrRes.items.map(function(item) {
            return item.text || item.content || item.words || ''
          }).filter(Boolean).join('')
        }
        if (typeof ocrRes === 'string') return ocrRes
      }
      if (data.words_result && Array.isArray(data.words_result)) {
        return data.words_result.map(function(w) { return w.words || '' }).join('')
      }
      if (typeof data === 'string') return data
      return ''
    } catch(e) {
      return ''
    }
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
  },

  onShareAppMessage() {
    const { result } = this.data
    const total = (result && result.total) || 0
    return {
      title: `食安查 | 配料表解析 - 发现${total}种添加剂`,
      path: '/pages/scan/scan'
    }
  }
})
