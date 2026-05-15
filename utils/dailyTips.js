const dailyTips = [
  { id: 'e627', title: '味精真的有害吗？', fact: '味精（谷氨酸钠）在正常用量下安全，JECFA未设定ADI上限', safetyLevel: '争议' },
  { id: 'e250', title: '火腿为什么那么红？', fact: '亚硝酸钠让肉制品保持鲜红色，但胃内可生成致癌的N-亚硝胺', safetyLevel: '慎用' },
  { id: 'e202', title: '最安全的防腐剂是哪种？', fact: '山梨酸钾在人体内代谢为二氧化碳和水，是国际公认最安全的防腐剂', safetyLevel: '安全' },
  { id: 'e951', title: '无糖饮料安全吗？', fact: '阿斯巴甜被IARC列为2B类可能致癌物，但JECFA维持现有ADI标准', safetyLevel: '争议' },
  { id: 'e955', title: '三氯蔗糖和蔗糖什么关系？', fact: '三氯蔗糖以蔗糖为原料氯化制得，甜度是蔗糖600倍但不产生热量', safetyLevel: '安全' },
  { id: 'e621', title: '鸡精比味精更健康？', fact: '鸡精的主要成分就是谷氨酸钠（味精），另加少量核苷酸增鲜', safetyLevel: '争议' },
  { id: 'e322', title: '大豆卵磷脂从哪来？', fact: '卵磷脂是大豆提取的天然乳化剂，广泛用于巧克力防止脂霜析出', safetyLevel: '安全' },
  { id: 'e415', title: '酸奶为什么那么稠？', fact: '黄原胶是微生物发酵产生的增稠剂，即使高温和酸性条件下也很稳定', safetyLevel: '安全' },
  { id: 'e102', title: '黄色零食的颜色从哪来？', fact: '柠檬黄是最常用的合成色素之一，可能引起部分儿童注意力下降', safetyLevel: '争议' },
  { id: 'e319', title: '薯片为什么放很久不坏？', fact: '特丁基对苯二酚（TBHQ）是高效抗氧化剂，但高剂量可致恶心呕吐', safetyLevel: '慎用' },
  { id: 'e211', title: '饮料瓶上的苯甲酸钠是什么？', fact: '苯甲酸钠在酸性饮料中防腐效果强，但与维C共存可能生成微量苯', safetyLevel: '争议' },
  { id: 'e330', title: '柠檬酸就是柠檬里的酸吗？', fact: '柠檬酸天然存在于柑橘中，工业上由发酵生产，是最安全的酸度调节剂', safetyLevel: '安全' },
  { id: 'e471', title: '冰淇淋丝滑的秘密？', fact: '单双甘油酯是天然油脂的衍生物，作为乳化剂让冰淇淋口感细腻', safetyLevel: '安全' },
  { id: 'e124', title: '红色糖果的红色从哪来？', fact: '胭脂红是合成偶氮色素，部分国家已禁用于食品，中国允许限量使用', safetyLevel: '慎用' },
  { id: 'e220', title: '葡萄酒为什么要加二氧化硫？', fact: '二氧化硫防止葡萄酒氧化和细菌繁殖，但可能诱发哮喘患者过敏', safetyLevel: '争议' },
  { id: 'e412', title: '罐头里的瓜尔胶是什么？', fact: '瓜尔胶来自瓜尔豆种子，是天然增稠剂，可增加饱腹感但过量易胀气', safetyLevel: '安全' },
  { id: 'e171', title: '口香糖为什么是白色的？', fact: '二氧化钛是常用的白色着色剂，欧盟已禁用作食品添加剂', safetyLevel: '慎用' },
  { id: 'e338', title: '可乐里的磷酸有什么用？', fact: '磷酸赋予可乐独特酸味，但长期大量摄入可能影响钙吸收和骨密度', safetyLevel: '争议' },
  { id: 'e466', title: '低脂食品靠什么增稠？', fact: '羧甲基纤维素钠是纤维素衍生物，广泛用于低脂冰淇淋和酱料增稠', safetyLevel: '安全' },
  { id: 'e110', title: '日落黄和夕阳有关吗？', fact: '日落黄是合成偶氮色素，常用于饮料和糖果，对阿司匹林过敏者需注意', safetyLevel: '争议' },
  { id: 'e270', title: '乳酸是牛奶里的酸吗？', fact: '乳酸可由发酵或合成制得，既是酸度调节剂也用于防腐，安全性高', safetyLevel: '安全' },
  { id: 'e325', title: '面包为什么放几天不发硬？', fact: '硬脂酰乳酸钠是面团改良剂，让面包更柔软、保质期更长', safetyLevel: '安全' },
  { id: 'e950', title: '零度可乐用什么甜的？', fact: '安赛蜜甜度是蔗糖200倍，不参与代谢直接排出，常与其他甜味剂复配', safetyLevel: '安全' },
  { id: 'e129', title: '食用色素"诱惑红"安全吗？', fact: '诱惑红是合成偶氮色素，欧盟要求含此色素的食品标注可能影响儿童活动', safetyLevel: '慎用' },
  { id: 'e300', title: '维C也能当防腐剂？', fact: '抗坏血酸（维C）既是营养强化剂又是抗氧化剂，可防止果蔬褐变', safetyLevel: '安全' },
  { id: 'e422', title: '甘油只能护肤吗？', fact: '甘油（丙三醇）是天然保湿剂，食品中用于保持水分和柔韧口感', safetyLevel: '安全' },
  { id: 'e281', title: '酱油里的防腐剂是什么？', fact: '对羟基苯甲酸酯类防腐效果强，但存在类雌激素活性争议', safetyLevel: '慎用' },
  { id: 'e960', title: '甜菊糖苷是化学合成的吗？', fact: '甜菊糖苷从甜叶菊中提取，是天然零热量甜味剂，略带苦味后味', safetyLevel: '安全' },
  { id: 'e510', title: '盐里为什么要加亚铁氰化钾？', fact: '亚铁氰化钾是抗结剂防止食盐结块，其氰根与铁结合极稳定，用量极低安全', safetyLevel: '安全' },
  { id: 'e631', title: '方便面调料为什么那么鲜？', fact: '肌苷酸二钠是强力增味剂，与谷氨酸钠合用鲜味可增强数倍', safetyLevel: '安全' }
]

function getDailyTip() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return dailyTips[dayOfYear % dailyTips.length]
}

module.exports = { getDailyTip }
