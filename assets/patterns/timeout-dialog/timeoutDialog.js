/* eslint-env jquery */

require('jquery')
var dialog = require('./dialog.js')
var redirectHelper = require('./redirectHelper.js')

Date.now = Date.now || function () {
  return +new Date()
}

module.exports = function (options) {
  var settings = {
    timeout: 900,
    countdown: 120,
    title: 'You’re about to be signed out',
    message: 'For security reasons, you will be signed out of this service in',
    keep_alive_url: '/keep-alive',
    logout_url: '/sign-out',
    keep_alive_button_text: 'Stay signed in',
    sign_out_button_text: 'Sign out'
  }

  $.extend(settings, options)

  var dialogControl
  var TimeoutDialog = {
    init: function () {
      this.setupDialogTimer()
    },

    setupDialogTimer: function () {
      var self = this
      settings.signout_time = Date.now() + settings.timeout * 1000
      self.timeout = window.setTimeout(function () {
        self.setupDialog()
      }, ((settings.timeout) - (settings.countdown)) * 1000)
    },

    setupDialog: function () {
      var self = this
      var $element = $('<div id="timeout-dialog" class="timeout-dialog" role="dialog" aria-labelledby="timeout-message" tabindex=-1 aria-live="polite">' +
        '<h1 class="heading-medium push--top">' + settings.title + '</h1>' +
        '<p id="timeout-message" role="text">' + settings.message + ' <span id="timeout-countdown" class="countdown"></span>' + '.</p>' +
        '<button id="timeout-keep-signin-btn" class="button">' + settings.keep_alive_button_text + '</button>' +
        '<a id="timeout-sign-out-btn" class="link">' + settings.sign_out_button_text + '</a>' +
        '</div>' +
        '<div id="timeout-overlay" class="timeout-overlay"></div>')

      var close = self.keepAliveAndClose.bind(self)
      $element.find('#timeout-keep-signin-btn').on('click', close)
      $element.find('#timeout-sign-out-btn').on('click', self.signOut)

      dialogControl = dialog.displayDialog($element, close)

      self.startCountdown($element.find('#timeout-countdown'))
      self.escPress = function (event) {
        if (event.keyCode === 27) {
          self.keepAliveAndClose()
        }
      }

    },

    destroyDialog: function () {
      if (dialogControl) {
        dialogControl.closeDialog()
      }
    },

    updateCountdown: function (counter, $countdownElement) {
      if (counter < 60) {
        $countdownElement.html(counter + ' second' + (counter !== 1 ? 's' : ''))
      } else {
        var newCounter = Math.ceil(counter / 60)
        var minutesMessage = ' minutes'
        if (newCounter === 1) {
          minutesMessage = ' minute'
        }
        $countdownElement.html(newCounter + minutesMessage)
      }
    },

    startCountdown: function ($countdownElement) {
      function recalculateCount() {
        return Math.floor((settings.signout_time - Date.now()) / 1000)
      }

      var self = this
      self.updateCountdown(recalculateCount(), $countdownElement)
      self.countdown = window.setInterval(function () {
        var counter = recalculateCount()
        self.updateCountdown(counter, $countdownElement)
        if (counter <= 0) {
          self.signOut()
        }
      }, 1000)
    },

    keepAliveAndClose: function () {
      this.cleanup()
      this.setupDialogTimer()
      $.get(settings.keep_alive_url, function () {
      })
    },

    signOut: function () {
      redirectHelper.redirectToUrl(settings.logout_url)
    },
    cleanup: function () {
      if (TimeoutDialog.timeout) {
        window.clearTimeout(TimeoutDialog.timeout)
      }
      if (TimeoutDialog.countdown) {
        window.clearInterval(TimeoutDialog.countdown)
      }
      TimeoutDialog.destroyDialog()
    }
  }

  TimeoutDialog.init()
  return {cleanup: TimeoutDialog.cleanup}
}
