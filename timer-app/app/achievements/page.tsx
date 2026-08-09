import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AchievementsPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-base text-muted-foreground">
            Achievements
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-2 py-8">
          <p className="text-sm text-muted-foreground">Coming soon.</p>
        </CardContent>
      </Card>
    </main>
  );
}
