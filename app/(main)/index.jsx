import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  View
} from 'react-native';

// --- The Card Component ---
// This component displays a single report.
const ReportCard = ({ item }) => {
  // Helper function to capitalize the hazard type for better display
  const formatHazardType = (type) => {
    if (!type) return 'Unknown Hazard';
    // Replaces underscores with spaces and capitalizes words
    return type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  const location = item.location?.coordinates;

  return (
    <View className="bg-white rounded-2xl shadow-lg overflow-hidden mb-5 mx-4 border border-gray-200">
      {/* Image */}
      {item.mediaUrl ? (
        <Image 
          source={{ uri: item.mediaUrl }} 
          className="w-full h-48"
          resizeMode="cover"
        />
      ) : (
        // Placeholder for reports without an image
        <View className="w-full h-48 bg-gray-200 justify-center items-center">
            <Text className="text-gray-500">No Image Available</Text>
        </View>
      )}

      {/* Content */}
      <View className="p-4">
        <Text className="text-xl font-bold text-cyan-800 mb-1">
          {formatHazardType(item.hazardType)}
        </Text>
        <Text className="text-sm text-gray-600">
          {item.description}
        </Text>
        
        {/* Location Info */}
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


// --- The Main Screen Component ---
export default function Home() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // 👇 *IMPORTANT*: Replace with your actual backend IP address and port
        const API_URL = 'http://192.168.0.102:5000/reports';
        
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch data from the server.');
        }
        const data = await response.json();
        setReports(data.reports); // Assuming your API returns { reports: [...] }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []); // The empty array ensures this effect runs only once when the component mounts

  // --- Render Logic ---
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-cyan-50">
        <ActivityIndicator size="large" color="#0891b2" />
        <Text className="mt-4 text-lg text-cyan-700">Loading Reports...</Text>
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

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={reports}
        renderItem={({ item }) => <ReportCard item={item} />}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={() => (
            <Text className="text-3xl font-extrabold text-cyan-900 text-center my-6">
                Recent Hazard Reports
            </Text>
        )}
        ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center mt-20">
                <Text className="text-lg text-gray-500">No reports found.</Text>
            </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}