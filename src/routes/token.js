const express = require("express");
const axios = require("axios");
const { generateSignedJwt } = require("../utils/jwtGenerator.js");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        error: "Missing authorization code",
      });
    }

    // Generate client assertion JWT
    const clientAssertion = await generateSignedJwt();
    console.log('jwt: ', clientAssertion);
    /*
      ===== Build OAuth Parameters =====
    */
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI,
      client_id: process.env.CLIENT_ID,
      client_assertion_type: process.env.CLIENT_ASSERTION_TYPE,
      client_assertion: clientAssertion,
      code_verifier: process.env.PKCE_CODE_VERIFIER,
    });

    /*
      ===== Call Token Endpoint =====
    */
    const response = await axios.post(
      process.env.TOKEN_ENDPOINT,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },

        // Fayda sometimes returns raw string JSON
        responseType: "text",
        transformResponse: [(data) => data],
      }
    );

    /*
      ===== Safe JSON Parsing =====
    */
    let parsedData;

    if (typeof response.data === "string") {
      try {
        parsedData = JSON.parse(response.data);
      } catch {
        return res.status(502).json({
          error: "Invalid JSON received from token endpoint",
        });
      }
    } else {
      parsedData = response.data;
    }

    return res.json(parsedData);
  } catch (error) {
    console.error(
      "Token API error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      error: "Token request failed",
    });
  }
});

module.exports = router;
