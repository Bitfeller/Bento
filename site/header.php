<div id="too-big-img"></div>
<header class=header id=header>
  <img alt="Bento! Logo" class=logo height=40px onclick='location.href="/home"' src="/img/bento logo white.svg" title="Bento! home">
  <div class=right-header>
    <img class="pfp right-header-ico" src="/img/defaultpfp.png" id="header:pfp" title="Your Profile">
    <span class='header-nav material-symbols-outlined right-header-ico' id='header:feedback' title='Give A Suggestion'>feedback</span>
    <span class="header-nav material-symbols-outlined right-header-ico" id="header:logout" title="Logout">logout</span>
  </div>
</header>
<div class="loader">
  <div class="load-rot"></div>
  <p class="tips"></p>
</div>
<section>
  <dialog id='header:feedback_dialog' class="feedback-dialog">
    <h1>Give Feedback...</h1>
    <p>You can report a bug or give suggestions here. We check regularly, so we'll be able to see your feedback almost immediately.</p>
    <textarea placeholder="Give feedback here..." id="header:feedback_content"></textarea>
    <button id='header:feedback_submit'>Submit!</button>
  </dialog>
</section>