// Handle guide registration form
document.getElementById("guideForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", document.getElementById("name").value);
  formData.append("email", document.getElementById("email").value);
  formData.append("password", document.getElementById("password").value);
  formData.append("age", document.getElementById("age").value);
  formData.append("license_number", document.getElementById("license_number").value);
  formData.append("license_file", document.getElementById("license_file").files[0]);

  try {
    const response = await fetch("http://127.0.0.1:8000/api/guides/register/", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("Guide registered successfully!");
      document.getElementById("guideForm").reset();
    } else {
      alert("Registration failed. Please check your inputs.");
    }
  } catch (error) {
    console.error(error);
    alert("An error occurred while submitting the form.");
  }
});
