const FAVORITES_KEY = 'favorites'
const SCAN_HISTORY_KEY = 'scan_history'
const SEARCH_HISTORY_KEY = 'search_history'
const SEARCH_COUNTS_KEY = 'search_counts'
const MAX_HISTORY = 50
const MAX_SEARCH_HISTORY = 10

function getFavorites() {
  return wx.getStorageSync(FAVORITES_KEY) || []
}

function addFavorite(id) {
  const list = getFavorites()
  if (!list.includes(id)) {
    list.push(id)
    wx.setStorageSync(FAVORITES_KEY, list)
  }
}

function removeFavorite(id) {
  const list = getFavorites()
  const idx = list.indexOf(id)
  if (idx > -1) {
    list.splice(idx, 1)
    wx.setStorageSync(FAVORITES_KEY, list)
  }
}

function isFavorite(id) {
  return getFavorites().includes(id)
}

function getScanHistory() {
  return wx.getStorageSync(SCAN_HISTORY_KEY) || []
}

function addScanHistory(text, result) {
  const list = getScanHistory()
  const existing = list.findIndex(item => item.text === text)
  if (existing > -1) {
    list.splice(existing, 1)
  }
  list.unshift({ text, time: Date.now(), result })
  if (list.length > MAX_HISTORY) {
    list.length = MAX_HISTORY
  }
  wx.setStorageSync(SCAN_HISTORY_KEY, list)
}

function clearScanHistory() {
  wx.removeStorageSync(SCAN_HISTORY_KEY)
}

function addSearchHistory(keyword) {
  if (!keyword || !keyword.trim()) return
  const list = getSearchHistory()
  const idx = list.indexOf(keyword)
  if (idx > -1) {
    list.splice(idx, 1)
  }
  list.unshift(keyword)
  if (list.length > MAX_SEARCH_HISTORY) {
    list.length = MAX_SEARCH_HISTORY
  }
  wx.setStorageSync(SEARCH_HISTORY_KEY, list)
}

function getSearchHistory() {
  return wx.getStorageSync(SEARCH_HISTORY_KEY) || []
}

function clearSearchHistory() {
  wx.removeStorageSync(SEARCH_HISTORY_KEY)
}

function incrementSearchCount(additiveId) {
  if (!additiveId) return
  const counts = wx.getStorageSync(SEARCH_COUNTS_KEY) || {}
  counts[additiveId] = (counts[additiveId] || 0) + 1
  wx.setStorageSync(SEARCH_COUNTS_KEY, counts)
}

function getHotAdditives(limit) {
  limit = limit || 8
  const counts = wx.getStorageSync(SEARCH_COUNTS_KEY) || {}
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)
}

function getSafetyIndex() {
  const history = getScanHistory()
  if (!history || history.length === 0) return { score: -1, level: '', desc: '' }

  let totalAdditives = 0
  let safeCount = 0
  let warningCount = 0
  let dangerCount = 0

  for (const item of history) {
    if (item.result) {
      totalAdditives += (item.result.total || 0)
      safeCount += (item.result.safe || 0)
      warningCount += (item.result.warning || 0)
      dangerCount += (item.result.danger || 0)
    }
  }

  if (totalAdditives === 0) return { score: -1, level: '', desc: '' }

  const safeRatio = safeCount / totalAdditives
  const dangerRatio = dangerCount / totalAdditives
  const warningRatio = warningCount / totalAdditives

  let score = Math.round(safeRatio * 60 + (1 - dangerRatio) * 25 + (1 - warningRatio) * 15)
  score = Math.max(0, Math.min(100, score))

  let level = ''
  let desc = ''
  if (score >= 80) {
    level = '优秀'
    desc = '您的饮食较为安全，继续保持健康饮食习惯'
  } else if (score >= 60) {
    level = '良好'
    desc = '饮食整体安全，注意减少含争议添加剂的食品'
  } else if (score >= 40) {
    level = '一般'
    desc = '饮食中争议添加剂较多，建议关注食品配料表'
  } else {
    level = '需注意'
    desc = '饮食中慎用添加剂较多，建议减少加工食品摄入'
  }

  return { score, level, desc }
}

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getScanHistory,
  addScanHistory,
  clearScanHistory,
  addSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  incrementSearchCount,
  getHotAdditives,
  getSafetyIndex
}
