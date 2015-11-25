(function () {

    var injectParams = ['$scope', '$location', '$routeParams',
                        '$timeout', 'config', 'dataService', 'modalService'];

    var ProductEditController = function ($scope, $location, $routeParams,
                                           $timeout, config, dataService, modalService) {

        var vm = this,
            productId = ($routeParams.productId) ? parseInt($routeParams.productId) : 0,
            timer,
            onRouteChangeOff;

        vm.product = {};
        vm.states = [];
        vm.title = (productId > 0) ? 'Edit' : 'Add';
        vm.buttonText = (productId > 0) ? 'Update' : 'Add';
        vm.updateStatus = false;
        vm.errorMessage = '';

        vm.isStateSelected = function (productStateId, stateId) {
            return productStateId === stateId;
        };

        vm.saveProduct = function () {
            if ($scope.editForm.$valid) {
                if (!vm.product.id) {
                    dataService.insertProduct(vm.product).then(processSuccess, processError);
                }
                else {
                    dataService.updateProduct(vm.product).then(processSuccess, processError);
                }
            }
        };

        vm.deleteProduct = function () {
            var custName = vm.product.firstName + ' ' + vm.product.lastName;
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete Product',
                headerText: 'Delete ' + custName + '?',
                bodyText: 'Are you sure you want to delete this product?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                if (result === 'ok') {
                    dataService.deleteProduct(vm.product.id).then(function () {
                        onRouteChangeOff(); //Stop listening for location changes
                        $location.path('/products');
                    }, processError);
                }
            });
        };

        function init() {

            getStates().then(function () {
                if (productId > 0) {
                    dataService.getProduct(productId).then(function (product) {
                        vm.product = product;
                    }, processError);
                } else {
                    dataService.newProduct().then(function (product) {
                        vm.product = product;
                    });
                }
            });


            //Make sure they're warned if they made a change but didn't save it
            //Call to $on returns a "deregistration" function that can be called to
            //remove the listener (see routeChange() for an example of using it)
            onRouteChangeOff = $scope.$on('$locationChangeStart', routeChange);
        }

        init();

        function routeChange(event, newUrl, oldUrl) {
            //Navigate to newUrl if the form isn't dirty
            if (!vm.editForm || !vm.editForm.$dirty) return;

            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Ignore Changes',
                headerText: 'Unsaved Changes',
                bodyText: 'You have unsaved changes. Leave the page?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                if (result === 'ok') {
                    onRouteChangeOff(); //Stop listening for location changes
                    $location.path($location.url(newUrl).hash()); //Go to page they're interested in
                }
            });

            //prevent navigation by default since we'll handle it
            //once the user selects a dialog option
            event.preventDefault();
            return;
        }

        function getStates() {
            return dataService.getStates().then(function (states) {
                vm.states = states;
            }, processError);
        }

        function processSuccess() {
            $scope.editForm.$dirty = false;
            vm.updateStatus = true;
            vm.title = 'Edit';
            vm.buttonText = 'Update';
            startTimer();
        }

        function processError(error) {
            vm.errorMessage = error.message;
            startTimer();
        }

        function startTimer() {
            timer = $timeout(function () {
                $timeout.cancel(timer);
                vm.errorMessage = '';
                vm.updateStatus = false;
            }, 3000);
        }
    };

    ProductEditController.$inject = injectParams;

    angular.module('customersApp').controller('ProductEditController', ProductEditController);

}());