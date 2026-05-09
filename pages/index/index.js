const { searchAdditives, getCategories, getBySafetyLevel } = require('../../utils/search')

Page({
  data: {
    keyword: '',
    searchResults: [],
    isSearching: false,
    categories: [],
    hotAdditives: [
      { id: 'e951', name: '阿斯巴甜', safetyLevel: '争议', category: '甜味剂', safetyClass: 'warning' },
      { id: 'e202', name: '山梨酸钾', safetyLevel: '安全', category: '防腐剂', safetyClass: 'safe' },
      { id: 'e250', name: '亚硝酸钠', safetyLevel: '慎用', category: '防腐剂', safetyClass: 'danger' },
      { id: 'e102', name: '柠檬黄', safetyLevel: '争议', category: '色素', safetyClass: 'warning' },
      { id: 'e319', name: 'TBHQ', safetyLevel: '争议', category: '抗氧化剂', safetyClass: 'warning' },
      { id: 'e621', name: '味精', safetyLevel: '争议', category: '其他', safetyClass: 'warning' },
      { id: 'e415', name: '黄原胶', safetyLevel: '安全', category: '增稠剂', safetyClass: 'safe' },
      { id: 'e322', name: '大豆磷脂', safetyLevel: '安全', category: '乳化剂', safetyClass: 'safe' }
    ],
    safetyStats: { safe: 0, warning: 0, danger: 0 }
  },

  onLoad() {
    const categories = getCategories()
    const safeItems = getBySafetyLevel('安全')
    const warningItems = getBySafetyLevel('争议')
    const dangerItems = getBySafetyLevel('慎用')
    this.setData({
      categories,
      safetyStats: {
        safe: safeItems.length,
        warning: warningItems.length,
        danger: dangerItems.length
      }
    })
  },

  onShow() {
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ keyword })
    if (keyword.length === 0) {
      this.setData({ searchResults: [], isSearching: false })
      return
    }
    const results = searchAdditives(keyword)
    this.setData({ searchResults: results, isSearching: true })
  },

  onClearSearch() {
    this.setData({ keyword: '', searchResults: [], isSearching: false })
  },

  onTapAdditive(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  onTapCategory(e) {
    const { name } = e.currentTarget.dataset
    wx.switchTab({ url: '/pages/category/category' })
  },

  onTapSafetyLevel(e) {
    const { level } = e.currentTarget.dataset
    wx.switchTab({ url: '/pages/category/category' })
  },

  onGoCompare() {
    wx.navigateTo({ url: '/pages/compare/compare' })
  }
})