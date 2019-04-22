let web = {
  KEY: 'KEY',
  URL: 'http://localhost:3030',
  token: '',
  pizzas: [],
  currentPizza: null,
  init: function () {
    document.querySelectorAll('.btn').forEach(function (item) {
      item.addEventListener('click', web.navigate);
    })
    document.querySelectorAll('.toggle-show-password').forEach(toggleButton => {
      toggleButton.addEventListener('click', web.toggleShowPassword);
    });

  },
  navigate: function (ev) {
    ev.preventDefault();
    page = ev.currentTarget.id;
    switch (page) {
      case 'register-btn':
        web.registerHandler();
        break;
      case 'login-btn':
        console.log("index");
        web.loginHandler();
        break;
      case 'logout':
        web.logoutHandler();
        break;
      case 'add-new-pizza-btn':
        web.currentPizza = null;
        window.location.href = "../admin/pizza-edit.html"
        break;
      case 'edit-pizza-cancel-btn':
        // let confirm = window.confirm("Do you want to discard all your changes?");
        // if (confirm == true) {
          web.currentPizza = null;
          window.location.href = "../admin/pizzas.html"
        
        break;
      case 'edit-pizza-save-btn':
        web.savePizzaHandler();
        break;
    }
  },

  logoutHandler: function (ev) {
    let confirm = window.confirm("Do you want to logout?");
    if (confirm == true) {
      location.href = "../index.html";
      web.token = '';
      sessionStorage.removeItem(web.KEY);
    }
  },
  registerHandler: function () {

    let url = web.URL + '/auth/users';
    console.log('Register');

    let firstName = document.getElementById('register-first-name').value;
    let lastName = document.getElementById('register-last-name').value;
    let email = document.getElementById('register-email').value;
    let password = document.getElementById('register-password').value;

    let newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    }

    if (!firstName || !lastName || !email || !password) {
      console.log('Missing field to register');
      web.addMessage('error', 'Missing field to register');
    } else {
      let sendBtn = document.getElementById('register-btn')
      sendBtn.classList.add('Proccessing');
      sendBtn.disabled = true;


      const headers = new Headers();
      headers.append('Content-Type', 'application/json;charset=UTF-8');

      const request = new Request(url, {
        headers: headers,
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(newUser)
      })


      fetch(request)
        .then(res => {
          return res.json();
        })
        .then(data => {
          console.log(JSON.stringify(data));
          if (data.data) {
            web.addMessage('success', "Register successfully!");
            web.resetRegister();
          } else {
            web.addMessage('error', data.errors[0].title + '<br>' + data.errors[0].detail);
          }
          sendBtn.classList.remove('Proccessing');
          sendBtn.disabled = false;
        })
        .catch(err => {
          console.error(err)
          sendBtn.classList.remove('Proccessing');
          sendBtn.disabled = false;
        });
    }
  },

  resetRegister: function () {
    document.getElementById('register-first-name').value = "";
    document.getElementById('register-last-name').value = "";
    document.getElementById('register-email').value = "";
    document.getElementById('register-password').value = "";
  },

  addMessage: function (type, msg) {

    let notification = document.querySelector(".notification");
    let div = document.querySelector(".msg");

    div.innerHTML = msg;

    switch (type) {
      case 'info':
        div.classList.remove('msg_success')
        div.classList.remove('msg_err')

        break;
      case 'error':
        div.classList.add('msg_err')
        div.classList.remove('msg_success')
        break;
      case 'success':
        div.classList.remove('msg_err')
        div.classList.add('msg_success')

        break;
    }

    notification.classList.add("visible");

    setTimeout(function () {
      notification.classList.remove("visible");
    }, 5000);

    document.getElementById('close').addEventListener('click', () => document.querySelector('.notification').classList.remove("visible"));

  },
  loginHandler: function () {
    let url = `${web.URL}/auth/tokens`;
    console.log('Login');

    let email = document.getElementById('login-email').value;
    let password = document.getElementById('login-password').value;

    if (!email || !password) {
      console.log('Missing field to login');
      web.addMessage('error', 'Missing field to Login');
    } else {
      let sendBtn = document.getElementById('login-btn')
      sendBtn.classList.add('Proccessing');
      sendBtn.disabled = true;

      let user = {
        email: email,
        password: password,
      }

      const headers = new Headers();
      headers.append('Content-Type', 'application/json;charset=UTF-8');

      const request = new Request(url, {
        headers: headers,
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(user)
      })

      fetch(request)
        .then(res => {
          return res.json();
        })
        .then(data => {
          console.log(JSON.stringify(data));
          if (data.data) {
            // web.addMessage('success', "Login successfully!");
            web.token = data.data.token;
            sessionStorage.setItem(web.KEY, data.data.token);
            web.getCurrentUser();
          } else {
            web.addMessage('error', data.errors[0].title + '<br>' + data.errors[0].detail);
          }
          sendBtn.classList.remove('Proccessing');
          sendBtn.disabled = false;
        })
        .catch(err => {
          console.error(err)
          sendBtn.classList.remove('Proccessing');
          sendBtn.disabled = false;
        });
    }
  },

  getCurrentUser: function () {
    let url = `${web.URL}/auth/users/me`;

    const headers = new Headers();
    web.attachBeaerToken(headers);
    const request = new Request(url, {
      headers: headers,
      method: 'GET',
    })

    fetch(request).then(res => {
      return res.json();
    }).then(data => {
      console.log('isStaff = ' + data.data.isStaff);
      if (data.data.isStaff) {
        // web.navigateTo('admin-page');
        //TODO
        location.href = "../admin/pizzas.html"
      } else {
        location.href = "../pizzas.html"
      }

    }).catch(err => {
      console.error(err)
    });
  },
  attachBeaerToken: function (headers) {
    headers.append('Authorization', 'Bearer ' + sessionStorage.getItem(web.KEY));
  },
  adminPizzasHandler: function () {
    let url = `${web.URL}/api/pizzas`;

    const headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');

    const request = new Request(url, {
      headers: headers,
      method: 'GET',
      mode: 'cors',
    })

    fetch(request).then(res => {
        return res.json();
      }).then(data => {
        web.pizzas = data.data;
        web.displayPizzaForAdmin();
      })
      .catch(err => console.log(err));
  },
  displayPizzaForAdmin: function () {
    let adminPizzaDiv = document.querySelector('.admin-pizzas');
    if (!web.pizzas || web.pizzas.length == 0) {
      let h1 = document.createElement('h1');
      h1.textContent = 'No data found';
      adminPizzaDiv.appendChild(h1);
    } else {
      let table = document.createElement('table');
      table.classList.add('table');
      table.classList.add('table-hover');
      table.id = 'pizzas-table';

      let tableHead = document.createElement('thead');
      tableHead.classList.add('thead-dark');

      let tableRow = document.createElement('tr');

      let thPizzaName = document.createElement('th');
      thPizzaName.textContent = "PizzaName";
      let thSize = document.createElement('th');
      thSize.textContent = "Size";
      let thIngredients = document.createElement('th');
      thIngredients.textContent = "Ingredients";
      let thToppings = document.createElement('th');
      thToppings.textContent = "Extra Toppings";
      let thGlutenFree = document.createElement('th');
      thGlutenFree.textContent = "Is Gluten Free";
      let thPrice = document.createElement('th');
      thPrice.textContent = "Price";
      let thUrl = document.createElement('th');
      thUrl.textContent = "Image Url";
      let thAction = document.createElement('th');
      thAction.textContent = "Action";

      tableRow.appendChild(thPizzaName);
      tableRow.appendChild(thSize);
      tableRow.appendChild(thIngredients);
      tableRow.appendChild(thToppings);
      tableRow.appendChild(thGlutenFree);
      tableRow.appendChild(thPrice);
      tableRow.appendChild(thUrl);
      tableRow.appendChild(thAction);

      tableHead.appendChild(tableRow);

      let tableBody = document.createElement('tbody');
      tableBody.classList.add('pizza-table-body')

      table.appendChild(tableHead);
      table.appendChild(tableBody);
      adminPizzaDiv.appendChild(table);

      web.pizzas.forEach(pizza => web.createPizzaRow(pizza));

      if (document.querySelectorAll('.delete-pizza-link').length > 0) {
        document.querySelectorAll('.delete-pizza-link').forEach(deleteButton => {
          deleteButton.addEventListener('click', async function (ev) {
            let pizzaId = ev.target.id;
            web.currentPizza = await web.pizzas.find(pizza => pizza._id == pizzaId);
            let confirm = window.confirm("Do you want to delete the pizza?");
            if (confirm == true) {
              web.sendDeletePizzaRequest(pizzaId);
            }

          });
        });
      }

      if (document.querySelectorAll('.edit-pizza-link').length > 0) {
        document.querySelectorAll('.edit-pizza-link').forEach(editButton => {
          editButton.addEventListener('click', async function (ev) {
            let pizzaId = ev.target.id;
            window.location.href = `../admin/pizza-edit.html?id=${pizzaId}`
          });
        });
      }
    }
  },
  createPizzaRow: function (pizza) {
    let tableBody = document.querySelector('.pizza-table-body');
    let tableRow = document.createElement('tr');

    let tdName = document.createElement('td');
    tdName.textContent = pizza.name;

    let tdSize = document.createElement('td');
    tdSize.textContent = pizza.size;

    let tdIngredients = document.createElement('td');
    tdIngredients.textContent = pizza.ingredients;

    let tdToppings = document.createElement('td');
    tdToppings.textContent = pizza.extraToppings;

    let tdGlutenFree = document.createElement('td');
    tdGlutenFree.textContent = pizza.isGlutenFree;

    let tdPrice = document.createElement('td');
    tdPrice.textContent = pizza.price;

    let tdUrl = document.createElement('td');
    tdUrl.textContent = pizza.imageUrl;

    let tdAction = document.createElement('td');

    let editLink = document.createElement('a');
    editLink.textContent = 'Edit'
    editLink.setAttribute('href', '#');
    editLink.classList.add('edit-pizza-link');
    editLink.id = pizza._id;
    editLink.set

    let deleteLink = document.createElement('a');
    deleteLink.textContent = 'Delete';
    deleteLink.setAttribute('href', '#');
    deleteLink.classList.add('delete-pizza-link');
    // deleteLink.setAttribute('data-toggle', 'modal')
    // deleteLink.setAttribute('data-target', '#confirm-dialog')
    deleteLink.id = pizza._id;

    tdAction.appendChild(editLink);
    tdAction.appendChild(deleteLink);

    tableRow.appendChild(tdName);
    tableRow.appendChild(tdSize);
    tableRow.appendChild(tdIngredients);
    tableRow.appendChild(tdToppings);
    tableRow.appendChild(tdGlutenFree);
    tableRow.appendChild(tdPrice);
    tableRow.appendChild(tdUrl);
    tableRow.appendChild(tdAction);

    tableBody.appendChild(tableRow);
  },
  toggleShowPassword: function (ev) {
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');

    let toggleVal = this.getAttribute('toggle');
    let inputField = document.getElementById(toggleVal);
    let inputType = inputField.getAttribute('type');

    if (inputType == 'password') {
      inputField.setAttribute('type', 'text');
    } else {
      inputField.setAttribute('type', 'password')
    }
  },

  sendDeletePizzaRequest: function (id) {
    let url = `${web.URL}/api/pizzas/${id}`;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    web.attachBeaerToken(headers);

    const request = new Request(url, {
      headers: headers,
      method: 'DELETE',
      mode: 'cors',
    })

    fetch(request)
      .then(res => {
        return res.json();
      })
      .then(data => {
        if (data.data) {

          web.pizzas = web.pizzas.filter(pizza => pizza._id != web.currentPizza._id);
          web.refreshPizzaAdminPage();
          web.addMessage('success', "Delete successfully!");
        } else {
          web.addMessage('error', data.errors[0].title + '<br>' + data.errors[0].detail);
        }

      })
      .catch(err => console.log(err))
      .finally(() => web.currentPizza = null);
  },

  refreshPizzaAdminPage: function () {
    if (web.pizzas.length == 0) { //if there is no content after delete, remove all the table 
      let pizzaAdminContainer = document.querySelector('admin.pizzas');
      let pizzasTable = document.getElementById('pizzas-table')
      pizzaAdminContainer.removeChild(pizzasTable);
      let h1 = document.createElement('h1');
      h1.textContent = 'No data found';
      pizzaAdminContainer.appendChild(h1);
    } else {
      web.removePizzaRows();
      web.pizzas.forEach(pizza => web.createPizzaRow(pizza));

    }
  },
  removePizzaRows: function () {
    let pizzaBody = document.querySelector('.pizza-table-body');
    let pizzaRow = pizzaBody.firstChild;

    while (pizzaRow) {
      pizzaBody.removeChild(pizzaRow);
      pizzaRow = pizzaBody.firstChild;
    }
  },
  getSelectValues: function (select) {
    let result = [];
    let options = select && select.options;
    let opt;

    for (let i = 0, iLen = options.length; i < iLen; i++) {
      opt = options[i];

      if (opt.selected) {
        result.push(opt.value);
      }
    }
    return result;
  },

  savePizzaHandler: function () {
    let pizza = null;
    //TODO

    let validInput = true;
    let p_name = document.getElementById('edit-pizza-name').value;
    let p_size = document.getElementById('edit-pizza-size').value;
    let p_url = document.getElementById('edit-pizza-url').value;
    let p_isGlutenFree = document.getElementById('edit-pizza-isGlutenFree').checked?"true":"false";
    let p_ingredients = web.getSelectValues(document.getElementById('edit-pizza-ingredients'));
    let p_toppings = web.getSelectValues(document.getElementById('edit-pizza-toppings'));

    if (!p_ingredients) p_ingredients = [];
    if (!p_toppings) p_toppings = [];
    if (!p_url) p_url = '';
    console.log('size ' + p_size);

    if (!p_name) {
      web.addMessage('error', 'Please input name of the pizza');
      validInput = false;
    }
    if (validInput) {
      pizza = {
        name: p_name,
        size: p_size,
        imageUrl: p_url,
        isGlutenFree: p_isGlutenFree,
        ingredients: p_ingredients, //must send the ingredient id
        extraToppings: p_toppings //must send the topping id
      }
      console.log(pizza)
      if (web.currentPizza) {
        web.sendEditPizzaRequest(pizza)
      } else {
        web.sendAddPizzaRequest(pizza)
      }

    }
  },

  sendEditPizzaRequest: function (pizza) {
    let url = `${web.URL}/api/pizzas/${web.currentPizza._id}`;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    web.attachBeaerToken(headers);

    const request = new Request(url, {
      headers: headers,
      method: 'PATCH',
      mode: 'cors',
      body: JSON.stringify(pizza)
    })

    fetch(request).then(res => {
        return res.json();
      }).then(data => {
        if (data.data) {
          web.addMessage('success', "Save successfully!");
        } else {
          // web.addMessage('error', data.errors[0].title + '<br>' + data.errors[0].detail);
          console.log(data.errors)
        }
        window.location.href = '../admin/pizzas.html'
        web.addMessage('success', "Save successfully!");
      })
      .catch(err => console.log(err));
  },
  sendAddPizzaRequest: function (pizza) {
    let url = `${web.URL}/api/pizzas/`;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    web.attachBeaerToken(headers);

    const request = new Request(url, {
      headers: headers,
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(pizza)
    })

    fetch(request).then(res => {
        return res.json();
      }).then(data => {
        if (data.data) {
          web.addMessage('success', "Save successfully!");
          web.resetEditPizza()

        } else {
          web.addMessage('error', data.errors[0].title + '<br>' + data.errors[0].detail);
        }
        // window.location.href = '../admin/pizzas.html'
        
      })
      .catch(err => console.log(err));
  },
  resetEditPizza: function(){
    document.getElementById('edit-pizza-name').value = "";
    document.getElementById('edit-pizza-size').value = "medium";
    document.getElementById('edit-pizza-isGlutenFree').checked = false;
    document.getElementById('edit-pizza-url').value = "";
    document.getElementById('edit-pizza-ingredients').value = "";
    document.getElementById('edit-pizza-toppings').value = "";
  },
  getIngredientsInStock: function () {
    let url = `${web.URL}/api/ingredients?instock=true`;

    const headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');

    const request = new Request(url, {
      headers: headers,
      method: 'GET',
      mode: 'cors',
    })

    fetch(request).then(res => {
        return res.json();
      }).then(data => {
        web.createIngredientList(data.data);
        web.createToppingsList(data.data);
      })
      .catch(err => console.log(err));
  },
  createIngredientList: function (arrays) {
    let select = document.getElementById("edit-pizza-ingredients");
    arrays.forEach(item => {
      let option = document.createElement('option');
      option.value = item._id;
      option.textContent = item.name;
      select.appendChild(option);
    })
  },
  createToppingsList: function (arrays) {
    let select = document.getElementById("edit-pizza-toppings");
    arrays.forEach(item => {
      let option = document.createElement('option');
      option.value = item._id;
      option.textContent = item.name;
      select.appendChild(option);
    })
  },
  showEditPizza: function (id) {
    let url = `${web.URL}/api/pizzas/${id}`;
    console.log(url)

    const headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');

    const request = new Request(url, {
      headers: headers,
      method: 'GET',
      mode: 'cors',
    })

    fetch(request)
      .then(res => {
        return res.json();
      }).then(data => {
        if (data.data) {
          web.currentPizza = data.data;
          console.log(JSON.stringify(data.data.ingredients));
          document.getElementById('edit-pizza-name').value = web.currentPizza.name;
          let size = document.getElementById('edit-pizza-size')
          size.value = web.currentPizza.size;

          let isGlutenFree = document.getElementById('edit-pizza-isGlutenFree')
          isGlutenFree.checked = web.currentPizza.isGlutenFree


          if (web.currentPizza.imageUrl) {
            document.getElementById('edit-pizza-url').value = web.currentPizza.imageUrl;
          }
          let ingredients = document.getElementById('edit-pizza-ingredients')
          
          for (let i = 0; i< ingredients.options.length; i++)
          {
            web.currentPizza.ingredients.forEach(item => {
                if (item._id === ingredients.options[i].value)
                  ingredients.options[i].selected = true ; 
              })
          }
          let extraToppings = document.getElementById('edit-pizza-toppings')
          for (let i = 0; i< extraToppings.options.length; i++)
          {
            web.currentPizza.extraToppings.forEach(item => {
                if (item._id === extraToppings.options[i].value)
                extraToppings.options[i].selected = true ; 
              })
          }

        } else {
          console.log(data.errors)
        }

      })
      .catch(err => console.log(err));

  }
}
web.init();