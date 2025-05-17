const {
  onCreated,
  getExtensionInfo,
  closeTab,
} = require("../src/close-tab-right-click");

describe("close-tab-right-click.js", () => {
  const tabId = 123;
  const tabUrl = "https://example.com";

  beforeEach(() => {
    global.browser = {
      runtime: {
        lastError: null,
      },
      i18n: {
        getMessage: jest.fn(),
      },
      tabs: {
        remove: jest.fn(),
      },
      storage: {
        local: {
          get: jest.fn(),
        },
      },
      history: {
        deleteUrl: jest.fn(),
      },
    };
    jest.clearAllMocks();
  });

  describe("onCreated", () => {
    test("logs success message when no error", () => {
      console.log = jest.fn();
      browser.runtime.lastError = null;

      onCreated();

      expect(console.log).toHaveBeenCalledWith(
        "close-tab-right-click item created successfully",
      );
    });

    test("logs error message when lastError exists", () => {
      console.log = jest.fn();
      browser.runtime.lastError = "some runtime error";

      onCreated();

      expect(console.log).toHaveBeenCalledWith("Error: some runtime error");
    });
  });

  describe("getExtensionInfo", () => {
    test("returns extension info object", () => {
      browser.i18n.getMessage.mockReturnValue("Close Tab");

      const info = getExtensionInfo();

      expect(info).toEqual({
        id: "close-tab-right-click",
        title: "Close Tab",
        contexts: ["all"],
      });

      expect(browser.i18n.getMessage).toHaveBeenCalledWith("menuItemClose");
    });
  });

  describe("closeTab", () => {
    test("removes tab and deletes history if with_options.is_history_delete is true", async () => {
      const info = { menuItemId: "close-tab-right-click" };
      const tab = { id: tabId, url: tabUrl };

      const deleteUrlMock = jest.fn().mockResolvedValue();
      const getMock = jest.fn().mockResolvedValue({
        with_options: { is_history_delete: true },
      });

      browser.tabs.remove.mockResolvedValue();
      browser.storage.local.get = getMock;
      browser.history.deleteUrl = deleteUrlMock;

      await closeTab(info, tab);

      // flush nested promises
      await new Promise(process.nextTick);

      expect(browser.tabs.remove).toHaveBeenCalledWith(tabId);
      expect(browser.storage.local.get).toHaveBeenCalledWith("with_options");
      expect(browser.history.deleteUrl).toHaveBeenCalledWith({ url: tabUrl });
    });

    test("removes tab and does not delete history if is_history_delete is false", async () => {
      const info = { menuItemId: "close-tab-right-click" };
      const tab = { id: tabId, url: tabUrl };

      browser.tabs.remove.mockResolvedValue();
      browser.storage.local.get.mockResolvedValue({
        with_options: { is_history_delete: false },
      });

      await closeTab(info, tab);

      expect(browser.tabs.remove).toHaveBeenCalledWith(tabId);
      expect(browser.history.deleteUrl).not.toHaveBeenCalled();
    });

    test("does nothing if menuItemId does not match", async () => {
      const info = { menuItemId: "unrelated-id" };
      const tab = { id: tabId, url: tabUrl };

      await closeTab(info, tab);

      expect(browser.tabs.remove).not.toHaveBeenCalled();
    });
  });
});
