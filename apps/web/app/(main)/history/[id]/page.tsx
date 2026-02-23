import {
  Card,
  CardContent,
} from "@repo/ui/components/card";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { createAuthClient } from "@/lib/auth-api-client";
import { RecipeDetail } from "./recipe-detail";

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    notFound();
  }

  const authClient = createAuthClient(session.accessToken);
  const { data, error } = await authClient.GET("/recipes/{id}", {
    params: { path: { id } },
  });

  if (error || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-gray-500">
            <p>レシピが見つかりません</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <RecipeDetail recipe={data} />;
}
