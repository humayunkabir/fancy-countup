$(document).ready(() => {
  /*-----------------------------------------------
  |   Utilities
  -----------------------------------------------*/
  const isScrolledIntoView = element => {
    const $el = $(element);
    const windowHeight = $(window).height();
    const elemTop = $el.offset().top;
    const elemHeight = $el.height();
    const windowScrollTop = $(window).scrollTop();

    return elemTop <= (windowScrollTop + windowHeight) && windowScrollTop <= (elemTop + elemHeight);
  };

  const toAlphanumeric = (num) => {
    let number = num;
    const abbreviations = {
      k: 1000,
      m: 1000000,
      b: 1000000000,
      t: 1000000000000,
    };
    if (num < abbreviations.m) {
      number = `${parseFloat((num / abbreviations.k).toFixed(2)).toString()}k`;
    } else if (num < abbreviations.b) {
      number = `${parseFloat((num / abbreviations.m).toFixed(2)).toString()}m`;
    } else if (num < abbreviations.t) {
      number = `${parseFloat((num / abbreviations.b).toFixed(2)).toString()}b`;
    } else {
      number = `${parseFloat((num / abbreviations.t).toFixed(2)).toString()}t`;
    }
    return number;
  };
  const toComma = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const toSpace = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const getFormattedNumber = (countNum, format) => {
    let formattedNumber;
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

  const setText = (element, countNum, format, prefix, suffix) => element.text(`${prefix}${getFormattedNumber(countNum, format)}${suffix}`);


  /*-----------------------------------------------
  |   Count Up
  -----------------------------------------------*/
  const $counters = $('[data-countup]');

  if ($counters.length) {
    $counters.each((index, value) => {
      const $counter = $(value);
      const counter = $counter.data('countup');
      let playCountUpTriggered = false;

      const countUP = () => {
        const option = $.extend({ count: 0, prefix: '', suffix: '', duration: 1000, delay: 0 }, counter);
        const { count, format, prefix, suffix, duration, delay } = option;

        if (isScrolledIntoView(value) && !playCountUpTriggered) {
          if (!playCountUpTriggered) {
            setTimeout(() => {
              $({ countNum: 0 }).animate(
                { countNum: count },
                {
                  duration,
                  easing: 'linear',
                  step() {
                    setText($counter, this.countNum, format, prefix, suffix);
                  },
                  complete() {
                    setText($counter, this.countNum, format, prefix, suffix);
                  },
                },
              );

              playCountUpTriggered = true;
            }, delay * 1000);
          }
        }
        return playCountUpTriggered;
      };

      countUP();
      $(window).scroll(() => {
        countUP();
      });
    });
  }
});
