/*
Ethan Lor
CS 202
Homework 5
December 2, 2017
*/
var current = {
  userId: null,
  taskList: null,
}

var toggle = function() {
  var login = document.getElementById("login");
  var home = document.getElementById("home");

  if (login.className === "on") {
    login.className = "off";
    home.className = "on";
  } else {
    login.className = "on";
    home.className = "off";
  }
}

var login = function(event) {
  event.preventDefault();
  var username = document.getElementById('usernameInput').value;
  var password = document.getElementById('passwordInput').value;

  tasker.login(username, password, function(user, error) {
    if (user) {
      current.userId = user.id;
      var logout = document.getElementById("logout");
      var logoutText = document.createTextNode("Welcome " + username);
      logout.appendChild(logoutText);
      tasker.tasks(current.userId, function(list, err) {
        if (list) {
          current.taskList = list;
          createTable(current.taskList);
        } else {
          alert(err);
        }
      });
      toggle();
    } else {
      alert("Login Failed!");
    }
  });
}

var logout = function() {
  var logout = document.getElementById("logout");
  var text = logout.firstChild;
  logout.removeChild(text);
  toggle();
  document.getElementById("searchField").value = "";
  document.getElementById("incompleteBox").checked = false;
  document.getElementById("overdueBox").checked = false;
};

var createHeader = function() {
  var row = document.createElement("tr");
  row.innerHTML = "<th>Description</th><th>Color</th><th>Due</th><th>Completed</th><th></td>";
  document.getElementById("tasks").appendChild(row);
}

var createTable = function(list) {
  var child = document.getElementById("tasks").firstChild;

  while (child) {
    document.getElementById("tasks").removeChild(child);
    child = document.getElementById("tasks").firstChild;
  }

  createHeader();

  list.forEach(t => {
    var desc = document.createTextNode(t.desc);
    var descCol = document.createElement("td");
    descCol.appendChild(desc);

    var color = t.color;
    var colorCol = document.createElement("td");
    var colorInput = document.createElement("input");
    colorInput.setAttribute("type", "color");
    colorInput.setAttribute("class", "form-control colorCol");
    colorInput.value = color;
    colorCol.appendChild(colorInput);

    var date = t.due.toISOString().substring(0, 10);
    var dateSplit = date.split("-");
    var date = dateSplit[1] + "/" + dateSplit[2] + "/" + dateSplit[0];
    var due = document.createTextNode(date);
    var dateCol = document.createElement("td");
    dateCol.appendChild(due);

    var complete = document.createElement("input");
    complete.setAttribute("type", "checkbox");
    if (t.complete) {
      complete.checked = true;
    }
    var completeCol = document.createElement("td");
    complete.addEventListener("click", () => completed(t.id, complete.checked));
    completeCol.appendChild(complete);

    var overDue = document.createElement("span");
    overDue.innerHTML = "!";
    overDue.setAttribute("name", "dueDate");
    if (t.due < new Date() && complete.checked == false) {
      overDue.setAttribute("class", "overDue");
    } else {
      overDue.setAttribute("class", "current");
    }
    completeCol.appendChild(overDue);

    var deleteCol = document.createElement('td');
    var deleteButton = document.createElement('span');
    deleteButton.setAttribute('class', 'btn btn-sm btn-danger');
    deleteButton.innerHTML = '<span class="glyphicon glyphicon-trash"></span>';
    deleteButton.addEventListener("click", () => deleteTask(t.id));
    deleteCol.appendChild(deleteButton);

    var row = document.createElement("tr");
    row.appendChild(descCol);
    row.appendChild(colorCol);
    row.appendChild(dateCol);
    row.appendChild(completeCol);
    row.appendChild(deleteCol);
    document.getElementById("tasks").appendChild(row);
  });
}

var addTask = function(a) {
  var description = document.getElementById("descField").value;
  var colorCode = document.getElementById("cField").value;
  var dueDate = document.getElementById("dField").value;
  document.getElementById("descField").value = "";
  document.getElementById("dField").value = "";

  var newTask = {
    desc: description,
    due: dueDate,
    color: colorCode,
    complete: false,
    id: null
  };

  tasker.add(current.userId, newTask, function(task, error) {
    if (task) {
      tasker.tasks(current.userId, function(list, err) {
        if (list) {
          current.taskList = list;
          filter();
        } else {
          alert(err);
        }
      });
    } else {
      alert(error);
    }
  });
}

var completed = function(tID, check) {
  var config;
  if (check) {
    config = {
      complete: true
    };
  } else {
    config = {
      complete: false
    };
  }

  tasker.edit(current.userId, tID, config, function(edit, error) {
    if (edit) {
      tasker.tasks(current.userId, function(list, err) {
        if (list) {
          current.taskList = list;
          filter();
        } else {
          alert(err);
        }
      });
    } else {
      alert(error);
    }
  });
}

var deleteTask = function(task) {
  tasker.delete(current.userId, task, function(error) {
    if (error) {
      tasker.tasks(current.userId, function(list, err) {
        if (list) {
          current.taskList = list;
          filter();
        } else {
          alert(err);
        }
      });
    }
  });
}

var filter = function() {
  var filteredList = current.taskList;
  if (document.getElementById("searchField").value) {
    var searchString = document.getElementById("searchField").value;
    filteredList = filteredList.filter(x => {
      if (x.desc.indexOf(searchString) >= 0) {
        return x;
      }
    });
  }

  if (document.getElementById("incompleteBox").checked) {
    filteredList = filteredList.filter(x => x.complete == false);
  }

  if (document.getElementById("overdueBox").checked) {
    filteredList = filteredList.filter(x => x.due < new Date() && x.complete === false);
  }

  createTable(filteredList);
}

var incompleteChange = function() {
  filter();
}

var overdueChange = function() {
  filter();
}

var searchTextChange = function() {
  filter();
}
