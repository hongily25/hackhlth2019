document.addEventListener("DOMContentLoaded", event => {
  const appConfig = new blockstack.AppConfig()
  const userSession = new blockstack.UserSession({ appConfig: appConfig })

  document.getElementById('signin-button').addEventListener('click', event => {
    event.preventDefault()
    userSession.redirectToSignIn()
  })

  document.getElementById('signout-button').addEventListener('click', event => {
    event.preventDefault()
    userSession.signUserOut()
    window.location = window.location.origin
  })

  function showProfile (profile) {
    let person = new blockstack.Person(profile);
    console.log('person', person);
    document.getElementById('heading-name').innerHTML = person.name() ? person.name() : ""
    if(person.avatarUrl()) {
      document.getElementById('avatar-image').setAttribute('src', person.avatarUrl())
    }
    document.getElementById('section-1').style.display = 'none'
    document.getElementById('section-2').style.display = 'block'
  }

  function listExpense () {
    document.getElementById('crypto').style.display = 'block';
  }

  if (userSession.isUserSignedIn()) {
    const profile = userSession.loadUserData().profile;
    console.log('profile test3: ', profile);
    showProfile(profile);
    listExpense();

    var userSession = new UserSession()
    let options = {
      encrypt: false
    }
    userSession.putFile("/hello.txt", "hello world!", options)
    .then(() => {
        // /hello.txt exists now, and has the contents "hello world!".
    })


  } else if (userSession.isSignInPending()) {
    userSession.handlePendingSignIn().then(userData => {
      window.location = window.location.origin
    })
  }
})


