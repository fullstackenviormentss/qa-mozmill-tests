/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is MozMill Test code.
 *
 * The Initial Developer of the Original Code is Mozilla Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Anthony Hughes <ahughes@mozilla.com>
 *   Henrik Skupin <hskupin@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * **** END LICENSE BLOCK ***** */

// Include necessary modules
var modalDialog = require("../../shared-modules/testModalDialogAPI");
var prefs = require("../../shared-modules/testPrefsAPI");
var tabs = require("../../shared-modules/testTabbedBrowsingAPI");
var utils = require("../../shared-modules/testUtilsAPI");

const gDelay = 0;
const gTimeout = 5000;

var gPreferences = new Array("security.warn_entering_secure",
                             "security.warn_entering_weak",
                             "security.warn_leaving_secure",
                             "security.warn_submit_insecure",
                             "security.warn_viewing_mixed");

var setupModule = function(module) {
  controller = mozmill.getBrowserController();
  tabs.closeAllTabs(controller);

  persisted.modalWarningShown = false;
}

var teardownModule = function(module)
{
  for each (p in gPreferences)
    prefs.preferences.clearUserPref(p);

  persisted = {}
}

/**
 * Test warning about submitting unencrypted information
 */
var testSubmitUnencryptedInfoWarning = function() {
  // Enable the 'warn_submit_insecure' pref only
  for (var i = 0; i < gPreferences.length; i++)
    prefs.preferences.setPref(gPreferences[i], (i == 3));

  // Create a listener for the warning dialog
  var md = new modalDialog.modalDialog(handleSecurityWarningDialog);
  md.start();

  // Load an unencrypted page
  controller.open("http://www.verisign.com");
  controller.waitForPageLoad();

  // Get the web page's search box
  var searchbox = new elementslib.ID(controller.tabs.activeTab, "s");
  controller.waitForElement(searchbox, gTimeout);

  // Use the web page search box to submit information
  controller.type(searchbox, "mozilla");
  controller.keypress(searchbox, "VK_RETURN", {});

  // Prevent the test from ending before the warning can appear
  controller.waitForPageLoad();

  // Check that the search field is not shown anymore
  controller.assertNodeNotExist(searchbox);

  // Test if the modal dialog has been shown
  controller.assertJS("subject.isModalWarningShown == true",
                      {isModalWarningShown: persisted.modalWarningShown});
}

/**
 * Helper function to handle interaction with the Security Warning modal dialog
 *
 * @param {MozMillController} controller
 *        MozMillController of the window to operate on
 */
var handleSecurityWarningDialog = function(controller) {
  persisted.modalWarningShown = true;

  // Get the message text
  var message = utils.getProperty("chrome://pipnss/locale/security.properties",
                                  "PostToInsecureFromInsecureMessage");

  // Wait for the content to load
  var infoBody = new elementslib.ID(controller.window.document, "info.body");
  controller.waitForElement(infoBody, gTimeout);

  // The message string contains "##" instead of \n for newlines.
  // There are two instances in the string. Replace them both.
  message = message.replace(/##/g, "\n\n");

  // Verify the message text
  controller.assertJSProperty(infoBody, "textContent", message);

  // Verify the "Alert me whenever" checkbox is checked by default
  var checkbox = new elementslib.ID(controller.window.document, "checkbox");
  controller.assertChecked(checkbox);

  // Click the OK button
  var okButton = new elementslib.Lookup(controller.window.document,
                                        '/id("commonDialog")' +
                                        '/anon({"anonid":"buttons"})' +
                                        '/{"dlgtype":"accept"}');
  controller.click(okButton);
}

/**
 * Map test functions to litmus tests
 */
// testSubmitUnencryptedInfoWarning.meta = {litmusids : [9295]};
