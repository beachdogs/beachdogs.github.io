/**
 * Beach Dog Marketing contact intake — paste this file into a Google Sheet's Apps Script.
 *
 * Sheet setup
 * -----------
 * 1. Create a Google Sheet (e.g. "Beach Dog contact leads").
 * 2. Put this header row in row 1 (A1:B1):
 *    Timestamp | Email
 * 3. Extensions → Apps Script. Replace any stub with this file.
 * 4. Deploy → New deployment → type "Web app"
 *      Execute as: Me
 *      Who has access: Anyone
 *        (not "Only myself", and not "Anyone with a Google account")
 * 5. Open the web app URL in an incognito window. You should see {"ok":true}.
 *    If Google asks you to sign in, access is still too locked down — edit
 *    the deployment and set Who has access to Anyone again.
 * 6. Copy the /exec URL into .env.local as NEXT_PUBLIC_CONTACT_SCRIPT_URL
 *    and into the GitHub Actions secret of the same name.
 *
 * The site POSTs JSON as text/plain (avoids a CORS preflight).
 */

const NOTIFY_EMAIL = 'beachdogmarketing@gmail.com'

function doGet() {
  return jsonOutput({ ok: true })
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)

    if (String(data.honeypot || '').trim()) {
      return jsonOutput({ ok: true })
    }

    const email = String(data.email || '').trim()

    if (!email) {
      return jsonOutput({ ok: false, error: 'Missing required fields' })
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
    sheet.appendRow([new Date(), email])

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: 'New contact lead: ' + email,
      body: [
        'New contact request from beachdogs.github.io.',
        '',
        'Email: ' + email,
      ].join('\n'),
    })

    return jsonOutput({ ok: true })
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) })
  }
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
