const tasks = [
  { id: 1, title: "Prepare the demo", status: "open" },
  { id: 2, title: "Read the requirements", status: "done" },
  { id: 3, title: "Review the change", status: "open" },
  { id: 4, title: "Check the setup", status: "done" },
];

export function selectTasks() {
  return tasks;
}
