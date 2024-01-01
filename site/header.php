<div id="too-big-img"></div>
<header class=header id=header>
  <img alt="Bento! Logo" class=logo height=40px onclick='location.href="/home"' src="/img/bento logo white.svg" title="Bento! home">
  <div class=right-header>
    <span id="header:verify-email-alert" class="verify-email-alert header-nav right-header-ico">Verify Your Email</span>
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
  <dialog id='header:feedback_dialog' class="header-dialog">
    <h1>Give Feedback...</h1>
    <p>You can report a bug or give suggestions here. We check regularly, so we'll be able to see your feedback almost immediately.</p>
    <textarea placeholder="Give feedback here..." id="header:feedback_content"></textarea>
    <button id='header:feedback_submit'>Submit!</button>
  </dialog>
  <dialog id='header:version_info' class="header-dialog">
    <h2>v0.3.0 - What's new</h2>
    <p>Bento v0.3.0; released 9/6/24.</p>
    <ul>
      <li>Fixed 14 more bugs, ranging from styling to functionality.</li>
      <li>Multiple answers for multiple choice and text cards.</li>
      <li>Math and scientific formatting, using MathJax, simply by putting two <code>$</code> around the content you want to format.</li>
      <li>Created an email verification and password reset system.</li>
      <li>Two-way cards for text cards, so both ways are shown. <b>Note: Minor features, such as SRS support in some situations, may be limited. This feature is still under development.</b></li>
      <li>Themes (found in your profile)</li>
      <li>More user-friendly deck creation, with easier tabbing and automatic card creation when you tab from the last input box on the last card.</li>
      <li>A new study game: Inertia, found in the bottom right corner of Learn mode. <b>Note: Not stable. Still under testing.</b></li>
    </ul>
  </dialog>
  <dialog id="header:verify_email" class="header-dialog">
    <h2>Verify your email!</h2>
    <p>Verifying your account with Bento allows us to identify that email as the true owner of this account, making account-related processes like password resetting much more faster and secure.</p>
    <p><b>Bento sent an email to you when your account was made to verify your account.</b> If you didn't receive it, check your Spam folder.</p>
    <p>Need to re-send it? Not a problem - click the button below to re-send it.</p>
    <button id="header:resend_verif_email">Resend Email</button>
    <p class="info-success" id="header:resend_success"></p>
  </dialog>
</section>
<div id="header:version" class="version">
  <span class="new-version"></span>
  <span class="version-number">v0.3.0</span>
</div>
<section>
</section>