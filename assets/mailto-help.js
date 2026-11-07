(function () {
  var links = document.querySelectorAll('a.btn[href^="mailto:"]');

  links.forEach(function (link) {
    var address = link.getAttribute('href').slice('mailto:'.length).split('?')[0];
    var help = document.createElement('p');
    var timer;

    help.textContent = 'Email didn\'t open? Your phone may not have an email app set up for email links. Use any email app or webmail to write to ' + address + '.';
    help.setAttribute('role', 'status');
    help.style.cssText = 'display:none;max-width:32rem;margin:12px 0 0;font:inherit;font-size:0.9rem;line-height:1.5;overflow-wrap:anywhere;';
    link.insertAdjacentElement('afterend', help);

    link.addEventListener('click', function () {
      window.clearTimeout(timer);
      help.style.display = 'none';
      timer = window.setTimeout(function () {
        if (document.visibilityState === 'visible') help.style.display = 'block';
      }, 1200);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        window.clearTimeout(timer);
        help.style.display = 'none';
      }
    });
  });
}());
