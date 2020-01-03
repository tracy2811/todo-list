let currentProject;
let todos = [];
let projects = [];

// Retrieve data from localStorage
if (localStorage.getItem("todos")) {
	todos = JSON.parse(localStorage.getItem("todos"));
}

if (localStorage.getItem("projects")) {
	projects = JSON.parse(localStorage.getItem("projects"));
}

window.addEventListener("unload", () => {
	localStorage.setItem("todos", JSON.stringify(TodoList.todos));
	localStorage.setItem("projects", JSON.stringify(TodoList.projects));
});

const Todo = function (title, description, dueDate, priority, projectID) {
	let done = false;
	return {
		title,
		description,
		dueDate,
		priority,
		done,
		projectID,
	};
}

const TodoList = (function(todos, projects) {
	const addTodo = (title, description, dueDate, priority, projectID) => (
		todos.push(Todo(title, description, dueDate, priority, projectID,))
	);
	const addProject = (name) => projects.push(name);
	const removeTodo = (index) => todos.splice(index, 1);
	const removeProject = (index) => {
		if (index >= projects.length) {
			return;
		}
		for (let i = 0; i < todos.length; ) {
			if (todos[i].projectID == index) {
				todos.splice(i, 1);
			} else {
				if (todos[i].projectID > index) {
					todos[i].projectID -= 1;
				}
				++i;
			}
		}

		projects.splice(index, 1);
	}

	const toggleDone = (index) => todos[index].done = !todos[index].done;
	const setPriority = (index, priority) => todos[index].priority = priority;
	const getTodosFromProject = (index) => todos.map((data, index) => {
		return { data, index };
	}).filter((todo) => todo.data.projectID == index);
	const getProjectLength = (index) => getTodosFromProject(index).length;
	return {
		todos,
		projects,
		addTodo,
		addProject,
		removeTodo,
		removeProject,
		toggleDone,
		setPriority,
		getTodosFromProject,
		getProjectLength
	};
})(todos, projects);

const updateDisplay = function () {
	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild);
	}

	document.body.appendChild(genNewTodoForm());
	document.body.appendChild(genProjectsDisplay());
	document.body.appendChild(genTodosDisplay());
}

const genNewTodoForm = function () {
	// Root tag
	const form = document.createElement("div");
	form.id = "todoForm";

	// Title input tag
	const title = document.createElement("input");
	title.type = "text";
	title.placeholder = "Title";
	title.required = true;

	// Description input tag
	const description = document.createElement("textarea");
	description.placeholder = "Short Description of Your Todo";

	// Due Date input tag
	const dueDate = document.createElement("input");
	dueDate.type = "date";
	dueDate.value = new Date().toISOString().substr(0,10);
	dueDate.required = true;

	// Priority input tag
	const priority = document.createElement("div");
	["urgent", "medium", "low"].forEach((p) => {
		const wrapper = document.createElement("div");

		// Radio input tag
		const input = document.createElement("input");
		input.type = "radio";
		input.name = "priority";
		input.value = p;
		input.id = p;
		if (p == "medium") {
			input.checked = true;
		}

		// Label for radio input tag
		const label = document.createElement("label");
		label.htmlFor = input.id;
		label.textContent = p.charAt(0).toUpperCase() + p.slice(1);

		// Append to wrapper then priority tag
		wrapper.appendChild(input);
		wrapper.appendChild(label);
		priority.appendChild(wrapper);
	});

	// Button to add new todo
	const button = document.createElement("button");
	button.textContent = "Add Todo";
	button.addEventListener("click", function() {
		if (!title.value.trim() || !dueDate.value) {
			return;
		}
		let prio;
		for (let i = 0; i < priority.children.length; ++i) {
			if (priority.children[i].firstChild.checked) {
				prio = priority.children[i].firstChild.value;
				break;
			}
		}
		TodoList.addTodo(title.value, description.value, dueDate.value, prio, currentProject);
		updateDisplay();
	});

	// Append all elements to form root and return
	form.appendChild(title);
	form.appendChild(description);
	form.appendChild(dueDate);
	form.appendChild(priority);
	form.appendChild(button);
	return form;
}

const genProjectsDisplay = function() {
	// Root tag
	const projects = document.createElement("div");
	projects.id = "projects";

	// Function to generate display for each project
	const genProjectDisplay = function(name, total, index) {
		const wrapper = document.createElement("div");

		// Tags for basic info: name, total number of todos
		const p = document.createElement("div");
		const n = document.createElement("h2");
		const t = document.createElement("p");
		n.textContent = name;
		t.textContent = total;
		p.appendChild(n);
		p.appendChild(t);

		// Change current project by click
		p.addEventListener("click", () => {
			currentProject = index;
			updateDisplay();
		});

		wrapper.appendChild(p);

		// Add delete button
		if (index >= 0) {
			const del = document.createElement("button");
			del.textContent = "X";
			del.addEventListener("click", () => {
				TodoList.removeProject(index);
				updateDisplay();
			});

			wrapper.appendChild(del);
			if (index == currentProject) {
				wrapper.classList.add("current");
			}
		}

		return wrapper;
	};

	// Display tag for All
	const all = genProjectDisplay("All", TodoList.todos.length);
	all.classList.add("current");
	projects.appendChild(all);

	// Display tags for each project
	TodoList.projects.forEach((p, i) => (
		projects.appendChild(genProjectDisplay(p, TodoList.getProjectLength(i), i))
	));

	// Fields for add new project
	const create = document.createElement("div");
	const name = document.createElement("input");
	const button = document.createElement("button");
	button.textContent = "Add Project";
	button.addEventListener("click", () => {
		if (name.value){
			currentProject = TodoList.projects.length;
			TodoList.addProject(name.value);
			updateDisplay();
		}
	});
	create.appendChild(name);
	create.appendChild(button);
	projects.appendChild(create);
	return projects;
}

const genTodosDisplay = function() {
	const todos = document.createElement("div");
	todos.id = "todos";

	// Get todos and its index
	let items = TodoList.todos.map((data, index) => {
		return { data, index };
	});
	if (currentProject) {
		items = TodoList.getTodosFromProject(currentProject);
	}

	// Iretate over items
	items.forEach((todo) => {
		// Root tag for each item
		const t = document.createElement("div");

		// Info tag
		const info = document.createElement("div");
		const tt = document.createElement("div");
		const dd = document.createElement("div");
		tt.textContent = todo.data.title;
		dd.textContent = todo.data.dueDate;
		info.classList.add(todo.data.priority);
		info.classList.add("todo");
		info.addEventListener("click", () => {
			const d = document.createElement("div");
			d.textContent = todo.data.description;
			info.appendChild(d);
		});
		info.appendChild(tt);
		info.appendChild(dd);

		// Toogle done button
		const done = document.createElement("button");
		done.textContent = todo.data.done ? "Done" : "Not Done";
		done.addEventListener("click", () => {
			TodoList.toggleDone(todo.index);
			done.textContent = todo.data.done ? "Done" : "Not Done";
		});

		// Delete button
		const del = document.createElement("button");
		del.textContent = "X";
		del.addEventListener("click", () => {
			TodoList.removeTodo(todo.index);
			updateDisplay();
		});

		// Append to root tag
		t.appendChild(info);
		t.appendChild(done);
		t.appendChild(del);
		todos.appendChild(t);
	});
	return todos;
}

updateDisplay();

