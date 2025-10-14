import { Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SocialLinks() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" asChild>
        <Link
          href="https://github.com/BCAPATHSHALA/RAGApplication"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <Github className="h-5 w-5" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <Link
          href="https://linkedin.com/in/manojofficialmj"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <Linkedin className="h-5 w-5" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <Link
          href="https://twitter.com/manojofficialmj"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
        >
          <Twitter className="h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
}
