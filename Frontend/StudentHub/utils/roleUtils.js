export const hasRole = (user, role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
};

export const shouldBlock = (user) => {
    return hasRole(user, 'ROLE_BANNED') || user?.disabled;
};