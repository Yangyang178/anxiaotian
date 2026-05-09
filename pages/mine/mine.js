const { getFavorites, getScanHistory, clearScanHistory, removeFavorite, isFavorite } = require('../../utils/storage')
const { getById } = require('../../utils/search')

Page({
  data: {
    activeTab: 'favorites',
    favorites: [],
    history: [],
    favoriteCount: 0,
    historyCount: 0
  },

  onShow() {
    this.loadFavorites()
    this.loadHistory()
  },

  loadFavorites() {
    const ids = getFavorites()
    const favorites = ids.map(id => getById(id)).filter(Boolean)
    this.setData({ favorites, favoriteCount: favorites.length })
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
    this.setData({ history, historyCount: history.length })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
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