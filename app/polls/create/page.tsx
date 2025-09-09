import { CreatePollForm } from "../../components/polls/create-poll-form";
import { Button } from "../../components/ui/button";
import { ProtectedRoute } from "../../components/auth/protected-route";
import Link from "next/link";

export default function CreatePollPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        <div className="mb-6">
          <Link href="/polls">
            <Button variant="outline" size="sm">
              ← Back to Polls
            </Button>
          </Link>
        </div>
        
        <CreatePollForm />
      </div>
    </ProtectedRoute>
  );
}