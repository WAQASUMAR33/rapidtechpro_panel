export const DEFAULT_AVATARS = {
    male: '/defaults/avatar-male.svg',
    female: '/defaults/avatar-female.svg',
} as const;

export type Gender = keyof typeof DEFAULT_AVATARS;

export const normalizeGender = (gender?: string | null): Gender => {
    const value = (gender || '').trim().toLowerCase();
    if (value === 'female' || value === 'f' || value === 'woman') return 'female';
    return 'male';
};

/**
 * Returns the absolute avatar URL for a member. When the admin never uploaded a
 * photo, a gender-based placeholder is served instead of an empty image.
 */
export const resolveMemberImage = (image: string | null | undefined, gender: string | null | undefined, baseUrl: string) => {
    const img = (image || '').trim();

    if (!img) {
        return `${baseUrl}${DEFAULT_AVATARS[normalizeGender(gender)]}`;
    }
    if (img.startsWith('/uploads/')) {
        return `${baseUrl}${img}`;
    }
    if (img.startsWith('/team/')) {
        return `https://rapidtechpro.com${img}`;
    }
    return img;
};
