// utils/MapHelpers.js

const getDistance = (p1, p2) => {
  const dx = p1.latitude - p2.latitude;
  const dy = p1.longitude - p2.longitude;
  return Math.sqrt(dx * dx + dy * dy);
};

export const clusterReports = (reports, distanceThreshold) => {
  if (!reports || reports.length === 0) return [];

  const clusters = [];
  const visited = new Array(reports.length).fill(false);

  for (let i = 0; i < reports.length; i++) {
    if (visited[i]) continue;
    visited[i] = true;
    const currentClusterPoints = [reports[i]];
    const centerPoint = {
      latitude: reports[i].location.coordinates[1],
      longitude: reports[i].location.coordinates[0],
    };
    for (let j = i + 1; j < reports.length; j++) {
      if (visited[j]) continue;
      const neighborPoint = {
        latitude: reports[j].location.coordinates[1],
        longitude: reports[j].location.coordinates[0],
      };
      if (getDistance(centerPoint, neighborPoint) < distanceThreshold) {
        visited[j] = true;
        currentClusterPoints.push(reports[j]);
      }
    }
    clusters.push({ points: currentClusterPoints });
  }

  const totalReports = reports.length;

  return clusters.map(cluster => {
    const count = cluster.points.length;
    const percentage = (count / totalReports) * 100;
    
    let color;
    let baseSize;
    let fixedRadius; // The new accurate radius in meters

    // We now define both a scaling factor (baseSize) and a fixed radius
    if (percentage > 40) {
      color = "#FF4500";
      baseSize = 10000;
      fixedRadius = 5000; // 5 km
    } else if (percentage >= 20) {
      color = "#FFD166";
      baseSize = 6000;
      fixedRadius = 3000; // 3 km
    } else {
      color = "#FF66B3";
      baseSize = 3000;
      fixedRadius = 1500; // 1.5 km
    }
    
    const lats = cluster.points.map(p => p.location.coordinates[1]);
    const lngs = cluster.points.map(p => p.location.coordinates[0]);
    const center = {
      latitude: lats.reduce((a, b) => a + b, 0) / lats.length,
      longitude: lngs.reduce((a, b) => a + b, 0) / lngs.length,
    };

    return {
      id: `cluster-${center.latitude}-${center.longitude}`,
      center,
      count,
      color,
      baseSize,
      fixedRadius, // Return both values
    };
  });
};