<?php
    require_once '../module.php';
    validate_request();
    $data = get_data('email');
    require_types('s', 'email');
    // Make sure there isn't a session, otherwise resetting the password is useless.
    session_start();
    if(isset($_SESSION['uid'])) {
        fail("in session");
    }
    // Get body values
    $email = $data['email'];
    try {
        $conn = connect_to_db();
        // Get user
        $sql = "SELECT * FROM users WHERE email = ?;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = mysqli_fetch_assoc($stmt->get_result());
        if(!$result) {
            // Invalid user information, but pretend a request was sent for security reasons
            success();
        }
        if($result['verified'] == 0) {
            // Not verified. We can't send a password reset link.
            fail('not verified');
        }
        $stmt->close();
        // Generate verifStr
        $verifStr = '';
        $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-=_+[]\\{}|;\':",./<>?`~';
        $len = strlen($chars);
        for($i = 0; $i < $len; $i++) {
            $verifStr .= $chars[random_int(0, $len-1)];
        }
        $hashVerif = password_hash($verifStr, PASSWORD_DEFAULT);
        // Update hashverif
        $sql = "UPDATE users SET verif = ? WHERE id = ?;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $hashVerif, $result['id']);
        $stmt->execute();
        $stmt->close();
        // Send email
        $username = $result['username'];
        $uid = $result['id'];
        send_mail(
            $result['email'],
            "Reset Password", 
            "Hey there!<br><br>Reset your password for <b>$username</b> <a href='https://bento-app.uk/user/userdir?hash=$hashVerif&v=1&user=$uid'>here</a>.<br><br>If you didn't request this password reset, you can safely ignore this email.<br><br>Bento<br><span style='font-size: 10px; color: rgb(200, 200, 200)'>You can reply to this email to contact us.<br>You're receiving this email because your email was associated with this account.</span>", 
            "Hey there!\n\nReset your password for $username at https://bento-app.uk/user/userdir?hash=$hashVerif&v=1&user=$uid.\nIf you didn't request this password reset, you can safely ignore this email.\n\nBento\n(You can reply to this email to contact us. You're receiving this email because your email was associated with this account.)"
        );
        success();
    } catch(Exception $e) {
        fail("exception: " . $e->getMessage());
    }