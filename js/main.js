let web = {
  KEY: 'KEY',
  URL: 'https://hoho0001.edumedia.ca', 
  WEBURL: 'https://hoho0001.github.io/pizzashop/',
  // URL: 'http://localhost:3030',
  token: '',
  pizzas: [],
  ingredients: [],
  currentUser: null,
  currentPizza: null,
  currentIngredient: null,
  defaultCategories: ['meat', 'spicy', 'vegitarian', 'vegan', 'halal', 'kosher', 'cheeze', 'seasonings'],
 
  init: function () {
    web.getAllIngredients();
    web.getAvailablePizzas();
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
        web.loginHandler();
        break;
      case 'logout':
        web.logoutHandler();
        break;
      case 'changepw-btn':
        document.getElementById('changepw-btn').addEventListener('click', web.changePasswordHandler);
        break;
      case 'add-new-pizza-btn':
        web.currentPizza = null;
        window.location.href = web.WEBURL + "admin/pizza-edit.html"
        break;
      case 'add-new-ingredient-btn':
        web.currentIngredient = null;
        window.location.href = web.WEBURL + "admin/ingredient-edit.html"
        break;
      case 'edit-pizza-cancel-btn':
          web.currentPizza = null;
          window.location.href = web.WEBURL + "admin/pizzas.html"
        break;
      case 'edit-ingredient-cancel-btn':
          web.currentIngredient = null;
          window.location.href = web.WEBURL + "admin/ingredients.html";
        break;
      case 'edit-ingredient-save-btn':
        web.saveIngredientHandler();
        break;
      case 'edit-pizza-save-btn':
        web.savePizzaHandler();
        break;
    }
  },

  logoutHandler: function (ev) {
    let confirm = window.confirm("Do you want to logout?");
    if (confirm == true) {
      location.href = web.WEBURL + "index.html";
      web.token = '';
      sessionStorage.removeItem(web.KEY);
    }
  },
  registerHandler: function () {

    let url = web.URL + '/auth/users';

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
      web.addMessage('error', 'Missing field to register');
    } else {
      web.addProcessingState('register-btn');
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
          web.removeProcessingState('register-btn');
          if (data.data) {
            web.addMessage('success', "Register successfully!");
            web.resetRegister();
          } else {
            web.addMessage('error', data.errors[0].title + '<br>' + data.errors[0].detail);
          }
        })
        .catch(err => {
          console.error(err)
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
    console.log(url);
    let email = document.getElementById('login-email').value;
    let password = document.getElementById('login-password').value;

    if (!email || !password) {
      web.addMessage('error', 'Missing field to Login');
    } else {
      web.addProcessingState('login-btn');
    
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
      console.log(request.url)
      fetch(request)
        .then(res => {
          return res.json();
        })
        .then(data => {
          web.removeProcessingState('login-btn');
          if (data.data) {
            web.token = data.data.token;
            sessionStorage.setItem(web.KEY, data.data.token);
            web.getLoginUser();
          } else {
            web.addMessage('error', data.errors[0].title + '<br>' + 'Please try again!');
          }
        })
        .catch(err => {
          console.error(err)
        });
    }
  },

  loadUserInfo: function() {
    if (web.currentUser) {
      document.getElementById('user-first-name').value = web.currentUser.firstName;
      document.getElementById('user-last-name').value = web.currentUser.lastName;
      document.getElementById('user-email').value = web.currentUser.email;
    }
  },

  changePasswordHandler: function() {
    let newPassword = document.getElementById('new-password').value;
    let confirmNewPassword = document.getElementById('confirm-new-password').value;

    if(!newPassword || !confirmNewPassword) {
      web.addMessage('error', 'Missing required field' + '<br>' + 'Please input new password');
    } else {
      if (newPassword === confirmNewPassword) {
        let newPassWordObject = {
          password: newPassword
        }
        web.sendChangePasswordRequest(newPassWordObject);
      } else {
        web.addMessage('error', 'Password confirm failed' + '<br>' + 'New password confirmed is incorrect');
      }
    }
  },

  getLoginUser: function () {
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
      if (data.data.isStaff) {
        web.currentUser = data.data;
        location.href = web.WEBURL + "admin/pizzas.html"
      } else {
        location.href = web.WEBURL + "profile.html";
        document.querySelector('.pizza-admin-link').hidden = true;
        document.querySelector('.ingredient-admin-link').hidden = true;
      }

    }).catch(err => {
      console.error(err)
    });
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
        web.currentUser = data.data;
        web.loadUserInfo();
    }).catch(err => {
      console.error(err)
    });
  },

  attachBeaerToken: function (headers) {
    headers.append('Authorization', 'Bearer ' + sessionStorage.getItem(web.KEY));
  },
  adminPizzasHandler: function () {
    let url = `${web.URL}/api/pizzas`;
    console.log('url = ' + url);

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
  adminIngredientHandler: function() {
    let url = `${web.URL}/api/ingredients`;

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
        web.ingredients = data.data;
        web.displayIngredientsForAdmin();
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
      tableHead.classList.add('table-head');

      let tableRow = document.createElement('tr');

      let thPizzaName = document.createElement('th');
      thPizzaName.textContent = "Pizza Name";
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
      tableRow.appendChild(thPrice);
      tableRow.appendChild(thGlutenFree);
      tableRow.appendChild(thUrl);
      tableRow.appendChild(thIngredients);
      tableRow.appendChild(thToppings);
      tableRow.appendChild(thAction);

      tableHead.appendChild(tableRow);

      let tableBody = document.createElement('tbody');
      tableBody.classList.add('pizza-table-body')

      table.appendChild(tableHead);
      table.appendChild(tableBody);
      adminPizzaDiv.appendChild(table);

      web.pizzas.forEach(pizza => web.createPizzaRow(pizza));
      web.addEditPizzaEvent();
      web.addDeletePizzaEvent();
    }
  },

  displayIngredientsForAdmin: function() {
    let adminIngredientsDiv = document.querySelector('.admin-ingredients');
    if (!web.ingredients || web.ingredients.length == 0) {
        let h1 = document.createElement('h1');
        h1.textContent = 'No data found';
        adminIngredientsDiv.appendChild(h1);
    } else {
        let table = document.createElement('table');
        table.classList.add('table');
        table.classList.add('table-hover');
        table.classList.add('ingredients-table');

        let tableHead = document.createElement('thead');
        tableHead.classList.add('table-head');

        let tableRow = document.createElement('tr');

        let thIngredientName = document.createElement('th');
        thIngredientName.textContent = "Ingredient Name";
        let thPrice = document.createElement('th');
        thPrice.textContent = "Price";
        let thQuantity = document.createElement('th');
        thQuantity.textContent = "Quantity";
        let thGlutenFree = document.createElement('th');
        thGlutenFree.textContent = "Is Gluten Free";
        let thUrl = document.createElement('th');
        thUrl.textContent = "Image Url";
        let thCategories = document.createElement('th');
        thCategories.textContent = 'Categories';
        let thAction = document.createElement('th');
        thAction.textContent = "Action";

        tableRow.appendChild(thIngredientName);
        tableRow.appendChild(thQuantity);
        tableRow.appendChild(thPrice);
        tableRow.appendChild(thGlutenFree);
        tableRow.appendChild(thUrl);
        tableRow.appendChild(thCategories);
        tableRow.appendChild(thAction);

        tableHead.appendChild(tableRow);
        
        let tableBody = document.createElement('tbody');
        tableBody.classList.add('ingredient-table-body')

        table.appendChild(tableHead);
        table.appendChild(tableBody);
        adminIngredientsDiv.appendChild(table);

        web.ingredients.forEach(ingredient => web.createIngredientRow(ingredient));
        web.addEditIngredientEvent();
        web.addDeleteIngredientEvent();
    }
  },

  addEditPizzaEvent: function() {
    if (document.querySelectorAll('.edit-pizza-link').length > 0) {
      document.querySelectorAll('.edit-pizza-link').forEach(editButton => {
        editButton.addEventListener('click', async function (ev) {
          let pizzaId = ev.target.id;
          window.location.href = `${web.WEBURL}admin/pizza-edit.html?id=${pizzaId}`
        });
      });
    }
  },

  addEditIngredientEvent: function() {
    if (document.querySelectorAll('.edit-ingredient-link').length > 0) {
      document.querySelectorAll('.edit-ingredient-link').forEach(editButton => {
        editButton.addEventListener('click', async function (ev) {
          let ingredientId = ev.target.id;
          window.location.href = `${web.WEBURL}admin/ingredient-edit.html?id=${ingredientId}`
        });
      });
    }
  },

  addDeletePizzaEvent: function() {
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
  },

  addDeleteIngredientEvent: function() {
    if (document.querySelectorAll('.delete-ingredient-link').length > 0) {
      document.querySelectorAll('.delete-ingredient-link').forEach(deleteButton => {
        deleteButton.addEventListener('click', async function (ev) {
          let ingredientId = ev.target.id;
          web.currentIngredient = await web.ingredients.find(ingredient => ingredient._id == ingredientId);
          let confirm = window.confirm("Do you want to delete the ingredient?");
          if (confirm == true) {
            web.sendDeleteIngredientRequest(ingredientId);
          }
        });
      });
    }
  },

  createPizzaRow: function (pizza) {
    let tableBody = document.querySelector('.pizza-table-body');
    let tableRow = document.createElement('tr');

    let tdName = document.createElement('td');
    tdName.classList.add('text-left');
    tdName.textContent = pizza.name;

    let tdSize = document.createElement('td');
    tdSize.classList.add('text-left');
    tdSize.textContent = pizza.size;

    let tdPrice = document.createElement('td');
    tdPrice.classList.add('text-right');
    tdPrice.textContent = pizza.price;

    let tdGlutenFree = document.createElement('td');

    let checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('onclick', 'return false');

    pizza.isGlutenFree == true? checkbox.checked = true: checkbox.checked = false;
    tdGlutenFree.appendChild(checkbox);

    let tdUrl = document.createElement('td');
    tdUrl.classList.add('text-left');
    tdUrl.textContent = pizza.imageUrl;

    let tdIngredients = document.createElement('td');
    tdIngredients.classList.add('text-left');
    if (pizza.ingredients.length > 0) {
      let ingredientNameList = [];
      pizza.ingredients.forEach(ingredient => {
        let ingredientFound = web.ingredients.find(i => i._id == ingredient);
        if (ingredientFound) {
          ingredientNameList.push(' ' + ingredientFound.name);
        }
      })
      tdIngredients.textContent = ingredientNameList;
    } else {
        tdIngredients.textContent = pizza.ingredients;
    }

    let tdToppings = document.createElement('td');
    tdToppings.classList.add('text-left');

    if (pizza.extraToppings.length > 0) {
      let toppingNameList = [];
      pizza.extraToppings.forEach(topping => {
          let toppingFound = web.ingredients.find(i => i._id == topping);
          if (toppingFound) {
            toppingNameList.push(' ' + toppingFound.name);
          }
      })
      tdToppings.textContent = toppingNameList;
      } else {
          tdToppings.textContent = pizza.extraToppings;
      }

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
    deleteLink.id = pizza._id;

    tdAction.appendChild(editLink);
    tdAction.appendChild(deleteLink);

    tableRow.appendChild(tdName);
    tableRow.appendChild(tdSize);
    tableRow.appendChild(tdPrice);
    tableRow.appendChild(tdGlutenFree);
    tableRow.appendChild(tdUrl);
    tableRow.appendChild(tdIngredients);
    tableRow.appendChild(tdToppings);
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

  createIngredientRow: function(ingredient) {
    let tableBody = document.querySelector('.ingredient-table-body');
    let tableRow = document.createElement('tr');

    let tdName = document.createElement('td');
    tdName.textContent = ingredient.name;
    tdName.classList.add('text-left');

    let tdPrice = document.createElement('td');
    tdPrice.textContent = ingredient.price;
    tdPrice.classList.add('text-right');

    let tdQuantity = document.createElement('td');
    tdQuantity.textContent = ingredient.quantity;
    tdQuantity.classList.add('text-right');


    let tdGlutenFree = document.createElement('td');

    let checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('onclick', 'return false');

    ingredient.isGlutenFree == true? checkbox.checked = true: checkbox.checked = false;
    tdGlutenFree.appendChild(checkbox);

    let tdUrl = document.createElement('td');
    tdUrl.textContent = ingredient.imageUrl;
    tdUrl.classList.add('text-left');


    let tdCategories = document.createElement('td');
    if (ingredient.categories. length > 0) {
      let i_categories = [];
      ingredient.categories.forEach(category => {
        i_categories.push(' ' + category);
      })
      tdCategories.textContent = i_categories;
    } else {
      tdCategories.textContent = ingredient.categories;
    }
    
    tdCategories.classList.add('text-left');


    let tdAction = document.createElement('td');

    let editLink = document.createElement('a');
    editLink.textContent = 'Edit'
    editLink.setAttribute('href', '#');
    editLink.classList.add('edit-ingredient-link');
    editLink.id = ingredient._id;
    
    let deleteLink = document.createElement('a');
    deleteLink.textContent = 'Delete';
    deleteLink.setAttribute('href', '#');
    deleteLink.classList.add('delete-ingredient-link');
    deleteLink.setAttribute('data-toggle', 'modal');
    deleteLink.setAttribute('data-target', '#confirm-delete-ingredient-dialog');
    deleteLink.id = ingredient._id;

    tdAction.appendChild(editLink);
    tdAction.appendChild(deleteLink);

    tableRow.appendChild(tdName);
    tableRow.appendChild(tdQuantity);
    tableRow.appendChild(tdPrice);
    tableRow.appendChild(tdGlutenFree);
    tableRow.appendChild(tdUrl);
    tableRow.appendChild(tdCategories);
    tableRow.appendChild(tdAction);

    tableBody.appendChild(tableRow);
},

  sendChangePasswordRequest: function(newPassWordObject) {
    let url = `${web.URL}/auth/users/me`;
    web.addProcessingState('changepw-btn');

    const headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    web.attachBeaerToken(headers);

    const request = new Request(url, {
        headers: headers,
        method: 'PATCH',
        mode: 'cors',
        body: JSON.stringify(newPassWordObject)
    })

    fetch(request)
    .then(res => {
        web.removeProcessingState('changepw-btn');
        if (res.status !== 200) {
            throw new Error(res.status);
        }
        web.addMessage('success', 'Congratulations!' + '<br>' + 'Successfully change password');
        return res.json();
    }).then(data => {
       
    })
    .catch(err => console.log(err));
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

  sendDeleteIngredientRequest: function(id) {
    let url = `${web.URL}/api/ingredients/${id}`;
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
          web.ingredients = web.ingredients.filter(ingredient => ingredient._id != web.currentIngredient._id);
          web.refreshIngredientAdminPage();
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
      let pizzaAdminContainer = document.querySelector('.admin-pizzas');
      let pizzasTable = document.getElementById('pizzas-table')
      pizzaAdminContainer.removeChild(pizzasTable);
      let h1 = document.createElement('h1');
      h1.textContent = 'No data found';
      pizzaAdminContainer.appendChild(h1);
    } else {
      web.removePizzaRows();
      web.pizzas.forEach(pizza => web.createPizzaRow(pizza));
      web.addEditPizzaEvent();
      web.addDeletePizzaEvent();
    }
  },

  refreshIngredientAdminPage: function() {
    if (web.ingredients.length == 0) {
      let ingredientAdminContainer = document.querySelector('.admin-ingredients');
      let ingredientTable = document.getElementById('ingredients-table');
      ingredientAdminContainer.removeChild(ingredientTable);
      let h1 = document.createElement('h1');
      h1.textContent = 'No data found';
      ingredientAdminContainer.appendChild(h1);
    } else {
      web.removeIngredientRows();
      web.ingredients.forEach(ingredient => web.createIngredientRow(ingredient));
      web.addEditIngredientEvent();
      web.addDeleteIngredientEvent();
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
  removeIngredientRows: function() {
    let ingredientBody = document.querySelector('.ingredient-table-body');
    let ingredientRow = ingredientBody.firstChild;
    while (ingredientRow) {
      ingredientBody.removeChild(ingredientRow);
      ingredientRow = ingredientBody.firstChild;
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
        ingredients: p_ingredients, 
        extraToppings: p_toppings 
      }
      web.addProcessingState('edit-pizza-save-btn');
      if (web.currentPizza) {
        web.sendEditPizzaRequest(pizza)
      } else {
        web.sendAddPizzaRequest(pizza)
      }
    }
  },

  addProcessingState: function(buttonId) {
    let btn = document.getElementById(buttonId);
    btn.classList.add('Proccessing');
    btn.disabled = true;
  },

  removeProcessingState: function(buttonId) {
    let btn = document.getElementById(buttonId);
    btn.classList.remove('Proccessing');
    btn.disabled = false;
  },

  saveIngredientHandler: function() {
    let ingredient = null;
    let validInput = true;
    let i_name = document.getElementById('edit-ingredient-name').value;
    let i_price = document.getElementById('edit-ingredient-price').value;
    let i_isGlutenFree = document.getElementById('edit-ingredient-isGlutenFree').checked?"true":"false";
    let i_url = document.getElementById('edit-ingredient-url').value;
    let i_quantity = document.getElementById('edit-ingredient-quantity').value;
    let i_categories = web.getSelectValues(document.getElementById('edit-ingredient-categories'));

    if (!i_name) {
      web.addMessage('error', 'Please input name of the ingredient');
      validInput = false;
    }
    if (validInput) {
      ingredient = {
        name: i_name,
        price: i_price,
        isGlutenFree: i_isGlutenFree,
        imageUrl: i_url,
        quantity: i_quantity,
        categories: i_categories
      }
      web.addProcessingState('edit-ingredient-save-btn');
      if (web.currentIngredient) {
        web.sendEditIngredientRequest(ingredient);
      } else {
        web.sendAddIngredientRequest(ingredient);
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
        web.removeProcessingState('edit-pizza-save-btn');
        if (data.data) {
          web.addMessage('success', "Save successfully!");
          let index = web.pizzas.findIndex(tmp => tmp._id == web.currentPizza._id);
          pizza._id = web.currentPizza._id;
          web.pizzas[index] = pizza;
        } else {
          // web.addMessage('error', data.errors[0].title + '<br>' + data.errors[0].detail);
          console.log(data.errors)
        }
        web.addMessage('success', "Save successfully!");
      })
      .catch(err => console.log(err));
  },

  sendEditIngredientRequest: function(ingredient) {
    let url = `${web.URL}/api/ingredients/${web.currentIngredient._id}`;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    web.attachBeaerToken(headers);
    const request = new Request(url, {
      headers: headers,
      method: 'PATCH',
      mode: 'cors',
      body: JSON.stringify(ingredient)
    })

    fetch(request)
    .then(res => {
      web.removeProcessingState('edit-ingredient-save-btn');
        return res.json();
    })
    .then(data => {
      if (data.data) {
        web.addMessage('success', "Save successfully!");
        let index = web.ingredients.findIndex(tmp => tmp._id == web.currentIngredient._id);
        ingredient._id = web.currentIngredient._id;
        web.ingredients[index] = ingredient;
      } else {
        // web.addMessage('error', data.errors[0].title + '<br>' + data.errors[0].detail);
        console.log(data.errors)
      }
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
        web.removeProcessingState('edit-pizza-save-btn');
        if (data.data) {
          web.addMessage('success', "Save successfully!");
          web.resetEditPizza()

        } else {
          web.addMessage('error', data.errors[0].title + '<br>' + data.errors[0].detail);
        }
      })
      .catch(err => console.log(err));
  },
  sendAddIngredientRequest: function(ingredient) {
    let url = `${web.URL}/api/ingredients/`;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json;charset=UTF-8');
    web.attachBeaerToken(headers);

    const request = new Request(url, {
      headers: headers,
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(ingredient)
    })

    fetch(request)
    .then(res => {
      web.removeProcessingState('edit-ingredient-save-btn');
      return res.json();
    })
    .then(data => {
      if (data.data) {
        web.addMessage('success', "Save successfully!");
        web.resetEditIngredient();
      } else {
        web.addMessage('error', data.errors[0].title + '<br>' + data.errors[0].detail);
      }
      })
      .catch(err => console.log(err));
  },
  resetEditPizza: function() {
    document.getElementById('edit-pizza-name').value = "";
    document.getElementById('edit-pizza-size').value = "medium";
    document.getElementById('edit-pizza-isGlutenFree').checked = false;
    document.getElementById('edit-pizza-url').value = "";
    document.getElementById('edit-pizza-ingredients').value = "";
    document.getElementById('edit-pizza-toppings').value = "";
  },

  resetEditIngredient: function() {
    document.getElementById('edit-ingredient-name').value = "";
    document.getElementById('edit-ingredient-price').value = "";
    document.getElementById('edit-ingredient-isGlutenFree').checked = false;
    document.getElementById('edit-ingredient-url').value = "";
    document.getElementById('edit-ingredient-quantity').value = "";
    document.getElementById('edit-ingredient-categories').value = "";
  },

  getAllIngredients: function() {
    let url = `${web.URL}/api/ingredients`;
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
      console.log(data.data);
      web.ingredients = data.data;
    })
    .catch(err => console.log(err));
  },

  getAvailablePizzas: function() {
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
      })
      .catch(err => console.log(err));
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

  },
  showEditIngredient: function(id) {
    let url = `${web.URL}/api/ingredients/${id}`;
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
        web.currentIngredient = data.data;
        document.getElementById('edit-ingredient-name').value = web.currentIngredient.name;
        document.getElementById('edit-ingredient-price').value = web.currentIngredient.price;

        let isGlutenFree = document.getElementById('edit-ingredient-isGlutenFree');
        isGlutenFree.checked = web.currentIngredient.isGlutenFree;

        if (web.currentIngredient.imageUrl) {
          document.getElementById('edit-ingredient-url').value = web.currentIngredient.imageUrl;
        }

        let categories = document.getElementById('edit-ingredient-categories')
          for (let i = 0; i< categories.options.length; i++)
          {
            web.currentIngredient.categories.forEach(category => {
              if (category === categories.options[i].value)
              categories.options[i].selected = true ; 
            })
          }
        document.getElementById('edit-ingredient-quantity').value = web.currentIngredient.quantity;
        document.getElementById('')
      } else {
        console.log(data.errors)
      }

    })
    .catch(err => console.log(err));

  }
}
web.init();
