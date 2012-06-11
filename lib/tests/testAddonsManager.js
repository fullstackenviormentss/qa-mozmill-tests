/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Include required modules
var addons = require("../addons");

const TIMEOUT = 5000;

const MOZMILL = {
  name : "MozMill",
  id : "mozmill@mozilla.com"
};

const SEARCH_ADDON = {
  name : "MozMill Crowd",
  id : "mozmill-crowd@quality.mozilla.org"
}


function setupModule() {
  controller = mozmill.getBrowserController();

  am = new addons.AddonsManager(controller);
}

function testAddonsAPI() {
  am.open({type: "shortcut"});

  // Switch to the extension pane
  var category = am.getCategoryById({id: "extension"});
  am.setCategory({category: category});

  var addonsList = am.getElement({type: "addonsList"});
  controller.assertJSProperty(addonsList, "localName", "richlistbox");

  // Check some properties of the Mozmill extension
  var addon = am.getAddons({attribute: "value", value: MOZMILL.id})[0];
  controller.assertDOMProperty(addon, "name", MOZMILL.name);
  controller.assertDOMProperty(addon, "type", "extension");

  // Disable Mozmill in the list view and re-enable it in the details view
  am.disableAddon({addon: addon});
  controller.click(am.getAddonLink({addon: addon, link: "more"}));
  am.enableAddon({addon: addon});

  // Disable automatic updates (Doesn't work at the moment)
  var updateCheck = am.getAddonRadiogroup({addon: addon, radiogroup: "findUpdates"});

  // Open recent updates via utils button
  var recentUpdates = am.getCategoryById({id: "recentUpdates"});
  am.waitForCategory({category: recentUpdates}, function () {
    am.handleUtilsButton({item: "viewUpdates"});
  });

  // The search result for Mozmill Crowd has to show the remote pane per default
  am.search({value: SEARCH_ADDON.name});
  controller.assert(function() {
    return am.getSearchFilterValue({filter: am.selectedSearchFilter}) === "remote";
  }, "The remote search filter is active per default.");
  controller.assert(function() {
    return am.getSearchResults().length === 1;
  }, "One result has to be shown with the remote filter active.");

  am.selectedSearchFilter = "local";
  controller.assert(function() {
    return am.getSearchFilterValue({filter: am.selectedSearchFilter}) === "local";
  }, "The local search filter is active.");

  // Mozmill should be marked as installed
  controller.assert(function() {
    return am.isAddonInstalled({addon: addon});
  }, "MozMill is marked as being installed");

  // Get first search result and check it is not installed
  addon = am.getAddons()[0];
  controller.assert(function() {
    return !am.isAddonInstalled({addon: addon});
  }, "First search result is marked as not being installed");

  // Install the first search result and undo the action immediately
  // TODO: Needs update to support installation of addons in the search view
  //am.installAddon({addon: addon});
  //am.undo({addon: addon});

  am.close();
}