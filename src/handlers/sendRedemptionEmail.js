const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient();

exports.handler = async (event) => {
  try {
    // Parse the event data
    const messageData = JSON.parse(event.Records[0].body);
    console.log('Received message data:', JSON.stringify(messageData, null, 2));

    // Check the message attributes to determine the type of email
    const messageAttributes = event.Records[0].messageAttributes || {};
    const emailType = messageAttributes.EmailType?.stringValue || 'redemption_confirmation';

    let params;

    // This is a credit or voucher redemption
    const { userEmail, userName, code, type, productName, redeemedAt } = messageData;

    // Prepare email parameters for credit/voucher redemption
    params = {
      Destination: {
        ToAddresses: [userEmail],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
                <html>
                  <head>
                    <style>
                      body { font-family: Arial, sans-serif; line-height: 1.6; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background-color: #232f3e; color: white; padding: 20px; text-align: center; }
                      .content { padding: 20px; background-color: #f8f9fa; }
                      .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6c757d; }
                      .code { background-color: #e9ecef; padding: 10px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1>Your ${productName} Redemption</h1>
                      </div>
                      <div class="content">
                        <p>Hello ${userName || 'there'},</p>
                        <p>Thank you for being an active member of our AWS User Group Madurai! Your ${type} has been redeemed successfully.</p>
                        <p>Here is your ${type} code:</p>
                        <div class="code">${code}</div>
                        <p>If you have any questions about your ${type}, please contact our support team.</p>
                        <p>Best regards,<br>AWS User Group Team</p>
                      </div>
                      <div class="footer">
                        <p>This is an automated message, please do not reply to this email.</p>
                        <p>Redemption Date: ${new Date(redeemedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </body>
                </html>
              `,
          },
          Text: {
            Charset: "UTF-8",
            Data: `
Hello ${userName || 'there'},

Thank you for being an active member of our AWS User Group! Your ${type} has been redeemed successfully.

Here is your ${type} code: ${code}

If you have any questions about your ${type}, please contact our support team.

Best regards,
AWS User Group Team

Redemption Date: ${new Date(redeemedAt).toLocaleString()}
              `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Your AWS User Group Madurai ${type.charAt(0).toUpperCase() + type.slice(1)} Redemption`,
        },
      },
      Source: process.env.SENDER_EMAIL,
    };

    // Send the email
    const command = new SendEmailCommand(params);
    await sesClient.send(command);

    console.log(`Redemption email sent to ${userEmail} for product ${productName}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };
  } catch (error) {
    console.error('Error sending redemption email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send email' }),
    };
  }
};