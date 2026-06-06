import Link from "next/link";

type ListingCardProps = {
  id: string;
  title: string;
  description: string | null;
  serviceName: string;
  hostName: string;
  pricePerSeat: string | null;
  currency: string;
  totalSeats: number;
  remainingSeats: number;
  region: string | null;
};

export default function ListingCard({
  id,
  title,
  description,
  serviceName,
  hostName,
  pricePerSeat,
  currency,
  totalSeats,
  remainingSeats,
  region,
}: ListingCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow">
      {/* Top section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full px-2.5 py-0.5">
            {serviceName}
          </span>
          {region && (
            <span className="text-xs text-gray-400 uppercase">{region}</span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>

        {description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{description}</p>
        )}

        <p className="text-xs text-gray-400">Hosted by {hostName}</p>
      </div>

      {/* Bottom section */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900">
            {currency} {Number(pricePerSeat).toFixed(2)}
            <span className="text-sm font-normal text-gray-400"> / seat</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {remainingSeats} of {totalSeats} seats left
          </p>
        </div>

        <Link
          href={`/listings/${id}`}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          View
        </Link>
      </div>
    </div>
  );
}
