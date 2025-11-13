import AuthForm from "@/components/AuthForm";

export default function AuthPage({ onLogin }) {
  return (
      <AuthForm onLogin={onLogin} />
  );
}
