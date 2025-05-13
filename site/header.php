<div id="too-big-img"></div>
<header class=header id=header>
    <img alt="Bento! Logo" class=logo id="header:logo" height=40px onclick='location.href="/home"' src="/img/bento logo white.svg" title="Bento! home">
    <span class="info" id="header:beta-text" onclick='location.href="/home"'>BETA</span>
    <div class=right-header>
        <span id="header:verify-email-alert" class="verify-email-alert header-nav right-header-ico">Verify Your Email</span>
        <img class="pfp right-header-ico" src="/img/defaultpfp.png" id="header:pfp" title="Your Profile">
        <span class='header-nav material-symbols-outlined right-header-ico' id='header:feedback' title='Give A Suggestion'>feedback</span>
        <span class="header-nav material-symbols-outlined right-header-ico" id="header:logout" title="Logout">logout</span>
    </div>
    <!-- This is loaded after everything to place it as far as possible to the left -->
    <div class="left-header">
        <span class="header-nav material-symbols-outlined" id="header:back" title="Black Button">keyboard_double_arrow_left</span>
    </div>
</header>
<div class="loader">
    <div class="load-rot"></div>
    <p class="tips"></p>
</div>
<section class="global-headers">
    <dialog id='header:feedback_dialog' class="header-dialog">
        <h1>Give Feedback...</h1>
        <p>You can report a bug or give suggestions here. We check regularly, so we'll be able to see your feedback almost immediately.</p>
        <textarea placeholder="Give feedback here..." id="header:feedback_content"></textarea>
        <button id='header:feedback_submit' class="feedback-submit-button">Submit!</button>
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