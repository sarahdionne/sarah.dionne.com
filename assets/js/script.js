// Underscore throttle function
const throttle = (func, wait, options) => {
  let timeout, context, args, result,
      previous = 0;
  if (!options) options = {};

  const later = () => {
    previous = options.leading === false ? 0 : new Date().getTime();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  const throttled = function() {
    const now = new Date().getTime();
    if (!previous && options.leading === false) previous = now;
    const remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  throttled.cancel = function() {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };
  return throttled;
};

// JS TO USE THE MENU AS A SINGLE PAGE WITH SCROLL
const linkToAnchorClickedHandler = evt => {
  evt.preventDefault();
  const toggler = document.getElementById('toggler'),
        mobileOnlyElm = document.querySelector('.wrapper .mobile-navbar'),
        isMobile = mobileOnlyElm.style.display !== 'none',
        timeout = ((isMobile && toggler.checked))? 400 : 10;
  let   target = evt.target;

  // Close the mobile menu
  if(isMobile && toggler.checked === true) {
    setTimeout(() => toggler.click(), 50);
  }

  if (target.nodeName !== 'A') {
    target = target.closest("a");
  }

  // Scroll to the anchor
  setTimeout(() => {
    location.hash = "";
    location.hash = target.getAttribute('href');
  }, timeout);

  const ul = target.parentNode.parentNode,
        copy = ul.cloneNode(true),
        parent = ul.parentNode;

  // Remove than add again the submenu
  if (parent.nodeName === 'LI') {
    setTimeout(() => parent.removeChild(ul), 100);
    setTimeout(() => {
      parent.appendChild(copy);
      initLinksCloseNav();
    }, 1000);
  }
};

// don't scroll body if the mobile menu is visible
const togglerClickedHandler = checked => {
  if(checked === true) {
    document.documentElement.classList.add('no-scroll-mobile');
  } else {
    document.documentElement.classList.remove('no-scroll-mobile');
  }
};

// Animate the desktop navbar with Intersection observer
const containerObserverCallback = entries => {
  entries.forEach(entry => {
    const container = document.querySelector(".container");
    if(entry.isIntersecting) {
      container.classList.add('banner-intersecting');
    } else {
      container.classList.remove('banner-intersecting');
    }
  });
};

// Animate the desktop navbar
const parallax = () => {
  const pos = window.scrollY,
        banner = document.querySelector("#banner");

  // Don't calculate if the banner isn't above the fold
  if (pos <= banner.offsetHeight) {
    const scale = (pos / (banner.offsetHeight * 10)),
          bg = document.querySelector("#banner .bg"),
          mg = document.querySelector("#banner .mg"),
          fg = document.querySelector("#banner .fg");

    bg.style.top = `${pos*0.4}px`;
    bg.style.transform = `scale(${1 + scale})`;
    mg.style.top = `${pos*0.3}px`;
    mg.style.transform = `scale(${1 + (scale * 0.65)})`;
    fg.style.top = `${pos*0.25}px`;
  }
};

const initLinksCloseNav = () => {
  Array.from(
    document.querySelectorAll("a[href*='#']:not([href='#'])")
  ).forEach((link) => {
    link.removeEventListener('click', linkToAnchorClickedHandler);
    link.addEventListener('click', linkToAnchorClickedHandler);
  });
}

// Add first class
const toggleClass = (elm, classes, force) => {
  if(force) {
    elm.classList.remove(...classes);
    elm.classList.add(force);
  } else {
    if (elm.classList.contains(classes[0])) {
      elm.classList.replace(...classes)
    } else if(elm.classList.contains(classes[1])) {
      [classes[0], classes[1]] = [classes[1], classes[0]];
      elm.classList.replace(...classes);
    } else {
      elm.classList.add(classes[0]);
    }
  }
};

const initCloseSubNav = () => {
  document.querySelectorAll("li.submenu").forEach(item => {
    const throttledReopenSubmenu = throttle(() => toggleClass(item, ['open', 'closed'], 'open'), 1000, { leading: false });
    item.addEventListener('click', () => {
      setTimeout(() => toggleClass(item, ['open', 'closed']), 0);
      throttledReopenSubmenu.cancel();
    });
    item.addEventListener('mouseenter', () => {
      // on mobile, timeout to trigger hover after click ;)
      setTimeout(() => toggleClass(item, ['open', 'closed'], 'open'), 100);
    });
    item.addEventListener("mousemove", throttledReopenSubmenu);
  });
};

const initMaps = () => {
  document.querySelectorAll('div.map').forEach(item => {
    item.addEventListener('click', () => {
      const iframe = item.querySelector('iframe');
      iframe.src = iframe.getAttribute('data-src');
      iframe.removeAttribute('data-src');
    });
  });
};

const init = () => {
  initLinksCloseNav();
  initCloseSubNav();
  initMaps();

  const toggler = document.getElementById('toggler'),
        banner = document.getElementById('banner');

  if(!!banner) {
    const observer = new IntersectionObserver(
      containerObserverCallback
    );
    observer.observe(banner);
  }

  document.addEventListener("scroll", throttle(() => parallax(), 1000/48));
  toggler.addEventListener('click', () => togglerClickedHandler(toggler.checked) );
}

document.addEventListener("DOMContentLoaded", init);
