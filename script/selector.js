angular.module("selector", [
]).constant('OptionType', {
  UNSELECTED: 0,
  SELECTED: 1,
  DISABLED: 2
}).controller('RootController', ['$scope', '$timeout', 'Selector', 'OptionType',
  function($scope, $timeout, Selector, OptionType) {
    $scope.CategoryBar = Selector.CategoryBar;
    $scope.ItemsManager = Selector.ItemsManager;
    $scope.OptionType = OptionType;
    $scope.optionState = function (name, option) {
      var state = _.findWhere(Selector.CategoryBar.flatCategory, {name:name,option:option})["state"];
      if (state == OptionType.UNSELECTED) {
        return "option-unselected";
      } else if (state == OptionType.SELECTED) {
        return "option-selected";
      } else {
        return "option-disabled"
      }
    };
    $scope.isDisabledOption = function (name, option) {
      return (_.findWhere(Selector.CategoryBar.flatCategory, {name:name,option:option})["state"] == OptionType.DISABLED)
    };
    $scope.toggleSelect = function (name, option) {
      var startTime = new Date();
      if (_.findWhere(Selector.CategoryBar.flatCategory, {name:name,option:option})["state"] == OptionType.SELECTED) {
        Selector.unselect(name, option);
      } else {
        Selector.select(name, option);
      }
      $scope.time = (new Date)-startTime;
    }
  }
]).filter("code", ["$filter", function($filter) {
  return function (input) {
    var out = JSON.stringify(input)+"<br\/><br\/>";
    return out;
  }
}]).factory('Selector', ['OptionType', 'Data', function (OptionType, Data) {

  Vector = {
    wordLength: 30,
    init: function (l, oriVector) {
      var vector = [];
      var num = Math.ceil(l/Vector.wordLength);
      var bString = Vector.toBinaryString(l, oriVector);
      for (var i = 0; i < num; i++) {
        vector[i] = parseInt(bString.substr(Math.max(bString.length-Vector.wordLength*(i+1), 0), Math.min(Vector.wordLength, bString.length-Vector.wordLength*i)), 2);
      }
      return vector;
    },
    toBinaryString: function (l, vector) {
      var s = "";
      vector.sort(function (a,b) {return (a<b?-1:1);});
      var step = 0;
      for (var i = 0; i < l; i++) {
        if (vector[step]==undefined || (i < vector[step])) {
          s = "0"+s;
        } else {
          s = "1"+s;
          step++;
        }
      }
      return s;

    },
    setOne: function (vector, index) {
      var a = 1 << (index%Vector.wordLength);
      vector[Math.floor(index/Vector.wordLength)] |= a;
    },
    setZero: function (vector, index) {
      var a = 1 << (index%Vector.wordLength);
      if (vector[Math.floor(index/Vector.wordLength)] & a) {
        vector[Math.floor(index/Vector.wordLength)] -= a;
      }
    },
    isCover: function (v0, v1) {
      for (var i = 0; i < v0.length; i++) {
        if ((v0[i] & v1[i]) != v1[i]) {
          return false;
        }
      }
      return true;
    },
    orExtend: function (v0, v1) {
      for (var i = 0; i < v0.length; i++) {
        v0[i] = v0[i] | v1[i];
      }
    },
    toOriVector: function(l, vector) {
      var result = [];
      for (var i = 0; i < l; i++) {
        if (((vector[Math.floor(i/this.wordLength)]>>(i%this.wordLength))&1)>0) {
          result.push(i);
        }
      }
      return result;
    },
    getZeroString: function (l) {
      var s = "";
      for (var i = 0; i < l; i++) {
        s += "0";
      }
      return s;
    }
  };

  var CategoryBar = {
    flatCategory: [],
    selectedVector: [],
    validVector: [],
    category: Data.Category,
    init: function () {
      var category = CategoryBar.category;
      for (var i = 0; i < category.length; i++) {
        for (var j = 0; j < category[i]["options"].length; j++) {
          this.flatCategory.push({
            "name": category[i]["name"],
            "option": category[i]["options"][j],
            "state": OptionType.UNSELECTED
          })
        }
      }
      CategoryBar.selectedVector = Vector.init(Selector.vectorLength, []);
    },
    setValidVector: function(l, aValidVector) {
      this.validVector = aValidVector;
      var oriValidVector = Vector.toOriVector(l, aValidVector);
      var oriSelectedVector = Vector.toOriVector(l, this.selectedVector);
      for (var i = 0; i < this.flatCategory.length; i++) {
        if (oriValidVector.indexOf(i) >= 0) {
          if (oriSelectedVector.indexOf(i) >= 0) {
            this.flatCategory[i]["state"] = OptionType.SELECTED;
          } else {
            this.flatCategory[i]["state"] = OptionType.UNSELECTED;
          }
        } else {
          this.flatCategory[i]["state"] = OptionType.DISABLED;
        }
      }
    }
  };

  var ItemsManager = {
    selectedItems: [],
    unselectedItems: [],
    itemVectors: [],
    items: Data.Items,
    init: function () {
      var items = ItemsManager.items;
      for (var i = 0; i < items.length; i++) {
        this.selectedItems.push(parseInt(i));
        this.itemVectors.push(Vector.init(Selector.vectorLength, Selector.getItemOriVector(items[i])));
      }
    },
    getUnselectedItems: function () {
      var result = [];
      // 不使用indexOf，优化创建速度，需保证selectedItems有序
      var step = 0;
      for (var i = 0; i < this.items.length; i++) {
        if (step < this.selectedItems.length && i < this.selectedItems[step]) {
          result.push(i);
        } else {
          step++;
        }
      }
      return result;
    }
  };

  var Selector = {
    vectorLength: 0,
    CategoryBar: CategoryBar,
    ItemsManager: ItemsManager,
    getItemOriVector: function (item) {
      var vector = [];
      for (var i = 0; i < this.CategoryBar.category.length; i++) {
        var name = this.CategoryBar.category[i]["name"];
        for (var j = 0; j < item[name].length; j++) {
          vector.push(_.findIndex(this.CategoryBar.flatCategory, {name:name})+item[name][j]);
        }
      }
      return vector;
    },
    _initVectorLength: function (category) {
      var l = 0;
      for (var i = 0; i < category.length; i++) {
        l += category[i]["options"].length;
      }
      this.vectorLength = l;
    },
    _initValidVector: function() {
      var newValidVector = Vector.init(this.vectorLength, []);
      for (var i = 0; i < ItemsManager.selectedItems.length; i++) {
        var curItemVector = ItemsManager.itemVectors[ItemsManager.selectedItems[i]];
        Vector.orExtend(newValidVector, curItemVector);
      }
      CategoryBar.setValidVector(this.vectorLength, newValidVector);
    },
    _init: function () {
      this._initVectorLength(CategoryBar.category);
      CategoryBar.init();
      ItemsManager.init();
      this._initValidVector();
    },
    select: function (name, option) {
      Vector.setOne(CategoryBar.selectedVector, _.findIndex(this.CategoryBar.flatCategory, {name:name,option:option}));
      var newSelectedItems = [];
      var newValidVector = Vector.init(this.vectorLength, []);
      for (var i = 0; i < ItemsManager.selectedItems.length; i++) {
        var curItemVector = ItemsManager.itemVectors[ItemsManager.selectedItems[i]];
        if (Vector.isCover(curItemVector, CategoryBar.selectedVector)) {
          newSelectedItems.push(ItemsManager.selectedItems[i]);
          Vector.orExtend(newValidVector, curItemVector);
        }
      }
      ItemsManager.selectedItems = newSelectedItems;
      CategoryBar.setValidVector(this.vectorLength, newValidVector);
    },
    // todo 和select合并代码
    unselect: function (name, option) {
      Vector.setZero(CategoryBar.selectedVector, _.findIndex(this.CategoryBar.flatCategory, {name:name,option:option}));

      var unselectedItems = ItemsManager.getUnselectedItems();
      var newSelectedItems = [];
      var newValidVector = CategoryBar.validVector;
      for (var i = 0; i < unselectedItems.length; i++) {
        var curItemVector = ItemsManager.itemVectors[unselectedItems[i]];
        if (Vector.isCover(curItemVector, CategoryBar.selectedVector)) {
          newSelectedItems.push(unselectedItems[i]);
          Vector.orExtend(newValidVector, curItemVector);
        }
      }
      ItemsManager.selectedItems = (ItemsManager.selectedItems.concat(newSelectedItems)).sort(function (a,b) {return (a<b?-1:1);});
      CategoryBar.setValidVector(this.vectorLength, newValidVector);
    }
  };

  Selector._init();
  return Selector;

}]).factory('Data', [function() {
  var Category = [{
    name: "brand",
    options: ["nike", "adidas", "puma"]
  },{
    name: "size",
    options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]
  },{
    name: "gender",
    options: ["male", "female", "neutral"]
  },{
    name: "color",
    options: ["red", "green", "blue", "yellow", "orange", "gray"]
  // 可增删
  //},{
  //  name: "style",
  //  options: ["cool", "cute", "sex"]
  }];

  var Items = _.map(_.range(1000), function (i) {
    return _.extend({name:"item_"+i}, _.reduce([{}].concat(Category), function (info, v) {
      // *.8是不让选满，当然设为1也没问题
      info[v["name"]] = _.sample(_.range(v["options"]["length"]), _.random(0, Math.floor(v["options"]["length"] *.8))).sort(function (a,b) {return (a<b?-1:1);});
      return info;
    }));
  });

  return {
    Category: Category,
    Items: Items
  }
}]);

