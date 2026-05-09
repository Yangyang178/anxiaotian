const { getFavorites, getScanHistory, clearScanHistory, removeFavorite, isFavorite } = require('../../utils/storage')
const { getById } = require('../../utils/search')

const PREVIEW_COUNT = 3

Page({
  data: {
    activeTab: 'favorites',
    favorites: [],
    displayFavorites: [],
    history: [],
    displayHistory: [],
    favoriteCount: 0,
    historyCount: 0,
    showAllFavorites: false,
    showAllHistory: false
  },

  onShow() {
    this.loadFavorites()
    this.loadHistory()
  },

  loadFavorites() {
    const ids = getFavorites()
    const favorites = ids.map(id => getById(id)).filter(Boolean)
    const displayFavorites = this.data.showAllFavorites ? favorites : favorites.slice(0, PREVIEW_COUNT)
    this.setData({ favorites, displayFavorites, favoriteCount: favorites.length })
  },

  loadHistory() {
    const history = getScanHistory().map(item => {
      const d = new Date(item.time)
      const pad = n => String(n).padStart(2, '0')
      return {
        ...item,
        timeText: `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
      }
    })
    const displayHistory = this.data.showAllHistory ? history : history.slice(0, PREVIEW_COUNT)
    this.setData({ history, displayHistory, historyCount: history.length })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  onToggleFavorites() {
    const showAllFavorites = !this.data.showAllFavorites
    const displayFavorites = showAllFavorites ? this.data.favorites : this.data.favorites.slice(0, PREVIEW_COUNT)
    this.setData({ showAllFavorites, displayFavorites })
  },

  onToggleHistory() {
    const showAllHistory = !this.data.showAllHistory
    const displayHistory = showAllHistory ? this.data.history : this.data.history.slice(0, PREVIEW_COUNT)
    this.setData({ showAllHistory, displayHistory })
  },

  onTapAdditive(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  onRemoveFavorite(e) {
    const { id } = e.currentTarget.dataset
    removeFavorite(id)
    this.loadFavorites()
    wx.showToast({ title: '已取消收藏', icon: 'none' })
  },

  onClearHistory() {
    const that = this
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有扫描历史吗？',
      success(res) {
        if (res.confirm) {
          clearScanHistory()
          that.loadHistory()
          wx.showToast({ title: '已清空', icon: 'none' })
        }
      }
    })
  },

  onViewHistoryDetail(e) {
    const { index } = e.currentTarget.dataset
    const item = this.data.history[index]
    if (item && item.result) {
      this.setData({ activeTab: 'history' })
    }
  }
})
