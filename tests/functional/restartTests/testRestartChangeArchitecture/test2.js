/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

Cu.import("resource://gre/modules/Services.jsm");

// Include required modules
var {expect} = require("../../../../lib/assertions");

function setupModule(module) {
  controller = mozmill.getBrowserController();
}

/**
 * Verify that we're in 64 bit mode
 */
function testRestartedNormally() {
  expect.equal(Services.appinfo.XPCOMABI, "x86_64-gcc3",
               "After a restart the application still launches in 64bit mode");
}

/**
 * Restart in 32 bit mode
 */
function teardownTest() {
  controller.startUserShutdown(4000, true);

  Services.startup.quit(Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart |
                        Ci.nsIAppStartup.eRestarti386);
}


if (persisted.skipTests)
  setupModule.__force_skip__ = "Architecture changes only supported on OSX 10.6";
