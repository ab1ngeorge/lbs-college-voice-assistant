import { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useGeolocation,
  COLLEGE_COORDINATES,
  CAMPUS_LOCATIONS,
  COLLEGE_MAPS_LINK,
  calculateDistance,
  getDirection,
  Coordinates,
} from '@/hooks/useGeolocation';

interface LocationPanelProps {
  onLocationResult?: (result: LocationResult) => void;
  destinationKey?: string;
}

export interface LocationResult {
  userLocation: Coordinates | null;
  destination: { name: string; coordinates: Coordinates };
  distance: number;
  direction: string;
  googleMapsUrl: string;
  spokenDirections: string;
}

const LocationPanel = ({ onLocationResult, destinationKey }: LocationPanelProps) => {
  const {
    coordinates,
    error,
    isLoading,
    permissionState,
    getCurrentPosition,
  } = useGeolocation();

  const [selectedDestination, setSelectedDestination] = useState<string>(destinationKey || 'main_entrance');

  const destination = CAMPUS_LOCATIONS[selectedDestination] || {
    name: 'LBS College of Engineering',
    coordinates: COLLEGE_COORDINATES,
    description: 'Main campus',
    mapsLink: COLLEGE_MAPS_LINK,
  };

  const handleGetLocation = async () => {
    try {
      const userCoords = await getCurrentPosition();
      
      const distance = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        destination.coordinates.latitude,
        destination.coordinates.longitude
      );
      
      const direction = getDirection(
        userCoords.latitude,
        userCoords.longitude,
        destination.coordinates.latitude,
        destination.coordinates.longitude
      );

      const googleMapsUrl = destination.mapsLink;

      // Generate spoken directions
      const distanceText = distance < 1 
        ? `${Math.round(distance * 1000)} meters` 
        : `${distance.toFixed(1)} kilometers`;
      
      const spokenDirections = `${destination.name} is approximately ${distanceText} to the ${direction} from your current location. I'll open Google Maps to help you navigate there.`;

      const result: LocationResult = {
        userLocation: userCoords,
        destination: { name: destination.name, coordinates: destination.coordinates },
        distance,
        direction,
        googleMapsUrl,
        spokenDirections,
      };

      onLocationResult?.(result);
    } catch (err) {
      console.error('Failed to get location:', err);
    }
  };

  const handleOpenMaps = () => {
    window.open(destination.mapsLink, '_blank');
  };

  const distance = coordinates
    ? calculateDistance(
        coordinates.latitude,
        coordinates.longitude,
        destination.coordinates.latitude,
        destination.coordinates.longitude
      )
    : null;

  const direction = coordinates
    ? getDirection(
        coordinates.latitude,
        coordinates.longitude,
        destination.coordinates.latitude,
        destination.coordinates.longitude
      )
    : null;

  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm border-kerala-green/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-kerala-green" />
          Campus Navigation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Destination Selector */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Select Destination</label>
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="w-full p-2 rounded-md border border-border bg-background text-foreground"
          >
            {Object.entries(CAMPUS_LOCATIONS).map(([key, loc]) => (
              <option key={key} value={key}>
                {loc.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">{destination.description}</p>
        </div>

        {/* Permission Status */}
        {permissionState && (
          <div className="flex items-center gap-2">
            {permissionState === 'granted' && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Location Enabled
              </Badge>
            )}
            {permissionState === 'denied' && (
              <Badge variant="outline" className="text-destructive border-destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Location Denied
              </Badge>
            )}
            {permissionState === 'prompt' && (
              <Badge variant="outline" className="text-kerala-gold border-kerala-gold">
                <MapPin className="h-3 w-3 mr-1" />
                Permission Required
              </Badge>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Location Info */}
        {coordinates && (
          <div className="space-y-2 p-3 rounded-md bg-kerala-green/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Distance</span>
              <span className="font-medium">
                {distance !== null && distance < 1
                  ? `${Math.round(distance * 1000)} m`
                  : `${distance?.toFixed(1)} km`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Direction</span>
              <span className="font-medium flex items-center gap-1">
                <Navigation className="h-4 w-4" />
                {direction}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleGetLocation}
            disabled={isLoading}
            className="flex-1 bg-kerala-green hover:bg-kerala-green/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Get My Location
              </>
            )}
          </Button>
          
          <Button
            onClick={handleOpenMaps}
            variant="outline"
            className="border-kerala-green text-kerala-green hover:bg-kerala-green/10"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Maps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPanel;
