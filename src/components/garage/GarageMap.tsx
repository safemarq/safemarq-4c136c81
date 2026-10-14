import { MapPin } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import LeafletMapView, { garageMarkerIcon } from '@/components/maps/LeafletMapView';

interface GarageMapProps {
  address: string;
  coords: { lat: number; lng: number };
}

const escapeHtml = (value: string) =>
  value
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;')
    .split("'").join('&#39;');

const GarageMap = ({ address, coords }: GarageMapProps) => {
  const { t } = useI18n();
  const markers = [
    {
      id: 'garage-location',
      position: coords,
      icon: garageMarkerIcon,
      popupHtml: `<span style="font-size:12px;font-weight:600">${escapeHtml(address)}</span>`,
    },
  ];

  return (
    <section aria-label={t('garage.directions')} className="overflow-hidden rounded-2xl border border-line">
      <div className="relative z-0 aspect-[16/9]">
        <LeafletMapView
          center={[coords.lat, coords.lng]}
          zoom={15}
          markers={markers}
          fitPoints={[[coords.lat, coords.lng]]}
          className="h-full w-full"
          style={{ background: 'hsl(var(--paper-2))' }}
          maxFitZoom={15}
          scrollWheelZoom={false}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="flex min-w-0 items-start gap-2 text-[15px] text-ink">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate1" aria-hidden />
          <span>{address}</span>
        </p>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] font-semibold text-strong underline underline-offset-4"
        >
          {t('garage.directions')}
        </a>
      </div>
    </section>
  );
};

export default GarageMap;
