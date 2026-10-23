const list = document.querySelector("#tasks");
const count = document.querySelector("#count");
const errorBox = document.querySelector("#error");
const filter = document.querySelector("#filter");
let openOnly = false;

async function loadTasks(nextOpenOnly = openOnly) {
  filter.disabled = true;
  errorBox.hidden = true;
  try {
    const response = await fetch(nextOpenOnly ? "/api/tasks?status=open" : "/api/tasks");
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const { items, count: total } = await response.json();
    list.replaceChildren(...items.map(task => {
      const item = document.createElement("li");
      const badge = document.createElement("span");
      badge.textContent = task.status;
      badge.className = `badge ${task.status}`;
      item.textContent = task.title;
      item.append(badge);
      return item;
    }));
    count.textContent = `${total} ${total === 1 ? "task" : "tasks"}`;
    openOnly = nextOpenOnly;
    filter.setAttribute("aria-pressed", String(openOnly));
  } catch (error) {
    list.replaceChildren();
    count.textContent = "Tasks unavailable";
    errorBox.textContent = error.message;
    errorBox.hidden = false;
  } finally {
    filter.disabled = false;
  }
}

filter.addEventListener("click", () => loadTasks(!openOnly));
loadTasks();
