/* eslint-env jasmine, jquery */
/* global loadFixtures */

/**
 * Timeout Dialog tests
 */

require('jquery')
require('../../components/index.js')


describe('Timeout Dialog', function () {
  var ESCAPE_KEY_CODE = 27
  var timeoutDialogControl

  function pretendSecondsHavePassed(numberOfSeconds) {
    jasmine.clock().tick(numberOfSeconds * 10)
  }

  beforeEach(function () {
    jasmine.getFixtures().fixturesPath = 'base/patterns/timeout-dialog'
    loadFixtures('timeout-dialog.html')
    jasmine.clock().install()
  })

  afterEach(function () {
    if (timeoutDialogControl && timeoutDialogControl.cleanup) {
      timeoutDialogControl.cleanup();
    }
    delete timeoutDialogControl
    jasmine.clock().uninstall()
    jasmine.getFixtures().cleanUp()
  })

  describe('with custom settings', function () {
    it('should start countdown at 2.5 minutes', function () {
      timeoutDialogControl = window.govuk.timeoutDialog({timeout: 300, count: 30})

      pretendSecondsHavePassed(269)

      expect($('#timeout-dialog')).not.toBeInDOM()

      pretendSecondsHavePassed(1)

      expect($('#timeout-dialog')).toBeInDOM()
    })
  })
  describe('with default settings', function () {
    it('should start countdown at 13 minutes', function () {
      timeoutDialogControl = window.govuk.timeoutDialog()

      pretendSecondsHavePassed(779)

      expect($('#timeout-dialog')).not.toBeInDOM()

      pretendSecondsHavePassed(1)

      expect($('#timeout-dialog')).toBeInDOM()
    })
  })

  describe('the default options', function () {
    beforeEach(function () {
      timeoutDialogControl = window.govuk.timeoutDialog()
      pretendSecondsHavePassed(780)
    })
    it('should show heading', function () {
      expect($('#timeout-dialog h1')).toContainText('You’re about to be signed out')
    })

    it('should show message', function () {
      expect($('#timeout-dialog #timeout-message').text()).toEqual('For security reasons, you will be signed out of this service in 2 minutes')
    })

    it('should show keep signed in button', function () {
      expect($('#timeout-dialog #timeout-keep-signin-btn').text()).toEqual('Stay signed in')
    })

    it('should show sign out button', function () {
      expect($('#timeout-dialog #timeout-sign-out-btn').text()).toEqual('Sign out')
    })
    it('should hide when escape is pressed', function () {
      var esc = $.Event('keydown', {keyCode: ESCAPE_KEY_CODE})
      $('#timeout-dialog').trigger(esc)
      expect($('#timeout-dialog')).not.toBeInDOM()
    })
    it('should not hide when everything other than the escape key is pressed', function () {
      var keyCode = 256
      while (keyCode >= 0) {
        keyCode--
        if (keyCode !== ESCAPE_KEY_CODE) {
          $('#timeout-dialog').trigger($.Event('keydown', {keyCode: keyCode}))
        }
      }
      expect($('#timeout-dialog')).toBeInDOM()
    })
    it('should be attached to the end of the body', function () {
      expect($('body').children().last().attr('id')).toEqual('timeout-dialog')
    })
  })
  describe('the configuration options', function () {
    beforeEach(function () {
      timeoutDialogControl = window.govuk.timeoutDialog({
        title: 'my custom TITLE',
        message: 'MY custom message',
        keep_alive_button_text: 'KEEP alive',
        sign_out_button_text: 'sign OUT'
      })
      pretendSecondsHavePassed(780)
    })
    it('should show heading', function () {
      expect($('#timeout-dialog h1')).toContainText('my custom TITLE')
    })

    it('should show message', function () {
      expect($('#timeout-dialog #timeout-message').text()).toEqual('MY custom message')
    })

    it('should show keep signed in button', function () {
      expect($('#timeout-dialog #timeout-keep-signin-btn').text()).toEqual('KEEP alive')
    })

    it('should show sign out button', function () {
      expect($('#timeout-dialog #timeout-sign-out-btn').text()).toEqual('sign OUT')
    })
  })
  describe('Using the legacy interface', function () {
    beforeEach(function () {
      spyOn(window.govuk, 'timeoutDialog')
    })
    it('should log a deprecation warning', function () {
      spyOn(window.console, 'warn')

      $.timeoutDialog();

      expect(window.console.warn).toHaveBeenCalledWith('$.timeout is now deprecated, please use window.govuk.timeoutDialog')
    })
    it('should provide legacy defaults when no config object is provided', function () {
      $.timeoutDialog();

      expect(window.govuk.timeoutDialog).toHaveBeenCalledWith({
        timeout: 900,
        count: 120,
        keep_alive_url: '/keep-alive',
        logout_url: '/sign-out'
      });
    })
    it('should override legacy defaults with specified config', function () {
      var config = {
        timeout: 100,
        count: 50,
        keep_alive_url: '/hello-world',
        logout_url: '/goodbye-world'
      }

      $.timeoutDialog(config);

      expect(window.govuk.timeoutDialog).toHaveBeenCalledWith(config);
    })
  })
  describe('Cleanup', function () {
    var MINIMUM_TIME_UNTIL_MODAL_DISPLAYED = 10;
    beforeEach(function () {
      timeoutDialogControl = window.govuk.timeoutDialog({timeout: 130, count: 120})
    })
    it('should not display the dialog if cleanup has already been called', function () {
      timeoutDialogControl.cleanup()
      pretendSecondsHavePassed(MINIMUM_TIME_UNTIL_MODAL_DISPLAYED)
      expect($('#timeout-dialog')).not.toBeInDOM()
    })
    it('should remove dialog when cleanup is called', function () {
      pretendSecondsHavePassed(MINIMUM_TIME_UNTIL_MODAL_DISPLAYED)
      expect($('#timeout-dialog')).toBeInDOM()
      timeoutDialogControl.cleanup()
      expect($('#timeout-dialog')).not.toBeInDOM()
    })
  })
})
