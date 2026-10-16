export function getPhotoUrl(target) {
    if (!target) {
        return null;
    }

    // 1. If target already has an explicit photo route or relative path provided by parent
    if (target.photoUrl) {
        return target.photoUrl;
    }

    // 2. Build route URL if target has convention_id and app_uid / id
    const conventionId = target.convention_id || target.conventionId;
    const playerUid = target.app_uid || target.appUid;

    if (conventionId && playerUid) {
        const generatedUrl = `/c/${conventionId}/player/${playerUid}/photo`;
        return generatedUrl;
    }

    // 3. Fall back to image_url if it's already an absolute or valid relative path
    if (target.image_url) {
        return target.image_url;
    }

    return null;
}