/* eslint-env jquery */

require('jquery')

Date.now = Date.now || function () { return +new Date() }

module.exports = function (options) {
  var settings = {
    timeout: 900,
    countdown: 120,
    title: 'You’re about to be signed out',
    message: 'For security reasons, you will be signed out of this service in',
    keep_alive_url: '/keep-alive',
    logout_url: '/sign-out',
    keep_alive_button_text: 'Stay signed in',
    sign_out_button_text: 'Sign out',
    redirector: function (url) {
      // TODO: Look for a sensible way to test redirects
      window.location.href = url
    }
  }

  $.extend(settings, options)

  var TimeoutDialog = {
    init: function () {
      this.setupDialogTimer()
    },

    setupDialogTimer: function () {
      var self = this
      settings.signout_time = Date.now() + settings.timeout * 1000

//       self.dialogOpen = false
      self.timeout = window.setTimeout(function () {
        self.setupDialog()
      }, ((settings.timeout) - (settings.countdown)) * 1000)
    },
//
    setupDialog: function () {
      var self = this
//       window.dialogOpen = true
//       self.startTime = Math.round(Date.now() / 1000, 0)
//       self.currentMin = Math.ceil(settings.timeout / 60)
//       self.destroyDialog()
        $('html').addClass('noScroll')
      $('<div id="timeout-dialog" class="timeout-dialog" role="dialog" aria-labelledby="timeout-message" tabindex=-1 aria-live="polite">' +
        '<h1 class="heading-medium push--top">' + settings.title + '</h1>' +
        '<p id="timeout-message" role="text">' + settings.message + ' <span id="timeout-countdown" class="countdown"></span>' + '.</p>' +
        '<button id="timeout-keep-signin-btn" class="button">' + settings.keep_alive_button_text + '</button>' +
        '<a id="timeout-sign-out-btn" class="link">' + settings.sign_out_button_text + '</a>' +
        '</div>' +
        '<div id="timeout-overlay" class="timeout-overlay"></div>')
        .appendTo('body')

//
//       // AL: disable the non-dialog page to prevent confusion for VoiceOver users
//       $('#skiplink-container, body>header, #global-cookie-message, body>main, body>footer').attr('aria-hidden', 'true')
//
//       var activeElement = document.activeElement
//       var modalFocus = document.getElementById('timeout-dialog')
//       modalFocus.focus()
//       self.addEvents()
      self.startCountdown(settings.countdown)
      self.escPress = function (event) {
        if (event.keyCode === 27) {
          // close the dialog
          self.keepAlive()
//           activeElement.focus()
        }
      }
//
      self.closeDialog = function () {
//         if (window.dialogOpen) {
          self.keepAlive()
//           activeElement.focus()
//         }
      }
//
//       // AL: prevent scrolling on touch, but allow pinch zoom
//       self.handleTouch = function (e) {
//         var touches = e.originalEvent.touches || e.originalEvent.changedTouches
//         if ($('#timeout-dialog').length) {
//           if (touches.length === 1) {
//             e.preventDefault()
//           }
//         }
//       }
//       // AL: add touchmove handler
//       $(document).on('touchmove', self.handleTouch)
      $(document).on('keydown', self.escPress)
      $('#timeout-keep-signin-btn').on('click', self.closeDialog)
      $('#timeout-sign-out-btn').on('click', self.signOut)
    },
//
    destroyDialog: function () {
//       if ($('#timeout-dialog').length) {
//         window.dialogOpen = false
//         $('.timeout-overlay').remove()
        $('#timeout-dialog').remove()
//         if (settings.background_no_scroll) {
          $('html').removeClass('noScroll')
//         }
//       }
//       $('#skiplink-container, body>header, #global-cookie-message, body>main, body>footer').removeAttr('aria-hidden')
    },
//
//     // AL: moved updater to own call to allow calling from other events
    updateUI: function (counter) {
      var self = this
      if (counter < 60) {
//         $('.timeout-dialog').removeAttr('aria-live')
        $('#timeout-countdown').html(counter + ' second' + (counter !== 1 ? 's' : ''))
      } else {
        var newCounter = Math.ceil(counter / 60)
        var minutesMessage = ' minutes'
        if (newCounter === 1) {
          minutesMessage = ' minute'
        }
//         if (newCounter < self.currentMin) {
//           self.currentMin = newCounter
          $('#timeout-countdown').html(newCounter + minutesMessage)
//         }
      }
    },
//
//     addEvents: function () {
//       var self = this
//       // trap focus in modal (or browser chrome)
//       $('a, input, textarea, button, [tabindex]').not('[tabindex="-1"]').on('focus', function (event) {
//         var modalFocus = document.getElementById('timeout-dialog')
//         if (modalFocus && self.dialogOpen) {
//           if (!modalFocus.contains(event.target)) {
//             event.stopPropagation()
//             modalFocus.focus()
//           }
//         }
//       })
//
//       function handleFocus () {
//         if (self.dialogOpen) {
//           // clear the countdown
//           window.clearInterval(self.countdown)
//           // calculate remaining time
//           var expiredSeconds = (Math.round(Date.now() / 1000, 0)) - self.startTime
//           var currentCounter = settings.countdown - expiredSeconds
//           self.updateUI(currentCounter)
//           self.startCountdown(currentCounter)
//         }
//       }
//
//       // AL: handle browsers pausing timeouts/intervals by recalculating the remaining time on window focus
//       // need to widen this to cover the setTimeout which triggers the dialog for browsers which pause timers on blur
//       // hiding this from IE8 and it breaks the reset - to investigate further
//       if (navigator.userAgent.match(/MSIE 8/) == null) {
//         // $(window).on("blur", function(){
//         $(window).off('focus', handleFocus)
//         $(window).on('focus', handleFocus)
//         // });
//       }
//     },
//
    startCountdown: function () {
      function recalculateCount() {
        return Math.floor((settings.signout_time - Date.now()) / 1000)
      }

      var self = this
      self.updateUI(recalculateCount())
      self.countdown = window.setInterval(function () {
        var counter = recalculateCount()
        self.updateUI(counter)
        if (counter <= 0) {
          self.signOut()
        }
      }, 1000)
    },
//
    keepAlive: function () {
//       var self = this
      this.cleanup()
      this.setupDialogTimer()
      $.get(settings.keep_alive_url, function () {
//         if (settings.restart_on_yes) {
//           self.setupDialogTimer()
//         } else {
//           self.signOut()
//         }
      })
    },

    signOut: function () {
      settings.redirector(settings.logout_url)
    },
    cleanup: function () {
      if (TimeoutDialog.timeout) {
        window.clearTimeout(TimeoutDialog.timeout)
      }
      $(document).off('keydown', self.escPress)
      if (TimeoutDialog.countdown) {
        window.clearInterval(TimeoutDialog.countdown)
      }
      TimeoutDialog.destroyDialog()
    }
  }

  TimeoutDialog.init()
  return {cleanup: TimeoutDialog.cleanup}
}
