const { additiveData } = require('./additiveData')

const SAFETY_CLASS_MAP = {
  '\u5B89\u5168': 'safe',
  '\u4E89\u8BAE': 'warning',
  '\u614E\u7528': 'danger'
}

function addSafetyClass(item) {
  if (!item) return item
  return { ...item, safetyClass: SAFETY_CLASS_MAP[item.safetyLevel] || 'safe' }
}

function searchAdditives(keyword) {
  if (!keyword) return []
  const kw = keyword.toLowerCase()
  const exact = []
  const aliasMatch = []
  const codeMatch = []
  const partial = []

  for (const item of additiveData) {
    const nameLower = (item.name || '').toLowerCase()
    const aliases = item.aliases || []
    const code = (item.code || '').toLowerCase()

    if (nameLower === kw) {
      exact.push(item)
    } else if (aliases.some(a => a.toLowerCase() === kw)) {
      aliasMatch.push(item)
    } else if (code === kw) {
      codeMatch.push(item)
    } else if (
      nameLower.includes(kw) ||
      aliases.some(a => a.toLowerCase().includes(kw)) ||
      code.includes(kw)
    ) {
      partial.push(item)
    }
  }

  return [...exact, ...aliasMatch, ...codeMatch, ...partial].slice(0, 20).map(addSafetyClass)
}

function getByCategory(category) {
  return additiveData.filter(item => item.category === category).map(addSafetyClass)
}

function getBySafetyLevel(level) {
  return additiveData.filter(item => item.safetyLevel === level).map(addSafetyClass)
}

function getCategories() {
  const map = {}
  for (const item of additiveData) {
    const cat = item.category
    if (cat) {
      map[cat] = (map[cat] || 0) + 1
    }
  }
  return Object.keys(map).map(name => ({ name, count: map[name] }))
}

function getById(id) {
  const item = additiveData.find(item => item.id === id) || null
  return addSafetyClass(item)
}

function parseIngredientList(text) {
  if (!text) return { total: 0, safe: 0, warning: 0, danger: 0, items: [] }
  const parts = text.split(/[\u3001\uFF0C,\s\uFF1B\u00B7\uFF1A:\uFF08\uFF09()\[\]\u3010\u3011\/;]+/).filter(p => p.trim().length > 0)
  const matched = []
  const seen = new Set()

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue
    let found = false
    for (const item of additiveData) {
      if (seen.has(item.id)) continue
      if (item.name === trimmed || (item.aliases && item.aliases.some(a => a === trimmed))) {
        matched.push(item)
        seen.add(item.id)
        found = true
        break
      }
    }
    if (found) continue
    for (const item of additiveData) {
      if (seen.has(item.id)) continue
      if (trimmed.includes(item.name) || (item.aliases && item.aliases.some(a => trimmed.includes(a) && a.length >= 2))) {
        matched.push(item)
        seen.add(item.id)
      }
    }
  }

  for (const item of additiveData) {
    if (seen.has(item.id)) continue
    if (text.includes(item.name)) {
      matched.push(item)
      seen.add(item.id)
    }
  }

  const levelOrder = { '\u614E\u7528': 0, '\u4E89\u8BAE': 1, '\u5B89\u5168': 2 }
  matched.sort((a, b) => (levelOrder[a.safetyLevel] ?? 9) - (levelOrder[b.safetyLevel] ?? 9))

  const safe = matched.filter(i => i.safetyLevel === '\u5B89\u5168').length
  const warning = matched.filter(i => i.safetyLevel === '\u4E89\u8BAE').length
  const danger = matched.filter(i => i.safetyLevel === '\u614E\u7528').length

  return {
    total: matched.length,
    safe,
    warning,
    danger,
    items: matched.map(addSafetyClass)
  }
}

module.exports = {
  searchAdditives,
  getByCategory,
  getBySafetyLevel,
  getCategories,
  getById,
  parseIngredientList
}