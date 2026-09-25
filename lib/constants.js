export const approvalStatuses = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2
}

export const approvalStatusLabels = Object.fromEntries(
    Object.entries(approvalStatuses).map(([key, val]) => [val, key])
);

export const NR_TARGETS = 5;

export const CAPTURE_REWARD = 1;

export const REFRESH_COOLDOWN_MINUTES = 60;
export const REFRESH_COOLDOWN_MILLISECONDS = REFRESH_COOLDOWN_MINUTES * 60 * 1000;
export const REFRESH_PERIOD = 20;

export const MAX_PHOTO_MB = 50;
