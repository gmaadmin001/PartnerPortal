import LoginForm from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign In | Global Mobility Adviser",
  description: "Sign in or register for the GMA Partner Portal.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen pt-0 pb-12 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <LoginForm />
      </div>
    </div>
  );
}
