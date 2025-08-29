import { Separator } from "@/components/ui/separator";
import PfButton from "@/components/pf/pf-button";
import Image from "next/image";
import { Mail, Phone, Calendar, User } from "lucide-react";

interface UserDetailProps {
  onClose: () => void;
  user: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    createdAt?: string;
  };
}

const UserDetail: React.FC<UserDetailProps> = ({ onClose, user }) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6">
      {/* Header with Avatar */}
      <div className="flex flex-col items-center text-center">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-md">
          <Image
            src="https://avatar.iran.liara.run/public/boy"
            alt={user.name}
            fill
            className="object-cover"
          />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mt-4">{user.name}</h2>
        <p className="text-sm text-slate-500">User Role : {user.role}</p>
      </div>

      <Separator className="my-6" />

      {/* User Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-slate-500" />
          <span className="text-slate-700">{user.email}</span>
        </div>

        {user.phone || (
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-slate-500" />
            <span className="text-slate-700">03149393713</span>
          </div>
        )}

        {user.createdAt && (
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-500" />
            <span className="text-slate-700">
              Joined: 12 June 2026
            </span>
          </div>
        )}
      </div>

      <Separator className="my-6" />

      {/* Actions */}
      <div className="flex justify-end">
        <PfButton variant="default" type="button" onClick={onClose}>
          Close
        </PfButton>
      </div>
    </div>
  );
};

export default UserDetail;
