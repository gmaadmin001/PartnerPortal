import LoginForm from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign In | Global Mobility Adviser",
  description: "Sign in or register for the GMA Partner Portal.",
};

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        background: "linear-gradient(180deg, #e8f0f8 0%, #ffffff 60%)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        <LoginForm />
      </div>
    </div>
  );
}
