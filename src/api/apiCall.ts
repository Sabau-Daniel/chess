async function api(method, endpoint, payload, file = false) {
  const BASE_URL = import.meta.env.VITE_API_URL;

  return new Promise(async (resolve, reject) => {
    try {
      let options = {
        method,
        headers: {
          Authorization: "Bearer " + "hehe",
        },
      };

      // Check if the payload includes a file (Blob, File, or similar)

      if (method === "GET" || method === "HEAD") {
        // GET/HEAD cannot have a body
        delete options.body;
      } else if (payload && file) {
        console.log("Contains file, uploading multipart");
        const formData = new FormData();

        // Append payload fields to FormData
        Object.keys(payload).forEach((key) => {
          formData.append(key, payload[key]);
        });

        options.body = formData; // Set form data as body
      } else {
        options.headers["Content-Type"] = "application/json";
        options.body = payload ? JSON.stringify(payload) : null;
      }

      const response = await fetch(BASE_URL + endpoint, options);

      if (response.ok) {
        const data = await response.json();

        // Check if the success property is true
        if (!data.success) {
          // Log the user out if we have a session error
          if (
            data.code &&
            data.code === 80201 &&
            !endpoint.includes("logout")
          ) {
            reject(data.message ? data.message : "Session error.");
          }
          // Reject with the error message or with a default message
          if (data.message) reject(data.message);
          else reject("Internal error. Please try again later.");
        } else {
          resolve(data);
        }
      } else {
        reject(`Internal Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      reject(error.message);
    }
  });
}

export default api;
