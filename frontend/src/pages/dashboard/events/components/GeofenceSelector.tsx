import { useState, useEffect, useRef, useMemo } from "react";
import {
  Map,
  MapMarker,
  MapControls,
  useMap,
  MarkerContent,
} from "@/components/ui/map";
import { MapPin } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

function MapClickListener({
  onClick,
}: {
  onClick: (lngLat: { lng: number; lat: number }) => void;
}) {
  const { map, isLoaded } = useMap();
  const isListeningRef = useRef(false);

  useEffect(() => {
    if (!map || !isLoaded) return;
    if (isListeningRef.current) return;

    const handleNativeClick = (e: any) => {
      onClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    };

    map.on("click", handleNativeClick);
    isListeningRef.current = true;

    return () => {
      map.off("click", handleNativeClick);
      isListeningRef.current = false;
    };
  }, [map, isLoaded, onClick]);

  return null;
}

interface NativeGeofenceLayerProps {
  geoJson: any;
}

function NativeGeofenceLayer({ geoJson }: NativeGeofenceLayerProps) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded || !geoJson || !map.style) return;

    const sourceId = "geofence-source";
    const fillLayerId = "geofence-fill";
    const strokeLayerId = "geofence-stroke";

    const THEME_COLOR = "#7499d6";

    try {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: geoJson,
        });

        map.addLayer({
          id: fillLayerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": THEME_COLOR,
            "fill-opacity": 0.15,
          },
        });

        map.addLayer({
          id: strokeLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": THEME_COLOR,
            "line-width": 2,
            "line-opacity": 0.8,
          },
        });
      } else {
        const source = map.getSource(sourceId) as any;
        if (source) {
          source.setData(geoJson);
        }
      }
    } catch (err) {
      console.warn("MapLibre layer update skipped during render shift:", err);
    }

    return () => {
      if (map && map.style && typeof map.getLayer === "function") {
        try {
          if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
          if (map.getLayer(strokeLayerId)) map.removeLayer(strokeLayerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
        } catch (cleanupError) {
          console.debug(
            "Map layers cleaned up via parent canvas destruction cycle.",
          );
        }
      }
    };
  }, [map, isLoaded, geoJson]);

  return null;
}

interface GeofenceSelectorProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  radius: number;
  onLocationChange: (location: { lat: number; lng: number }) => void;
  onRadiusChange: (radius: number) => void;
  disabled?: boolean;
}

export function GeofenceSelector({
  latitude,
  longitude,
  radius,
  onLocationChange,
  onRadiusChange,
  disabled = false,
}: GeofenceSelectorProps) {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(
    longitude && latitude ? [longitude, latitude] : null,
  );
  const [mapZoom, setMapZoom] = useState(15);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const PHILIPPINES_LNG = 120.9842;
  const PHILIPPINES_LAT = 14.5995;

  useEffect(() => {
    if (!latitude && !longitude && !mapCenter) {
      if (!navigator.geolocation) {
        setGeoError("Geolocation tracking is unsupported by your browser.");
        setMapCenter([PHILIPPINES_LNG, PHILIPPINES_LAT]);
        return;
      }

      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: currentLat, longitude: currentLng } =
            position.coords;
          onLocationChange({ lat: currentLat, lng: currentLng });
          setMapCenter([currentLng, currentLat]);
          setIsLocating(false);
        },
        (error) => {
          console.warn("Device location access blocked:", error.message);
          setGeoError("Location access denied. Defaulted view to Philippines.");
          setMapCenter([PHILIPPINES_LNG, PHILIPPINES_LAT]);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 6000 },
      );
    }
  }, [latitude, longitude, mapCenter, onLocationChange]);

  const geofenceGeoJson = useMemo(() => {
    if (!latitude || !longitude) return null;

    const points = 64;
    const coordinates: [number, number][] = [];
    const distanceX = radius / (111320 * Math.cos((latitude * Math.PI) / 180));
    const distanceY = radius / 110540;

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * (2 * Math.PI);
      const lng = longitude + distanceX * Math.cos(angle);
      const lat = latitude + distanceY * Math.sin(angle);
      coordinates.push([lng, lat]);
    }
    coordinates.push(coordinates[0]);

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coordinates],
      },
    };
  }, [latitude, longitude, radius]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="w-full h-60 border border-border rounded-lg overflow-hidden relative shadow-inner bg-muted/20">
        {mapCenter ? (
          <Map
            center={mapCenter}
            zoom={mapZoom}
            onViewportChange={(viewport) => {
              setMapCenter(viewport.center);
              setMapZoom(viewport.zoom);
            }}
            className="w-full h-full"
          >
            <MapControls
              position="top-right"
              showFullscreen
              showLocate
              onLocate={({ longitude: locLng, latitude: locLat }) => {
                onLocationChange({ lat: locLat, lng: locLng });
                setMapCenter([locLng, locLat]);
              }}
            />

            <MapClickListener
              onClick={({ lng, lat }) => {
                if (!disabled) onLocationChange({ lat, lng });
              }}
            />

            <NativeGeofenceLayer geoJson={geofenceGeoJson} />

            {latitude && longitude && (
              <MapMarker
                key="pin"
                longitude={longitude}
                latitude={latitude}
                draggable={!disabled}
                onDragEnd={({ lng, lat }) => {
                  onLocationChange({ lat, lng });
                }}
              >
                <MarkerContent>
                  <div className="relative flex items-center justify-center h-0 w-0">
                    <MapPin className="text-primary size-8 absolute -translate-y-1/2 fill-primary/10 drop-shadow" />
                  </div>
                </MarkerContent>
              </MapMarker>
            )}
          </Map>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground animate-pulse bg-muted/10">
            Establishing geographic link...
          </div>
        )}

        {isLocating && mapCenter && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center text-xs font-medium text-muted-foreground animate-pulse z-20">
            Refining coordinates...
          </div>
        )}

        {geoError && (
          <div className="absolute top-2 inset-x-2 bg-destructive/10 border border-destructive/20 text-destructive text-[11px] px-2 py-1.5 rounded shadow-sm z-30 font-medium text-center">
            {geoError}
          </div>
        )}
      </div>

      {latitude && longitude ? (
        <div className="text-[11px] text-muted-foreground font-mono flex gap-4 p-2 bg-muted/30 rounded border border-border/50">
          <span>
            LAT:{" "}
            <strong className="text-foreground">{latitude.toFixed(6)}</strong>
          </span>
          <span>
            LNG:{" "}
            <strong className="text-foreground">{longitude.toFixed(6)}</strong>
          </span>
        </div>
      ) : (
        <div className="text-[11px] text-amber-500 font-medium p-2 bg-amber-500/10 rounded border border-amber-500/20">
          Click or drag on the map above to select your event geofence center.
        </div>
      )}

      <Field>
        <div className="flex justify-between items-center mb-1">
          <FieldLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Scan Verification Radius
          </FieldLabel>
          <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
            {radius} meters
          </span>
        </div>
        <FieldGroup>
          <input
            type="range"
            min="15"
            max="500"
            step="5"
            value={radius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </FieldGroup>
      </Field>
    </div>
  );
}
