const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        error: "Missing access token",
      });
    }

    /*
      ===== Call UserInfo Endpoint =====
    */
    const response = await axios.get(
      process.env.USERINFO_ENDPOINT,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error(
      "UserInfo API error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      error: "Userinfo request failed",
    });
  }
});

module.exports = router;
