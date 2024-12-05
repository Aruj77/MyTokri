const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const encryptionKey = "FtmJ7frzTyWOzintybbqIWzwwclcPtaI";
const apiUrl = "https://d3398n96t5wqx9.cloudfront.net/UsersAquisition/";

function encrypt(text, key) {
  let iv = key.substring(0, 16);
  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key),
    Buffer.from(iv)
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("base64");
}

function decrypt(text, key) {
  let iv = key.substring(0, 16);
  let encryptedText = Buffer.from(text, "base64");
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key),
    Buffer.from(iv)
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

app.post("/api/data", async (req, res) => {
  const requestData = {
    DeviceInfo: {
      PackageName: "com.test.com",
      LangCode: "en",
      DeviceID: "test_dev_doc",
    },
    Referrer: {
      Affiliate: {
        Campaign: "will be shared with you",
        ClickID: "your clickid",
        Pub_ID: "your pub id",
        Aff_ID: "your aff id",
        extra: "",
        extra1: "",
        firstPageButtonID: "msisdn-entry",
        secondPageButtonID: "pin-entry",
        Country: "the desired country",
      },
    },
    Request: {
      Action: 1,
      TransactionID: "b5d7ab80-262e-4246-9dc0-a9ca3202cf74",
      SessionID: "",
      MSISDN: "",
      PinCode: "",
    },
  };

  const encryptedRequest = encrypt(JSON.stringify(requestData), encryptionKey);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Encryption-Key": encryptionKey,
        "Access-Token": "0e186445-0647-417c-ae27-8098533f1914",
      },
      body: JSON.stringify({ data: encryptedRequest }),
    });

    const encryptedResponse = await response.json();
    const decryptedResponse = JSON.parse(
      decrypt(encryptedResponse.data, encryptionKey)
    );

    res.json(decryptedResponse);

    // Check for AFScript and include it if available
    if (decryptedResponse.NextAction && decryptedResponse.NextAction.AFScript) {
      const script = `
        <script type="text/javascript">
          ${decryptedResponse.NextAction.AFScript}
        </script>
      `;
      res.send(script);
    } else {
      res.json(decryptedResponse);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
