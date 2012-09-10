/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var {assert} = require("../../../../../../lib/assertions");
var checks = require("../../../lib/checks");
var selenium = require("../../../lib/selenium");
var tabs = require("../../../../../../lib/tabs");

function setupModule(module) {
  controller = mozmill.getBrowserController();

  sm = new selenium.SeleniumManager();
  sm.open(controller);

  tabs.closeAllTabs(controller);
  controller.open("chrome://selenium-ide/content/tests/functional/aut/alert.html");
  controller.waitForPageLoad();
}

function teardownModule(module) {
  sm.close();
}

function testAssertNotAlertCommandFails() {
  sm.addCommand({action: "click",
                target: "link=show alert"});
  sm.addCommand({action: "assertNotAlert",
                target: "hello"});
  sm.addCommand({action: "echo",
                target: "final command"});
  sm.playTest();

  checks.commandFailed(sm, "Actual value 'hello' did match 'hello'");

  //check final command is not executed
  assert.notEqual(sm.finalLogInfoMessage, "echo: final command");
}
