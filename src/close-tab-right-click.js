var id = "close-tab-right-click";

function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log(`${id} item created successfully`);
  }
}

function onRemoved() {}

function onError(error) {
  console.log(`Error: ${error}`);
}

function getExtensionInfo() {
  return {
    id: id,
    title: browser.i18n.getMessage("menuItemClose"),
    contexts: ["all"],
  };
}

function closeTab(info, tab) {
  switch (info.menuItemId) {
    case id:
      var removing = browser.tabs.remove(tab.id);
      removing.then(function () {
        var getting = browser.storage.local.get("with_options");
        getting.then(function (result) {
          if (result.with_options.is_history_delete) {
            var deleting = browser.history.deleteUrl({ url: tab.url });
            deleting.then(onRemoved, onError);
          }
        }, onError);
      }, onError);
      break;
  }
}

// Export for tests
if (typeof module !== "undefined") {
  module.exports = {
    onCreated,
    getExtensionInfo,
    closeTab,
  };
}

// Set functions to windows object for extension
if (typeof window !== "undefined") {
  window.onCreated = onCreated;
  window.getExtensionInfo = getExtensionInfo;
  window.closeTab = closeTab;
}
