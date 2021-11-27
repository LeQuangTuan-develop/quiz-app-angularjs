import storage from './firebase.js'
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-storage.js";
var app = angular.module("quizApp", ['ngRoute'])

app.config($routeProvider => {
    $routeProvider
        .when('/home', { templateUrl: 'pages/intro.html', controller: 'introCtrl' })
        .when('/cate', { templateUrl: 'pages/cate.html', controller: 'cateCtrl' })
        .when('/faq', { templateUrl: 'pages/faq.html' })
        .when('/feedback', { templateUrl: 'pages/feedback.html' })
        .when('/account', { templateUrl: 'pages/account.html', controller: 'accountCtrl' })
        .when('/updatepass', { templateUrl: 'pages/updatepass.html', controller: 'updatePassCtrl' })
        .when('/resetpass', { templateUrl: 'pages/resetpass.html', controller: 'resetPassCtrl' })
        .when('/quiz/:idMH/:tenMH', { templateUrl: 'pages/quiz.html', controller: 'quizCtrl' })
        .otherwise({
            redirectTo: '/home'
        })
})

app.controller("quiz", function ($scope, $rootScope, $http) {
    $rootScope.user = getUser();

    $scope.logout = () => {
        addUser(null);
        if(window.location.hash === '#!/account')
            window.location = 'http://127.0.0.1:5500/asm/index.html'
        else
            window.location.reload()
    }
})

app.filter('range', function () {
    return function (input, total) {
        total = parseInt(total);

        for (var i = 1; i <= total; i++) {
            input.push(i);
        }

        return input;
    };
});

app.controller("quizCtrl", function ($scope, $rootScope, $http, $routeParams) {
    $scope.idMH = $routeParams.idMH
    $scope.tenMH = $routeParams.tenMH

    $scope.startQuiz = () => {
        saveQuiz($scope.subject)
    }

    $http.get(`db/Quizs/${$scope.idMH}.js`).then(
        function(d) { 
            $scope.quizs = d.data;
            console.log($scope.quizs);
        },
        function(e) { alert('Lỗi: ' + e.statusText)}
    )
    $http.get(`db/Subjects.js`).then(
        function(d) { 
            let subjects = d.data;
            $scope.subject = subjects.find(s => s.Id === $scope.idMH)
        },
        function(e) { alert('Lỗi: ' + e.statusText)}
    )
})

app.controller("cateCtrl", function ($scope, $http) {
    $scope.subjects = []
    $scope.pageSize = 9
    $scope.curPage = 1
    $scope.start = 0
    $http.get('db/Subjects.js').then(
        function(d) { 
            $scope.subjects = d.data;
            $scope.pageNum = Math.ceil($scope.subjects.length / $scope.pageSize)
        },
        function(e) { alert('Lỗi: ' + e.statusText)}
    )
    $scope.next = () => {
        if ($scope.start < $scope.subjects.length - $scope.pageSize) {
            $scope.start += $scope.pageSize
            $scope.curPage++
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    $scope.previous = () => {
        if ($scope.start > 0) {
            $scope.start -= $scope.pageSize
            $scope.curPage--
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    $scope.direct = (index) => {
        $scope.curPage = index
        $scope.start = (index-1)*$scope.pageSize
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
})

app.controller("accountCtrl", function ($scope, $rootScope, $http) {
    $rootScope.user = getUser();
    $scope.avatar = null
    var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
        keyboard: false
    })

    var inputFile = document.getElementById('file')
    const avatar = document.querySelector('.avatar-img')

    inputFile.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            avatar.src = URL.createObjectURL(e.target.files[0])
            $scope.avatar = e.target.files[0]
        }
    })

    $scope.gender = $rootScope.user.gender

    $scope.handleSubmit = async () => {
        let urlImg = null
        if ($scope.avatar) {
            console.log("upload file to firebase");

            var storageRef = ref(storage, `images/test/${$scope.avatar.name}`);
            var metaData = {
                contentType: 'image/*'
            };
            await uploadBytes(storageRef, $scope.avatar, metaData)
                .then((snapshot) => {
                    console.log('Uploaded successfully');
                })
                .catch((error) => error);

            await getDownloadURL(ref(storage, `images/test/${$scope.avatar.name}`))
                .then( (url) => {
                    urlImg = url;
                })
                .catch((error) => error);
        }

        let info = {
            fullname: $scope.fullname,
            gender: $scope.gender,
            phone: $scope.phone,
            class: $scope.class,
            major: $scope.major,
            address: $scope.address,
        }

        if (urlImg) {
            info.avatar = urlImg
        }

        $http({
            url: 'http://localhost:3000/students/' + $rootScope.user.id,
            method: "PATCH",
            data: JSON.stringify(info)
        })
        .then(function(r) {
            $scope.userInfo = r.data;
            updateUser(info)
            $rootScope.user = getUser();
            myModal.show()
        }, 
        function(e) { // optional
            alert('Lỗi: ' + e.statusText)
        });
    }
})

app.controller("introCtrl", function ($scope) {
    new Splide('#secondary-slider', {
        autoWidth: true,
        autoHeight: true,
        gap: 20,
        rewind: true,
        pagination: false,
        cover: true,
    }).mount();

    new Splide('#primary-slider', {
        autoWidth: true,
        autoHeight: true,
        gap: 20,
        rewind: true,
        pagination: false,
        cover: true,
    }).mount();

    new Splide('#third-slider', {
        autoWidth: true,
        autoHeight: true,
        gap: 20,
        rewind: true,
        pagination: false,
        cover: true,
    }).mount();
})

app.controller("resetPassCtrl", function ($scope, $rootScope, $http) {
    $scope.currentTab = 0;
    $scope.fixStepIndicator = (n) => {
        var i, x = document.getElementsByClassName("step");
        for (i = 0; i < x.length; i++) {
            x[i].className = x[i].className.replace(" active", "");
        }
        x[n].className += " active";
        for (let i = 0; i < n; i++) {
            x[i].className +=' finish'
        }
    }

    $scope.showTab = (n) => {
        var x = document.getElementsByClassName("tab");
        x[n].style.display = "block";
        $scope.fixStepIndicator(n)
    }

    $scope.nextPrev = (n) => {
        console.log("run");
        var x = document.getElementsByClassName("tab");
        x[$scope.currentTab].style.display = "none";
        $scope.currentTab = $scope.currentTab + n;
        if ($scope.currentTab >= x.length) {
            document.getElementById("all-steps").style.display = "none";
            document.getElementById("register").style.display = "none";
            document.getElementById("text-message").style.display = "block";
        }
        $scope.showTab($scope.currentTab);
    }

    $scope.handleEmail = () => {
        let checkEmail = $rootScope.user.email === $scope.email
        if (!checkEmail) {
            $scope.errorEmail = true;
        } else {
            $scope.errorEmail = false;
            $scope.nextPrev(1)
        }
    }

    $scope.handleCode = () => {
        let checkCode = $scope.code === 123456
        if (!checkCode) {
            $scope.errorCode = true;
        } else {
            $scope.errorCode = false;
            $scope.nextPrev(1)
        }
    }
    
    $scope.handlePass = () => {
        $http({
            url: 'http://localhost:3000/students/' + $rootScope.user.id,
            method: "PATCH",
            data: JSON.stringify({password: $scope.newPass})
        })
        .then(function(r) {
            console.log(r.data);
        }, 
        function(e) { // optional
            alert('Lỗi: ' + e.statusText)
        });
        $scope.nextPrev(1)
    }

    $scope.showTab($scope.currentTab);
})

app.controller("updatePassCtrl", function ($scope, $rootScope, $http) {
    $rootScope.user = getUser();
    $scope.checkOldPass = true

    var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
        keyboard: false
    })

    var btnConfirm = document.querySelector('.btn-confirm')
    btnConfirm.addEventListener('click', () => {
        myModal.hide()
        window.location = "http://127.0.0.1:5500/asm/index.html#!/account"
    })

    $scope.handleSubmit = () => {
        if($scope.user.password !== $scope.oldpass) 
            $scope.checkOldPass = false
        if ($scope.checkOldPass) {
            $http({
                url: 'http://localhost:3000/students/' + $rootScope.user.id,
                method: "PATCH",
                data: JSON.stringify({password: $scope.newpass})
            })
            .then(function(r) {
                console.log(r.data);
                myModal.show()
            }, 
            function(e) { // optional
                alert('Lỗi: ' + e.statusText)
            });
        }
    }

    $http.get(`http://localhost:3000/students/${$rootScope.user.id}`).then(
        function (d) {
            $scope.user = d.data;
            console.log($scope.user);
        },
        function (e) { alert('Lỗi: ' + e.statusText) }
    )

    $scope.clearErrorOldPass = () => {
        $scope.checkOldPass = true
    }
})

