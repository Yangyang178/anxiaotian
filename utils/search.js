const { additiveData } = require('./additiveData')
const { searchIndex } = require('./searchIndex')

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

  for (const item of searchIndex) {
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

  return [...exact, ...aliasMatch, ...codeMatch, ...partial].slice(0, 20)
}

function getByCategory(category) {
  return searchIndex.filter(item => item.category === category)
}

function getBySafetyLevel(level) {
  return searchIndex.filter(item => item.safetyLevel === level)
}

function getCategories() {
  const map = {}
  for (const item of searchIndex) {
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

function cleanIngredientText(text) {
  let cleaned = text
  cleaned = cleaned.replace(/[\d]+\.?\d*%/g, '')
  cleaned = cleaned.replace(/[\uff08(][^)\uff09]{0,20}[\uff09)]/g, '')
  cleaned = cleaned.replace(/[\u2264\u2265<>~\-]\s*\d+\.?\d*/g, '')
  return cleaned.trim()
}

function buildAliasLookup() {
  const lookup = {}
  for (const item of searchIndex) {
    lookup[item.name] = item
    if (item.aliases && item.aliases.length > 0) {
      for (const alias of item.aliases) {
        if (alias && alias.length >= 2 && !lookup[alias]) {
          lookup[alias] = item
        }
      }
    }
  }
  return lookup
}

const aliasLookup = buildAliasLookup()

function parseIngredientList(text) {
  if (!text) return { total: 0, safe: 0, warning: 0, danger: 0, items: [] }

  const cleanedText = cleanIngredientText(text)

  const parts = cleanedText
    .split(/[\u3001\uFF0C,\s\uFF1B\u00B7\uFF1A:\uFF08\uFF09()\[\]\u3010\u3011\/\\;]+/)
    .filter(p => p.trim().length > 0)
    .map(p => p.trim())

  const matched = []
  const seen = new Set()

  for (const part of parts) {
    if (part.length < 2) continue
    const directMatch = aliasLookup[part]
    if (directMatch && !seen.has(directMatch.id)) {
      matched.push(directMatch)
      seen.add(directMatch.id)
      continue
    }
    const partLower = part.toLowerCase()
    for (const item of searchIndex) {
      if (seen.has(item.id)) continue
      if (item.name === part) {
        matched.push(item)
        seen.add(item.id)
        break
      }
      if (item.aliases && item.aliases.some(a => a === part)) {
        matched.push(item)
        seen.add(item.id)
        break
      }
      if (item.code && item.code.toLowerCase() === partLower) {
        matched.push(item)
        seen.add(item.id)
        break
      }
    }
  }

  for (const part of parts) {
    if (part.length < 2) continue
    for (const item of searchIndex) {
      if (seen.has(item.id)) continue
      const nameLen = (item.name || '').length
      if (nameLen < 2) continue
      if (part.includes(item.name)) {
        matched.push(item)
        seen.add(item.id)
        continue
      }
      if (item.aliases) {
        for (const alias of item.aliases) {
          if (alias.length >= 2 && part.includes(alias)) {
            matched.push(item)
            seen.add(item.id)
            break
          }
        }
      }
    }
  }

  for (const item of searchIndex) {
    if (seen.has(item.id)) continue
    const nameLen = (item.name || '').length
    if (nameLen < 3) continue
    if (cleanedText.includes(item.name)) {
      matched.push(item)
      seen.add(item.id)
      continue
    }
    if (item.aliases) {
      for (const alias of item.aliases) {
        if (alias.length >= 3 && cleanedText.includes(alias)) {
          matched.push(item)
          seen.add(item.id)
          break
        }
      }
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
    items: matched
  }
}

function searchSuggestions(keyword) {
  if (!keyword || keyword.length < 1) return []
  const kw = keyword.toLowerCase()
  const results = []
  const seen = new Set()

  for (const item of searchIndex) {
    if (seen.has(item.id)) continue
    if (item.name.toLowerCase() === kw || (item.aliases && item.aliases.some(a => a.toLowerCase() === kw)) || (item.code && item.code.toLowerCase() === kw)) {
      results.push({ id: item.id, name: item.name, code: item.code, safetyLevel: item.safetyLevel, safetyClass: item.safetyClass, matchType: 'exact' })
      seen.add(item.id)
    }
  }

  for (const item of searchIndex) {
    if (seen.has(item.id)) continue
    if (results.length >= 8) break
    const nameLower = (item.name || '').toLowerCase()
    if (nameLower.startsWith(kw) || (item.aliases && item.aliases.some(a => a.toLowerCase().startsWith(kw))) || (item.code && item.code.toLowerCase().startsWith(kw))) {
      results.push({ id: item.id, name: item.name, code: item.code, safetyLevel: item.safetyLevel, safetyClass: item.safetyClass, matchType: 'prefix' })
      seen.add(item.id)
    }
  }

  for (const item of searchIndex) {
    if (seen.has(item.id)) continue
    if (results.length >= 8) break
    const nameLower = (item.name || '').toLowerCase()
    if (nameLower.includes(kw) || (item.aliases && item.aliases.some(a => a.toLowerCase().includes(kw) && a.length >= 2)) || (item.code && item.code.toLowerCase().includes(kw))) {
      results.push({ id: item.id, name: item.name, code: item.code, safetyLevel: item.safetyLevel, safetyClass: item.safetyClass, matchType: 'partial' })
      seen.add(item.id)
    }
  }

  return results.slice(0, 8)
}

module.exports = {
  searchAdditives,
  getByCategory,
  getBySafetyLevel,
  getCategories,
  getById,
  parseIngredientList,
  searchSuggestions
}
