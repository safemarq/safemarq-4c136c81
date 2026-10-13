import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '@/contexts/ThemeContext';

export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  score: number;
  /** false = placed at the centre of its postal code. */
  precise: boolean;
}

interface Props {
  center: { lat: number; lng: number };
  radiusKm: number;
  points: MapPoint[];
  activeId: string | null;
  onSelect: (id: string) => void;
  label: string;
  className?: string;
}

// Same OpenStreetMap data in a day and a night style, so the map follows the site theme.
const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
} as const;
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Score pins, like prices on a rental map: the number is the information. */
const pinIcon = (p: MapPoint, active: boolean) =>
  L.divIcon({
    className: '',
    html: `<span class="sm-pin${active ? ' is-active' : ''}${p.precise ? '' : ' is-approx'}" title="${escapeHtml(p.name)}">${p.score}</span>`,
    iconSize: [44, 30],
    iconAnchor: [22, 30],
  });

export default function SearchMap({ center, radiusKm, points, activeId, onSelect, label, className }: Props) {
  const { theme } = useTheme();
  const box = useRef<HTMLDivElement | null>(null);
  const map = useRef<L.Map | null>(null);
  const tiles = useRef<L.TileLayer | null>(null);
  const area = useRef<L.LayerGroup | null>(null);
  const pins = useRef<L.LayerGroup | null>(null);
  const markers = useRef(new Map<string, { marker: L.Marker; point: MapPoint }>());
  const frame = useRef<L.LatLngBounds | null>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  // Create once.
  useEffect(() => {
    if (!box.current || map.current) return;
    const m = L.map(box.current, { zoomControl: false, scrollWheelZoom: true, attributionControl: true });
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    tiles.current = L.tileLayer(TILES[theme], { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(m);
    area.current = L.layerGroup().addTo(m);
    pins.current = L.layerGroup().addTo(m);
    map.current = m;
    // The map is often shown after a layout change (list ↔ map on phones).
    const ro = new ResizeObserver(() => {
      m.invalidateSize();
      if (frame.current) m.fitBounds(frame.current, { padding: [16, 16] });
    });
    ro.observe(box.current);
    const store = markers.current;
    return () => {
      ro.disconnect();
      m.remove();
      map.current = null;
      store.clear();
    };
    // theme is applied by the effect below; creating the map once is the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    tiles.current?.setUrl(TILES[theme]);
  }, [theme]);

  // Search area: a quiet circle, the map framed on it.
  useEffect(() => {
    const m = map.current;
    const layer = area.current;
    if (!m || !layer) return;
    layer.clearLayers();
    // Frame first: until the map has a view, Leaflet does not place layers yet.
    frame.current = L.latLng(center.lat, center.lng).toBounds(radiusKm * 2000);
    m.fitBounds(frame.current, { padding: [16, 16] });
    L.circle([center.lat, center.lng], {
      radius: radiusKm * 1000,
      color: 'hsl(36 79% 57%)',
      weight: 1.5,
      dashArray: '6 6',
      fillOpacity: 0.04,
      interactive: false,
    }).addTo(layer);
    L.circleMarker([center.lat, center.lng], {
      radius: 5,
      color: '#fff',
      weight: 2,
      fillColor: 'hsl(36 79% 57%)',
      fillOpacity: 1,
      interactive: false,
    }).addTo(layer);
  }, [center.lat, center.lng, radiusKm]);

  useEffect(() => {
    const layer = pins.current;
    if (!layer) return;
    layer.clearLayers();
    markers.current.clear();
    for (const p of points) {
      const marker = L.marker([p.lat, p.lng], { icon: pinIcon(p, false), keyboard: true, title: p.name, riseOnHover: true })
        .on('click', () => selectRef.current(p.id))
        .addTo(layer);
      markers.current.set(p.id, { marker, point: p });
    }
  }, [points]);

  useEffect(() => {
    for (const [id, { marker, point }] of markers.current) {
      const active = id === activeId;
      marker.setIcon(pinIcon(point, active));
      marker.setZIndexOffset(active ? 1000 : 0);
    }
    const hit = activeId ? markers.current.get(activeId) : null;
    if (hit && map.current && !map.current.getBounds().contains(hit.marker.getLatLng())) {
      map.current.panTo(hit.marker.getLatLng());
    }
  }, [activeId, points]);

  return <div ref={box} role="region" aria-label={label} className={className} />;
}
