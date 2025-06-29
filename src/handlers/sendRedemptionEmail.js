const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient();

exports.handler = async (event) => {
  try {
    // Parse the event data
    const redemption = JSON.parse(event.Records[0].body);
    
    // Extract redemption details
    const { userEmail, userName, productName, productId, redemptionId, points } = redemption;
    
    // Generate a random redemption code (in a real system, this might be more sophisticated)
    const redemptionCode = `${productId.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}-${redemptionId.substring(0, 4)}`;
    
    // Prepare email parameters
    const params = {
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
                      <h1>Your Redemption is Complete!</h1>
                    </div>
                    <div class="content">
                      <p>Hello ${userName || 'there'},</p>
                      <p>Thank you for being an active member of our AWS User Group! Your redemption for <strong>${productName}</strong> has been processed successfully.</p>
                      <p>Here is your redemption code:</p>
                      <div class="code">${redemptionCode}</div>
                      <p>You redeemed <strong>${points} points</strong> for this item.</p>
                      <p>If you have any questions about your redemption, please contact our support team.</p>
                      <p>Best regards,<br>AWS User Group Team</p>
                    </div>
                    <div class="footer">
                      <p>This is an automated message, please do not reply to this email.</p>
                      <p>Redemption ID: ${redemptionId}</p>
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

Thank you for being an active member of our AWS User Group! Your redemption for ${productName} has been processed successfully.

Here is your redemption code: ${redemptionCode}

You redeemed ${points} points for this item.

If you have any questions about your redemption, please contact our support team.

Best regards,
AWS User Group Team

Redemption ID: ${redemptionId}
            `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Your AWS User Group Redemption: ${productName}`,
        },
      },
      Source: process.env.SENDER_EMAIL || "no-reply@example.com",
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