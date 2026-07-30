import { initLoginPage } from './js/login.js';
import { initSignupPage } from './js/signup.js';
import { initChatPage } from './js/chat.js';

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("page-login")) {
    initLoginPage();
  } else if (document.getElementById("page-signup")) {
    initSignupPage();
  } else if (document.getElementById("page-translator")) {
    initChatPage();
  }
});
