// 👇 1. Accept 'token' as a second argument
export const submitReport = async (formData, token) => { 
  try {
    const response = await fetch("http://192.168.0.100:5000/reports", {
      method: "POST",
      headers: {
        // 👇 2. Use the token to create the Authorization header
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.error || 'Something went wrong');
    }

    return responseData;

  } catch (error) {
    console.error("❌ Error submitting report:", error);
    throw error;
  }
};