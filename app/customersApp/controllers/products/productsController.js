(function () {

    var injectParams = ['$location', '$filter', '$window',
                        '$timeout', 'authService', 'dataService', 'modalService'];

    var ProductsController = function ($location, $filter, $window,
        $timeout, authService, dataService, modalService) {

        var vm = this;

        vm.products = [];
        vm.filteredProducts = [];
        vm.filteredCount = 0;
        vm.orderby = 'Name';
        vm.reverse = false;
        vm.searchText = null;
        vm.cardAnimationClass = '.card-animation';

        //paging
        vm.totalRecords = 0;
        vm.pageSize = 10;
        vm.currentPage = 1;

        vm.pageChanged = function (page) {
            vm.currentPage = page;
            getProductsSummary();
        };

        vm.deleteProduct = function (id) {
            if (!authService.user.isAuthenticated) {
                $location.path(authService.loginPath + $location.$$path);
                return;
            }

            var prod = getProductById(id);
            var prodName = prod.Name;

            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete Product',
                headerText: 'Delete ' + prodName + '?',
                bodyText: 'Are you sure you want to delete this product?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                if (result === 'ok') {
                    dataService.deleteProduct(id).then(function () {
                        for (var i = 0; i < vm.products.length; i++) {
                            if (vm.products[i].id === id) {
                                vm.products.splice(i, 1);
                                break;
                            }
                        }
                        filterProducts(vm.searchText);
                    }, function (error) {
                        $window.alert('Error deleting product: ' + error.message);
                    });
                }
            });
        };

        vm.DisplayModeEnum = {
            Card: 0,
            List: 1
        };

        vm.changeDisplayMode = function (displayMode) {
            switch (displayMode) {
                case vm.DisplayModeEnum.Card:
                    vm.listDisplayModeEnabled = false;
                    break;
                case vm.DisplayModeEnum.List:
                    vm.listDisplayModeEnabled = true;
                    break;
            }
        };

        vm.navigate = function (url) {
            $location.path(url);
        };

        vm.setOrder = function (orderby) {
            if (orderby === vm.orderby) {
                vm.reverse = !vm.reverse;
            }
            vm.orderby = orderby;
        };

        vm.searchTextChanged = function () {
            filterProducts(vm.searchText);
        };

        function init() {
            //createWatches();
            getProductsSummary();
        }

        //function createWatches() {
        //    //Watch searchText value and pass it and the products to nameCityStateFilter
        //    //Doing this instead of adding the filter to ng-repeat allows it to only be run once (rather than twice)
        //    //while also accessing the filtered count via vm.filteredCount above

        //    //Better to handle this using ng-change on <input>. See searchTextChanged() function.
        //    vm.$watch("searchText", function (filterText) {
        //        filterProducts(filterText);
        //    });
        //}

        function getProductsSummary() {
            dataService.getProducts(vm.currentPage - 1, vm.pageSize)
            .then(function (data) {
                vm.totalRecords = data.totalRecords;
                vm.products = data.results;
                filterProducts(''); //Trigger initial filter

                $timeout(function () {
                    vm.cardAnimationClass = ''; //Turn off animation since it won't keep up with filtering
                }, 1000);

            }, function (error) {
                $window.alert('Sorry, an error occurred: ' + error.data.message);
            });
        }

        function filterProducts(filterText) {
            vm.filteredProducts = $filter("nameCityStateFilter")(vm.products, filterText);
            vm.filteredCount = vm.filteredProducts.length;
        }

        function getProductById(id) {
            for (var i = 0; i < vm.products.length; i++) {
                var cust = vm.products[i];
                if (cust._id === id) {
                    return cust;
                }
            }
            return null;
        }

        init();
    };

    ProductsController.$inject = injectParams;

    angular.module('customersApp').controller('ProductsController', ProductsController);

}());
