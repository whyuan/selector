// 定义数据结构
// 1.显示出来的object
// 2.逻辑处理的数据结构
// 流程设计
// 1.编定html，controller绑定
// 2.使用Category,Items初始化好其他结构，使到能正常显示
// 3.添加事件触发功能
// 4.选择功能：
//   1.转化为vector
//   2.遍历得新的选中队列selectedItems
//   3.得到新的CategoryBar状态

OptionType = {
  UNSELECTED: 0,
  SELECTED: 1,
  DISABLED: 2
};
CategoryBar = {
  state: {
    "brand_nike": OptionType.UNSELECTED,
    "brand_adidas": OptionType.SELECTED,
    "brand_puma": OptionType.DISABLED
  },
  vector: [22,33,112]
};
Category = [{
  name: "brand",
  options: ["nike", "adidas", "puma"]
},{
  name: "size",
  options: [37, 38, 39, 40, 41, 42]
},{
  name: "gender",
  options: ["male", "female", "neutral"]
},{
  name: "color",
  options: ["red", "green", "blue", "yellow", "orange", "gray"]
}];

selectedItems = [1,2];
Items = [{
  name: "A",
  brand: [0],
  size: [3],
  gender: [0,1],
  color: [1]
  //vector: [21,32,10000]
},{
  name: "B",
  brand: [2],
  size: [4,5],
  gender: [0,1,2],
  color: [0,5]
},{
  name: "C",
  brand: [1],
  size: [1,2],
  gender: [0,1],
  color: [1,2,3]
},{
  name: "D",
  brand: [1],
  size: [3],
  gender: [0],
  color: [2,5]
},{
  name: "E",
  brand: [1,2],
  size: [2,3],
  gender: [2],
  color: [1,2]
},{
  name: "F",
  brand: [1,2,3],
  size: [0,1,2,3,4,5],
  gender: [0,1,2],
  color: [0,1,2,3,4,5]
},{
  name: "G",
  brand: [],
  size: [],
  gender: [],
  color: []
}]