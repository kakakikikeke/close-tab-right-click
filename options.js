function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    with_options: {
      is_history_delete: document.querySelector("#is_history_delete").checked
    }
  });
}

function restoreOptions() {
  function setCurrentChoice(result) {
    document.querySelector("#is_history_delete").checked = result.with_options.is_history_delete;
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("with_options");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
