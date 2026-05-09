const { searchAdditives, getById } = require('../../utils/search')

Page({
  data: {
    keyword: '',
    searchResults: [],
    selectedItems: [],
    showSearch: true,
    maxSelect: 4
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
  }
})
