/* eslint-disable no-undef */
browser.menus.create(getExtensionInfo(), onCreated);
browser.menus.onClicked.addListener(closeTab);
