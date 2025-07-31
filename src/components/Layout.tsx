import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

const Layout = ({ children, className = "" }: LayoutProps) => {
  return (
    <div className={`min-h-screen bg-gradient-subtle ${className}`}>
      <div className="container max-w-md mx-auto px-4">
        {children}
      </div>
    </div>
  );
};

export default Layout;