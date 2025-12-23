export const hyperspeedPresets = {
  // ...existing presets...
  sunset: {
    onSpeedUp: () => { },
    onSlowDown: () => { },
    distortion: 'deepDistortion',
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 4,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5],
    lightStickHeight: [1.3, 1.7],
    movingAwaySpeed: [60, 80],
    movingCloserSpeed: [-120, -160],
    carLightsLength: [400 * 0.03, 400 * 0.2],
    carLightsRadius: [0.05, 0.14],
    carWidthPercentage: [0.3, 0.5],
    carShiftX: [-0.8, 0.8],
    carFloorSeparation: [0, 5],
    colors: {
      roadColor: 0x2D1E2F,
      islandColor: 0x4F2E4C,
      background: 0x1A1423,
      shoulderLines: 0xFFD6E0,
      brokenLines: 0xFFC371,
      leftCars: [0xFF5E62, 0xFF9966, 0xFF5E62],
      rightCars: [0xFFC371, 0xFF5F6D, 0xFFD6E0],
      sticks: 0xFF9966,
    }
  }
};

export default hyperspeedPresets; 