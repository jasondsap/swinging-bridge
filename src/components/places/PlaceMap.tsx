'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

import type { FallbackPlace } from '@/data/places-fallback';
import { PLACE_TYPE_CONFIG } from './PlaceTypeBadge';

interface PlaceMapProps {
  place: FallbackPlace;
}

/**
 * Single-point map for a place detail page.
 *
 * Uses a custom divIcon styled with the place type's color and icon, so a
 * restaurant pin looks distinct from a campground pin even at a glance.
 *
 * Kept deliberately minimal: no list view, no clustering, no bottom sheet.
 * For a multi-place map we'd build a separate component.
 */
export default function PlaceMap({ place }: PlaceMapProps) {
  const cfg = PLACE_TYPE_CONFIG[place.placeType] ?? PLACE_TYPE_CONFIG.attraction;
  const Icon = cfg.icon;

  // Build the SVG pin once. Using renderToStaticMarkup so we don't need to
  // hand-write SVG for every Lucide icon.
  const iconHtml = `
    <div class="place-pin" style="
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 2px solid #1e3a5f;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    ">
      <div style="transform: rotate(45deg); color: #1e3a5f;">
        ${renderToStaticMarkup(<Icon className="h-5 w-5" />)}
      </div>
    </div>
  `;

  const pinIcon = L.divIcon({
    html: iconHtml,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32],
  });

  return (
    <MapContainer
      center={[place.location.latitude, place.location.longitude]}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: '320px', width: '100%' }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker
        position={[place.location.latitude, place.location.longitude]}
        icon={pinIcon}
      >
        <Popup>
          <strong>{place.name}</strong>
          {place.location.address && (
            <>
              <br />
              {place.location.address}
            </>
          )}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
