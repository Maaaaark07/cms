import React from "react";

const statusStyles = {
    New: {
        backgroundColor: "#FFA80380",
        color: "#664301",
    },
    "On going": {
        backgroundColor: "#3F83F880",
        color: "#1E429F",
    },
    Settled: {
        backgroundColor: "#00A6AE80",
        color: "#004246",
    },
    Reconciled: {
        backgroundColor: "#00B83380",
        color: "#004a14",
    },
    "Moved to higher court": {
        backgroundColor: "#E7003680",
        color: "#5c0016",
    },
};

const StatusBadge = ({ status }) => {
    if (!status) return "N/A";

    const style = statusStyles[status] || {};

    return (
        <div
            className="px-4 py-2 rounded-3xl text-center"
            style={style}
        >
            {status}
        </div>
    );
};

export default StatusBadge;
