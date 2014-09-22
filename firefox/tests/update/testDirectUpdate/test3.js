/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// Include required modules
var { expect } = require("../../../../lib/assertions");
var softwareUpdate = require("../../../lib/software-update");
var utils = require("../../../lib/utils");

function setupModule(aModule) {
  aModule.controller = mozmill.getBrowserController();
  aModule.update = new softwareUpdate.softwareUpdate();

  // Collect some data of the current build
  persisted.updates[persisted.update.index].build_post = aModule.update.buildInfo;
}

function teardownModule(aModule) {
  // Prepare persisted object for the next update
  persisted.update.updateIndex++;

  // TODO: Revert changes as long as the update script doesn't restore the file
  if (persisted.update.origChannel) {
    aModule.update.defaultChannel = persisted.update.origChannel;
  }

  aModule.controller.stopApplication(true);
}

/**
 * Test that the update has been correctly applied and no further updates
 * can be found.
 */
function testDirectUpdate_AppliedAndNoUpdatesFound() {
  // Open the software update dialog and wait until the check has been finished
  update.openDialog(controller);
  update.waitForCheckFinished();

  // No updates should be offered now - filter out major updates
  if (update.updatesFound) {
    update.download(false);

    var lastUpdateType = persisted.updates[persisted.update.index].type;
    expect.notEqual(update.updateType, lastUpdateType,
                    "No more update of the same type offered.");
  }

  // Check that updates have been applied correctly
  update.assertUpdateApplied(persisted);

  // Check the about dialog
  update.checkAboutDialog(controller);

  // Update was successful
  persisted.updates[persisted.update.index].success = true;
}
