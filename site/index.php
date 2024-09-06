<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento!</title>
    <?php require_once "globalreqs.php"?>
    <link rel="stylesheet" href="/css/index.css"/>
    <script type='module' src="/sitejs/index.js"></script>
</head>
<body>
    <header>
        <div class="left-header">
            <img id="logo" alt="Bento! Logo" src="/img/bento logo white.svg" height="40px" onclick="location.href='/home'">
        </div>
        <div class="right-header">
            <button class="header-button" id="signInBtn">Login</button>
            <nav>
                <!-- <a class="header-nav">About Us</a>
                <a class="header-nav">Science</a> -->
            </nav>
        </div>
    </header>
    <section id="hero">
        <div id="hero-elements">
            <h1>
                Accelerate <u>your</u> learning
            </h1>
            <h2>
                Learn in <mark>simple, bite sized <p></p></mark>pieces so you really <mark>remember<p></p> </mark>what you study

            </h2>
            <button id="signUpBtn"><p>Sign Up</p></button>
        </div>
    </section>
    
    <section class="pitch">
        <h1 class="content-header">
            Ace Your Next Class With Hands-Free SRS
            <hr>
        </h1>

        <div class="pitch-container">
            <div class="pitch-box">
                <p>
                    <b>Spaced Repetition System.</b> Designed to help you review knowledge just before you forget it so when the time comes it will be easy to remember 
                </p>
                <img alt="SRS Diagram" src="/img/SRS Diagram.svg">
            </div>
            <div class="pitch-box">
                <p>
                    <b>Hands-Free Learning.</b> Just pick whatever you want to learn and let the system determine what you need to review and when. 
                </p>
                <img alt="Neuron Activation Diagram" src="/img/neuron activation.jpg">
            </div>
        </div>
    </section>

    <section id="feature-set" class="pitch">
        <h1>
            Bento!'s Features
            <hr>
        </h1>

        <div class="bento-feature-container">
            <div class="bento-feature-bento hidden" id="feature-bento-1">
                <span class="material-symbols-outlined">rocket_launch</span>
                <div>
                    <h2>Custom Decks</h2>
                    <p>Create your own custom deck to learn anything you want. From Russian scientific vocabulary to plant genuses.</p>
                </div>
            </div>
            <div class="bento-feature-bento hidden" id="feature-bento-2">
                <span class="material-symbols-outlined">groups</span>
                <div>
                    <h2>Thriving Community</h2>
                    <p>Many community-made decks to further your own learning and collaborate with others.</p>
                </div>
            </div>
            <div class="bento-feature-bento hidden" id="feature-bento-3">
                <span class="material-symbols-outlined">sentiment_very_satisfied</span>
                <div>
                    <h2>Engaging Learning</h2>
                    <p>Custom web interface to promote fun and engaging learning.</p>
                </div>
            </div>
            <div class="bento-feature-bento hidden" id="feature-bento-4">
                <span class="material-symbols-outlined">bolt</span>
                <div>
                    <h2>Learn With Ease</h2>
                    <p>Review lots of information in small pieces everyday</p>
                </div>
            </div>
            <div class="bento-feature-bento hidden" id="feature-bento-5">
                <span class="material-symbols-outlined">tune</span>
                <div>
                    <h2>Customization</h2>
                    <p>In depth settings to create the experience that helps you learn best</p>
                </div>
            </div>
            <div class="bento-feature-bento hidden" id="feature-bento-6">
                <span class="material-symbols-outlined">lan</span>
                <div>
                    <h2>Play To Learn</h2>
                    <p>A variety of different learning gamemodes like matching, input, selection, and ranking so you are motivated to learn even on 4 coffees and 3 hours of sleep.</p>
                </div>
            </div>
        </div>
        <section id="cta">
            <h1>Sign Up NOW</h1>
            <button id="cta-button">Sign Up</button>
        </section>
        <hr>
    </section>
    <!-- <div id="contact-box">
        <h1>Contact Us</h1>
        <input placeholder="Name:">
        <input type="email" placeholder="Email:">
        <textarea placeholder="Message:"></textarea>
        <button id="contactSubmitButton">Submit</button>
    </div> -->

    <footer>
        <hr>
        <p>Created By: Bitfeller and Valley</p>
    </footer>

    <section id="modals">
        <dialog class="modal" id="signUpModal">
            <div class="modal-content">
                <p><u>Sign Up</u></p>
                <p>Username:</p>
                <input type="email" id="signUpUsername">
                <p>Password:</p>
                <input type="password" id="signUpPassword">
                <p style="font-size: 13px; font-family: kadwa;">Your password is always secure. No one can see your password, not even us.</p>
                <p>Email:</p>
                <input type="email" id="signUpEmail">
                <button class="submitBtn" id="signUpBtnM">Sign Up</button>
                <p class="info-error" id="signup-err"></p>
            </div>
        </dialog>
        <dialog class="modal" id="signInModal">
            <div class="modal-content">
                <p><u>Login</u></p>
                <p>Username:</p>
                <input type="email" id="signInUsername">
                <p>Password:</p>
                <input type="password" id="signInPassword">
                <button class="submitBtn" id="signInBtnM">Login</button>
                <p class='reset-pwd' onclick="location.href='/user/resetpwd'">I forgot my password >></p>
                <p class="info-error" id="login-err"></p>
            </div>
        </dialog>
    </section>
</body>
</html>