Component({
  properties: {
    current: {
      type: Number,
      value: 0
    }
  },
  data: {
    list: [
      { pagePath: "/pages/index/index", text: "首页", icon: "home" },
      { pagePath: "/pages/category/category", text: "分类", icon: "category" },
      { pagePath: "/pages/scan/scan", text: "扫一扫", icon: "scan" },
      { pagePath: "/pages/mine/mine", text: "我的", icon: "mine" }
    ]
  },
  methods: {
    onSwitchTab(e) {
      const dataset = e.currentTarget.dataset
      const url = dataset.path
      wx.switchTab({ url })
    }
  }
})