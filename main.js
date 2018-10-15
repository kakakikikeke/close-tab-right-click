function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("close-tab-right-click item created successfully");
  }
}

function onRemoved() {
}

function onError(error) {
  console.log(`Error: ${error}`);
}

browser.menus.create({
  id: "close-tab",
  title: browser.i18n.getMessage("menuItemClose"),
  contexts: ["all"]
}, onCreated);

browser.menus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "close-tab":
      var removing = browser.tabs.remove(tab.id);
      removing.then(onRemoved, onError);
      break;
  }
});
