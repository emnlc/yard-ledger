import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <div className="flex flex-col gap-24 items-center pb-12 md:py-16">
        <Button asChild className="hover:bg-kelly-green transition-all">
          <Link to={"/login"}>Get started</Link>
        </Button>

        <div className="flex flex-col items-center gap-8">
          <img src="logo_icon.svg" className="h-16 w-16" alt="" />
          <span>© 2024 Yard Ledger</span>
        </div>
      </div>
    </>
  );
};

export default Footer;
