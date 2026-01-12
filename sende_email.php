<?php
/**
 * Kontaktformular-E-Mail-Skript
 * Sendet Anfragen an Beratung@manuela-rosenkranz.de
 */

// CORS Header für AJAX-Anfragen
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Nur POST-Anfragen erlauben
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Nur POST-Anfragen erlaubt"]);
    exit;
}

// Sicherheits-Header
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");

// Eingaben validieren und bereinigen
function clean_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Pflichtfelder prüfen
if (empty($_POST['name']) || empty($_POST['email']) || empty($_POST['message'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Bitte füllen Sie alle Pflichtfelder aus"]);
    exit;
}

// Datenschutzerklärung prüfen
if (!isset($_POST['privacy']) || $_POST['privacy'] !== 'on') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Bitte akzeptieren Sie die Datenschutzerklärung"]);
    exit;
}

// Formulardaten bereinigen
$name = clean_input($_POST['name']);
$email = clean_input($_POST['email']);
$phone = clean_input($_POST['phone']);
$message = clean_input($_POST['message']);

// E-Mail-Validierung
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Bitte geben Sie eine gültige E-Mail-Adresse ein"]);
    exit;
}

// Name-Länge prüfen
if (strlen($name) < 2 || strlen($name) > 100) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Bitte geben Sie einen gültigen Namen an"]);
    exit;
}

// Nachricht-Länge prüfen
if (strlen($message) < 10 || strlen($message) > 2000) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Ihre Nachricht sollte zwischen 10 und 2000 Zeichen lang sein"]);
    exit;
}

// E-Mail-Parameter
$to = "Beratung@manuela-rosenkranz.de";
$subject = "Kontaktanfrage von Website: " . $name;

// E-Mail-Header (wichtig für Spam-Filter)
$headers = [
    "From: " . $email,
    "Reply-To: " . $email,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "X-Mailer: PHP/" . phpversion(),
    "X-Priority: 3",
    "X-Originating-IP: " . $_SERVER['REMOTE_ADDR']
];

// E-Mail-Body zusammenbauen
$email_body = "Neue Kontaktanfrage von der Website\n\n";
$email_body .= "=====================================\n\n";
$email_body .= "Name: " . $name . "\n";
$email_body .= "E-Mail: " . $email . "\n";
$email_body .= "Telefon: " . ($phone ? $phone : "Nicht angegeben") . "\n\n";
$email_body .= "Nachricht:\n" . wordwrap($message, 70, "\n", true) . "\n\n";
$email_body .= "=====================================\n";
$email_body .= "Gesendet am: " . date("d.m.Y H:i") . "\n";
$email_body .= "IP-Adresse: " . $_SERVER['REMOTE_ADDR'] . "\n";

// E-Mail senden
$mail_sent = mail($to, $subject, $email_body, implode("\r\n", $headers));

if ($mail_sent) {
    // Erfolg
    http_response_code(200);
    echo json_encode([
        "success" => true, 
        "message" => "Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet."
    ]);
} else {
    // Fehler beim Senden
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Leider konnte Ihre Nachricht nicht gesendet werden. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt per E-Mail."
    ]);
}
?>
