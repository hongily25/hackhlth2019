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

  document.getElementById('save-expense').addEventListener('click', event => {
    event.preventDefault()
    saveExpense(userSession);
  })

  function showProfile (profile) {
    let person = new blockstack.Person(profile);
    console.log('person', person);
    document.getElementById('heading-name').innerHTML = person.name() ? person.name() : "there";
    if(person.avatarUrl()) {
      document.getElementById('avatar-image').setAttribute('src', person.avatarUrl())
    }
    document.getElementById('section-1').style.display = 'none'
    document.getElementById('section-2').style.display = 'block'
  }

  function listExpense (userSession) {
    document.getElementById('crypto').style.display = 'block';
    console.log('userSession', userSession);
    let options = {
      decrypt: false
    }

    userSession.getFile("/hello.txt", options)
    .then((fileContents) => {
        // get the contents of the file /hello.txt
        console.log('fileContents', fileContents);
        document.getElementById('expenses').innerHTML = fileContents;
    });
  }

  async function getExpenses(userSession) {
    let options = {
      decrypt: false
    }
    userSession.getFile("/hello.txt", {
      decrypt: false
    })
    .then((fileContents) => {
        // get the contents of the file /hello.txt
        console.log('getExpenses', fileContents);
        return fileContents;
    });
  }

  async function saveExpense(userSession) {
    let options = {
      encrypt: false
    }
    userSession.getFile("/hello.txt", {
      decrypt: false
    })
    .then((fileContents) => {
        // get the contents of the file /hello.txt
        console.log('getExpenes', fileContents);
        const prevExpenses = fileContents ? fileContents : '' ;
        const category = document.getElementById('expense-category').value;
        const expenseAmount = document.getElementById('expense-amount').value;
        const expense = prevExpenses + '<br>' + category + ' ' + expenseAmount;
        console.log('prev expenses', prevExpenses);
        console.log('category input', category);
        console.log('amt input', expenseAmount);
        console.log('expense input', expense);
        userSession.putFile("/hello.txt", expense , options)
        .then(() => {
            listExpense(userSession);
            // /hello.txt exists now, and has the contents "hello world!".
        })
    });

  }

  if (userSession.isUserSignedIn()) {
    const profile = userSession.loadUserData().profile;
    console.log('profile test3: ', profile);
    showProfile(profile);
    listExpense(userSession);
  } else if (userSession.isSignInPending()) {
    userSession.handlePendingSignIn().then(userData => {
      window.location = window.location.origin
    })
  }
})


