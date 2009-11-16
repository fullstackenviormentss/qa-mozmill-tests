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
 * The Initial Developer of the Original Code is Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
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
 * ***** END LICENSE BLOCK ***** */

/**
 * Litmus test #7972: Install an extension
 */

// Include necessary modules
var RELATIVE_ROOT = '../../../shared-modules';
var MODULE_REQUIRES = ['ModalDialogAPI', 'UtilsAPI'];

const gTimeout = 5000;

var setupModule = function(module) {
  module.controller = mozmill.getBrowserController();
  module.addonsController = mozmill.getAddonsController();

  UtilsAPI.closeAllTabs(controller);
  module.persisted.extensionName = "Adblock Plus";
  module.persisted.extensionId = "{d10d0bf8-f5b5-c8b4-a8b2-2b9879e08c5d}";
}

var testInstallExtension = function() {
  // Make sure the Get Add-ons pane is visible
  var getAddonsPane = new elementslib.ID(addonsController.window.document, "search-view");
  addonsController.waitThenClick(getAddonsPane, gTimeout);

  // Wait for the Browse All Add-ons link and click on it
  var browseAddonsLink = new elementslib.ID(addonsController.window.document, "browseAddons");
  addonsController.waitThenClick(browseAddonsLink, gTimeout);

  // The target web page is loaded lazily so wait for the newly created tab first
  controller.waitForEval("subject.length == 2", gTimeout, 100, controller.tabs);
  controller.waitForPageLoad();

  // To avoid a broken test lets install Adblock directly
  controller.open("https://addons.mozilla.org/de/firefox/addon/1865");
  controller.waitForPageLoad();

  // Create a modal dialog instance to handle the Software Installation dialog
  var md = new ModalDialogAPI.modalDialog(handleTriggerDialog);
  md.start();

  // Click the link to install the extension
  var triggerLink = new elementslib.XPath(controller.tabs.activeTab, "/html/body[@id='mozilla-com']/div/div[@id='addon']/div/div/div[@id='addon-summary-wrapper']/div[@id='addon-summary']/div[@id='addon-install']/div[1]/p/a/span");
  controller.waitForElement(triggerLink, gTimeout);
  controller.click(triggerLink, triggerLink.getNode().width / 2, triggerLink.getNode().height / 2);

  // Wait that the Installation pane is selected in the Add-ons Manager after the extension has been installed
  var installPane = new elementslib.ID(addonsController.window.document, "installs-view");
  addonsController.waitForEval("subject.selected == true", 10000, 100, installPane.getNode());

  // Check if the installed extension is visible in the Add-ons Manager
  var extension = new elementslib.Lookup(addonsController.window.document, '/id("extensionsManager")/id("addonsMsg")/id("extensionsBox")/[1]/id("extensionsView")/id("urn:mozilla:item:' + persisted.extensionId + '")/anon({"flex":"1"})/[0]/[1]/{"class":"addon-name-version","xbl:inherits":"name, version=newVersion"}/anon({"value":"' + persisted.extensionName + '"})');
  addonsController.waitForElement(extension, gTimeout);

  // Check if restart button is present
  var restartButton = new elementslib.XPath(addonsController.window.document, "/*[name()='window']/*[name()='notificationbox'][1]/*[name()='notification'][1]/*[name()='button'][1]");
  addonsController.waitForElement(restartButton, gTimeout);
}

/**
 * Handle the Software Installation dialog
 */
var handleTriggerDialog = function(controller) {
  // Get list of extensions which should be installed
  var itemElem = controller.window.document.getElementById("itemList");
  var itemList = new elementslib.Elem(controller.window.document, itemElem);
  controller.waitForElement(itemList, gTimeout);

  // There should be listed only one extension
  if (itemElem.childNodes.length != 1) {
    throw "Expected one extension for installation";
  }

  // Check if the extension name is shown
  if (itemElem.childNodes[0].name != persisted.extensionName) {
    throw "Visible extension name doesn't match target extension";
  }

  // Will the extension be installed from https://addons.mozilla.org/?
  if (itemElem.childNodes[0].url.indexOf("https://addons.mozilla.org/") == -1) {
    throw "Extension location doesn't contain https://addons.mozilla.org/";
  }

  // Check if the Cancel button is present
  var cancelButton = new elementslib.Lookup(controller.window.document, '/id("xpinstallConfirm")/anon({"anonid":"buttons"})/{"dlgtype":"cancel"}');
  controller.assertNode(cancelButton);

  // Wait for the install button is enabled before clicking on it
  var installButton = new elementslib.Lookup(controller.window.document, '/id("xpinstallConfirm")/anon({"anonid":"buttons"})/{"dlgtype":"accept"}');
  controller.waitForEval("subject.disabled != true", 7000, 100, installButton.getNode());
  controller.click(installButton);
}
