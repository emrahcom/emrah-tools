<?php
require_once 'vendor/autoload.php';
use \Firebase\JWT\JWT;

$LINK = "https://___JITSI_HOST___";
$ROOM = "classroom-name";

$key = "___APPSECRET___";
$payload = array(
    "aud" => "___APPID___",
    "iss" => "___APPID___",
    "sub" => "___JITSI_HOST___",
    "exp" => time() + (24*60*60),
    "room" => "classroom-name",
    "context" => array(
        "user" => array(
            "name" => "student-name",
            "email" => "student-name@___JITSI_HOST___",
            "avatar" => "https://gravatar.com/avatar/none.jpg",
            "affiliation" => "student",
        ),
        "features" => array(
            "recording" => false,
            "livestreaming" => false,
            "screen-sharing" => true,
        )
    )
);

$jwt = JWT::encode($payload, $key);
echo $LINK . '/' . $ROOM . '?jwt=' . $jwt;
echo "\n";
?>
