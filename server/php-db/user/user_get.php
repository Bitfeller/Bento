<?php
    require_once '../module.php';
    validate_request();
    $data = get_data();
    require_types('bbbb', 'getpfp', 'getudata', 'getreviews', 'getdrafts');
    session_start();
    if(!isset($_SESSION['uid']) || !isset($_SESSION['username'])) {
        fail('no session');
    } else {
        $getpfp = $data['getpfp'] ? 1 : 0;
        $getudata = $data['getudata'] ? 1 : 0;
        $getreviews = $data['getreviews'] ? 1 : 0;
        $getdrafts = $data['getdrafts'] ? 1 : 0;
        try {
            $data =["uid"=>$_SESSION['uid'], "username"=>$_SESSION['username'], "email"=>$_SESSION['email'], "verified"=>$_SESSION['verified'], "creation_date"=>$_SESSION['creation_date'], "notifsub"=>$_SESSION['notifsub']];
            if($getudata == 1) {
                $userdata = json_decode($_SESSION['userdata'], false);
                if($getreviews == 0) {
                    unset($userdata->reviews);
                }
                if($getdrafts == 0) {
                    unset($userdata->draftdecks);
                }
                $data['userdata'] = json_encode($userdata);
            }
            if($getpfp == 1) {
                $data['pfp'] = $_SESSION['pfp'];
            }
            success($data);
        } catch(e) {
            header('Location: /');
            session_start();
            session_unset();
            session_destroy();
            fail("invalid user data");
        }
    }