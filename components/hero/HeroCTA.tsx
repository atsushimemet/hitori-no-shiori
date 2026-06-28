import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HeroCTA() {
  return (
    <Button className="mt-8 gap-2">
      <Sparkles aria-hidden="true" size={17} strokeWidth={1.8} />
      ひとり時間をAIと探す
    </Button>
  );
}
