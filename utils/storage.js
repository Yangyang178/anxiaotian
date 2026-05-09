const FAVORITES_KEY = 'favorites'
const SCAN_HISTORY_KEY = 'scan_history'
const MAX_HISTORY = 50

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
  const summary = {
    total: result.total,
    safe: result.safe,
    warning: result.warning,
    danger: result.danger
  }
  list.unshift({ text, time: Date.now(), result: summary })
  if (list.length > MAX_HISTORY) {
    list.length = MAX_HISTORY
  }
  wx.setStorageSync(SCAN_HISTORY_KEY, list)
}

function clearScanHistory() {
  wx.removeStorageSync(SCAN_HISTORY_KEY)
}

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getScanHistory,
  addScanHistory,
  clearScanHistory
}
