import { AuthForm } from "../../components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <AuthForm type="login" />
      </div>
    </div>
  );
}