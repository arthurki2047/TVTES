import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="container py-6">
      <h1 className="mb-6 font-headline text-4xl font-bold">Profile</h1>
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
        <Avatar className="h-24 w-24">
            <AvatarImage src="https://picsum.photos/seed/user/200" alt="User avatar" />
            <AvatarFallback>
                <User className="h-12 w-12" />
            </AvatarFallback>
        </Avatar>
        <h3 className="mt-4 text-2xl font-semibold">User Profile</h3>
        <p className="mt-2 text-muted-foreground">
          This is where user settings and profile information will be displayed.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>TEST TV HERE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-lg bg-yellow-300/20 border-2 border-dashed border-yellow-500/50 flex items-center justify-center">
            <p className="text-yellow-700 font-medium">Test TV placeholder</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
