let currentProject;

const Todo = function(title, description, dueDate, priority, projectID) {
	let done = false;
	return {title, description, dueDate, priority, done, projectID};
}

const genNewTodoForm = function() {
	const form = document.createElement("div");

	const title = document.createElement("input");
	title.type = "text";
	title.placeholder = "Title";

	const description = document.createElement("textarea");
	description.placeholder = "Short Description of Your Todo";

	const dueDate = document.createElement("input");
	dueDate.type = "date";

	const priority = document.createElement("div");
	["urgent", "medium", "low"].forEach((p) => {
		const wrapper = document.createElement("div");

		const input = document.createElement("input");
		input.type = "radio";
		input.name = "priority";
		input.value = p;
		input.id = p;
		if (p == "medium") {
			input.checked = true;
		}

		const label = document.createElement("label");
		label.htmlFor = input.id;
		label.textContent = p.charAt(0).toUpperCase() + p.slice(1);

		wrapper.appendChild(input);
		wrapper.appendChild(label);
		priority.appendChild(wrapper);
	});

	const button = document.createElement("button");
	button.textContent = "Add Todo";
	button.addEventListener("click", function() {
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

	form.appendChild(title);
	form.appendChild(description);
	form.appendChild(dueDate);
	form.appendChild(priority);
	form.appendChild(button);
	return form;
}

const genProjectsDisplay = function() {
	const projects = document.createElement("div");
	projects.id = "projects";

	const genProjectDisplay = function(name, total, index) {
		const wrapper = document.createElement("div");

		const p = document.createElement("div");
		const n = document.createElement("h2");
		n.textContent = name;
		const t = document.createElement("p");
		t.textContent = total;
		p.appendChild(n);
		p.appendChild(t);

		p.addEventListener("click", () => {
			currentProject = index;
			updateDisplay();
		});
		wrapper.appendChild(p);

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

	const all = genProjectDisplay("All", TodoList.todos.length);
	all.classList.add("current");
	projects.appendChild(all);

	TodoList.projects.forEach((p, i) => projects.appendChild(
		genProjectDisplay(p, TodoList.getProjectLength(i), i)));

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

	let items = TodoList.todos.map((data, index) => {
		return {data, index};
	});

	if (currentProject) {
		items = TodoList.getTodosFromProject(currentProject);
	}

	items.forEach((todo) => {
		const t = document.createElement("div");

		const info = document.createElement("div");
		info.classList.add(todo.data.priority);
		info.classList.add("todo");
		info.addEventListener("click", () => {
			d = document.createElement("div");
			d.textContent = todo.data.description;
			info.appendChild(d);
		});

		const tt = document.createElement("div");
		tt.textContent = todo.data.title;

		const dd = document.createElement("div");
		dd.textContent = todo.data.dueDate;

		info.appendChild(tt);
		info.appendChild(dd);

		const done = document.createElement("button");
		done.textContent = todo.data.done ? "Done" : "Not Done";
		done.addEventListener("click", () => {
			TodoList.toggleDone(todo.index);
			done.textContent = todo.data.done ? "Done" : "Not Done";
		});

		const del = document.createElement("button");
		del.textContent = "X";
		del.addEventListener("click", () => {
			TodoList.removeTodo(todo.index);
			updateDisplay();
		});

		
		t.appendChild(info);
		t.appendChild(done);
		t.appendChild(del);
		todos.appendChild(t);
	});

	return todos;
}

let todos = [];
let projects = [];

if (localStorage.getItem("todos")) {
	todos = JSON.parse(localStorage.getItem("todos"));
}
if (localStorage.getItem("projects")) {
	projects = JSON.parse(localStorage.getItem("projects"));
}

const TodoList = (function(todos, projects) {
	const addTodo = (title, description, dueDate, priority, projectID) =>
		todos.push(Todo(title, description, dueDate, priority, projectID));

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
					todos[i].projectID--;
				}
				++i;
			}
		}
		projects.splice(index, 1);
	}
	const toggleDone = (index) => todos[index].done = !todos[index].done;
	const setPriority = (index, priority) => todos[index].priority = priority;
	const getTodosFromProject = (index) => todos.map((data, index) => {
		return {data, index};
	}).filter((todo) => todo.data.projectID == index);
	const getProjectLength = (index) => getTodosFromProject(index).length;

	return {todos, projects,
		addTodo, addProject,
		removeTodo, removeProject,
		toggleDone, setPriority,
		getTodosFromProject, getProjectLength};
})(todos, projects);

const updateDisplay = function () {
	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild);
	}
	document.body.appendChild(genNewTodoForm());
	document.body.appendChild(genProjectsDisplay());
	document.body.appendChild(genTodosDisplay());
}

updateDisplay();
window.addEventListener("unload", () => {
	localStorage.setItem("todos", JSON.stringify(TodoList.todos));
	localStorage.setItem("projects", JSON.stringify(TodoList.projects));
});
