"use strict";

$(document).ready(function () {
  /*-----------------------------------------------
  |   Utilities
  -----------------------------------------------*/
  var isScrolledIntoView = function isScrolledIntoView(element) {
    var $el = $(element);
    var windowHeight = $(window).height();
    var elemTop = $el.offset().top;
    var elemHeight = $el.height();
    var windowScrollTop = $(window).scrollTop();
    return elemTop <= windowScrollTop + windowHeight && windowScrollTop <= elemTop + elemHeight;
  };

  var toAlphanumeric = function toAlphanumeric(num) {
    var number = num;
    var abbreviations = {
      k: 1000,
      m: 1000000,
      b: 1000000000,
      t: 1000000000000
    };

    if (num < abbreviations.m) {
      number = parseFloat((num / abbreviations.k).toFixed(2)).toString() + "k";
    } else if (num < abbreviations.b) {
      number = parseFloat((num / abbreviations.m).toFixed(2)).toString() + "m";
    } else if (num < abbreviations.t) {
      number = parseFloat((num / abbreviations.b).toFixed(2)).toString() + "b";
    } else {
      number = parseFloat((num / abbreviations.t).toFixed(2)).toString() + "t";
    }

    return number;
  };

  var toComma = function toComma(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  var toSpace = function toSpace(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  var getFormattedNumber = function getFormattedNumber(countNum, format) {
    var formattedNumber = void 0;

    switch (format) {
      case 'comma':
        formattedNumber = toComma(Math.round(countNum));
        break;

      case 'space':
        formattedNumber = toSpace(Math.round(countNum));
        break;

      case 'alphanumeric':
        formattedNumber = toAlphanumeric(Math.round(countNum));
        break;

      default:
        formattedNumber = Math.round(countNum);
    }

    return formattedNumber;
  };

  var setText = function setText(element, countNum, format, prefix, suffix) {
    return element.text("" + prefix + getFormattedNumber(countNum, format) + suffix);
  };
  /*-----------------------------------------------
  |   Count Up
  -----------------------------------------------*/


  var $counters = $('[data-countup]');

  if ($counters.length) {
    $counters.each(function (index, value) {
      var $counter = $(value);
      var counter = $counter.data('countup');
      var playCountUpTriggered = false;

      var countUP = function countUP() {
        var option = $.extend({
          count: 0,
          prefix: '',
          suffix: '',
          duration: 1000,
          delay: 0
        }, counter);
        var count = option.count,
            format = option.format,
            prefix = option.prefix,
            suffix = option.suffix,
            duration = option.duration,
            delay = option.delay;

        if (isScrolledIntoView(value) && !playCountUpTriggered) {
          if (!playCountUpTriggered) {
            setTimeout(function () {
              $({
                countNum: 0
              }).animate({
                countNum: count
              }, {
                duration: duration,
                easing: 'linear',
                step: function step() {
                  setText($counter, this.countNum, format, prefix, suffix);
                },
                complete: function complete() {
                  setText($counter, this.countNum, format, prefix, suffix);
                }
              });
              playCountUpTriggered = true;
            }, delay * 1000);
          }
        }

        return playCountUpTriggered;
      };

      countUP();
      $(window).scroll(function () {
        countUP();
      });
    });
  }
});