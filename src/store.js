// LocalStorage based store
const KEY = "workout-tracker-v1";

export function loadData() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { exercises: [], logs: [] };
  } catch {
    return { exercises: [], logs: [] };
  }
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
