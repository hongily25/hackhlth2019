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

  document.getElementById('delete-button').addEventListener('click', event => {
    event.preventDefault()
    deleteList(userSession);
  })

  document.getElementById('delete-last').addEventListener('click', event => {
    event.preventDefault()
    deleteLastItem(userSession);
  })

  function showProfile (profile) {
    let person = new blockstack.Person(profile);

    document.getElementById('section-1').style.display = 'none';
    document.getElementById('section-2').style.display = 'block';
    document.getElementById('site-wrapper-inner').style.verticalAlign = 'top';
  }

  function listExpense (userSession) {
    document.getElementById('crypto').style.display = 'block';
    document.getElementById('deleteExpenses').style.display = 'flex';
    let options = {
      decrypt: false
    }

    userSession.getFile("/expense5.json", options)
    .then((fileContents) => {
        var expenses =  JSON.parse(fileContents || '[]');
        console.log('fileContents of listExpense', fileContents);
        console.log('expenses in listExpense', expenses);
        expenses.length === 0 ? document.getElementById('expenses').style.display = 'none' : document.getElementById('expenses').style.display = 'flex';
        let rows = '';
        expenses.forEach(item => {
          rows += '<tr><td>' + item.item + '</td><td>' + item.expenseAmount + '</td><td>' + item.category + '</td></tr>';
        });
        document.getElementById('expense-body').innerHTML = rows;
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
        var expenses = JSON.parse(fileContents || '[]');
        console.log('old expenses in saveExpense', expenses);

        const item = document.getElementById('expense-item').value;
        const category = document.getElementById('expense-category').value;
        const expenseAmount = document.getElementById('expense-amount').value;
        const expense = [...expenses, { 
                item: item,
                category: category,
                expenseAmount: '$' + expenseAmount,
              }];
        console.log('expense to be saved', expense);
        userSession.putFile("/expense5.json", JSON.stringify(expense), options)
        .then(() => {
            listExpense(userSession);
        })
    });

  }

  function deleteList(userSession) {
    userSession.deleteFile("/expense5.json")
    .then(() => {
       listExpense(userSession);
    })
  }

  function deleteLastItem(userSession) {
    userSession.getFile("/expense5.json", { decrypt: false })
    .then((fileContents) => {
      var expenses = JSON.parse(fileContents || '[]');
      if (expenses.length > 1) { 
        expenses.pop(); 
        console.log('after deleting last item', expenses);
        document.getElementById('expense-body').innerHTML = rows; 
        userSession.putFile("/expense5.json", JSON.stringify(expenses), { decrypt: false })
        .then(() => {
          listExpense(userSession);
        })
      } else {
        document.getElementById('expenses').style.display = 'none';
        document.getElementById('expense-body').innerHTML = '';
        deleteFile(userSession);
      }; 
    })
  }

  if (userSession.isUserSignedIn()) {
    const profile = userSession.loadUserData().profile;
    showProfile(profile);
    listExpense(userSession);
  } else if (userSession.isSignInPending()) {
    userSession.handlePendingSignIn().then(userData => {
      window.location = window.location.origin
    })
  }
})


