import { useEffect, useState } from "react";
import {
  ActivityIndicator, // Kept for the horizontal list, but main layout is ScrollView
  Image,
  SafeAreaView,
  ScrollView, // Changed to ScrollView for the overall page layout
  Text,
  TouchableOpacity, // Added for the "More" button
  View,
} from "react-native";

// --- Reusable UI Components ---

// Card for the top statistics section
const StatsCard = ({ title, value, icon, bgColor }) => (
  <View
    className={`w-[48%] ${bgColor} p-4 rounded-3xl shadow-lg mb-3 justify-between h-36`}
  >
    <View>
      <Text className="text-gray-700 font-semibold text-base">{title}</Text>
      <Text className="text-gray-900 text-4xl font-bold mt-1">{value}</Text>
    </View>
    <Text className="text-right text-2xl opacity-60">{icon}</Text>
  </View>
);

// Card for a single report in the "Recent Reports" list
const ReportCard = ({ item }) => {
  const formatHazardType = (type) => {
    if (!type) return "Unknown Hazard";
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const location = item.location?.coordinates;

  return (
    <View className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4 border border-gray-200">
      {item.mediaUrl ? (
        <Image
          source={{ uri: item.mediaUrl }}
          className="w-full h-48"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-48 bg-gray-200 justify-center items-center">
          <Text className="text-gray-500">No Image Available</Text>
        </View>
      )}
      <View className="p-4">
        <Text className="text-xl font-bold text-cyan-800 mb-1">
          {formatHazardType(item.hazardType)}
        </Text>
        <Text className="text-sm text-gray-600" numberOfLines={2}>
          {item.description}
        </Text>
        {location && (
          <View className="flex-row items-center mt-3 pt-3 border-t border-gray-200">
            <Text className="text-base font-semibold text-gray-700">
              📍 Location:
            </Text>
            <Text className="text-base text-gray-600 ml-2">
              Lat: {location[1].toFixed(4)}, Lon: {location[0].toFixed(4)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// --- UPDATED Leaderboard Component with Ranking Styles ---

// Helper function to get styles based on rank
const getRankStyle = (rank) => {
  switch (rank) {
    case 1:
      return "bg-amber-100 border-amber-400"; // Gold
    case 2:
      return "bg-slate-200 border-slate-400"; // Silver
    case 3:
      return "bg-orange-200 border-orange-400"; // Bronze
    default:
      return "bg-white border-gray-200";
  }
};

const LeaderboardItem = ({ user, rank }) => {
  const rankStyle = getRankStyle(rank);
  // Placeholder for user avatar
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <View
      className={`flex-row items-center p-3 rounded-2xl mb-3 shadow-md border-2 ${rankStyle}`}
    >
      {/* Avatar Placeholder */}
      <View className="w-12 h-12 rounded-full bg-cyan-100 justify-center items-center mr-4">
        <Text className="text-cyan-700 font-bold text-lg">{initials}</Text>
      </View>

      {/* User Info */}
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-800">{user.name}</Text>
        <Text className="text-sm text-gray-500">{user.reports} Reports</Text>
      </View>

      {/* Points */}
      <View className="items-end">
        <Text className="text-xl font-bold text-cyan-800">{user.points}</Text>
        <Text className="text-sm text-gray-500">Points</Text>
      </View>
    </View>
  );
};

// --- The Main Home Screen Component ---
export default function Home() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // MOCK DATA for Leaderboard (replace with API call)
  const leaderboardData = [
    { id: "1", name: "Priya Sharma", reports: 25, points: 1250 },
    { id: "2", name: "Raj Patel", reports: 21, points: 1050 },
    { id: "3", name: "Amit Singh", reports: 18, points: 900 },
  ];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const API_URL = "http://192.168.0.101:5000/reports";

        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch data from the server.");
        }
        const data = await response.json();
        const sortedReports = data.reports.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setReports(sortedReports);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // --- Loading and Error State Handlers ---
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-cyan-50">
        <ActivityIndicator size="large" color="#0891b2" />
        <Text className="mt-4 text-lg text-cyan-700">Loading Dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-red-50 p-4">
        <Text className="text-xl font-bold text-red-700">Oops!</Text>
        <Text className="text-center text-red-600 mt-2">{error}</Text>
      </SafeAreaView>
    );
  }

  // --- Derived State for Stats ---
  const totalReports = reports.length;
  const userReports = reports.filter((r) => r.source === "user").length;
  const socialMediaReports = reports.filter(
    (r) => r.source === "social_media"
  ).length;
  const verifiedReports = reports.filter((r) => r.isVerified).length;

  // --- Main Render ---
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Section 1: Overall Statistics */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <StatsCard
            title="Total Reports"
            value={totalReports}
            bgColor="bg-cyan-200"
          />
          <StatsCard
            title="User Reports"
            value={userReports}
            bgColor="bg-cyan-200"
          />
          <StatsCard
            title="Social Media"
            value={socialMediaReports}
            bgColor="bg-cyan-200"
          />
          <StatsCard
            title="Verified Reports"
            value={verifiedReports}
            bgColor="bg-cyan-200"
          />
        </View>

        {/* Section 2: Recent Hazard Reports */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-cyan-900">
              Recent Hazard Reports
            </Text>
            <TouchableOpacity
              onPress={() => console.log("Navigate to All Reports")}
            >
              <Text className="text-cyan-600 font-semibold">More &gt;</Text>
            </TouchableOpacity>
          </View>
          {reports.slice(0, 3).map((item) => (
            <ReportCard item={item} key={item._id} />
          ))}
          {reports.length === 0 && (
            <Text className="text-center text-gray-500 mt-4">
              No recent reports found.
            </Text>
          )}
        </View>

        {/* Section 3: Community Leaderboard */}
        <View>
          <Text className="text-2xl font-bold text-cyan-900 mb-4">
            Community Leaderboard
          </Text>
          {leaderboardData.map((user, index) => (
            <LeaderboardItem user={user} rank={index + 1} key={user.id} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
