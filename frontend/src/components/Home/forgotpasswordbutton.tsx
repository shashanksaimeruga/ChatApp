import { Button } from "../ui/button";

interface ForgotPasswordButtonProps {
  label: string;
  onClick: () => void;
  className?: string;  // Add this line
}

const ForgotPasswordButton = ({ label, onClick, className }: ForgotPasswordButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="link"
      className={`text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-300 ${className}`}
    >
      {label}
    </Button>
  );
};

export default ForgotPasswordButton;