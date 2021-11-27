const QUIZ_APP = 'quizApp'
const QUIZ_TEST = 'quizTest'

function getUser () {
    return JSON.parse(localStorage.getItem(QUIZ_APP)) || null
}

function addUser(user) {
    localStorage.setItem(QUIZ_APP, JSON.stringify(user))
}

function updateUser(data) {
    let user = getUser()
    let newUser = {
        ...user,
        ...data
    }
    localStorage.setItem(QUIZ_APP, JSON.stringify(newUser))
}

function saveQuiz(subject) {
    sessionStorage.setItem(QUIZ_TEST, JSON.stringify(subject))
}

function getQuiz() {
    return JSON.parse(sessionStorage.getItem(QUIZ_TEST))
}