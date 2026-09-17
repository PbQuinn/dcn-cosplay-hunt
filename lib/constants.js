export const approvalStatuses = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2
}

export const approvalStatusLabels = Object.fromEntries(
    Object.entries(approvalStatuses).map(([key, val]) => [val, key])
);

export const NR_TARGETS = 5;