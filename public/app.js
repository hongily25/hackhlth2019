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
    // console.log('person', person);
    document.getElementById('heading-name').innerHTML = person.name() ? person.name() : "there";
    if(person.avatarUrl()) {
      document.getElementById('avatar-image').setAttribute('src', person.avatarUrl())
    }
    document.getElementById('section-1').style.display = 'none'
    document.getElementById('section-2').style.display = 'block'
  }

  function listExpense (userSession) {
    document.getElementById('crypto').style.display = 'block';
    // console.log('userSession', userSession);
    let options = {
      decrypt: false
    }

    userSession.getFile("/expense5.json", options)
    .then((fileContents) => {
        // get the contents of the file /expenses.txt
        var expenses =  JSON.parse(fileContents || '[]');
        console.log('fileContents of listExpense', fileContents);
        console.log('expenses in listExpense', expenses);
        // document.getElementById('expenses').innerHTML = fileContents.length ? expenses[0].category + ' ' + expenses[0].expenseAmount : '';
    });
  }

  function saveExpense(userSession) {
    let options = {
      encrypt: false
    }
    userSession.getFile("/expense5.json", {
      decrypt: false
    })
    .then((fileContents) => {
        // get the contents of the file /expenses.txt
        var expenses = [];
        console.log('old expenses in saveExpense', expenses);

        const category = document.getElementById('expense-category').value;
        const expenseAmount = parseInt(document.getElementById('expense-amount').value);
        const expense = [{ 
                category: category,
                expenseAmount: expenseAmount,
              }];
        console.log('expense to be saved', expense);
        // console.log('prev expenses', prevExpenses);
        // console.log('category input', category);
        // console.log('amt input', expenseAmount);
        // console.log('expense input', expense);
        userSession.putFile("/expense5.json", JSON.stringify(expense), options)
        .then(() => {
            listExpense(userSession);
            // /expenses.txt exists now, and has the contents "hello world!".
        })
    });

  }

  function deleteList(userSession) {
    userSession.deleteFile("/expense5.json")
    .then(() => {
       // /hello.txt is now removed.
    })
  }

  if (userSession.isUserSignedIn()) {
    const profile = userSession.loadUserData().profile;
    // console.log('profile test3: ', profile);
    showProfile(profile);
    deleteList(userSession);
    listExpense(userSession);
  } else if (userSession.isSignInPending()) {
    userSession.handlePendingSignIn().then(userData => {
      window.location = window.location.origin
    })
  }
})


