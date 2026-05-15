const { searchAdditives, searchSuggestions, getCategories, getBySafetyLevel, getById } = require('../../utils/search')
const { addSearchHistory, getSearchHistory, clearSearchHistory, incrementSearchCount, getHotAdditives } = require('../../utils/storage')
const { getDailyTip } = require('../../utils/dailyTips')

const DEFAULT_HOT_IDS = ['e951', 'e202', 'e250', 'e102', 'e319', 'e621', 'e415', 'e322']

Page({
  data: {
    keyword: '',
    searchResults: [],
    isSearching: false,
    categories: [],
    hotAdditives: [],
    safetyStats: { safe: 0, warning: 0, danger: 0 },
    searchTimer: null,
    showHistory: false,
    searchHistory: [],
    showSuggestions: false,
    suggestions: [],
    dailyTip: null
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
    const hotIds = getHotAdditives(8)
    const ids = hotIds.length > 0 ? hotIds : DEFAULT_HOT_IDS
    const hotAdditives = ids.map(id => getById(id)).filter(Boolean)
    const dailyTip = getDailyTip()
    this.setData({ hotAdditives, dailyTip })
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ keyword })
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer)
    }
    if (keyword.length === 0) {
      this.setData({
        searchResults: [],
        isSearching: false,
        showSuggestions: false,
        suggestions: [],
        showHistory: true,
        searchHistory: getSearchHistory()
      })
      return
    }
    const timer = setTimeout(() => {
      const suggestions = searchSuggestions(keyword)
      this.setData({
        suggestions,
        showSuggestions: suggestions.length > 0,
        showHistory: false
      })
      const results = searchAdditives(keyword)
      this.setData({ searchResults: results, isSearching: true })
    }, 300)
    this.setData({ searchTimer: timer })
  },

  onSearchFocus() {
    if (this.data.keyword.length === 0) {
      this.setData({
        showHistory: true,
        searchHistory: getSearchHistory()
      })
    }
  },

  onSearchBlur() {
    setTimeout(() => {
      this.setData({ showHistory: false, showSuggestions: false })
    }, 200)
  },

  onClearSearch() {
    this.setData({
      keyword: '',
      searchResults: [],
      isSearching: false,
      showSuggestions: false,
      suggestions: [],
      showHistory: true,
      searchHistory: getSearchHistory()
    })
  },

  onTapHistory(e) {
    const { keyword } = e.currentTarget.dataset
    this.setData({ keyword })
    addSearchHistory(keyword)
    const results = searchAdditives(keyword)
    if (results.length > 0) {
      incrementSearchCount(results[0].id)
    }
    const suggestions = searchSuggestions(keyword)
    this.setData({
      searchResults: results,
      isSearching: true,
      showHistory: false,
      showSuggestions: false,
      suggestions: []
    })
  },

  onClearHistory() {
    clearSearchHistory()
    this.setData({ searchHistory: [], showHistory: false })
  },

  onTapSuggestion(e) {
    const { id } = e.currentTarget.dataset
    addSearchHistory(this.data.keyword)
    incrementSearchCount(id)
    this.setData({ showSuggestions: false, suggestions: [] })
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
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
  },

  onTapDailyTip() {
    if (this.data.dailyTip && this.data.dailyTip.id) {
      wx.navigateTo({ url: `/pages/detail/detail?id=${this.data.dailyTip.id}` })
    }
  },

  onShareAppMessage() {
    return {
      title: '食安查 - 看懂配料表再下单',
      path: '/pages/index/index'
    }
  }
})
