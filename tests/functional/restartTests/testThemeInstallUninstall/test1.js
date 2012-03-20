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
 * The Initial Developer of the Original Code is the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Henrik Skupin <hskupin@mozilla.com>
 *   Aaron Train <atrain@mozilla.com>
 *   Alex Lakatos <alex.lakatos@softvision.ro>
 *   Remus Pop <remus.pop@softvision.ro>
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

// Include required modules
var addons = require("../../../../lib/addons");
var modalDialog = require("../../../../lib/modal-dialog");
var tabs = require("../../../../lib/tabs");

const LOCAL_TEST_FOLDER = collector.addHttpResource('../../../../data/');

const TIMEOUT = 5000;
const TIMEOUT_INSTALL_DIALOG = 30000;
const TIMEOUT_INSTALLATION = 30000;

var setupModule = function(module) {
  controller = mozmill.getBrowserController();
  addonsManager = new addons.addonsManager();

  persisted.themeName = "Theme (Plain)";
  persisted.themeId = "plain.theme@quality.mozilla.org";
  persisted.defaultThemeId = "{972ce4c6-7e08-4474-a285-3208198ce6fd}";
  persisted.themeURL = LOCAL_TEST_FOLDER + "/addons/install.html?addon=/themes/plain.jar";

  // Whitelist add the localhost
  addons.addToWhiteList(LOCAL_TEST_FOLDER);

  tabs.closeAllTabs(controller);
}

/*
 * Tests theme installation
 */
var testInstallTheme = function()
{
  addonsManager.open(controller);
  addonsManager.paneId = "search";

  // Open the web page for the Theme (Plain)
  controller.open(persisted.themeURL);
  controller.waitForPageLoad();

  // Create a modal dialog instance to handle the Software Installation dialog
  var md = new modalDialog.modalDialog(controller.window);
  md.start(handleTriggerDialog);

  // Click link to install the theme which triggers a modal dialog
  var installLink = new elementslib.ID(controller.tabs.activeTab, "addon");
  controller.waitThenClick(installLink, TIMEOUT);
  md.waitForDialog(TIMEOUT_INSTALL_DIALOG);

  // Wait that the Installation pane is selected after the extension has been installed
  addonsManager.controller.waitFor(function () {
    return addonsManager.paneId === 'installs';
  }, "Installation pane has been selected");

  // Wait until the Theme has been installed.
  var theme = addonsManager.getListboxItem("addonID", persisted.themeId);
  addonsManager.controller.waitForElement(theme, TIMEOUT_INSTALLATION);

  var themeName = theme.getNode().getAttribute('name');
  addonsManager.controller.assertJS("subject.isValidThemeName == true",
                                    {isValidThemeName: themeName == persisted.themeName});

  addonsManager.controller.assertJS("subject.isThemeInstalled == true",
                                    {isThemeInstalled: theme.getNode().getAttribute('state') == 'success'});

  // Check if restart button is present
  var restartButton = addonsManager.getElement({type: "notificationBar_buttonRestart"});
  addonsManager.controller.waitForElement(restartButton, TIMEOUT);
}

/**
 * Handle the Software Installation dialog
 */
var handleTriggerDialog = function(controller)
{
  // Get list of themes which should be installed
  var itemElem = controller.window.document.getElementById("itemList");
  var itemList = new elementslib.Elem(controller.window.document, itemElem);
  controller.waitForElement(itemList, TIMEOUT);

  // There should be one theme for installation
  controller.assertJS("subject.themes.length == 1",
                      {themes: itemElem.childNodes});

  // Will the theme be installed from the original domain
  controller.assertJS("subject.url.indexOf('" + LOCAL_TEST_FOLDER + "') != -1",
                      itemElem.childNodes[0]);

  // Check if the correct theme name is shown
  // XXX: Foo must be used here because it is given by the install.html
  controller.assertJS("subject.name == '" + "Foo" + "'",
                      itemElem.childNodes[0]);

  // Check if the Cancel button is present
  var cancelButton = new elementslib.Lookup(controller.window.document,
                                            '/id("xpinstallConfirm")/anon({"anonid":"buttons"})/{"dlgtype":"cancel"}');
  controller.assertNode(cancelButton);

  // Wait for the install button is enabled before clicking on it
  var installButton = new elementslib.Lookup(controller.window.document,
                                             '/id("xpinstallConfirm")/anon({"anonid":"buttons"})/{"dlgtype":"accept"}');
  controller.waitFor(function () {
    return !installButton.getNode().disabled;
  }, "Install button has been enabled", undefined, 100);
  controller.click(installButton);
}