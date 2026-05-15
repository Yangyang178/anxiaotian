const { additiveData } = require('./additiveData')
const SAFETY_CLASS_MAP = { '安全': 'safe', '争议': 'warning', '慎用': 'danger' }

const searchIndex = additiveData.map(item => ({
  id: item.id,
  name: item.name,
  aliases: item.aliases,
  code: item.code,
  category: item.category,
  safetyLevel: item.safetyLevel,
  safetyClass: SAFETY_CLASS_MAP[item.safetyLevel] || 'safe',
  summary: item.summary,
  commonFoods: item.commonFoods
}))

module.exports = { searchIndex }
