import { useState, useCallback, useEffect } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationState {
  coordinates: Coordinates | null;
  error: string | null;
  isLoading: boolean;
  permissionState: PermissionState | null;
}

// LBS College coordinates (Main Entrance)
export const COLLEGE_COORDINATES: Coordinates = {
  latitude: 8.8932,
  longitude: 76.6141,
};

// Main college Google Maps link
export const COLLEGE_MAPS_LINK = 'https://maps.app.goo.gl/ZGm4R6fiM6KgbfH97';

// Campus locations with verified Google Maps links
export const CAMPUS_LOCATIONS: Record<string, { 
  name: string; 
  coordinates: Coordinates; 
  description: string;
  mapsLink: string;
}> = {
  'main_entrance': {
    name: 'LBS College of Engineering (Main Entrance)',
    coordinates: { latitude: 8.8932, longitude: 76.6141 },
    description: 'Main entrance of LBS College of Engineering',
    mapsLink: 'https://maps.app.goo.gl/ZGm4R6fiM6KgbfH97'
  },
  'academic_departments': {
    name: 'Academic Departments (General Area)',
    coordinates: { latitude: 8.8935, longitude: 76.6145 },
    description: 'General academic departments area',
    mapsLink: 'https://maps.app.goo.gl/2PvfbFGAkUFjFBjS6'
  },
  'mechanical_department': {
    name: 'Dept. Of Mechanical Engineering',
    coordinates: { latitude: 8.8938, longitude: 76.6148 },
    description: 'Department of Mechanical Engineering',
    mapsLink: 'https://maps.app.goo.gl/Yas8hpFy3kNim1xD8'
  },
  'cse_department': {
    name: 'Computer Science & IT Department Building',
    coordinates: { latitude: 8.8940, longitude: 76.6150 },
    description: 'Department of Computer Science and Information Technology',
    mapsLink: 'https://maps.app.goo.gl/DbwYQ6b984VTGDjm6'
  },
  'library': {
    name: 'Central Library',
    coordinates: { latitude: 8.8942, longitude: 76.6143 },
    description: 'Central library with reading rooms and digital resources',
    mapsLink: 'https://maps.app.goo.gl/fh6Z8TEsomfuoFbJ9'
  },
  'fab_lab': {
    name: 'Campus Fab Lab',
    coordinates: { latitude: 8.8936, longitude: 76.6147 },
    description: 'Fabrication lab for innovation and prototyping',
    mapsLink: 'https://maps.app.goo.gl/3rz8e5WXZ3UytSze7'
  },
  'computer_lab': {
    name: 'Computer Lab',
    coordinates: { latitude: 8.8939, longitude: 76.6149 },
    description: 'Main computer laboratory',
    mapsLink: 'https://maps.app.goo.gl/6pasZGBNrC3opwTg8'
  },
  'reprographic_centre': {
    name: 'Reprographic Centre',
    coordinates: { latitude: 8.8934, longitude: 76.6144 },
    description: 'Printing and photocopying services',
    mapsLink: 'https://maps.app.goo.gl/FZ72xAAczEwk2mgi7'
  },
  'sports_area': {
    name: 'Multipurpose Sports Area',
    coordinates: { latitude: 8.8928, longitude: 76.6138 },
    description: 'Multipurpose sports and recreation area',
    mapsLink: 'https://maps.app.goo.gl/uyPH83UZo3rjEFEBA'
  },
  'football_ground': {
    name: 'LBS College Football Ground',
    coordinates: { latitude: 8.8925, longitude: 76.6135 },
    description: 'Main football ground',
    mapsLink: 'https://maps.app.goo.gl/vjLN3ZgN2yUoxuSr5'
  },
  'mens_hostel': {
    name: "Men's Hostel",
    coordinates: { latitude: 8.8945, longitude: 76.6155 },
    description: 'Boys hostel accommodation',
    mapsLink: 'https://maps.app.goo.gl/fQ1QAUmNk5MDepgTA'
  },
  'ladies_hostel': {
    name: 'Shahanas Hostel (Ladies Hostel)',
    coordinates: { latitude: 8.8948, longitude: 76.6158 },
    description: 'Shahanas Hostel for women students',
    mapsLink: 'https://maps.app.goo.gl/nPwgvr3U3fXSiUj47'
  },
  'canteen': {
    name: 'College Canteen',
    coordinates: { latitude: 8.8933, longitude: 76.6142 },
    description: 'Food court serving breakfast, lunch, and snacks',
    mapsLink: 'https://maps.app.goo.gl/UN4s7g16zSMiHhYz8'
  },
  'atm': {
    name: 'College ATM (SBI ATM)',
    coordinates: { latitude: 8.8931, longitude: 76.6140 },
    description: 'SBI ATM for cash withdrawal',
    mapsLink: 'https://maps.app.goo.gl/ug6jLStaQDjnVZ239'
  },
  'bus_garage': {
    name: 'Bus Garage / Transport Area',
    coordinates: { latitude: 8.8920, longitude: 76.6130 },
    description: 'College bus parking and transport area',
    mapsLink: 'https://maps.app.goo.gl/9WUemftWwmGohsRW8'
  },
};

// Calculate distance between two coordinates in kilometers
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get cardinal direction from one point to another
export const getDirection = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): string => {
  const dLon = toLon - fromLon;
  const dLat = toLat - fromLat;
  const angle = (Math.atan2(dLon, dLat) * 180) / Math.PI;
  
  const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
  const index = Math.round(((angle + 360) % 360) / 45) % 8;
  return directions[index];
};

// Generate Google Maps URL for directions
export const getGoogleMapsUrl = (
  destination: Coordinates,
  origin?: Coordinates
): string => {
  const destStr = `${destination.latitude},${destination.longitude}`;
  
  if (origin) {
    const originStr = `${origin.latitude},${origin.longitude}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=driving`;
  }
  
  return `https://www.google.com/maps/dir/?api=1&destination=${destStr}&travelmode=driving`;
};

// Search for campus location by query
export const searchCampusLocation = (query: string): { key: string; location: typeof CAMPUS_LOCATIONS[string] } | null => {
  const normalizedQuery = query.toLowerCase();
  
  // Search by key or name
  for (const [key, location] of Object.entries(CAMPUS_LOCATIONS)) {
    const normalizedName = location.name.toLowerCase();
    const normalizedKey = key.replace(/_/g, ' ');
    
    if (
      normalizedName.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedName) ||
      normalizedKey.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedKey)
    ) {
      return { key, location };
    }
  }
  
  // Special keyword matching
  const keywordMap: Record<string, string> = {
    'library': 'library',
    'book': 'library',
    'read': 'library',
    'food': 'canteen',
    'eat': 'canteen',
    'hungry': 'canteen',
    'lunch': 'canteen',
    'breakfast': 'canteen',
    'coffee': 'canteen',
    'computer': 'cse_department',
    'cse': 'cse_department',
    'software': 'cse_department',
    'it department': 'cse_department',
    'mechanical': 'mechanical_department',
    'workshop': 'mechanical_department',
    'hostel': 'mens_hostel',
    'boys hostel': 'mens_hostel',
    'men hostel': 'mens_hostel',
    'stay': 'mens_hostel',
    'accommodation': 'mens_hostel',
    'girls hostel': 'ladies_hostel',
    'ladies hostel': 'ladies_hostel',
    'women hostel': 'ladies_hostel',
    'shahanas': 'ladies_hostel',
    'football': 'football_ground',
    'ground': 'football_ground',
    'sports': 'sports_area',
    'play': 'sports_area',
    'cricket': 'sports_area',
    'gate': 'main_entrance',
    'entrance': 'main_entrance',
    'entry': 'main_entrance',
    'exit': 'main_entrance',
    'main gate': 'main_entrance',
    'fab lab': 'fab_lab',
    'fablab': 'fab_lab',
    'fabrication': 'fab_lab',
    'makerspace': 'fab_lab',
    'maker': 'fab_lab',
    'innovation': 'fab_lab',
    'prototype': 'fab_lab',
    'computer lab': 'computer_lab',
    'lab': 'computer_lab',
    'reprographic': 'reprographic_centre',
    'xerox': 'reprographic_centre',
    'print': 'reprographic_centre',
    'photocopy': 'reprographic_centre',
    'atm': 'atm',
    'cash': 'atm',
    'money': 'atm',
    'sbi': 'atm',
    'bus': 'bus_garage',
    'transport': 'bus_garage',
    'parking': 'bus_garage',
    'garage': 'bus_garage',
    'academic': 'academic_departments',
    'department': 'academic_departments',
    'class': 'academic_departments',
    'classroom': 'academic_departments',
  };
  
  for (const [keyword, locationKey] of Object.entries(keywordMap)) {
    if (normalizedQuery.includes(keyword)) {
      return { key: locationKey, location: CAMPUS_LOCATIONS[locationKey] };
    }
  }
  
  return null;
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: false,
    permissionState: null,
  });

  // Check permission status
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      return null;
    }
    
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setState(prev => ({ ...prev, permissionState: result.state }));
      return result.state;
    } catch {
      return null;
    }
  }, []);

  // Get current position
  const getCurrentPosition = useCallback((): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by your browser';
        setState(prev => ({ ...prev, isLoading: false, error }));
        reject(new Error(error));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setState(prev => ({
            ...prev,
            coordinates,
            isLoading: false,
            error: null,
            permissionState: 'granted',
          }));
          resolve(coordinates);
        },
        (error) => {
          let errorMessage = 'Unable to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              setState(prev => ({ ...prev, permissionState: 'denied' }));
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          
          setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Cache for 1 minute
        }
      );
    });
  }, []);

  // Get distance to college
  const getDistanceToCollege = useCallback((userCoordinates: Coordinates): number => {
    return calculateDistance(
      userCoordinates.latitude,
      userCoordinates.longitude,
      COLLEGE_COORDINATES.latitude,
      COLLEGE_COORDINATES.longitude
    );
  }, []);

  // Get direction to location
  const getDirectionToLocation = useCallback((
    userCoordinates: Coordinates,
    destination: Coordinates
  ): string => {
    return getDirection(
      userCoordinates.latitude,
      userCoordinates.longitude,
      destination.latitude,
      destination.longitude
    );
  }, []);

  // Open Google Maps for navigation
  const openGoogleMaps = useCallback((
    destination: Coordinates,
    origin?: Coordinates
  ) => {
    const url = getGoogleMapsUrl(destination, origin);
    window.open(url, '_blank');
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    ...state,
    getCurrentPosition,
    getDistanceToCollege,
    getDirectionToLocation,
    openGoogleMaps,
    checkPermission,
    COLLEGE_COORDINATES,
    CAMPUS_LOCATIONS,
    searchCampusLocation,
  };
};
