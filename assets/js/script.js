//hamburger

let hamburger = document.querySelector('.gg-menu');
let menu = document.querySelector('.nav-links');
let nav = document.querySelector('.nav-ribbon');
let mobileNav = document.querySelector('.mobile-menu');
let closeMenu = document.querySelector('.gg-close');
let mobileMenu = document.querySelector('.mobile-menu')

hamburger.addEventListener('click', () => {
    hamburger.classList.add('hide')
    closeMenu.classList.remove('hide')
    menu.classList.add('hide')
    mobileMenu.classList.remove('hide')

});

closeMenu.addEventListener('click', () => {
    closeMenu.classList.add('hide')
    hamburger.classList.remove('hide')
    menu.classList.remove('hide')
    mobileMenu.classList.add('hide')
    //   menu.classList.toggle('active');
});

const changeNavbar = () => {
    if (window.scrollY >= nav.scrollHeight ) {
      nav.classList.add("fixed");
      mobileNav.classList.add("fixed");
      mobileNav.style.top = nav.scrollHeight
    } else {
      nav.classList.remove("fixed");
      mobileNav.classList.remove("fixed");
    }
  }
  window.onscroll = changeNavbar;