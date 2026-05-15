const { getById, getByCategory } = require('../../utils/search')
const { isFavorite, addFavorite, removeFavorite } = require('../../utils/storage')

Page({
  data: {
    additive: null,
    isFav: false,
    safetyEmoji: '',
    safetyColor: '',
    safetyBg: '',
    gbIcon: '',
    euIcon: '',
    usIcon: '',
    relatedItems: []
  },

  onLoad(options) {
    const { id } = options
    const additive = getById(id)
    if (!additive) {
      wx.showToast({ title: '未找到该添加剂', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }
    const safetyMap = {
      '安全': { emoji: '🟢', color: '#52C41A', bg: '#F6FFED' },
      '争议': { emoji: '🟡', color: '#FAAD14', bg: '#FFFBE6' },
      '慎用': { emoji: '🔴', color: '#FF4D4F', bg: '#FFF2F0' }
    }
    const statusIcon = { '允许': '✅', '限量': '⚠️', '禁止': '❌' }
    const safety = safetyMap[additive.safetyLevel] || safetyMap['安全']
    const relatedItems = getByCategory(additive.category)
      .filter(item => item.id !== additive.id)
      .slice(0, 6)
    this.setData({
      additive,
      isFav: isFavorite(id),
      safetyEmoji: safety.emoji,
      safetyColor: safety.color,
      safetyBg: safety.bg,
      gbIcon: statusIcon[additive.gbStatus] || '—',
      euIcon: statusIcon[additive.euStatus] || '—',
      usIcon: statusIcon[additive.usStatus] || '—',
      relatedItems
    })
  },

  onRelatedTap(e) {
    const { id } = e.currentTarget.dataset
    wx.redirectTo({ url: `/pages/detail/detail?id=${id}` })
  },

  onToggleFav() {
    const { additive, isFav } = this.data
    if (isFav) {
      removeFavorite(additive.id)
    } else {
      addFavorite(additive.id)
    }
    this.setData({ isFav: !isFav })
    wx.showToast({ title: isFav ? '已取消收藏' : '已收藏', icon: 'none' })
  },

  onShareAppMessage() {
    const { additive } = this.data
    return {
      title: `食安查 | ${additive.name} - ${additive.safetyLevel}`,
      path: `/pages/detail/detail?id=${additive.id}`
    }
  }
})