
(function(){
  var app = angular.module('store',[]);

  app.controller('StoreController', function(){
    this.products = gems;
  });

  var gems = [
    {
      name : 'Dodecahedron',
      price : 2.95,
      description : 'Twelve Sides',
      canPurchase : true ,
    },

    {
      name : 'Pentagonal Gem',
      price : 5.95,
      description : 'Its gotta have 5 sides baby.',
      canPurchase : false ,
    },
  ];





})();
