import UserForm from "@/components/admin/dashboard/users/user-form";

export default function NewUserPage() {
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">New User</h1>
      </div>
        <UserForm />
    </div>
  );
}