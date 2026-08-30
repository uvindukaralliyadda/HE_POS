import type { Role } from '@/data/mockData';
import adminProfile from '@/Admin.jpg';
import officeProfile from '@/OfficeStaff.jpg';
import portProfile from '@/PortStaff.jpg';

export const PROFILE_IMAGES: Record<Role, string> = {
  Admin: adminProfile,
  'Office Staff': officeProfile,
  'Port Staff': portProfile,
};

export function UserAvatar({
  role,
  size = 'md',
  className = '',
}: {
  role: Role;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <img
      src={PROFILE_IMAGES[role]}
      alt={`${role} profile`}
      className={`rounded-full object-cover ring-2 ring-white shadow-sm ${sizeClasses[size]} ${className}`}
    />
  );
}
