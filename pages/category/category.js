const { getCategories, getByCategory, getBySafetyLevel } = require('../../utils/search')

Page({
  data: {
    activeTab: 'category',
    categories: [],
    currentCategory: '',
    currentSafetyLevel: '',
    displayList: [],
    safetyLevels: [
      { key: '安全', emoji: '🟢', color: '#52C41A', bg: '#F6FFED' },
      { key: '争议', emoji: '🟡', color: '#FAAD14', bg: '#FFFBE6' },
      { key: '慎用', emoji: '🔴', color: '#FF4D4F', bg: '#FFF2F0' }
    ]
  },

  onLoad() {
    const categories = getCategories()
    this.setData({ categories })
    this.switchTab({ currentTarget: { dataset: { tab: 'category' } } })
  },

  onShow() {
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab, currentCategory: '', currentSafetyLevel: '' })
    if (tab === 'category') {
      const list = getByCategory(this.data.categories[0]?.name || '防腐剂')
      this.setData({ currentCategory: this.data.categories[0]?.name || '防腐剂', displayList: list })
    } else {
      const list = getBySafetyLevel('安全')
      this.setData({ currentSafetyLevel: '安全', displayList: list })
    }
  },

  onSelectCategory(e) {
    const name = e.currentTarget.dataset.name
    const list = getByCategory(name)
    this.setData({ currentCategory: name, displayList: list })
  },

  onSelectSafetyLevel(e) {
    const level = e.currentTarget.dataset.level
    const list = getBySafetyLevel(level)
    this.setData({ currentSafetyLevel: level, displayList: list })
  },

  onTapAdditive(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})