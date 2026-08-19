// ─────────────────────────────────────────────────────────────────────────────
// components/StatusBadge.jsx — Report status badge
// ─────────────────────────────────────────────────────────────────────────────

const statusStyles = {
    SUBMITTED: {
        label: 'SUBMITTED',
        className: 'text-amber-400 border-amber-500/30 bg-amber-600/10',
        dot: 'bg-amber-400',
    },
    RECEIVED: {
        label: 'RECEIVED',
        className: 'text-blue-400 border-blue-500/30 bg-blue-600/10',
        dot: 'bg-blue-400',
    },
    CANCELLED: {
        label: 'CANCELLED',
        className: 'text-gray-400 border-gray-500/30 bg-gray-600/10',
        dot: 'bg-gray-400',
    },
};

export default function StatusBadge({ status }) {
    const style = statusStyles[status] || {
        label: status || 'UNKNOWN',
        className: 'text-gray-400 border-gray-500/30 bg-gray-600/10',
        dot: 'bg-gray-400',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${style.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {style.label}
        </span>
    );
}