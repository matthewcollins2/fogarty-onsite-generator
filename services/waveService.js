import axios from "axios";

export async function waveRequest(query, variables = {}) {

  try {

    const response = await axios.post(
      "https://gql.waveapps.com/graphql/public",
      { query, variables },
      {
        headers: {
          Authorization: `Bearer ${process.env.WAVE_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (err) {

    if (err.response?.data) {
      console.error("Wave API Error:", err.response.data);
    }

    throw err;
  }
}