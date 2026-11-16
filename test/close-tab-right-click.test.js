const { afterEach, beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  onCreated,
  getExtensionInfo,
  closeTab,
} = require("../src/close-tab-right-click");

function createMock(implementation = () => {}) {
  const calls = [];
  const mock = (...args) => {
    calls.push(args);
    return implementation(...args);
  };
  mock.calls = calls;
  return mock;
}

describe("close-tab-right-click.js", () => {
  const tabId = 123;
  const tabUrl = "https://example.com";
  let originalConsoleLog;

  beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = createMock();
    global.browser = {
      runtime: {
        lastError: null,
      },
      i18n: {
        getMessage: createMock(() => "Close Tab"),
      },
      tabs: {
        remove: createMock(() => Promise.resolve()),
      },
      storage: {
        local: {
          get: createMock(() =>
            Promise.resolve({
              with_options: { is_history_delete: false },
            }),
          ),
        },
      },
      history: {
        deleteUrl: createMock(() => Promise.resolve()),
      },
    };
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    delete global.browser;
  });

  describe("onCreated", () => {
    it("logs success message when no error", () => {
      browser.runtime.lastError = null;

      onCreated();

      assert.deepEqual(console.log.calls, [
        ["close-tab-right-click item created successfully"],
      ]);
    });

    it("logs error message when lastError exists", () => {
      browser.runtime.lastError = "some runtime error";

      onCreated();

      assert.deepEqual(console.log.calls, [["Error: some runtime error"]]);
    });
  });

  describe("getExtensionInfo", () => {
    it("returns extension info object", () => {
      const info = getExtensionInfo();

      assert.deepEqual(info, {
        id: "close-tab-right-click",
        title: "Close Tab",
        contexts: ["all"],
      });

      assert.deepEqual(browser.i18n.getMessage.calls, [["menuItemClose"]]);
    });
  });

  describe("closeTab", () => {
    it("removes tab and deletes history if with_options.is_history_delete is true", async () => {
      const info = { menuItemId: "close-tab-right-click" };
      const tab = { id: tabId, url: tabUrl };

      browser.storage.local.get = createMock(() =>
        Promise.resolve({
          with_options: { is_history_delete: true },
        }),
      );
      closeTab(info, tab);

      await new Promise((resolve) => setImmediate(resolve));

      assert.deepEqual(browser.tabs.remove.calls, [[tabId]]);
      assert.deepEqual(browser.storage.local.get.calls, [["with_options"]]);
      assert.deepEqual(browser.history.deleteUrl.calls, [[{ url: tabUrl }]]);
    });

    it("removes tab and does not delete history if is_history_delete is false", async () => {
      const info = { menuItemId: "close-tab-right-click" };
      const tab = { id: tabId, url: tabUrl };

      closeTab(info, tab);
      await new Promise((resolve) => setImmediate(resolve));

      assert.deepEqual(browser.tabs.remove.calls, [[tabId]]);
      assert.deepEqual(browser.history.deleteUrl.calls, []);
    });

    it("does nothing if menuItemId does not match", () => {
      const info = { menuItemId: "unrelated-id" };
      const tab = { id: tabId, url: tabUrl };

      closeTab(info, tab);

      assert.deepEqual(browser.tabs.remove.calls, []);
    });
  });
});
