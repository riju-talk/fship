// src/components/CourierResultCard.jsx
export default function CourierResultCard({ courier }) {
  const isAir = courier.type?.toLowerCase() === "air";

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm transition-all hover:shadow-md">
      {/* Left: Courier info */}
      <div>
        <div className="text-[15px] font-bold text-[#111827]">{courier.name}</div>
        <div className="mt-1 flex items-center gap-2 text-[12px] text-[#6b7280]">
          <span className="font-medium text-[#ef6a23]">via {courier.aggregator}</span>
          {courier.courier_code && (
            <>
              <span className="h-1 w-1 rounded-full bg-[#d1d5db]" />
              <span>#{courier.courier_code}</span>
            </>
          )}
        </div>
        {courier.cutoff_time && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#ea580c]">
            <span role="img" aria-label="clock">⏰</span>
            Order by {courier.cutoff_time}
          </div>
        )}
      </div>

      {/* Right: ETA & Type */}
      <div className="text-right">
        <div className={[
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-tight",
          isAir ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
        ].join(" ")}>
          {isAir ? "✈ Air" : "🚛 Surface"}
        </div>
        
        {courier.eta && courier.eta !== "N/A" && (
          <div className="mt-2 text-[13px] font-medium text-[#111827]">
            ETA: <span className="font-bold">{courier.eta}</span>
          </div>
        )}
        
        {courier.total_freight != null && (
          <div className="mt-1 text-[12px] font-bold text-[#059669]">
            ₹{courier.total_freight}
          </div>
        )}
      </div>
    </div>
  );
}
