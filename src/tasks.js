const tasks = [
  { id: 1, title: "Prepare the demo", status: "open" },
  { id: 2, title: "Read the requirements", status: "done" },
  { id: 3, title: "Review the change", status: "open" },
  { id: 4, title: "Check the setup", status: "done" },
];

export function selectTasks(params) {
  const statuses = params.getAll("status");
  if (statuses.length === 0) return tasks;
  if (statuses.length !== 1 || statuses[0] !== "open") {
    throw new RangeError("Use exactly one status=open parameter");
  }
  return tasks.filter(task => task.status === "open");
}
