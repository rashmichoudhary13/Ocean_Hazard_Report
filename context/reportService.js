export const submitReport = async (reportData) => {
  try {
    const response = await fetch("http://192.168.0.102:5000/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData),
    });

    return await response.json();
  } catch (error) {
    console.error("❌ Error submitting report:", error);
    throw error;
  }
};
