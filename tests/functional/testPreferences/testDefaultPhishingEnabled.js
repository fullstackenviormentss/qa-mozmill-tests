/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Include necessary modules
var { assert } = require("../../../lib/assertions");
var prefs = require("../../../lib/prefs");

const gDelay = 0;
const gTimeout = 5000;

var setupModule = function(module) {
  module.controller = mozmill.getBrowserController();
}

/**
 * Verify phishing detection is enabled
 */
var testDefaultPhishingEnabled = function() {
  prefs.openPreferencesDialog(controller, prefPaneSetCallback);
}

/**
 * Check that phishing checkboxes are enabled
 *
 * @param {MozMillController} controller
 *        MozMillController of the window to operate on
 */
var prefPaneSetCallback = function(controller) {
  var prefDialog = new prefs.preferencesDialog(controller);
  prefDialog.paneId = 'paneSecurity';

  // Check if the Security pane is active
  var attackElem = new elementslib.ID(controller.window.document, "blockAttackSites");
  var forgeryElem = new elementslib.ID(controller.window.document, "blockWebForgeries");

  // Verify Block Attack Sites and Reported Web Forgeries are checked by default
  controller.waitForElement(attackElem, gTimeout);
  assert.ok(attackElem.getNode().checked, "Block Attack Sites checkbox is checked");
  assert.ok(forgeryElem.getNode().checked, "Reported Web Forgeries checkbox is checked");

  prefDialog.close();
}

