/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Include the required modules
var addons = require("../../../lib/addons");
var endurance = require("../../../lib/endurance");
var tabs = require("../../../lib/tabs");

const BASE_URL = collector.addHttpResource("../../../data/");
const TEST_DATA = BASE_URL + "layout/mozilla.html";

function setupModule() {
  controller = mozmill.getBrowserController();

  enduranceManager = new endurance.EnduranceManager(controller);

  addonsManager = new addons.AddonsManager(controller);
  addons.setDiscoveryPaneURL(TEST_DATA);

  tabBrowser = new tabs.tabBrowser(controller);

  tabBrowser.closeAllTabs();
}

function teardownModule() {
  addons.resetDiscoveryPaneURL();
}

function testOpenAndCloseAddonManager() {
  enduranceManager.run(function () {
    addonsManager.open();
    enduranceManager.addCheckpoint("Add-ons Manager open");
    addonsManager.close();
    enduranceManager.addCheckpoint("Add-ons Manager closed");
  });
}
